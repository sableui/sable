#!/usr/bin/env node
/**
 * prerender-routes — give every docs URL its own HTML shell after `vite build`,
 * and everything a host and a crawler need around them.
 *
 * The site is a client-rendered SPA, so an agent or crawler fetching `/button`
 * without running JavaScript would get the same empty document as every other
 * URL. This writes, into dist/:
 *
 *   <route>/index.html  for every route the app renders: the same app shell
 *                       plus a real <title>, description, canonical URL, Open
 *                       Graph / Twitter meta (with the share image), a `<link rel="alternate"
 *                       type="text/markdown">` to the agent-readable twin, and
 *                       the twin itself rendered as plain HTML inside #root.
 *                       The app boots on top and replaces it.
 *   <route>.md          the twin at the page's own URL plus `.md`
 *                       (/getting-started.md), the address agents try first.
 *   index.html          the home route (`/`), with the same head.
 *   404.html            served by the host with HTTP 404 for any other path;
 *                       the app boots on it and renders its not-found page.
 *   robots.txt, sitemap.xml
 *
 * The route list is read from the app itself (the `pages` map in src/App.tsx
 * and the previews in src/pages/PatternPreview.tsx), so a page added there
 * gets a shell, and a route with no title or description fails the build
 * instead of shipping as a soft 404.
 *
 *   node scripts/prerender-routes.mjs   (runs as part of `pnpm build`)
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { marked } from "marked"

const DOCS_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const SRC = join(DOCS_ROOT, "src")
const DIST = join(DOCS_ROOT, "dist")
const SABLE_ROOT = join(DOCS_ROOT, "..", "..", "packages", "sable")

const fail = (message) => {
	console.error(`[prerender-routes] ✗ ${message}`)
	process.exit(1)
}

const shellPath = join(DIST, "index.html")
if (!existsSync(shellPath)) fail("dist/index.html missing — run vite build first.")
// The local reference atlas holds third-party captures that are not cleared
// for redistribution (see scripts/sync-llms.mjs). The host 404s the path
// because nothing is there; keep it that way.
if (existsSync(join(DIST, "llms", "atlas"))) fail("dist/llms/atlas exists — the reference atlas must never be published.")

const shell = readFileSync(shellPath, "utf8")
if (shell.includes('property="og:title"')) fail("dist/index.html was already prerendered — run vite build again first.")
const site = JSON.parse(readFileSync(join(SRC, "site-meta.json"), "utf8"))
// Shared with the page header's Copy Markdown action, so the twin a person
// copies is the twin this script publishes at /<route>.md.
const { $comment, ...markdownTwins } = JSON.parse(readFileSync(join(SRC, "markdown-twins.json"), "utf8"))
const registry = JSON.parse(readFileSync(join(SABLE_ROOT, "registry.json"), "utf8"))
const ORIGIN = site.origin.replace(/\/+$/, "")

const escape = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
const kebab = (name) => name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase() // = componentSlug
// Crawlers need the share image as an absolute URL.
if (!existsSync(join(DIST, site.image.path.replace(/^\/+/, "")))) fail(`share image ${site.image.path} is not in dist — render it with scripts/render-og-image.mjs.`)
const SHARE_IMAGE = `${ORIGIN}${site.image.path}`
const urlFor = (route) => (route === "" ? `${ORIGIN}/` : `${ORIGIN}/${route}`)

// ── The routes the app renders ────────────────────────────────────────────

const appSource = readFileSync(join(SRC, "App.tsx"), "utf8")
const pagesStart = appSource.indexOf("const pages: Record<string, ComponentType> = {")
if (pagesStart < 0) fail("could not find the `pages` map in src/App.tsx.")
const pagesBlock = appSource.slice(pagesStart)
/** slug → { file, exportName } */
const appPages = new Map()
for (const m of pagesBlock.matchAll(/["']?([a-z0-9-]+)["']?:\s*page\(\s*\(\)\s*=>\s*import\(\s*"\.\/pages\/([^"]+)"\s*\),\s*"(\w+)"/g)) {
	appPages.set(m[1], { file: m[2], exportName: m[3] })
}
if (appPages.size < 50) fail(`parsed only ${appPages.size} routes from src/App.tsx — has the pages map changed shape?`)

const previewSource = readFileSync(join(SRC, "pages", "PatternPreview.tsx"), "utf8")
const previewSlugs = [...previewSource.matchAll(/^\t"([a-z0-9-]+)":\s*lazy(?:Route)?\(/gm)].map((m) => m[1])
const catalogPatterns = JSON.parse(readFileSync(join(SRC, "generated", "catalog-patterns.json"), "utf8"))
for (const p of catalogPatterns) {
	const slug = p.path.replace(/^patterns\//, "").replace(/\.tsx$/, "")
	if (!previewSlugs.includes(slug)) fail(`the Patterns page links /preview/${slug}, but PatternPreview.tsx has no preview for it.`)
}

/** The page's own <PageHeader title="…" lede="…">, so the shell's title matches the h1 the app titles the tab with. */
function pageHeader(file, exportName) {
	const path = [`${file}.tsx`, `${file}/index.tsx`].map((f) => join(SRC, "pages", f)).find(existsSync)
	if (!path) return {}
	const source = readFileSync(path, "utf8")
	const start = source.indexOf(`export function ${exportName}(`)
	if (start < 0) return {}
	const header = source.slice(start).match(/<PageHeader\b([\s\S]*?)\/>/)
	if (!header) return {}
	return {
		title: header[1].match(/\btitle="([^"]+)"/)?.[1],
		lede: header[1].match(/\blede="([^"]+)"/)?.[1],
	}
}

const componentsBySlug = new Map(registry.components.map((c) => [kebab(c.name), c]))
const foundationsBySlug = new Map((registry.foundations ?? []).map((f) => [f.slug, f]))
// Pages that predate the foundation slugs.
const foundationAlias = { dimensions: "spacing", elevation: "surfaces" }

/** Metadata for routes the registry does not describe. Their twins are in src/markdown-twins.json. */
const extra = {
	"getting-started": {
		description: "Install Sable from npm, connect React and Tailwind CSS, and set up your coding agent.",
	},
	guidelines: {
		title: "Guidelines",
		description: "Every component's do's and don'ts in one searchable list.",
	},
	customize: {
		title: "Canvas",
		description: "Tune color, type, corners, depth and motion on a live canvas of Sable components, then export the look as a preset.",
	},
}

/** route → { title, description, markdown, index } */
const routes = new Map()
const missing = []
for (const [slug, { file, exportName }] of appPages) {
	if (slug === "introduction") continue // the home page, written as / below
	const header = pageHeader(file, exportName)
	const component = componentsBySlug.get(slug)
	const foundation = foundationsBySlug.get(foundationAlias[slug] ?? slug)
	const more = extra[slug] ?? {}
	const meta = {
		title: more.title ?? header.title ?? foundation?.title ?? component?.name,
		description: more.description ?? component?.summary ?? foundation?.summary ?? header.lede,
		markdown:
			markdownTwins[slug] ??
			(component ? `/llms/components/${slug}.md` : foundation ? `/llms/foundations/${foundation.slug}.md` : undefined),
		index: true,
	}
	if (!meta.title || !meta.description || !meta.markdown) missing.push(slug)
	routes.set(slug, meta)
}
for (const slug of ["customize", "guidelines"]) routes.set(slug, { ...extra[slug], markdown: markdownTwins[slug], index: true })
/**
 * Previews that are not patterns — a component shown at full page size — and
 * the twin each one publishes: the component's own, since that is what it shows.
 */
const COMPONENT_PREVIEWS = {
	"app-shell-inset": { title: "App shell inset frame preview", component: "app-shell" },
}
for (const slug of previewSlugs) {
	const own = COMPONENT_PREVIEWS[slug]
	if (own) {
		routes.set(`preview/${slug}`, {
			title: own.title,
			description: `A full-page preview of ${own.title.replace(/ preview$/, "").toLowerCase()}.`,
			markdown: `/llms/components/${own.component}.md`,
			index: false,
		})
		continue
	}
	const pattern = catalogPatterns.find((p) => p.path === `patterns/${slug}.tsx`)
	const name = (pattern?.name ?? slug).replace(/Page$/, "").split(/(?=[A-Z])/).join(" ").toLowerCase()
	routes.set(`preview/${slug}`, {
		title: `${name.charAt(0).toUpperCase()}${name.slice(1)} page shell preview`,
		description: pattern?.summary ?? `A full-page preview of Sable's ${name} page shell.`,
		markdown: `/llms/patterns/${slug}.md`,
		// Bare demo pages, framed by the Patterns page: reachable, not indexed.
		index: false,
	})
}
if (missing.length) fail(`no title, description or markdown twin for: ${missing.join(", ")}. Add them to \`extra\` in this script.`)

// ── Writing ───────────────────────────────────────────────────────────────

const shellHasTitle = /<title>[^<]*<\/title>/.test(shell)
const shellHasRoot = shell.includes('<div id="root"></div>')
if (!shellHasTitle || !shellHasRoot) fail("dist/index.html no longer has a <title> and an empty #root to fill.")

/*
 * The page's content, for whoever fetches it without running JavaScript.
 *
 * An agent pointed at /getting-started fetched the HTML and got the title and
 * nothing else: the app renders its content client-side, and the markdown twin
 * was only named in a <link rel="alternate"> that fetch tools do not follow.
 * Every shell now carries its twin as plain HTML inside #root, so the URL a
 * person shares is the URL an agent can read. The app replaces it when it boots
 * (createRoot clears the container), and until then it is visually hidden, so
 * nobody sees a flash of unstyled docs. A browser without JavaScript shows it
 * through the <noscript> style. CSS only: the site's CSP allows no inline script.
 */
const PRERENDER_CSS = `<style>.sable-prerendered{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}</style>
		<noscript><style>.sable-prerendered{position:static;width:auto;height:auto;overflow:visible;clip-path:none;white-space:normal;max-width:72ch;margin:2rem auto;padding:0 1rem;font:16px/1.55 system-ui,sans-serif}.sable-prerendered pre{overflow:auto;padding:1rem;background:#8882}</style></noscript>`

/** The twin as published, read from dist (sync-llms copies it into public/). */
function twinSource(markdown) {
	const file = join(DIST, markdown.replace(/^\/+/, ""))
	if (!existsSync(file)) fail(`markdown twin ${markdown} is not in dist — is it published by sync-llms or public/?`)
	return readFileSync(file, "utf8")
}

/**
 * The twin as HTML. Its relative links are written against the twin's own URL
 * (`../components/button.md` from /llms/tasks/), so they are resolved there
 * before the HTML lands at a different path (/getting-started).
 */
function twinHtml(markdown) {
	const base = `${ORIGIN}${markdown}`
	return marked.parse(twinSource(markdown), {
		gfm: true,
		async: false,
		walkTokens(token) {
			if ((token.type === "link" || token.type === "image") && token.href && !/^(?:[a-z][a-z0-9+.-]*:|#)/i.test(token.href)) {
				const url = new URL(token.href, base)
				token.href = url.origin === ORIGIN ? `${url.pathname}${url.search}${url.hash}` : url.href
			}
		},
	})
}

/** The line every prerendered page opens with: where the agent-readable forms of it live. */
function agentPointer(mdUrl) {
	const links = [
		mdUrl ? `This page as markdown: <a href="${mdUrl}">${mdUrl}</a>` : null,
		`Index for agents: <a href="/llms.txt">/llms.txt</a>`,
		`Everything in one file: <a href="/llms-full.txt">/llms-full.txt</a>`,
	].filter(Boolean)
	return `<p>${links.join(" · ")}</p>`
}

function documentFor({ title, description, canonical, markdown, index, noscript, mdUrl, body }) {
	const head = [
		`<title>${escape(title)}</title>`,
		`<meta name="description" content="${escape(description)}" />`,
		index ? null : `<meta name="robots" content="noindex" />`,
		canonical ? `<link rel="canonical" href="${canonical}" />` : null,
		markdown ? `<link rel="alternate" type="text/markdown" href="${markdown}" title="${escape(title)} (markdown)" />` : null,
		`<meta property="og:site_name" content="${escape(site.name)}" />`,
		`<meta property="og:type" content="website" />`,
		`<meta property="og:title" content="${escape(title)}" />`,
		`<meta property="og:description" content="${escape(description)}" />`,
		canonical ? `<meta property="og:url" content="${canonical}" />` : null,
		// One share image for every page (og.html, rendered by
		// scripts/render-og-image.mjs); each page keeps its own title and description.
		`<meta property="og:image" content="${SHARE_IMAGE}" />`,
		`<meta property="og:image:type" content="image/png" />`,
		`<meta property="og:image:width" content="${site.image.width}" />`,
		`<meta property="og:image:height" content="${site.image.height}" />`,
		`<meta property="og:image:alt" content="${escape(site.image.alt)}" />`,
		`<meta name="twitter:card" content="summary_large_image" />`,
		`<meta name="twitter:title" content="${escape(title)}" />`,
		`<meta name="twitter:description" content="${escape(description)}" />`,
		`<meta name="twitter:image" content="${SHARE_IMAGE}" />`,
		`<meta name="twitter:image:alt" content="${escape(site.image.alt)}" />`,
		body ? PRERENDER_CSS : null,
	]
		.filter(Boolean)
		.join("\n\t\t")
	const root = body
		? `<div id="root"><article class="sable-prerendered">\n${agentPointer(mdUrl)}\n${body}</article></div>`
		: `<div id="root"></div>\n\t\t<noscript><p>${noscript}</p></noscript>`
	return shell
		.replace(/<meta\s+name="description"[^>]*>\s*/, "")
		.replace(/<title>[^<]*<\/title>/, head)
		.replace('<div id="root"></div>', root)
}

function write(relative, contents) {
	const out = join(DIST, relative)
	mkdirSync(dirname(out), { recursive: true })
	writeFileSync(out, contents)
}

const pointer = (markdown) =>
	markdown && markdown !== "/llms.txt"
		? `Read it as markdown: <a href="${markdown}">${markdown}</a>. Index: <a href="/llms.txt">/llms.txt</a>.`
		: `Index for agents: <a href="/llms.txt">/llms.txt</a>.`

let written = 0
let markdownCopies = 0
for (const [route, { title, description, markdown, index }] of routes) {
	// The page's own URL plus `.md`. A twin that already lives there (/credits.md) is left as is.
	const mdUrl = `/${route}.md`
	if (markdown !== mdUrl) {
		write(`${route}.md`, twinSource(markdown))
		markdownCopies++
	}
	write(
		join(route, "index.html"),
		documentFor({
			title: `${title} — ${site.name}`,
			description,
			canonical: urlFor(route),
			markdown: mdUrl,
			index,
			noscript: `${escape(title)} — ${escape(description)} ${pointer(markdown)}`,
			mdUrl,
			body: twinHtml(markdown),
		}),
	)
	written++
}

// The home page answers at / and at /introduction (the nav's Home item); both
// name / as canonical so search engines keep one copy.
// The home page's twin is the agent index itself.
write("index.md", twinSource("/llms.txt"))
const home = documentFor({
	title: site.homeTitle,
	description: site.homeDescription,
	canonical: urlFor(""),
	markdown: "/llms.txt",
	index: true,
	noscript: `${escape(site.homeTitle)}. ${escape(site.homeDescription)} ${pointer("/llms.txt")}`,
	mdUrl: "/llms.txt",
	body: twinHtml("/llms.txt"),
})
write("index.html", home)
write(join("introduction", "index.html"), home)
written++

// Every other path: the host answers 404 with this document, and the app,
// booting on an unknown route, renders its not-found page.
write(
	"404.html",
	documentFor({
		title: `Page not found — ${site.name}`,
		description: "There's no page at this address.",
		index: false,
		noscript: `There's no page at this address. Start at <a href="/">${escape(site.name)}</a> or the agent index, <a href="/llms.txt">/llms.txt</a>.`,
	}),
)

const indexed = ["", ...[...routes].filter(([, meta]) => meta.index).map(([route]) => route)]
write(
	"sitemap.xml",
	`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexed
		.map((route) => `\t<url><loc>${escape(urlFor(route))}</loc></url>`)
		.join("\n")}\n</urlset>\n`,
)
write("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap.xml\n`)

console.log(
	`[prerender-routes] ✓ wrote ${written} route shells with their content (+ /introduction), ${markdownCopies} <route>.md twins, 404.html, robots.txt and a ${indexed.length}-URL sitemap.xml.`,
)

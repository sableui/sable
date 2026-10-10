/**
 * Vendor the brand marks into `src/icon-sets/brands.generated.ts`.
 *
 * Brand logos are fetched ONCE, here, and committed — never fetched at render
 * time. The obvious alternative (an `<img src="https://cdn.reicon.dev/…">`) is
 * wrong for this package in four separate ways, and all four are why this
 * script exists:
 *
 *   1. Sable renders offline. A remote icon makes every page that shows a
 *      footer social row depend on a third-party origin being up.
 *   2. A published Artifact's CSP blocks external hosts outright, so the mark
 *      would silently fail to render exactly where pages get shared.
 *   3. `<img>` cannot inherit `currentColor`. Social marks are almost always
 *      wanted monochrome, taking the surrounding ink — which is the whole
 *      point of Sable's `Icon`.
 *   4. It leaks a visitor request to a third party on every page view.
 *
 * The upstream `reicon-brands` npm package would have solved 1-4 by shipping
 * paths. The current set retains 23 marks from reicon-brands 1.0.2. Four
 * former CDN-only marks (LinkedIn, Slack, Microsoft, OpenAI) are excluded
 * until their exact artwork has a verified permission chain. Never fall back
 * to the CDN when the installed package lacks a glyph.
 *
 * Normalization is the real work here. Upstream viewBoxes are inconsistent
 * (0 0 256 256, 0 0 2447.6 2452.5, 0 0 24 24 among the four spot-checked), and
 * an icon that does not share the UI grid sits visibly wrong beside a 24-grid
 * glyph. Every mark is rewritten onto a 24 viewBox via a wrapping transform,
 * so callers never think about it.
 *
 *   pnpm icons:brands            # refresh all
 *   pnpm icons:brands:check     # fail if the committed file is stale
 *
 * Generation and --check use the installed, lockfile-pinned package offline.
 * The upstream MIT notice is retained in third-party/reicon-LICENSE.txt.
 *
 * Trademark note: these designs are the trademarks of their respective owners.
 * Vendoring the paths is a convenience, not a license — follow each brand's
 * usage guidelines.
 */
import { readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = join(HERE, "..", "src", "icon-sets", "brands.generated.ts")

/**
 * The curated set. Deliberately small: these are the marks a product actually
 * puts in a footer, an auth row, or an integrations list. `name` is the
 * semantic name Sable callers use (`<Icon name="github" />`); `slug` is a
 * diagnostic label. Only entries with a known npm module are included.
 */
const BRANDS = [
	// Social
	{ name: "x", slug: "x", title: "X" , pkg: "X" },
	{ name: "instagram", slug: "instagram", title: "Instagram" , pkg: "Instagram" },
	{ name: "facebook", slug: "facebook", title: "Facebook" , pkg: "Facebook" },
	{ name: "youtube", slug: "youtube", title: "YouTube" , pkg: "Youtube" },
	{ name: "tiktok", slug: "tiktok", title: "TikTok" , pkg: "Tiktok" },
	{ name: "threads", slug: "threads", title: "Threads" , pkg: "Threads" },
	{ name: "bluesky", slug: "bluesky", title: "Bluesky" , pkg: "Bluesky" },
	{ name: "mastodon", slug: "mastodon", title: "Mastodon" , pkg: "Mastodon" },
	{ name: "reddit", slug: "reddit", title: "Reddit" , pkg: "Reddit" },
	{ name: "pinterest", slug: "pinterest", title: "Pinterest" , pkg: "Pinterest" },
	// Dev & work
	{ name: "github", slug: "github", title: "GitHub" , pkg: "Github" },
	{ name: "gitlab", slug: "gitlab", title: "GitLab" , pkg: "Gitlab" },
	{ name: "discord", slug: "discord", title: "Discord" , pkg: "Discord" },
	{ name: "figma", slug: "figma", title: "Figma" , pkg: "Figma" },
	{ name: "notion", slug: "notion", title: "Notion" , pkg: "Notion" },
	{ name: "vercel", slug: "vercel", title: "Vercel" , pkg: "Vercel" },
	{ name: "npm", slug: "npm", title: "npm" , pkg: "Npm" },
	// Platforms & AI
	{ name: "google", slug: "google", title: "Google" , pkg: "Google" },
	{ name: "apple", slug: "apple", title: "Apple" , pkg: "Apple" },
	{ name: "claude", slug: "claude", title: "Claude" , pkg: "Claude" },
	// Commerce
	{ name: "stripe", slug: "stripe", title: "Stripe" , pkg: "Stripe" },
	{ name: "paypal", slug: "paypal", title: "PayPal" , pkg: "Paypal" },
	{ name: "shopify", slug: "shopify", title: "Shopify" , pkg: "Shopify" },
]

const GRID = 24

/** `<svg …>inner</svg>` → the inner markup, with the viewBox it was drawn on. */
function parseSvg(svg, slug) {
	const open = svg.match(/<svg\b[^>]*>/i)
	if (!open) throw new Error(`${slug}: no <svg> element`)

	const viewBox = open[0].match(/viewBox\s*=\s*"([^"]+)"/i)?.[1]
	let box
	if (viewBox) {
		const parts = viewBox.trim().split(/[\s,]+/).map(Number)
		if (parts.length !== 4 || parts.some(Number.isNaN))
			throw new Error(`${slug}: unparseable viewBox "${viewBox}"`)
		box = { minX: parts[0], minY: parts[1], w: parts[2], h: parts[3] }
	} else {
		// No viewBox: fall back to width/height, which is what a raw export gives.
		const w = Number(open[0].match(/width\s*=\s*"?([\d.]+)/i)?.[1])
		const h = Number(open[0].match(/height\s*=\s*"?([\d.]+)/i)?.[1])
		if (!w || !h) throw new Error(`${slug}: no viewBox and no usable width/height`)
		box = { minX: 0, minY: 0, w, h }
	}

	const inner = svg
		.replace(/^[\s\S]*?<svg\b[^>]*>/i, "")
		.replace(/<\/svg>[\s\S]*$/i, "")
		// Comments and <title> would be duplicated into every render; Sable's Icon
		// owns the accessible name, so an embedded title actively conflicts.
		.replace(/<!--[\s\S]*?-->/g, "")
		.replace(/<title\b[\s\S]*?<\/title>/gi, "")
		.trim()

	if (!inner) throw new Error(`${slug}: empty <svg>`)
	return { inner, box }
}

/**
 * Wrap the artwork so it fills a 24 grid regardless of what it was drawn on.
 * Uniform scale on the LARGER axis with centering, so a non-square mark (a
 * wordmark-ish logo) keeps its aspect ratio instead of being stretched.
 */
function normalize(inner, box) {
	const scale = GRID / Math.max(box.w, box.h)
	const dx = (GRID - box.w * scale) / 2 - box.minX * scale
	const dy = (GRID - box.h * scale) / 2 - box.minY * scale
	const near = (a, b) => Math.abs(a - b) < 0.0001
	if (near(scale, 1) && near(dx, 0) && near(dy, 0)) return inner
	const round = (n) => Number(n.toFixed(4))
	return `<g transform="translate(${round(dx)} ${round(dy)}) scale(${round(scale)})">${inner}</g>`
}

/**
 * Strip hardcoded color so the mark takes the surrounding ink.
 *
 * `fill="none"` and `stroke="none"` MUST survive: they are structure, not
 * color — a counter (the hole in a letterform, the gap in a logo) is drawn as
 * a `fill="none"` shape, and recoloring it paints the hole solid. Same for
 * `fill="currentColor"`, which is already what we want.
 */
function monochrome(markup) {
	return (
		markup
			// Gradients go first, and they go entirely. Several marks (Instagram's
			// mesh, Slack's four-color mark) paint through `fill="url(#grad)"` with
			// the stops in a <defs> block — leaving that intact keeps hex colors in
			// the file AND defeats the whole point, since a gradient cannot inherit
			// currentColor. Dropping the defs and pointing the reference at
			// currentColor renders the mark as a solid silhouette, which is the
			// conventional monochrome treatment for a multi-color logo.
			.replace(/<defs\b[\s\S]*?<\/defs>/gi, "")
			.replace(/<(linearGradient|radialGradient|pattern)\b[\s\S]*?<\/\1>/gi, "")
			.replace(/\s(fill|stroke)\s*=\s*"url\([^"]*\)"/gi, ' $1="currentColor"')
			.replace(/\s(fill|stroke)\s*=\s*"([^"]*)"/gi, (whole, attr, value) => {
				const v = value.trim().toLowerCase()
				if (v === "none" || v === "currentcolor" || v === "transparent") return whole
				return ` ${attr}="currentColor"`
			})
			// Inline style fills would outrank the attribute we just set.
			.replace(/\sstyle\s*=\s*"[^"]*"/gi, "")
			// Leftover paint attributes that carry color independently of fill/stroke.
			.replace(/\s(stop-color|flood-color|lighting-color)\s*=\s*"[^"]*"/gi, "")
			// Classes reference stylesheet rules that do not travel with the markup;
			// worse, an upstream `.cls-1{fill:#e1306c}` would reintroduce color.
			.replace(/\sclass\s*=\s*"[^"]*"/gi, "")
	)
}

/**
 * Guard the invariant the whole set rests on: nothing here may name a color.
 * A single surviving hex both breaks `currentColor` theming and trips
 * `design-lint`'s `inline-color` rule on a generated file nobody edits by hand
 * — which is a confusing failure to land on someone else later.
 */
function assertNoColor(brands) {
	const offenders = brands
		.map((b) => ({ name: b.name, hits: b.markup.match(/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(|oklch\(/gi) }))
		.filter((b) => b.hits)
	if (offenders.length) {
		for (const o of offenders) {
			console.error(`[brand-icons] ✗ ${o.name} still carries color: ${[...new Set(o.hits)].join(", ")}`)
		}
		throw new Error("brand markup must not name a color — extend monochrome() to handle it")
	}
}

/**
 * Read only the installed reicon-brands package. Earlier versions fell back
 * to the CDN for four missing marks; that fallback is now disabled.
 *
 * The CDN serves each logo as its full-color brand asset, and several of those
 * are drawn as a filled background shape with the glyph KNOCKED OUT in white
 * (Instagram's rounded square, Facebook's circle, YouTube's rounded rect,
 * Notion, npm, Reddit). Recolor both layers to `currentColor` and the knockout
 * disappears into the background: the mark renders as a solid blob. That is
 * not a hypothetical — it is what the first generated pass shipped, visible
 * the moment the catalog rendered.
 *
 * `reicon-brands` carries simple-icons-style artwork instead: one path, no
 * background plate, authored to be recolored. So it is correct by construction
 * for exactly the marks the CDN gets wrong. The four it does not carry
 * (LinkedIn, Slack, Microsoft, OpenAI) rendered correctly, but their
 * redistribution rights were not established, so they are excluded.
 */
async function loadFromPackage(brand) {
	if (!brand.pkg) return null
	try {
		const mod = await import(`reicon-brands/icons/${brand.pkg}`)
		const glyph = mod[brand.pkg]
		if (!glyph?.svgContent) return null
		// createIcon defaults to a 24 viewBox and only overrides it via meta, which
		// the returned function does not expose — read it off the module source.
		const source = readFileSync(
			new URL(`../node_modules/reicon-brands/icons/${brand.pkg}.js`, import.meta.url),
			"utf8",
		)
		const viewBox = source.match(/viewBox:\s*'([^']+)'/)?.[1] ?? `0 0 ${GRID} ${GRID}`
		return { svg: `<svg viewBox="${viewBox}">${glyph.svgContent}</svg>`, from: "reicon-brands" }
	} catch {
		return null
	}
}

async function fetchBrand(brand) {
	const source = await loadFromPackage(brand)
	if (!source) throw new Error(`${brand.name}: no glyph in installed reicon-brands; CDN fallback is disabled`)
	const { inner, box } = parseSvg(source.svg, brand.slug)
	return {
		...brand,
		markup: monochrome(normalize(inner, box)),
		sourceViewBox: `${box.minX} ${box.minY} ${box.w} ${box.h}`,
		from: source.from,
	}
}

function render(brands) {
	const entries = brands
		.map(
			(b) =>
				`\t/** ${b.title} — ${b.from}, source viewBox ${b.sourceViewBox}. */\n\t${JSON.stringify(b.name)}: {\n\t\ttitle: ${JSON.stringify(b.title)},\n\t\tmarkup: ${JSON.stringify(b.markup)},\n\t},`,
		)
		.join("\n")

	return `// GENERATED by scripts/fetch-brand-icons.mjs — do not edit.
// Refresh: pnpm icons:brands. Uses the installed reicon-brands package offline.
//
// Brand marks vendored from reicon-brands 1.0.2, normalized onto a ${GRID} grid and
// stripped of hardcoded color so each takes the surrounding ink. The designs
// are trademarks of their respective owners; follow each brand's usage
// guidelines. Retain third-party/reicon-LICENSE.txt. CDN-only glyphs are excluded.

export interface BrandGlyph {
	/** Brand name as its owner writes it — the default accessible name. */
	title: string
	/** Inner SVG markup, already normalized to a 0 0 ${GRID} ${GRID} viewBox. */
	markup: string
}

export const BRAND_GRID = ${GRID}

export const BRAND_GLYPHS: Record<string, BrandGlyph> = {
${entries}
}
`
}

const check = process.argv.includes("--check")

const brands = []
for (const brand of BRANDS) {
	brands.push(await fetchBrand(brand))
}
assertNoColor(brands)
const next = render(brands)

if (check) {
	let current = ""
	try {
		current = readFileSync(OUT, "utf8")
	} catch {
		console.error("[brand-icons] ✗ brands.generated.ts is missing — run `node scripts/fetch-brand-icons.mjs`.")
		process.exit(1)
	}
	if (current.replace(/\r\n/g, "\n") !== next.replace(/\r\n/g, "\n")) {
		console.error(
			"[brand-icons] ✗ brands.generated.ts is out of date with installed reicon-brands — run `node scripts/fetch-brand-icons.mjs` and commit the result.",
		)
		process.exit(1)
	}
	console.log(`[brand-icons] ✓ ${brands.length} marks in sync.`)
} else {
	writeFileSync(OUT, next)
	console.log(`[brand-icons] ✓ wrote ${brands.length} marks to src/icon-sets/brands.generated.ts.`)
}

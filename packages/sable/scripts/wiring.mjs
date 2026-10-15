/**
 * sable doctor --fix and sable init — the wiring doctor checks, applied.
 *
 * Doctor names each way Sable fails silently in a consuming app, and most of
 * them have one mechanical fix: an import in the right order, an `@source`, a
 * dependency, a dedupe line. This applies the ones it can apply without
 * guessing and prints the rest — the exact snippet and the file it belongs in —
 * because an edit made on a guess is a second silent failure.
 *
 * Every edit is narrow and idempotent. A config whose shape it does not
 * recognise is left alone and reported as manual. The CLI re-runs doctor after
 * fixing, and a fix whose check still fails is reported as unverified, never as
 * applied.
 */
import { spawnSync } from "node:child_process"
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join, relative, resolve } from "node:path"
import { SOURCES_MARKER, sourcesCss } from "./sources.mjs"

const read = (file) => (existsSync(file) ? readFileSync(file, "utf8") : null)
const readJson = (file) => {
	try {
		return JSON.parse(readFileSync(file, "utf8"))
	} catch {
		return null
	}
}
const posix = (path) => path.split("\\").join("/")

const VITE_CONFIGS = ["vite.config.ts", "vite.config.mts", "vite.config.js", "vite.config.mjs"]
const NEXT_CONFIGS = ["next.config.ts", "next.config.mjs", "next.config.js"]
const POSTCSS_CONFIGS = ["postcss.config.mjs", "postcss.config.js", "postcss.config.cjs", "postcss.config.ts", ".postcssrc", ".postcssrc.json"]

/** The directories from the project up to its repository root (or the filesystem root). */
function upward(root) {
	const dirs = []
	for (let dir = resolve(root); ; dir = dirname(dir)) {
		dirs.push(dir)
		if (existsSync(join(dir, ".git")) || dirname(dir) === dir) return dirs
	}
}

/**
 * Declared dependencies of the project and the workspace packages above it —
 * a monorepo often keeps its build tooling in the root package.json. The
 * nearest declaration wins.
 */
export function declaredDeps(root) {
	const deps = {}
	for (const dir of upward(root)) {
		const pkg = readJson(join(dir, "package.json"))
		if (!pkg) continue
		for (const [name, range] of Object.entries({ ...pkg.peerDependencies, ...pkg.devDependencies, ...pkg.dependencies }))
			if (!(name in deps)) deps[name] = range
	}
	return deps
}

/** The package manager: package.json's `packageManager`, else the nearest lockfile, else npm. */
export function detectPackageManager(root) {
	for (const dir of upward(root)) {
		const declared = readJson(join(dir, "package.json"))?.packageManager
		if (typeof declared === "string") return declared.split("@")[0]
		if (existsSync(join(dir, "pnpm-lock.yaml")) || existsSync(join(dir, "pnpm-workspace.yaml"))) return "pnpm"
		if (existsSync(join(dir, "yarn.lock"))) return "yarn"
		if (existsSync(join(dir, "bun.lock")) || existsSync(join(dir, "bun.lockb"))) return "bun"
		if (existsSync(join(dir, "package-lock.json"))) return "npm"
	}
	return "npm"
}

export function installCommand(pm, names, { dev = false } = {}) {
	const verb = pm === "npm" ? "install" : "add"
	const devFlag = dev ? [pm === "bun" ? "-d" : "-D"] : []
	return [pm, verb, ...devFlag, ...names]
}

/**
 * What the project is built with, from its own package.json and config files —
 * never an ancestor's, which would label a plain package inside a Next.js
 * monorepo as a Next.js app. `stylesheets` are where that framework's starter
 * keeps the global stylesheet; `root` is the file that renders the app.
 */
export function detectFramework(root) {
	const pkg = readJson(join(root, "package.json")) ?? {}
	const deps = { ...pkg.devDependencies, ...pkg.dependencies }
	const first = (list) => list.find((f) => existsSync(join(root, f))) ?? null
	if (deps.next || first(NEXT_CONFIGS)) {
		const appDir = first(["app", "src/app"])
		return {
			id: "next",
			label: appDir ? "Next.js (App Router)" : "Next.js (Pages Router)",
			config: first(NEXT_CONFIGS),
			html: null,
			stylesheets: appDir ? [`${appDir}/globals.css`] : ["styles/globals.css", "src/styles/globals.css"],
			root: appDir ? first(["tsx", "jsx", "js"].map((ext) => `${appDir}/layout.${ext}`)) : first(["pages/_app.tsx", "src/pages/_app.tsx", "pages/_app.jsx", "pages/_app.js"]),
			appDir,
		}
	}
	if (deps.vite || first(VITE_CONFIGS))
		return {
			id: "vite",
			label: "Vite",
			config: first(VITE_CONFIGS),
			html: first(["index.html"]),
			stylesheets: ["src/index.css", "src/app.css", "src/styles.css", "src/main.css", "src/App.css"],
			root: first(["src/main.tsx", "src/main.jsx", "src/index.tsx", "src/index.jsx", "src/main.ts", "src/main.js"]),
		}
	return {
		id: "unknown",
		label: "an unrecognised setup",
		config: null,
		html: null,
		stylesheets: ["src/index.css", "src/app.css", "src/styles.css", "app/globals.css", "src/app/globals.css"],
		root: null,
	}
}

/* ── Doctor checks this module owns. ─────────────────────────────────────────── */

/**
 * Tailwind has to be in the build, or `@import "tailwindcss"` compiles to
 * nothing and every component renders unstyled. A warning, not a failure: a
 * project can run Tailwind through a pipeline this cannot see (a shared config,
 * the CLI), and a false failure would block `sable check`.
 */
export function tailwindBuildCheck(root, framework) {
	if (framework.id === "unknown") return null
	const deps = declaredDeps(root)
	const postcss = POSTCSS_CONFIGS.map((f) => read(join(root, f)) ?? "").join("\n")
	const viaPostcss = deps["@tailwindcss/postcss"] && /@tailwindcss\/postcss/.test(postcss)
	if (framework.id === "vite") {
		const config = framework.config ? (read(join(root, framework.config)) ?? "") : ""
		if ((deps["@tailwindcss/vite"] && /@tailwindcss\/vite/.test(config)) || viaPostcss) return { status: "pass", name: "css:build", detail: "Tailwind runs in the Vite build." }
		return {
			status: "warn",
			name: "css:build",
			detail: deps["@tailwindcss/vite"]
				? `@tailwindcss/vite is installed but ${framework.config ?? "the Vite config"} does not use it, so @import "tailwindcss" compiles to nothing.`
				: "No Tailwind integration in the Vite build (@tailwindcss/vite), so @import \"tailwindcss\" compiles to nothing.",
			fix: 'Add @tailwindcss/vite and put tailwindcss() in the Vite config\'s plugins (sable doctor --fix does both).',
		}
	}
	if (viaPostcss) return { status: "pass", name: "css:build", detail: "Tailwind runs through PostCSS." }
	return {
		status: "warn",
		name: "css:build",
		detail: "No @tailwindcss/postcss in a PostCSS config, so Next.js never compiles @import \"tailwindcss\".",
		fix: 'Add @tailwindcss/postcss and a postcss.config.mjs with plugins: { "@tailwindcss/postcss": {} } (sable doctor --fix does both when there is no PostCSS config yet).',
	}
}

const FONT_HREF = "https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Figtree:wght@300..900&display=swap"
const FONT_LINKS = [
	'<link rel="preconnect" href="https://fonts.googleapis.com" />',
	'<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />',
	`<link href="${FONT_HREF}" rel="stylesheet" />`,
]

/**
 * The Sable theme names Figtree and DM Mono; the app loads the files. Without
 * them the stacks fall back to system fonts — the page works, just not as
 * drawn, so this warns. Any mention counts as loading: a Google Fonts link,
 * next/font, @fontsource, or an @font-face. An app that sets its own
 * `--font-sans` has chosen other fonts and is not judged here.
 */
export function fontsCheck({ css, source, html, deps }) {
	if (/--font-sans\s*:/.test(css)) return { status: "pass", name: "fonts", detail: "The app sets its own --font-sans; load the files for the fonts it names." }
	const text = [css, source, html, Object.keys(deps ?? {}).join(" ")].join("\n")
	const missing = [!/figtree/i.test(text) && "Figtree", !/dm[\s_+-]?mono/i.test(text) && "DM Mono"].filter(Boolean)
	if (!missing.length) return { status: "pass", name: "fonts", detail: "Figtree and DM Mono are loaded." }
	return {
		status: "warn",
		name: "fonts",
		detail: `${missing.join(" and ")} ${missing.length > 1 ? "are" : "is"} never loaded, so the Sable theme falls back to system fonts.`,
		fix: `Load them in the document head: <link href="${FONT_HREF}" rel="stylesheet" />`,
	}
}

/* ── Snippets. ───────────────────────────────────────────────────────────────── */

const CSS_BLOCK = (sourceGlob) => ['@import "tailwindcss";', '@import "@sableui/react/styles.css";', `@source "${sourceGlob}";`].join("\n")

/** Where IconProvider goes for this framework, as code to paste. */
export function providerSnippet(framework) {
	if (framework.id === "next" && framework.appDir)
		return {
			file: `${framework.appDir}/providers.tsx`,
			then: `${framework.root ?? `${framework.appDir}/layout.tsx`}: import { Providers } from "./providers", then <body><Providers>{children}</Providers></body>`,
			code: [
				'"use client"',
				"",
				'import type { ReactNode } from "react"',
				'import { IconProvider } from "@sableui/react"',
				'import { reiconIconSet } from "@sableui/react/icons/reicon"',
				"",
				"// A client boundary: the icon set is components, which a server layout cannot pass as a prop.",
				"export function Providers({ children }: { children: ReactNode }) {",
				"\treturn <IconProvider set={reiconIconSet}>{children}</IconProvider>",
				"}",
			].join("\n"),
		}
	return {
		file: framework.root ?? "the file that renders your app",
		then: null,
		code: [
			'import { IconProvider } from "@sableui/react"',
			'import { reiconIconSet } from "@sableui/react/icons/reicon"',
			"",
			"<IconProvider set={reiconIconSet}>",
			"\t<App />",
			"</IconProvider>",
		].join("\n"),
	}
}

/* ── Text edits. ─────────────────────────────────────────────────────────────── */

const COMMENT = /\/\*[\s\S]*?\*\/|\/\/[^\n]*/g
const CSS_COMMENT = /\/\*[\s\S]*?\*\//g
const TW_IMPORT = /@import\s+["']tailwindcss["'][^;]*;/g
const SABLE_IMPORT = /@import\s+["']@sableui\/react\/styles\.css["'][^;]*;/g

/** Matches of `pattern` outside comments — a commented-out import is not wiring. */
function live(text, pattern, comments = CSS_COMMENT) {
	const ranges = [...text.matchAll(comments)].map((m) => [m.index, m.index + m[0].length])
	return [...text.matchAll(new RegExp(pattern.source, "g"))].filter((m) => !ranges.some(([a, b]) => m.index >= a && m.index < b))
}

/** The indentation of the first indented line after `at`, or two spaces. */
function indentAfter(text, at) {
	return /\n([ \t]+)\S/.exec(text.slice(at))?.[1] ?? "  "
}

/** The file's string quote, read from its import specifiers, so an edit matches its style. */
function quoteOf(text) {
	return /(?:from\s*|^import\s*)'/m.test(text) && !/(?:from\s*|^import\s*)"/m.test(text) ? "'" : '"'
}
const inQuotes = (text, code) => code.replaceAll('"', quoteOf(text))

/** Insert an import after the file's last import statement (multi-line ones included), or at the top. */
function addImport(text, line) {
	const lines = text.split("\n")
	let end = -1
	for (let i = 0; i < lines.length; i++) {
		if (!/^import\b/.test(lines[i])) continue
		let j = i
		while (j < lines.length - 1 && !/(?:from\s*["'][^"']+["']|^import\s*["'][^"']+["'])\s*;?\s*$/.test(lines[j])) j++
		end = i = j
	}
	lines.splice(end + 1, 0, inQuotes(text, line))
	return lines.join("\n")
}

/**
 * Add `key: value` to the object a Vite config exports, when there is exactly
 * one recognisable such object: `defineConfig({`, `defineConfig(() => ({`, or
 * `export default {`. Anything else returns null and the edit is manual.
 */
function addConfigKey(text, entry) {
	const opens = [
		...live(text, /defineConfig\(\s*\{/, COMMENT),
		...live(text, /defineConfig\(\s*(?:async\s*)?\([^)]*\)\s*=>\s*\(\s*\{/, COMMENT),
		...live(text, /export\s+default\s+\{/, COMMENT),
	]
	if (opens.length !== 1) return null
	const at = opens[0].index + opens[0][0].length
	const indent = indentAfter(text, at)
	return `${text.slice(0, at)}\n${indent}${inQuotes(text, entry)},${/^\s*\n/.test(text.slice(at)) ? "" : "\n"}${text.slice(at)}`
}

function addDedupe(text) {
	if (/dedupe/.test(text)) return text
	const resolves = live(text, /\bresolve\s*:\s*\{/, COMMENT)
	if (resolves.length > 1) return null
	if (resolves.length === 1) {
		const at = resolves[0].index + resolves[0][0].length
		return `${text.slice(0, at)} ${inQuotes(text, 'dedupe: ["react", "react-dom"]')},${text.slice(at)}`
	}
	return addConfigKey(text, 'resolve: { dedupe: ["react", "react-dom"] }')
}

function addTailwindPlugin(text) {
	if (/@tailwindcss\/vite/.test(text)) return text
	// The plugin's conventional name is taken; renaming someone's binding is a guess.
	if (live(text, /\btailwindcss\b/, COMMENT).length) return null
	const plugins = live(text, /\bplugins\s*:\s*\[/, COMMENT)
	let next
	if (plugins.length === 1) {
		const at = plugins[0].index + plugins[0][0].length
		next = `${text.slice(0, at)}tailwindcss(), ${text.slice(at)}`.replace("tailwindcss(), ]", "tailwindcss()]")
	} else if (!plugins.length) next = addConfigKey(text, "plugins: [tailwindcss()]")
	if (!next) return null
	return addImport(next, 'import tailwindcss from "@tailwindcss/vite"')
}

/* ── The fixer. ──────────────────────────────────────────────────────────────── */

/**
 * Apply (or, with dryRun, plan) a fix for each failing doctor check that has a
 * mechanical one. Returns one result per check it acted on:
 * `{ check, status: "applied" | "would-apply" | "manual" | "failed", file?, detail, snippet? }`.
 */
export function fixWiring({ root, pkgRoot, report, framework, dryRun = false, install = true, quiet = false }) {
	const results = []
	const flagged = new Map(report.checks.filter((c) => c.status === "fail" || c.status === "warn" || (c.status === "info" && c.name === "dedupe")).map((c) => [c.name, c]))
	const handled = new Set()
	const done = (check, detail, file) => {
		handled.add(check)
		results.push({ check, status: dryRun ? "would-apply" : "applied", ...(file ? { file } : {}), detail })
	}
	const manual = (check, detail, snippet, file) => {
		handled.add(check)
		results.push({ check, status: "manual", ...(file ? { file } : {}), detail, ...(snippet ? { snippet } : {}) })
	}
	const write = (file, text) => {
		if (dryRun) return
		mkdirSync(dirname(join(root, file)), { recursive: true })
		writeFileSync(join(root, file), text)
	}

	/* Dependencies first: everything after edits files that assume them. */
	const pm = detectPackageManager(root)
	// Only a missing package installs. A version outside the range (a warning) is
	// the user's upgrade to make, never a side effect of fixing CSS.
	const failing = (name) => flagged.get(name)?.status === "fail"
	const runtime = [failing("install") && "@sableui/react", failing("react") && "react", failing("react-dom") && "react-dom"].filter(Boolean)
	const build = flagged.get("css:build")
	const deps = declaredDeps(root)
	const integration = framework.id === "vite" ? "@tailwindcss/vite" : framework.id === "next" ? "@tailwindcss/postcss" : null
	const dev = [failing("tailwindcss") && "tailwindcss", build && integration && !deps[integration] && integration].filter(Boolean)
	// The integration package is reported under css:build, with the config edit
	// that makes it do anything; a failed install leaves that check to fail.
	let integrationInstall = dev.includes(integration) ? "pending" : "present"
	for (const [names, isDev] of [[runtime, false], [dev, true]]) {
		if (!names.length) continue
		const cmd = installCommand(pm, names, { dev: isDev })
		const checks = names.filter((n) => n !== integration).map((n) => (n === "@sableui/react" ? "install" : n))
		if (!install) {
			if (names.includes(integration)) integrationInstall = "skipped"
			for (const check of checks) manual(check, "Install it (skipped by --no-install).", cmd.join(" "))
			continue
		}
		if (dryRun) {
			for (const check of checks) done(check, cmd.join(" "))
			continue
		}
		const r = spawnSync(cmd[0], cmd.slice(1), { cwd: root, encoding: "utf8", stdio: quiet ? "pipe" : ["ignore", "inherit", "inherit"], shell: process.platform === "win32" })
		if (names.includes(integration)) integrationInstall = r.status === 0 ? "present" : "failed"
		for (const check of checks)
			if (r.status === 0) done(check, cmd.join(" "))
			else results.push({ check, status: "failed", detail: `${cmd.join(" ")} exited ${r.status ?? "with an error"}${quiet && r.stderr ? `: ${r.stderr.trim().split("\n").pop()}` : ""}` })
	}
	const integrationCmd = integration ? installCommand(pm, [integration], { dev: true }).join(" ") : ""
	const installedNote = dev.includes(integration) ? `${integrationCmd}; ` : ""
	/** True when the integration package could not be installed, after reporting why. */
	const buildBlocked = () => {
		if (integrationInstall === "skipped") manual("css:build", `Install ${integration} (skipped by --no-install), then run sable doctor --fix again.`, integrationCmd)
		else if (integrationInstall === "failed") {
			handled.add("css:build")
			results.push({ check: "css:build", status: "failed", detail: `${integrationCmd} failed, so the build integration was not configured.` })
		} else return false
		return true
	}

	/* The build: Tailwind in it, and one React. */
	if (framework.id === "vite") {
		const file = framework.config
		const original = file ? read(join(root, file)) : null
		let text = original
		if (build && !buildBlocked()) {
			const next = text === null ? null : addTailwindPlugin(text)
			if (next === null) manual("css:build", `Add tailwindcss() from @tailwindcss/vite to the plugins in ${file ?? "your Vite config"}.`, 'import tailwindcss from "@tailwindcss/vite"\n// plugins: [tailwindcss(), …]', file ?? undefined)
			else {
				text = next
				done("css:build", `${installedNote}tailwindcss() in the Vite plugins.`, file)
			}
		}
		if (flagged.has("dedupe")) {
			const next = text === null ? null : addDedupe(text)
			if (next === null) manual("dedupe", `Add resolve.dedupe to ${file ?? "your Vite config"}; its shape is not one this edits safely.`, 'resolve: { dedupe: ["react", "react-dom"] }', file ?? undefined)
			else {
				text = next
				done("dedupe", 'resolve: { dedupe: ["react", "react-dom"] } in the Vite config.', file)
			}
		}
		if (text !== null && text !== original) write(file, text)
	} else if (framework.id === "next" && build && !buildBlocked()) {
		const existing = POSTCSS_CONFIGS.find((f) => existsSync(join(root, f)))
		if (existing) manual("css:build", `Add "@tailwindcss/postcss": {} to the plugins in ${existing}.`, 'plugins: { "@tailwindcss/postcss": {} }', existing)
		else {
			write("postcss.config.mjs", 'const config = {\n\tplugins: {\n\t\t"@tailwindcss/postcss": {},\n\t},\n}\n\nexport default config\n')
			done("css:build", `${installedNote}a postcss.config.mjs running @tailwindcss/postcss.`, "postcss.config.mjs")
		}
	} else if (build && !handled.has("css:build")) manual("css:build", build.detail, build.fix)
	// Next.js resolves react to its own bundled copy for the app, so there is no
	// second React to dedupe; doctor only notes that it could not confirm one.
	if (flagged.has("dedupe") && !handled.has("dedupe") && framework.id !== "next")
		manual("dedupe", "Dedupe React in your bundler, so Base UI and the app share one copy.", 'resolve: { dedupe: ["react", "react-dom"] }')

	/* The stylesheet: tailwindcss, then Sable's styles, then the @source. */
	const cssChecks = ["css", "css:tailwind", "css:styles", "css:order", "css:source"].filter((n) => flagged.has(n))
	if (cssChecks.length) fixStylesheet({ root, framework, cssChecks, done, manual, write })

	/* A generated sources list that went stale. */
	const sources = flagged.get("css:sources")
	if (sources?.status === "fail") {
		const file = /--write\s+(\S+)/.exec(sources.fix ?? "")?.[1]
		if (!file) manual("css:sources", sources.detail, sources.fix)
		else {
			if (!dryRun) writeFileSync(resolve(root, file), sourcesCss(pkgRoot, root, file).css)
			done("css:sources", "The @source list regenerated for the modules the app imports.", file)
		}
	}

	/* Fonts, in the document head. */
	if (flagged.has("fonts")) {
		const html = framework.html ? read(join(root, framework.html)) : null
		const head = html ? live(html, /<\/head>/, /<!--[\s\S]*?-->/g) : []
		if (head.length === 1) {
			const lineStart = html.lastIndexOf("\n", head[0].index) + 1
			const closing = html.slice(lineStart, head[0].index)
			const inner = /\n([ \t]+)<[^/][^\n]*\n[ \t]*$/.exec(html.slice(0, lineStart))?.[1] ?? `${closing}\t`
			const block = FONT_LINKS.map((l) => `${inner}${l}\n`).join("")
			write(framework.html, html.slice(0, lineStart) + block + html.slice(lineStart))
			done("fonts", "Google Fonts links for Figtree and DM Mono in the head.", framework.html)
		} else
			manual(
				"fonts",
				"Load Figtree and DM Mono in the document head" + (framework.id === "next" ? ` — in ${framework.root ?? "the root layout"}, inside <head>.` : "."),
				FONT_LINKS.join("\n"),
				framework.id === "next" ? (framework.root ?? undefined) : undefined,
			)
	}

	/* IconProvider: edited only in the starter's own shape — one <App /> in a
	 * Vite entry that calls createRoot. Anything else is printed. */
	if (flagged.has("icons")) {
		const snippet = providerSnippet(framework)
		const file = framework.id === "vite" ? framework.root : null
		const text = file ? read(join(root, file)) : null
		const apps = text ? live(text, /<App\s*\/>/, COMMENT) : []
		if (text && apps.length === 1 && /createRoot\s*\(/.test(text) && !/\bIconProvider\b|\breiconIconSet\b/.test(text)) {
			const m = apps[0]
			const lineStart = text.lastIndexOf("\n", m.index) + 1
			const indent = /^[ \t]*/.exec(text.slice(lineStart))[0]
			const own = text.slice(lineStart, m.index).trim() === ""
			const unit = indent.includes("\t") ? "\t" : "  "
			const wrapped = own
				? `<IconProvider set={reiconIconSet}>\n${indent}${unit}<App />\n${indent}</IconProvider>`
				: "<IconProvider set={reiconIconSet}><App /></IconProvider>"
			let next = text.slice(0, m.index) + wrapped + text.slice(m.index + m[0].length)
			next = addImport(addImport(next, 'import { IconProvider } from "@sableui/react"'), 'import { reiconIconSet } from "@sableui/react/icons/reicon"')
			write(file, next)
			done("icons", "<App /> wrapped in <IconProvider set={reiconIconSet}>.", file)
		} else manual("icons", `Mount IconProvider once at the app root${snippet.then ? `, then ${snippet.then}` : ""}.`, snippet.code, snippet.file)
	}

	/* Everything else doctor flags has no mechanical fix: print its own. */
	for (const [name, check] of flagged) {
		if (handled.has(name) || check.status === "info" || name === "css:sources") continue
		if (name === "css:build") continue
		manual(name, check.detail, check.fix)
	}
	if (sources && sources.status !== "fail") manual("css:sources", sources.detail, sources.fix)
	return results
}

function fixStylesheet({ root, framework, cssChecks, done, manual, write }) {
	// Every stylesheet in the project (not node_modules or build output), to find
	// the one that already carries the imports.
	const files = []
	const walk = (dir) => {
		let entries
		try {
			entries = readdirSync(dir, { withFileTypes: true })
		} catch {
			return
		}
		for (const entry of entries) {
			if (["node_modules", "dist", "build", "out", ".next", ".git", "coverage", ".turbo"].includes(entry.name)) continue
			const full = join(dir, entry.name)
			if (entry.isDirectory()) walk(full)
			else if (/\.css$/.test(entry.name)) files.push(posix(relative(root, full)))
		}
	}
	walk(root)
	const text = (f) => read(join(root, f)) ?? ""
	const withSable = files.find((f) => live(text(f), SABLE_IMPORT).length)
	const withTw = files.find((f) => live(text(f), TW_IMPORT).length)
	const candidate = framework.stylesheets.find((f) => files.includes(f))
	const entry = withSable ?? withTw ?? candidate ?? null

	const pkgDir = upward(root).map((d) => join(d, "node_modules", "@sableui", "react")).find((d) => existsSync(d)) ?? join(root, "node_modules", "@sableui", "react")
	const globFor = (file) => `${posix(relative(dirname(join(root, file)), join(pkgDir, "dist")))}/**/*.{js,mjs}`

	if (!entry) {
		// No stylesheet at all: create the framework's own and import it from the
		// file that renders the app — the two edits a starter would have made.
		const file = framework.stylesheets[0]
		const rootFile = framework.root
		const rootText = rootFile ? read(join(root, rootFile)) : null
		if (framework.id === "unknown" || !rootText) {
			for (const check of cssChecks) manual(check, `Create a global stylesheet${framework.id === "unknown" ? "" : ` (${file})`}, import it where the app renders, and start it with:`, CSS_BLOCK(globFor(file)))
			return
		}
		write(file, `${CSS_BLOCK(globFor(file))}\n`)
		const spec = `./${posix(relative(dirname(join(root, rootFile)), join(root, file)))}`
		write(rootFile, addImport(rootText, `import "${spec}"`))
		for (const check of cssChecks) done(check, `A new ${file} with the Sable imports, imported from ${rootFile}.`, file)
		return
	}

	let css = text(entry)
	const sableHere = live(css, SABLE_IMPORT)
	// Sable's import is somewhere other than the file with tailwindcss (a partial
	// imported before it): moving it means choosing between the user's files.
	if (cssChecks.includes("css:order") && (!sableHere.length || !live(css, TW_IMPORT).length)) {
		manual("css:order", `Import tailwindcss before @sableui/react/styles.css; they are split across files here (${[withTw, withSable].filter(Boolean).join(", ")}).`, CSS_BLOCK(globFor(entry)))
		return
	}
	const what = []
	for (const m of sableHere.reverse()) css = css.slice(0, m.index) + css.slice(m.index + m[0].length).replace(/^[ \t]*\r?\n/, "")
	let tw = live(css, TW_IMPORT)[0]
	if (!tw) {
		const charset = /^@charset[^;]*;\s*\n?/.exec(css)
		const at = charset ? charset[0].length : 0
		css = `${css.slice(0, at)}@import "tailwindcss";\n${css.slice(at)}`
		tw = live(css, TW_IMPORT)[0]
		what.push('@import "tailwindcss"')
	}
	what.push(sableHere.length ? '@import "@sableui/react/styles.css" moved after it' : '@import "@sableui/react/styles.css" after it')
	const all = files.map(text).join("\n")
	const hasSource = /@source[^;]*(@sableui\/react|packages\/sable)/.test(all.replace(CSS_COMMENT, "")) || all.includes(SOURCES_MARKER)
	if (!hasSource) what.push(`@source "${globFor(entry)}"`)
	const at = tw.index + tw[0].length
	const block = `\n@import "@sableui/react/styles.css";${hasSource ? "" : `\n@source "${globFor(entry)}";`}`
	css = css.slice(0, at) + block + css.slice(at)
	if (css !== text(entry)) write(entry, css)
	for (const check of cssChecks) done(check, `${what.join(", ")}.`, entry)
}

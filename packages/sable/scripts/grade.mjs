#!/usr/bin/env node
/**
 * grade — score a folder of generated code against the Sable contract.
 *
 *   node scripts/grade.mjs ../some-app/src
 *   node scripts/grade.mjs ./out --json
 *   node scripts/grade.mjs ./out --cli-log run.jsonl
 *
 * Why this exists: we have shipped a large amount of machinery aimed at making
 * agents write correct Sable code — the registry, llms.txt, the task docs, the
 * patterns tier, and now a retrieval CLI — and measured none of it. "Did that
 * help?" has been answered by reading diffs and forming an impression. This
 * turns the question into a number, with no model calls, so the same code can be
 * scored repeatedly and compared across conditions.
 *
 * It is deliberately NOT a typechecker. `tsc` already catches unknown imports
 * and bad prop types far better than any lexical pass, and a grader that
 * duplicated it would mostly measure whether the sample compiles. What it
 * measures instead is the stuff tsc structurally cannot see:
 *
 *   - class-string drift, which Tailwind silently no-ops (the design contract)
 *   - Radix idioms hallucinated into Base UI code (`asChild`)
 *   - the density ladder bypassed with a hardcoded pixel height
 *   - icons named outside the contract
 *   - pattern similarity as a diagnostic, never as a reward for copying a shell
 *
 * Every check is lexical and dependency-free. Scores are comparative
 * instruments, not grades in an absolute sense — a 78 means nothing on its own
 * and everything next to the same task scored 61.
 */

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs"
import { createHash } from "node:crypto"
import { dirname, extname, join, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { ignoreGlob, lintText, makeRules, surfaceInventory } from "./lint-rules.mjs"
import { labelContrastScanner, statusTextDrift } from "./label-contrast.mjs"
import { skeletonize } from "./skeleton.mjs"
import { assessReview, reviewTemplate } from "./review-evidence.mjs"

const HERE = dirname(fileURLToPath(import.meta.url))
const PKG_ROOT = join(HERE, "..")
const CWD = process.cwd()

const argv = process.argv.slice(2)
const flags = new Map()
const targets = []
const ignores = []
const BOOLEAN_FLAGS = new Set(["json", "help", "template", "strict"])
const VALUE_FLAGS = new Set(["cli-log", "review", "icons"])
const JSON_OUT = argv.includes("--json")
function abort(message) {
	const error = { type: "error", code: "ERR_GRADE_INPUT", message, suggestions: ["sable grade --help", "sable grade --template"] }
	process.stderr.write(JSON_OUT ? `${JSON.stringify(error)}\n` : `[grade] ${message}\n`)
	process.exit(1)
}
for (let i = 0; i < argv.length; i++) {
	const a = argv[i]
	if (!a.startsWith("--")) targets.push(a)
	else if (a === "--ignore" || a.startsWith("--ignore=")) {
		const glob = a === "--ignore" ? argv[++i] : a.slice(9)
		if (!glob || glob.startsWith("--")) abort("--ignore requires a glob.")
		ignores.push(glob)
	} else if (BOOLEAN_FLAGS.has(a.slice(2))) flags.set(a.slice(2), true)
	else if (VALUE_FLAGS.has(a.slice(2))) {
		if (!argv[i + 1] || argv[i + 1].startsWith("--")) abort(`${a} requires a file path.`)
		flags.set(a.slice(2), argv[++i])
	} else abort(`Unknown flag ${a}.`)
}

if (flags.has("template")) {
	process.stdout.write(`${JSON.stringify(reviewTemplate(), null, 2)}\n`)
	process.exit(0)
}

if (flags.has("help") || !targets.length) {
	process.stdout.write(
		[
			"grade — check the static contract and recorded review evidence. No model calls.",
			"",
			"  sable grade <dir...> [--json] [--review <review.json>] [--icons <icons.json>] [--ignore <glob>] [--strict]",
			"",
			"  --json           machine-readable scorecard",
			"  --cli-log        a SABLE_CLI_LOG jsonl, to report whether the CLI was used at all",
			"  --template       print a review JSON template; fill after inspecting the rendered build",
			"  --review         validate evidence files and observations; paths are relative to this JSON",
			'  --icons          icon names the app adds with composeIconSets: { "names": [...] }. Default: .sable/icons.json',
			"  --ignore         skip matching paths in the checks, as sable-lint --ignore (repeatable)",
			"  --strict         exit 1 for static findings or a missing/incomplete/unresolved review",
			"",
			"Checks: design-contract violations · hallucinated components and props ·",
			"Radix idioms · hardcoded control heights · off-contract icon names ·",
			"pattern similarity (informational only; original compositions carry no penalty).",
			"A clean contract is not visual approval. This tool does not inspect screenshots.",
			"",
		].join("\n"),
	)
	process.exit(flags.has("help") ? 0 : 1)
}

/* ── The contract. ─────────────────────────────────────────────────────────── */

const REGISTRY = JSON.parse(readFileSync(join(PKG_ROOT, "registry.json"), "utf8"))
const semanticTokens = new Set((REGISTRY.tokens?.semantic ?? []).map((t) => t.name))
const motionTokens = new Set(
	[
		...(REGISTRY.tokens?.motion?.durations ?? []).map((d) => `motion-duration-${d}`),
		...(REGISTRY.tokens?.motion?.easings ?? []).map((e) => `motion-ease-${e}`),
		REGISTRY.tokens?.motion?.scale,
	].filter(Boolean),
)
const RULES = makeRules({ semanticTokens, motionTokens, labelContrast: await labelContrastScanner(PKG_ROOT, REGISTRY.themes?.default), statusText: (css) => statusTextDrift(css, REGISTRY.themes?.default) }).filter((r) => r.scope !== "package")
const PROP_SURFACE = REGISTRY.propSurface?.items ?? {}
const ICONS = new Set(REGISTRY.iconContract?.names ?? [])
/**
 * The names an app adds with `composeIconSets(appExtras, reiconIconSet)`. That is
 * the sanctioned way to extend the set, and the grade cannot read a set's names
 * out of a render function, so the app declares them once. Without this every
 * domain icon read as off-contract.
 */
const APP_ICONS = (() => {
	const explicit = flags.get("icons")
	const path = resolve(CWD, explicit ?? ".sable/icons.json")
	if (!existsSync(path)) {
		if (explicit) abort(`Not found: ${explicit}`)
		return null
	}
	let names
	try { names = JSON.parse(readFileSync(path, "utf8")).names }
	catch (error) { abort(`Cannot read ${relative(CWD, path)}: ${error.message}`) }
	if (!Array.isArray(names) || !names.every((n) => typeof n === "string" && n)) abort(`${relative(CWD, path)} must be { "names": ["icon-name", …] }.`)
	return { file: relative(CWD, path).replaceAll("\\", "/"), names: new Set(names) }
})()
const PATTERNS = REGISTRY.patterns?.items ?? []

/**
 * Everything importable from the package. Read from the real barrel where it is
 * available, because the registry describes components and misses the hooks,
 * providers and helpers a page legitimately imports (`cn`, `useSableTheme`,
 * `Presence`, …) — grading those as hallucinations would be worse than useless.
 */
function exportSurface() {
	const names = new Set()
	for (const c of REGISTRY.components ?? []) {
		names.add(c.name)
		for (const s of c.subcomponents ?? []) names.add(typeof s === "string" ? s : s.name)
	}
	for (const m of REGISTRY.layoutPrimitives?.primitives ?? []) names.add(m.name)
	for (const p of PATTERNS) names.add(p.name)
	for (const n of REGISTRY.motionLayer?.policy ?? []) names.add(n)
	for (const n of REGISTRY.motionLayer?.primitives ?? []) names.add(n)

	const root = SUBPATHS.get("")
	if (root) for (const n of root.names) names.add(n)
	return names
}

/**
 * The export surface of every published subpath, read from the package's own
 * `exports` map (src in the workspace, dist .d.ts once published) by following
 * each entry's `export … from` / `export *` chain.
 *
 * It has to be per subpath. Judging every `@sableui/react/<anything>` import
 * against the root barrel reported `SignInBlock` from `/blocks`,
 * `presetManifest` from `/presets` and `reiconIconSet` from `/icons/reicon` as
 * hallucinations — 25 of them in Sable's own docs app — and a check that cries
 * wolf on correct code is a check people learn to skip.
 *
 * A surface is `complete: false` when a chain leaves the package (`export * from
 * "some-dep"`); names imported from it are then not judged rather than guessed.
 */
function subpathSurfaces() {
	const pkg = JSON.parse(readFileSync(join(PKG_ROOT, "package.json"), "utf8"))
	const exportsMap = pkg.exports ?? {}
	const out = new Map()
	const typesFile = (entry) => {
		const v = typeof entry === "string" ? entry : (entry?.types ?? entry?.import?.types ?? entry?.default ?? entry?.import)
		if (typeof v !== "string" || !/\.(?:d\.)?[cm]?[jt]sx?$/.test(v)) return null
		return join(PKG_ROOT, v)
	}
	const candidates = (base) => {
		const stem = base.replace(/\.(?:d\.)?[cm]?[jt]sx?$/, "")
		return [base, `${stem}.d.ts`, `${stem}.ts`, `${stem}.tsx`, `${stem}.d.mts`, join(base, "index.d.ts"), join(base, "index.ts"), join(base, "index.tsx")]
	}
	const collect = (file, names, seen, state) => {
		if (seen.has(file)) return
		seen.add(file)
		const src = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/[^\n]*/g, "$1")
		for (const m of src.matchAll(/export\s+(?:type\s+)?\{([^}]*)\}/g)) {
			for (const raw of m[1].split(",")) {
				const name = raw.trim().replace(/^type\s+/, "").split(/\s+as\s+/).pop()?.trim()
				if (name && name !== "default" && /^[A-Za-z_$][\w$]*$/.test(name)) names.add(name)
			}
		}
		for (const m of src.matchAll(/export\s+(?:declare\s+)?(?:default\s+)?(?:abstract\s+)?(?:const|let|var|function\*?|class|type|interface|enum|namespace)\s+([\w$]+)/g)) names.add(m[1])
		for (const m of src.matchAll(/export\s+\*\s+as\s+([\w$]+)\s+from/g)) names.add(m[1])
		for (const m of src.matchAll(/export\s+\*\s+from\s+["']([^"']+)["']/g)) {
			if (!m[1].startsWith(".")) { state.complete = false; continue }
			const next = candidates(resolve(dirname(file), m[1])).find((c) => existsSync(c) && statSync(c).isFile())
			if (next) collect(next, names, seen, state)
			else state.complete = false
		}
	}
	for (const [key, entry] of Object.entries(exportsMap)) {
		const sub = key === "." ? "" : key.replace(/^\.\//, "")
		const file = typesFile(entry)
		if (!file) {
			out.set(sub, { names: new Set(), complete: true, asset: true })
			continue
		}
		const names = new Set()
		const state = { complete: true }
		const start = candidates(file).find((c) => existsSync(c) && statSync(c).isFile())
		if (start) collect(start, names, new Set(), state)
		else state.complete = false
		out.set(sub, { names, complete: state.complete })
	}
	return out
}
const SUBPATHS = subpathSurfaces()
const EXPORTS = exportSurface()

/**
 * What one file imports from Sable: local name → { name, from }. Aliases
 * (`Button as SableButton`) map back to the Sable name, and a component the app
 * defines itself under a Sable name (its own `PageHeader`) is simply absent, so
 * the prop and icon checks below never judge it against Sable's contract.
 */
/**
 * The text with every template literal's literal part blanked (newlines kept,
 * so line numbers hold). A docs page or a code-preview builder carries JSX as
 * DATA — `<RadioCard value="post" …>` inside a backtick string, `<Icon
 * name="${glyph}" />` assembled for display — and judging that as rendered JSX
 * reported attributes like `n` (from a `\n` escape) and an icon named
 * `${glyph}`. `${…}` expressions are kept, since they are code.
 */
function maskTemplates(text) {
	let out = ""
	const stack = [] // "t" = inside a template literal, number = brace depth of a ${ } expression
	let quote = null
	for (let i = 0; i < text.length; i++) {
		const c = text[i]
		const top = stack[stack.length - 1]
		if (top === "t") {
			if (c === "\\") { out += text[i + 1] === "\n" ? " \n" : "  "; i++; continue }
			if (c === "`") { stack.pop(); out += c; continue }
			if (c === "$" && text[i + 1] === "{") { stack.push(0); out += "${"; i++; continue }
			out += c === "\n" ? "\n" : " "
			continue
		}
		if (quote) {
			if (c === "\\") { out += c + (text[i + 1] ?? ""); i++; continue }
			if (c === quote || c === "\n") quote = null
			out += c
			continue
		}
		if (c === "/" && text[i + 1] === "/") {
			const nl = text.indexOf("\n", i)
			const end = nl === -1 ? text.length : nl
			out += text.slice(i, end)
			i = end - 1
			continue
		}
		if (c === "/" && text[i + 1] === "*") {
			const end = text.indexOf("*/", i + 2)
			const stop = end === -1 ? text.length : end + 2
			out += text.slice(i, stop)
			i = stop - 1
			continue
		}
		if (c === "'" || c === '"') { quote = c; out += c; continue }
		if (c === "`") { stack.push("t"); out += c; continue }
		if (typeof top === "number") {
			if (c === "{") stack[stack.length - 1]++
			else if (c === "}") {
				if (top === 0) { stack.pop(); out += c; continue }
				stack[stack.length - 1]--
			}
		}
		out += c
	}
	return out
}

const SABLE_IMPORT =/import\s+(?:type\s+)?(?:[\w$]+\s*,\s*)?\{([^}]*)\}\s*from\s*["'](@sableui\/react(?:\/[^"']*)?)["']/g
function sableImports(text) {
	const out = new Map()
	for (const m of text.matchAll(SABLE_IMPORT)) {
		for (const raw of m[1].split(",")) {
			const [name, local] = raw.trim().replace(/^type\s+/, "").split(/\s+as\s+/).map((s) => s?.trim())
			if (name) out.set(local || name, { name, from: m[2], index: m.index })
		}
	}
	return out
}

/** Props any element legitimately takes, so they never read as hallucinated. */
const UNIVERSAL_PROPS = new Set([
	"key", "ref", "className", "style", "id", "role", "tabIndex", "title", "hidden", "slot", "children",
	"render", "asChild", "dir", "lang", "translate", "draggable", "contentEditable", "spellCheck",
	"inert", "popover", "form", "name", "value", "defaultValue", "checked", "defaultChecked",
	"disabled", "required", "readOnly", "placeholder", "type", "href", "target", "rel", "src", "alt",
	"width", "height", "colSpan", "rowSpan", "htmlFor", "autoFocus", "autoComplete", "maxLength",
	"minLength", "min", "max", "step", "rows", "cols", "open", "selected", "multiple", "loading",
	// Media attributes, for components that spread onto <video>/<audio>/<img> (Video, Image).
	"autoPlay", "muted", "loop", "playsInline", "preload", "crossOrigin", "decoding", "fetchPriority", "srcSet", "sizes",
])
const isEventProp = (p) => /^on[A-Z]/.test(p)
const isPassthrough = (p) => p.startsWith("data-") || p.startsWith("aria-") || p.startsWith("--")

/* ── Walk. ─────────────────────────────────────────────────────────────────── */

const SKIP = new Set(["node_modules", ".next", ".nuxt", "dist", "build", "out", "coverage", ".git", ".turbo"])
const CODE = /\.(tsx|ts|jsx|js|css|scss|html)$/
function* walk(dir, includeAssets = false) {
	for (const name of readdirSync(dir)) {
		if (SKIP.has(name)) continue
		const full = join(dir, name)
		const st = statSync(full)
		if (st.isDirectory()) yield* walk(full, includeAssets)
		else if ((includeAssets || CODE.test(name)) && !/\.(test|spec)\./.test(name)) yield full
	}
}

const snapshotFiles = []
for (const t of targets) {
	const abs = resolve(CWD, t)
	if (!existsSync(abs)) abort(`Not found: ${t}`)
	if (statSync(abs).isDirectory()) snapshotFiles.push(...walk(abs, true))
	else snapshotFiles.push(abs)
}
snapshotFiles.splice(0, snapshotFiles.length, ...new Set(snapshotFiles.sort()))
/* --ignore takes the same globs sable-lint does, so the grade judges the same
   files the lint does. A data layer (palette fixtures, document colours) is
   skipped by the checks but still fingerprinted: it is part of the build. */
const ignoreRes = ignores.map(ignoreGlob)
const isIgnored = (file) => ignoreRes.some((re) => re.test(relative(CWD, file).replaceAll("\\", "/")))
const ignoredFiles = snapshotFiles.filter((file) => CODE.test(file) && isIgnored(file))
const files = snapshotFiles.filter((file) => CODE.test(file) && !isIgnored(file))
if (!files.length) abort("No source files found.")
if (!files.some((file) => readFileSync(file, "utf8").trim().length > 0)) abort("No non-empty source content found.")
// Git checkouts may use CRLF on Windows and LF in CI. Normalize only known text
// formats for reproducible source identity; binary assets retain byte identity.
const TEXT_FILE = /\.(?:[cm]?[jt]sx?|css|scss|html?|json|md|mdx|txt|ya?ml|svg|xml|csv|tsv|map)$/i
function fingerprintBytes(file) {
	const bytes = readFileSync(file)
	return TEXT_FILE.test(file) ? bytes.toString("utf8").replace(/\r\n/g, "\n") : bytes
}
// Include the actual library implementation, not just its version string: a
// workspace library can change before its version is bumped. Installed consumers
// fingerprint dist; contributors fingerprint src (which their bundler uses).
const runtimeRoot = join(PKG_ROOT, existsSync(join(PKG_ROOT, "src")) ? "src" : "dist")
const packageFingerprint = createHash("sha256")
const packageFiles = [join(PKG_ROOT, "registry.json"), join(HERE, "lint-rules.mjs"), ...(existsSync(runtimeRoot) ? walk(runtimeRoot) : [])].sort()
for (const file of packageFiles) packageFingerprint.update(relative(PKG_ROOT, file).replaceAll("\\", "/")).update("\0").update(fingerprintBytes(file)).update("\0")
const packageHash = packageFingerprint.digest("hex")
const fingerprint = createHash("sha256")
fingerprint.update(packageHash).update("\0")
// Asset bytes inside supplied targets matter too. Pass public/ alongside src/
// when images or fonts live there; remote resources cannot be fingerprinted.
for (const file of snapshotFiles) fingerprint.update(relative(CWD, file).replaceAll("\\", "/")).update("\0").update(fingerprintBytes(file)).update("\0")
const sourceHash = fingerprint.digest("hex")

/* ── Checks. ───────────────────────────────────────────────────────────────── */

const findings = { contract: [], hallucinatedComponent: [], hallucinatedProp: [], radixIdiom: [], hardcodedControl: [], offContractIcon: [] }
let loc = 0
const routeSkeletons = []
/* App-owned surfaces: intrinsic elements wearing a surface's or a shape's
   classes. Never scored — a review list for the reuse inventory, so the agent
   accounts for each one (compose the named component, or say why not) instead
   of listing from memory. The lookalike-* lint rules fail the unambiguous
   cases; this lists the rest. */
const inventory = []

/**
 * Attribute names on one JSX open tag, stopping at the tag's own `>`.
 *
 * Comments are skipped explicitly. A `//` line comment is legal *inside* a JSX
 * open tag and Sable's own patterns use them to explain a prop — without this,
 * every word of the prose scans as a prop name and the component appears to be
 * carrying five hallucinated props.
 */
function attrsOf(source, from) {
	const out = []
	let depth = 0
	let quote = null
	for (let i = from; i < source.length; i++) {
		const c = source[i]
		if (quote) {
			if (c === quote) quote = null
			continue
		}
		if (c === "/" && source[i + 1] === "/") {
			const nl = source.indexOf("\n", i)
			if (nl === -1) break
			i = nl
			continue
		}
		if (c === "/" && source[i + 1] === "*") {
			const end = source.indexOf("*/", i + 2)
			if (end === -1) break
			i = end + 1
			continue
		}
		if (c === '"' || c === "'" || c === "`") { quote = c; continue }
		if (c === "{") depth++
		else if (c === "}") depth--
		else if (c === ">" && depth === 0) break
		else if (depth === 0 && /[A-Za-z_]/.test(c)) {
			const m = source.slice(i).match(/^([A-Za-z_][\w:-]*)\s*(=)?/)
			if (m) {
				out.push(m[1])
				i += m[1].length - 1
			}
		}
	}
	return out
}

for (const file of files) {
	const rel = relative(CWD, file).split(/[\\/]/).join("/")
	const text = readFileSync(file, "utf8")
	loc += text.split("\n").length

	/* 1. Same contract as sable-lint. An illustration exception uses the shared
	      reasoned disable syntax; the presence of a gradient cannot exempt an
	      unrelated inline color elsewhere on that source line. */
	const ctx = { isStylesheet: /\.(css|scss)$/.test(rel) }
	for (const v of lintText(text, RULES, ctx)) {
		findings.contract.push({ ...v, file: rel })
	}

	if (!/\.(tsx|jsx|ts|js)$/.test(extname(file) ? file : "")) continue

	/* 2. Imports that name something the subpath they come from does not export.
	      Each import is judged against ITS subpath's surface; an unpublished
	      subpath is itself the finding. */
	const imported = sableImports(text)
	for (const { name, from, index } of imported.values()) {
		const sub = from === "@sableui/react" ? "" : from.slice("@sableui/react/".length)
		const surface = SUBPATHS.get(sub)
		if (!surface) {
			findings.hallucinatedComponent.push({ file: rel, name, from, reason: "not a published subpath", line: lineOf(text, index) })
			continue
		}
		const known = surface.names.has(name) || (sub === "" && EXPORTS.has(name))
		if (!known && surface.complete) findings.hallucinatedComponent.push({ file: rel, name, from, line: lineOf(text, index) })
	}

	/* 3. Props set on a Sable component that its contract does not declare.
	      The contract is the component's real type (registry → propSurface),
	      which includes what it forwards to Base UI — Toggle's `pressed`,
	      Combobox's `filter` — plus its documented table. Only tags the file
	      imports from Sable are judged: an app's own `PageHeader` is not ours. */
	const code = maskTemplates(text)
	for (const m of code.matchAll(/<([A-Z][\w]*)[\s/>]/g)) {
		const sableName = imported.get(m[1])?.name
		if (!sableName) continue
		const comp = REGISTRY.components?.find((c) => c.name === sableName)
		if (!comp?.props?.length) continue
		const declared = new Set([...comp.props.map((p) => p.name), ...(PROP_SURFACE[sableName] ?? [])])
		for (const sub of comp.subcomponents ?? []) {
			if (typeof sub !== "string") for (const p of sub.props ?? []) declared.add(p.name)
		}
		for (const attr of attrsOf(code, m.index + m[0].length - 1)) {
			if (declared.has(attr) || UNIVERSAL_PROPS.has(attr) || isEventProp(attr) || isPassthrough(attr)) continue
			findings.hallucinatedProp.push({ file: rel, component: sableName, prop: attr, line: lineOf(text, m.index) })
		}
	}

	/* 4. Radix idioms. `asChild` is the single most-documented hallucination
	      against Base UI code — Sable composes with `render`. */
	for (const m of text.matchAll(/\basChild\b/g)) findings.radixIdiom.push({ file: rel, what: "asChild", line: lineOf(text, m.index) })
	for (const m of text.matchAll(/from\s*["'](@radix-ui\/[^"']+|@base-ui\/react[^"']*)["']/g)) {
		findings.radixIdiom.push({ file: rel, what: `direct import ${m[1]}`, line: lineOf(text, m.index) })
	}

	/* 5. Hardcoded control heights — bypassing the density ladder means the
	      component cannot follow a `data-density` scope, which stays invisible
	      until someone opens the workspace register.
	      Bounded to the ladder's actual range (24-44px, widened to 20-56 for
	      slack). An unbounded `h-[\d+px]` flags every media box and collage strip
	      on the page: `h-[380px]` is an illustration, not a control. */
	for (const m of text.matchAll(/\bh-\[(\d+)px\]/g)) {
		const px = Number(m[1])
		if (px >= 20 && px <= 56) findings.hardcodedControl.push({ file: rel, match: m[0], line: lineOf(text, m.index) })
	}

	/* 6. Icon names outside the contract render nothing at all — unless the app
	      supplies them itself and has declared them (APP_ICONS). Only Sable's
	      <Icon> (under whatever local name it was imported as) is judged. */
	for (const [local, { name }] of imported) {
		if (name !== "Icon") continue
		for (const m of code.matchAll(new RegExp(`<${local}\\s+[^>]*name=["']([^"']+)["']`, "g"))) {
			if (!ICONS.has(m[1]) && !APP_ICONS?.names.has(m[1])) findings.offContractIcon.push({ file: rel, name: m[1], line: lineOf(text, m.index) })
		}
	}

	/* 7. Surfaces the app built itself (informational). */
	if (/\.(tsx|jsx)$/.test(file)) {
		for (const { index, ...s } of surfaceInventory(text)) inventory.push({ file: rel, line: lineOf(text, index), ...s })
	}

	/* 8. Composition. Anything exporting a component that returns a big tree is
	      treated as a route worth comparing against the canonical shells. */
	if (/\.(tsx|jsx)$/.test(file) && /export\s+(default\s+)?function\s+[A-Z]/.test(text)) {
		const { tree } = skeletonize(text)
		if (tree.split("\n").length >= 6) routeSkeletons.push({ file: rel, tree })
	}
}

function lineOf(text, index) {
	return text.slice(0, index).split("\n").length
}

/* ── Pattern conformance. ──────────────────────────────────────────────────── */

/**
 * How close a page's composition is to the nearest canonical shell.
 *
 * This is the measurement nothing else in the ecosystem takes. Every other
 * signal here asks "is this line legal"; this one asks "is this page SHAPED
 * like the system's own answer to this problem" — the documented gap where an
 * agent produces a pile of individually-correct components in the wrong
 * arrangement. Half structural vocabulary (which primitives appear at all),
 * half order (do they nest and sequence the same way).
 */
/**
 * Only SABLE primitives count toward composition. Including raw html would score
 * two pages as similar for both containing many `div`s — the question is whether
 * the page reaches for the system's vocabulary in the system's arrangement, and
 * `div`/`span`/`p` carry no signal about that either way.
 */
const tagsOf = (tree) =>
	tree
		.split("\n")
		.map((l) => l.trim().match(/^<([A-Za-z][\w.]*)/)?.[1])
		.filter((t) => t && EXPORTS.has(t))

function lcs(a, b) {
	const prev = new Array(b.length + 1).fill(0)
	for (let i = 1; i <= a.length; i++) {
		let diag = 0
		for (let j = 1; j <= b.length; j++) {
			const tmp = prev[j]
			prev[j] = a[i - 1] === b[j - 1] ? diag + 1 : Math.max(prev[j], prev[j - 1])
			diag = tmp
		}
	}
	return prev[b.length]
}

function similarity(a, b) {
	if (!a.length || !b.length) return 0
	const sa = new Set(a)
	const sb = new Set(b)
	const inter = [...sa].filter((x) => sb.has(x)).length
	const jaccard = inter / (sa.size + sb.size - inter)
	const order = (2 * lcs(a, b)) / (a.length + b.length)
	return 0.5 * jaccard + 0.5 * order
}

const patternTags = PATTERNS.map((p) => ({ name: p.name, tags: tagsOf(skeletonize(p.code).tree) }))
const conformance = routeSkeletons.map((r) => {
	const tags = tagsOf(r.tree)
	let best = { name: null, score: 0 }
	for (const p of patternTags) {
		const s = similarity(tags, p.tags)
		if (s > best.score) best = { name: p.name, score: s }
	}
	return { file: r.file, nearest: best.name, score: +best.score.toFixed(3), depth: r.tree.split("\n").length }
})
const meanConformance = conformance.length
	? +(conformance.reduce((s, c) => s + c.score, 0) / conformance.length).toFixed(3)
	: null

/* ── Did the agent use the retrieval surface at all? ───────────────────────── */

let cliUsage = null
const logPath = flags.get("cli-log")
if (typeof logPath === "string" && existsSync(resolve(CWD, logPath))) {
	const lines = readFileSync(resolve(CWD, logPath), "utf8").split("\n").filter(Boolean)
	const byCommand = {}
	for (const l of lines) {
		try {
			const e = JSON.parse(l)
			byCommand[e.command ?? "?"] = (byCommand[e.command ?? "?"] ?? 0) + 1
		} catch {}
	}
	cliUsage = { invocations: lines.length, byCommand }
}

/* ── Score. ────────────────────────────────────────────────────────────────── */

const per100 = (n) => (loc ? +((n / loc) * 100).toFixed(2) : 0)
const counts = Object.fromEntries(Object.entries(findings).map(([k, v]) => [k, v.length]))

/*
 * Weights are a judgment, stated here rather than buried: a hallucinated
 * component or a Radix idiom does not compile or does not render, so it costs
 * most; a contract violation renders but wrong. Shell similarity is diagnostic
 * only: copying a pattern cannot compensate for a defect, and original
 * compositions must be able to pass the contract without resembling fixtures.
 */
const penalties = {
	hallucinatedComponent: counts.hallucinatedComponent * 10, // does not compile
	radixIdiom: counts.radixIdiom * 10, // compiles, silently does nothing
	offContractIcon: counts.offContractIcon * 6, // renders nothing at all
	hallucinatedProp: counts.hallucinatedProp * 3, // ignored prop
	hardcodedControl: counts.hardcodedControl * 2, // breaks the register
	contract: counts.contract * 1.5, // renders, but off-token
}
const deduction = Math.min(60, Object.values(penalties).reduce((a, b) => a + b, 0))
const score = Math.max(0, Math.min(100, Math.round(100 - deduction)))
let reviewDocument = null
const reviewPath = flags.get("review")
if (reviewPath) {
	try { reviewDocument = JSON.parse(readFileSync(resolve(CWD, reviewPath), "utf8")) }
	catch (error) { abort(`Cannot read review ${reviewPath}: ${error.message}`) }
}
const review = assessReview(reviewDocument, { baseDir: reviewPath ? dirname(resolve(CWD, reviewPath)) : CWD, sourceHash })
const clean = !Object.values(counts).some(Boolean)
const exitCode = flags.has("strict") && (!clean || review.status !== "review-recorded") ? 1 : 0

const result = {
	version: REGISTRY.version,
	sourceHash,
	fingerprint: { algorithm: "sha256", files: snapshotFiles.length, packageHash, coverage: "All non-test files in supplied targets, plus Sable runtime sources, registry, and lint contract. Known text formats normalize CRLF to LF; binary assets retain their bytes. Pass public/ for external asset directories; remote resources are not covered." },
	files: files.length,
	ignored: { globs: ignores, files: ignoredFiles.length },
	loc,
	score,
	scoreMeaning: "Static contract only. Pattern similarity does not affect this score; visual quality is not scored.",
	contract: { status: clean ? "pass" : "fail", score },
	review,
	counts,
	per100loc: Object.fromEntries(Object.entries(counts).map(([k, v]) => [k, per100(v)])),
	conformance: { informationalOnly: true, mean: meanConformance, routes: conformance },
	inventory: {
		informationalOnly: true,
		meaning: "App-owned surfaces to account for in the reuse inventory: compose the named Sable component, or record why the app owns it. Not scored.",
		total: inventory.length,
		byKind: Object.fromEntries(["surface", "media frame", "round"].map((k) => [k, inventory.filter((s) => s.kind === k).length])),
		surfaces: inventory,
	},
	cliUsage,
	appIcons: APP_ICONS ? { file: APP_ICONS.file, names: APP_ICONS.names.size } : null,
	findings,
}

if (JSON_OUT) {
	process.stdout.write(`${JSON.stringify(result, null, 1)}\n`)
	process.exit(exitCode)
}

/* ── Report. ───────────────────────────────────────────────────────────────── */

const L = (s = "") => process.stdout.write(`${s}\n`)
L()
L(`  grade — ${files.length} files, ${loc} lines, against @sableui/react ${REGISTRY.version}${ignoredFiles.length ? ` (${ignoredFiles.length} ignored)` : ""}`)
L(`  ${"─".repeat(66)}`)
const row = (label, n, note = "") =>
	L(`  ${label.padEnd(26)}${String(n).padStart(4)}${note ? `   ${note}` : ""}`)
row("contract violations", counts.contract, counts.contract ? `${per100(counts.contract)}/100 loc` : "clean")
row("hallucinated components", counts.hallucinatedComponent)
row("hallucinated props", counts.hallucinatedProp)
row("Radix idioms", counts.radixIdiom, counts.radixIdiom ? "asChild / direct primitive imports" : "")
row("hardcoded control heights", counts.hardcodedControl)
row("off-contract icon names", counts.offContractIcon, APP_ICONS ? `+${APP_ICONS.names.size} app icons from ${APP_ICONS.file}` : counts.offContractIcon ? "app-supplied? list them in .sable/icons.json" : "")
L()
if (conformance.length) {
	L(`  pattern similarity (informational) — ${conformance.length} route-like file(s), mean ${meanConformance}`)
	for (const c of conformance) {
		const bar = "█".repeat(Math.round(c.score * 20)).padEnd(20, "·")
		L(`    ${bar} ${String(c.score).padEnd(6)} ${c.nearest ?? "—"}   ${c.file}`)
	}
} else {
	L("  composition                 no route-like files found")
}
if (inventory.length) {
	const kinds = ["surface", "media frame", "round"].map((k) => [k, inventory.filter((s) => s.kind === k).length]).filter(([, n]) => n)
	L()
	L(`  app-owned surfaces (review, not scored) — ${inventory.length}: ${kinds.map(([k, n]) => `${n} ${k}`).join(" · ")}`)
	for (const s of inventory.slice(0, 12)) L(`    ${s.file}:${s.line}  <${s.tag}> ${s.kind} (${s.classes}) → ${s.consider}`)
	if (inventory.length > 12) L(`    … ${inventory.length - 12} more (--json lists every one)`)
}
if (cliUsage) {
	L()
	L(`  sable CLI                   ${cliUsage.invocations} invocation(s)`)
	for (const [c, n] of Object.entries(cliUsage.byCommand)) L(`    ${String(n).padStart(3)}× ${c}`)
}
L()
L(`  static contract ${score}/100 · ${clean ? "pass" : "fail"}`)
L(`  visual review: ${review.status}`)
for (const issue of review.issues) L(`    ${issue}`)
for (const issue of review.openIssues ?? []) L(`    open: ${typeof issue === "string" ? issue : JSON.stringify(issue)}`)
L(`  sourceHash: ${sourceHash}`)
L(`  ${"─".repeat(66)}`)
if (!JSON_OUT && Object.values(counts).some(Boolean)) {
	L()
	for (const [kind, list] of Object.entries(findings)) {
		if (!list.length) continue
		L(`  ${kind}:`)
		for (const f of list.slice(0, 8)) {
			const what = f.name ?? f.prop ?? f.what ?? f.match ?? f.ruleId
			L(`    ${f.file}:${f.line ?? "?"}  ${f.component ? `<${f.component}> ` : ""}${what}`)
		}
		if (list.length > 8) L(`    … ${list.length - 8} more`)
		L()
	}
}
L("  Static compliance is not visual approval. This tool does not inspect screenshots.")
L()
process.exit(exitCode)

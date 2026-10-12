#!/usr/bin/env node
/**
 * sable-lint — run Sable's design contract against YOUR app.
 *
 *   npx sable-lint                        # lints ./src
 *   npx sable-lint app components         # lints those directories instead
 *   npx sable-lint --ignore 'src/data/**' # skip paths (repeatable)
 *   npx sable-lint --rules                # list the rules and exit
 *
 * Exits 1 on any violation, so it drops straight into a build script or CI.
 *
 * Why this exists: the contract used to be enforceable only inside the Sable repo,
 * while every task doc instructed consuming agents to run it. That gap let a
 * converted app ship raw palette utilities for weeks with nothing to catch them.
 *
 * The token contract is read from the installed package's `registry.json`, so this
 * validates against the EXACT tokens your installed version ships — upgrade Sable
 * and the linter's vocabulary moves with it. Zero dependencies.
 *
 * What it does NOT do: this is a lexical linter over your source text, not a type
 * checker or an AST pass. It catches the class-string drift that TypeScript cannot
 * see (Tailwind silently no-ops a typo'd token — no compile error, just an
 * invisible style). It is not a substitute for `tsc`.
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { dirname, join, relative, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"
import { ignoreGlob, lintText, makeRules, report } from "../scripts/lint-rules.mjs"
import { labelContrastScanner, statusTextDrift } from "../scripts/label-contrast.mjs"

const HERE = dirname(fileURLToPath(import.meta.url))
const PKG_ROOT = join(HERE, "..")
const CWD = process.cwd()

/* ── The contract, from the installed package's registry.json. ──────────────── */
const registryPath = join(PKG_ROOT, "registry.json")
if (!existsSync(registryPath)) {
	console.error(
		"[sable-lint] Could not find registry.json inside the installed @sableui/react.\n" +
			"This shouldn't happen — please report it.",
	)
	process.exit(1)
}
const REGISTRY = JSON.parse(readFileSync(registryPath, "utf8"))

const semanticTokens = new Set((REGISTRY.tokens?.semantic ?? []).map((t) => t.name))
// Motion token NAMES are reassembled from the registry's durations/easings lists.
// A test in the package asserts this reconstruction equals _contract.ts exactly,
// so the consumer linter can never validate against a drifted vocabulary.
const motionTokens = new Set([
	...(REGISTRY.tokens?.motion?.durations ?? []).map((d) => `motion-duration-${d}`),
	...(REGISTRY.tokens?.motion?.easings ?? []).map((e) => `motion-ease-${e}`),
	REGISTRY.tokens?.motion?.scale,
].filter(Boolean))

const rules = makeRules({ semanticTokens, motionTokens, labelContrast: await labelContrastScanner(PKG_ROOT, REGISTRY.themes?.default), statusText: (css) => statusTextDrift(css, REGISTRY.themes?.default) }).filter((r) => r.scope !== "package")

/* ── Args. ─────────────────────────────────────────────────────────────────── */
const args = process.argv.slice(2)
if (args.includes("--help") || args.includes("-h")) {
	console.log(
		[
			"sable-lint — run Sable's design contract against your app.",
			"",
			"  sable-lint [dir...]        lint these directories (default: src)",
			"  sable-lint --ignore <glob> skip matching paths (repeatable)",
			"  sable-lint --rules         list the rules",
			"  sable-lint --since <ver>   what the contract added since that version",
			"",
			`Contract: @sableui/react ${REGISTRY.version} (${semanticTokens.size} semantic tokens)`,
			"",
			"Suppress a genuine exception with an auditable reason:",
			"  // design-lint-disable-next-line <ruleId> -- <why it is necessary>",
		].join("\n"),
	)
	process.exit(0)
}
if (args.includes("--rules")) {
	for (const r of rules) console.log(`\n● ${r.id}${r.since ? `  (new in ${r.since})` : ""}\n  ${r.why}`)
	process.exit(0)
}

/* ── --since: what the contract added while you were away. ───────────────────
 * The rules travel with the package, so `pnpm up @sableui/react` silently
 * widens what counts as a violation — which is the point, but it leaves an app
 * unable to tell a brand-new requirement from drift it has been carrying for
 * months. Both need fixing; only one is a regression, and treating a new rule as
 * a regression is how a team decides the linter is noise and pins the version. */
{
	const i = args.findIndex((a) => a === "--since" || a.startsWith("--since="))
	if (i !== -1) {
		const from = args[i].includes("=") ? args[i].split("=")[1] : args[i + 1]
		if (!from) {
			console.error("[sable-lint] --since needs a version, e.g. --since 0.1.0")
			process.exit(1)
		}
		const cmp = (a, b) => {
			const pa = String(a).split(".").map(Number)
			const pb = String(b).split(".").map(Number)
			for (let k = 0; k < 3; k++) if ((pa[k] ?? 0) !== (pb[k] ?? 0)) return (pa[k] ?? 0) - (pb[k] ?? 0)
			return 0
		}
		const added = rules.filter((r) => r.since && cmp(r.since, from) > 0)
		console.log(
			`Contract changes between ${from} and ${REGISTRY.version}:\n` +
				(added.length
					? added.map((r) => `\n● ${r.id}  (new in ${r.since})\n  ${r.why}`).join("\n")
					: "\n  No new lint rules. Component-level changes (new components, deprecations,\n" +
						"  motion declarations) are not lint rules — see llms/tasks/auditing-an-app.md."),
		)
		process.exit(0)
	}
}

/* ── --ignore. The rules police STYLE, and a codebase also contains DATA that
   looks like style: a `color_palette: ["#8C9B82", …]` in a prompt fixture is not
   a design decision, and a linter that flags it teaches people to disable the
   linter. Per-line `design-lint-disable` covers the odd case; this covers a whole
   data/fixture layer. Deliberately not a config file — an ignore you can't see in
   the command is an ignore nobody re-examines. ─────────────────────────────── */
const ignores = []
for (let i = 0; i < args.length; i++) {
	if (args[i] === "--ignore") ignores.push(args[++i])
	else if (args[i]?.startsWith("--ignore=")) ignores.push(args[i].slice(9))
}
const ignoreRes = ignores.filter(Boolean).map(ignoreGlob)
const isIgnored = (rel) => ignoreRes.some((re) => re.test(rel))

const targets = args.filter((a, i) => !a.startsWith("-") && args[i - 1] !== "--ignore")
const dirs = (targets.length ? targets : ["src"]).map((d) => resolve(CWD, d))
const missing = dirs.filter((d) => !existsSync(d))
if (missing.length) {
	console.error(
		`[sable-lint] Not found: ${missing.map((d) => relative(CWD, d)).join(", ")}\n` +
			"Pass the directories to lint, e.g. `sable-lint app components`.",
	)
	process.exit(1)
}

/* ── Walk. Skips the usual build/vendor noise and non-source files. ────────── */
const SKIP_DIRS = new Set([
	"node_modules",
	".next",
	".nuxt",
	"dist",
	"build",
	"out",
	"coverage",
	".git",
	".turbo",
	".svelte-kit",
])
function* walk(dir) {
	for (const name of readdirSync(dir)) {
		if (SKIP_DIRS.has(name)) continue
		const full = join(dir, name)
		const st = statSync(full)
		if (st.isDirectory()) yield* walk(full)
		// Markup and stylesheets count. Restricting this to .ts/.tsx/.js/.jsx was a
		// hole big enough to drive an app through: a converting agent's `index.html`
		// carried `bg-zinc-950 text-zinc-100` on <body> while this tool reported
		// "✓ 29 files clean — the contract holds." They proved it by moving the same
		// string into a .tsx, where it produced three violations. The gap landed
		// hardest on converting-an-app.md, which is largely about migrating an app's
		// CSS and told you to grep it by hand.
		else if (
			/\.(ts|tsx|js|jsx|html|htm|css|scss|vue|svelte|astro|mdx)$/.test(name) &&
			!/\.(test|spec)\.[jt]sx?$/.test(name)
		)
			yield full
	}
}

/* ── Run. ──────────────────────────────────────────────────────────────────── */
const violations = []
let filesScanned = 0
// A path may name one file (`sable lint src/app.tsx`) as well as a folder; walking
// a file threw ENOTDIR. A file is linted as named, extension and all.
const LINTABLE = /\.(ts|tsx|js|jsx|html|htm|css|scss|vue|svelte|astro|mdx)$/
const filesIn = (target) => (statSync(target).isFile() ? (LINTABLE.test(target) ? [target] : []) : walk(target))
for (const dir of dirs) {
	for (const file of filesIn(dir)) {
		const rel = relative(CWD, file).split(sep).join("/")
		if (isIgnored(rel)) continue
		filesScanned++
		const ctx = { isStylesheet: /\.(css|scss)$/.test(rel) }
		for (const v of lintText(readFileSync(file, "utf8"), rules, ctx)) {
			violations.push({ ...v, file: rel })
		}
	}
}

process.exit(
	report(
		"sable-lint",
		violations,
		filesScanned,
		"Fix by using a semantic token or motion recipe — `npx sable-lint --rules` explains each one,\n" +
			"and the token list with intent is in node_modules/@sableui/react/llms.txt.\n" +
			"For a genuine rare exception: `// design-lint-disable-next-line <ruleId> -- <reason>`.",
	),
)

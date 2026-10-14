#!/usr/bin/env node
/**
 * design-lint — the contract enforcer.
 *
 * Sable's hard rules used to live only as prose in AGENTS.md/DESIGN.md. Prose is
 * a suggestion; CI is a contract. This script turns each hard rule into a build
 * gate: it scans the package's own component/layout/motion/icon source and FAILS
 * (exit 1) on the drift the rules forbid. Inspired by Polar's "Orbit — an
 * LLM-safe design system" (docs → contract).
 *
 * It is deliberately ZERO-dependency (plain Node, no Babel/ESLint/Tailwind) so it
 * runs anywhere instantly. It is a lexical linter — it reads source as text, not
 * an AST — which is enough for the class-string patterns we police and keeps it
 * fast and dependency-free.
 *
 * SCOPE — this lints SABLE'S OWN SOURCE only. Sable is a published, themeable,
 * open-world library; we cannot (and must not) lint a consumer's app. So the
 * enforced surface is `src/` minus `themes/` (the palette layer, where literal
 * OKLCH values legitimately live) and `*.meta.ts` (prose + example strings).
 *
 * ESCAPE HATCH — a contract still needs a rare, AUDITABLE exception. Any rule can
 * be suppressed with a comment that MUST carry a reason after `--`:
 *   // design-lint-disable-next-line <ruleId> -- <why it is genuinely necessary>
 *   ...code...                                  // design-lint-disable-line <ruleId> -- <why>
 *   // design-lint-disable <ruleId> -- <why>    (block; until design-lint-enable)
 *   // design-lint-enable <ruleId>
 * A disable with no reason is itself an error — the audit trail is mandatory.
 */

import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs"
import { dirname, join, relative, sep } from "node:path"
import { fileURLToPath } from "node:url"
import { lintText, makeRules } from "./lint-rules.mjs"
import { readContractArray } from "./read-contract.mjs"

const HERE = dirname(fileURLToPath(import.meta.url))
const PKG_ROOT = join(HERE, "..")
const SRC = join(PKG_ROOT, "src")
const CONTRACT = join(SRC, "themes", "_contract.ts")

/* ── Load the token contract (decision #3: typos are validated against it) ──
   Parsed lexically from _contract.ts so there's a single source of truth — add
   a token there and the typo-checker knows about it with no second edit here. */
const readArray = (source, name) => readContractArray(source, name)

const contractSrc = readFileSync(CONTRACT, "utf8")
const SEMANTIC_TOKENS = new Set(readArray(contractSrc, "SEMANTIC_TOKENS"))
const MOTION_TOKENS = new Set(readArray(contractSrc, "MOTION_TOKENS"))
// Workspace-register surfaces (canvas/panel/hairline…). A real, contract-declared
// group, just an optional-with-derivation one rather than a per-theme required
// one — so a component meta may legitimately list them in `tokensUsed`.
const WORKSPACE_SURFACE_TOKENS = new Set(
	readArray(contractSrc, "WORKSPACE_SURFACE_TOKENS"),
)
/** Every token name a `tokensUsed` entry is allowed to name. */
const META_TOKENS = new Set([
	...SEMANTIC_TOKENS,
	...WORKSPACE_SURFACE_TOKENS,
	...readArray(contractSrc, "DERIVED_EDGE_TOKENS"),
	// Art direction (GradientArt): optional-with-derivation, like the surfaces.
	...readArray(contractSrc, "ART_TOKENS"),
	// The palette slots Badge, Pill and StatusDot paint a family from.
	...readArray(contractSrc, "PALETTE_SLOT_TOKENS"),
])
/* The rule table itself lives in ./lint-rules.mjs, shared with the `sable-lint`
   bin that consumers run against their own app. Ten of the eleven rules are about
   consumer code; keeping one table means the two can never drift. Here we take
   every rule — `scope: "package"` ones included. */
// `consumer` rules judge apps built WITH Sable (e.g. "use the component, not a
// hand-built control"); inside the package is where those controls are built.
const rules = makeRules({ semanticTokens: SEMANTIC_TOKENS, motionTokens: MOTION_TOKENS }).filter((r) => r.scope !== "consumer")

/* ── Ratcheted rules. ─────────────────────────────────────────────────────────
 * Some rules arrive after the code they judge. `physical-direction` is the first:
 * ~56 files already write `pl-4`/`text-left`, and a rule that fails all of them on
 * day one is a rule someone deletes from CI by Friday. So it lands the same way
 * build-registry's guidance floor did — measure what the library already carries,
 * freeze that as the bar, and fail only on a REGRESSION.
 *
 * The baseline is PER FILE, not a single total. A global count lets a file quietly
 * gain three violations while another loses three, which is exactly the drift the
 * rule exists to stop. Counts also only ever move down: a file that drops below
 * its baseline re-baselines automatically on the next `--update-baseline` run, and
 * the run prints the surplus so the ratchet gets tightened rather than forgotten.
 *
 *   pnpm design-lint --update-baseline    re-record (only ever to a LOWER number)
 *
 * A rule opts in with `ratchet: true` in the rule table. When a rule's baseline
 * reaches zero everywhere, delete its section here and it becomes a plain gate. */
const BASELINE_PATH = join(HERE, "lint-baseline.json")
const RATCHETED = new Set(rules.filter((r) => r.ratchet).map((r) => r.id))
const baseline = existsSync(BASELINE_PATH)
	? JSON.parse(readFileSync(BASELINE_PATH, "utf8"))
	: {}
const UPDATE_BASELINE = process.argv.includes("--update-baseline")
/** ruleId → file → count, measured on this run. */
const ratchetCounts = new Map([...RATCHETED].map((id) => [id, new Map()]))

/* ── Icon contract (registry.json → iconContract.names) ──
   Every literal icon name the package emits must be declared in the contract so
   a consumer building an IconSet from registry.json ships a COMPLETE adapter.
   Names the consumer supplies dynamically (<Icon name={props.icon} />) are theirs
   to define and are intentionally NOT checked here. */
const PKG_JSON = JSON.parse(readFileSync(join(PKG_ROOT, "package.json"), "utf8"))
const REGISTRY = JSON.parse(readFileSync(join(PKG_ROOT, "registry.json"), "utf8"))
const ICON_CONTRACT = new Set(REGISTRY.iconContract?.names ?? [])
// A hard-coded icon name, two ways: <Icon name="…"> (the tag may span lines, so
// [^>] is allowed to cross newlines) and a data-driven `icon: "…"` field. Both
// constrain the value to a lowercase-hyphen token, which excludes class-string
// literals like the Button `icon` size variant ("h-[40px] w-[40px]").
const ICON_JSX_RE = /<Icon\b[^>]*?\bname="([a-z][a-z0-9-]*)"/g
const ICON_DATA_RE = /\bicon:\s*"([a-z][a-z-]*)"/g

/* ── Walk src/, skipping themes/, foundations/, *.meta.ts, tests, and non-source
 * files. foundations/ is skipped for the same reason metas are: it is prose that
 * QUOTES the anti-patterns ("never duration-150") as data, never class strings
 * that render. ──── */
function* walk(dir) {
	for (const name of readdirSync(dir)) {
		const full = join(dir, name)
		const st = statSync(full)
		if (st.isDirectory()) {
			if (name === "themes" || name === "foundations" || name === "node_modules") continue
			yield* walk(full)
		} else if (/\.(ts|tsx)$/.test(name) && !/\.(meta|test|spec)\.tsx?$/.test(name)) {
			yield full
		}
	}
}

/* ── Comment-aware helpers for the full-file icon-contract pass. ───────────── */
function stripComments(src) {
	// Blank out block + line comments while preserving newlines so reported line
	// numbers stay accurate. The (^|[^:]) guard keeps URL "//" (https://…) intact.
	return src
		.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
		.replace(/(^|[^:])\/\/[^\n]*/gm, (_m, p) => p + " ".repeat(_m.length - p.length))
}
function lineAt(src, index) {
	let line = 1
	for (let i = 0; i < index && i < src.length; i++) if (src[i] === "\n") line++
	return line
}

/* ── Run. ──────────────────────────────────────────────────────────────────── */
const violations = []
let filesScanned = 0

/* Version single-source: src/index.ts SABLE_UI_VERSION must equal package.json's
   version, so the exported public constant can't silently drift from what ships. */
{
	const indexSrc = readFileSync(join(SRC, "index.ts"), "utf8")
	const m = indexSrc.match(/SABLE_UI_VERSION\s*=\s*"([^"]+)"/)
	if (!m) {
		violations.push({
			file: "src/index.ts",
			line: 1,
			ruleId: "version-sync",
			match: "SABLE_UI_VERSION not found",
			why: "Could not find the exported SABLE_UI_VERSION constant in src/index.ts.",
		})
	} else if (m[1] !== PKG_JSON.version) {
		violations.push({
			file: "src/index.ts",
			line: lineAt(indexSrc, m.index),
			ruleId: "version-sync",
			match: `SABLE_UI_VERSION "${m[1]}" ≠ package.json "${PKG_JSON.version}"`,
			why: "The exported SABLE_UI_VERSION must equal package.json's version so the public version constant can't drift from what is published. Update the constant (or bump package.json) so they match.",
		})
	}

	// registry.json carries its own top-level version (the machine-readable catalog
	// agents read). It must equal package.json's version too — it previously rotted
	// to 0.2.0 while the package shipped 0.5.0 because nothing checked it.
	if (REGISTRY.version !== PKG_JSON.version) {
		const registrySrc = readFileSync(join(PKG_ROOT, "registry.json"), "utf8")
		const vMatch = registrySrc.match(/"version"\s*:\s*"[^"]*"/)
		violations.push({
			file: "registry.json",
			line: vMatch ? lineAt(registrySrc, vMatch.index) : 1,
			ruleId: "version-sync",
			match: `registry.json version "${REGISTRY.version}" ≠ package.json "${PKG_JSON.version}"`,
			why: "registry.json's top-level version must equal package.json's version so the machine-readable catalog can't drift from what ships.",
		})
	}
}

for (const file of walk(SRC)) {
	filesScanned++
	const text = readFileSync(file, "utf8")
	const rel = relative(PKG_ROOT, file).split(sep).join("/")

	// Icon-contract: scan the COMMENT-STRIPPED full file (an <Icon> tag can span
	// lines; JSDoc examples must not count as real emissions). Every hard-coded
	// icon name must be declared in registry.json → iconContract.names.
	const code = stripComments(text)
	for (const re of [ICON_JSX_RE, ICON_DATA_RE]) {
		for (const m of code.matchAll(re)) {
			if (ICON_CONTRACT.has(m[1])) continue
			violations.push({
				file: rel,
				line: lineAt(code, m.index),
				ruleId: "icon-contract",
				match: `icon "${m[1]}"`,
				why: `Icon name "${m[1]}" is hard-coded by the package but missing from registry.json → iconContract.names. A consumer building an IconSet from the contract would ship an incomplete adapter. Add it to the contract.`,
			})
		}
	}

	// The per-line pass, the directive parser and the "don't lint a directive's own
	// reason text" subtlety all live in lint-rules.mjs, so the bin that consumers
	// run against their own app behaves identically to this.
	// `ctx.file` lets a rule exempt a whole module by path — the safe-area layer is
	// keyed on physical edge names because a notch does not mirror in RTL.
	for (const v of lintText(text, rules, { file: rel })) {
		if (RATCHETED.has(v.ruleId)) {
			const perFile = ratchetCounts.get(v.ruleId)
			perFile.set(rel, (perFile.get(rel) ?? 0) + 1)
			continue
		}
		violations.push({ ...v, file: rel })
	}
}

/* ── The ratchet verdict. Compare this run's per-file counts to the baseline. ── */
const ratchetSurplus = []
for (const ruleId of RATCHETED) {
	const rule = rules.find((r) => r.id === ruleId)
	const why = rule.why
	const hint = rule.ratchetHint ?? "Fix the new occurrence, or disable the rule at the site with a reason."
	const recorded = baseline[ruleId]?.files ?? {}
	const measured = ratchetCounts.get(ruleId)
	for (const [file, count] of measured) {
		const allowed = recorded[file] ?? 0
		if (count > allowed) {
			violations.push({
				file,
				line: 1,
				ruleId,
				match:
					allowed === 0
						? `${count} new ${ruleId} occurrence${count === 1 ? "" : "s"} in a file the baseline records as clean`
						: `${count} occurrences, up from the recorded baseline of ${allowed}`,
				why: `${why}\n      This rule is a RATCHET: existing occurrences are grandfathered in scripts/lint-baseline.json and only an INCREASE fails. ${hint}`,
			})
		}
	}
	// Progress, in the other direction: anything below its recorded baseline is
	// slack the ratchet should take up. Reported, never failed.
	for (const [file, allowed] of Object.entries(recorded)) {
		const count = measured.get(file) ?? 0
		if (count < allowed) ratchetSurplus.push({ ruleId, file, count, allowed })
	}
}

if (UPDATE_BASELINE) {
	const next = { ...baseline }
	for (const ruleId of RATCHETED) {
		/* A ratchet only turns one way. Recording the measured count outright would
		   let `--update-baseline` launder a regression into the contract, which is
		   how a baseline quietly becomes a permission slip — so each file takes the
		   MINIMUM of what is there now and what was recorded, and a file the
		   baseline has never seen is pinned at zero. The one exception is the very
		   first run for a rule (no entry at all), which is the seeding measurement. */
		const seeding = !baseline[ruleId]
		const recorded = baseline[ruleId]?.files ?? {}
		const files = Object.fromEntries(
			[...ratchetCounts.get(ruleId)]
				.map(([file, count]) => [file, seeding ? count : Math.min(count, recorded[file] ?? 0)])
				.filter(([, count]) => count > 0)
				.sort(([a], [b]) => a.localeCompare(b)),
		)
		next[ruleId] = { ...(baseline[ruleId] ?? {}), files, total: Object.values(files).reduce((a, b) => a + b, 0) }
	}
	writeFileSync(BASELINE_PATH, `${JSON.stringify(next, null, "\t")}\n`)
	console.log(`[design-lint] baseline written → scripts/lint-baseline.json`)
	process.exit(0)
}

/* ── Meta-token validation. The main walk skips *.meta.ts (prose + examples), so
   a typo or stale entry in a meta's `tokensUsed` is otherwise invisible — Tailwind
   silently no-ops it and the meta is the contract other agents read. Cross-check
   every tokensUsed entry against the SEMANTIC_TOKENS contract. ───────────────── */
function* walkMetas(dir) {
	for (const name of readdirSync(dir)) {
		const full = join(dir, name)
		const st = statSync(full)
		if (st.isDirectory()) {
			if (name === "themes" || name === "foundations" || name === "node_modules") continue
			yield* walkMetas(full)
		} else if (/\.meta\.tsx?$/.test(name)) {
			yield full
		}
	}
}
for (const metaFile of walkMetas(SRC)) {
	const src = readFileSync(metaFile, "utf8")
	const start = src.indexOf("tokensUsed: [")
	if (start === -1) continue
	const end = src.indexOf("]", start)
	const body = src.slice(start, end)
	const rel = relative(PKG_ROOT, metaFile).split(sep).join("/")
	for (const mm of body.matchAll(/"([^"]+)"/g)) {
		const token = mm[1]
		if (!META_TOKENS.has(token)) {
			violations.push({
				file: rel,
				line: lineAt(src, start + mm.index),
				ruleId: "unknown-meta-token",
				match: `tokensUsed: "${token}"`,
				why: `tokensUsed lists "${token}" which is in neither SEMANTIC_TOKENS nor WORKSPACE_SURFACE_TOKENS in themes/_contract.ts. Fix the typo or add the token to the contract.`,
			})
		}
	}
}

/* Ratchet slack, printed on pass and fail alike — a baseline nobody tightens is a
   baseline that has stopped meaning anything. */
if (ratchetSurplus.length) {
	console.log(
		`[design-lint] ${ratchetSurplus.length} file(s) now sit BELOW their ratchet baseline:\n` +
			ratchetSurplus
				.map((s) => `      ${s.file}  ${s.allowed} → ${s.count}  (${s.ruleId})`)
				.join("\n") +
			"\n      Run `pnpm design-lint --update-baseline` to lock the progress in.\n",
	)
}

if (violations.length === 0) {
	const totals = [...RATCHETED]
		.map((id) => `${id}: ${[...ratchetCounts.get(id).values()].reduce((a, b) => a + b, 0)} grandfathered`)
		.join(", ")
	console.log(
		`[design-lint] ✓ ${filesScanned} files clean — the contract holds.` +
			(totals ? `  [ratchet — ${totals}]` : ""),
	)
	process.exit(0)
}

console.error(`[design-lint] ✗ ${violations.length} violation(s) in ${filesScanned} files:\n`)
const byRule = new Map()
for (const v of violations) {
	if (!byRule.has(v.ruleId)) byRule.set(v.ruleId, [])
	byRule.get(v.ruleId).push(v)
}
for (const [ruleId, list] of byRule) {
	console.error(`  ● ${ruleId} — ${list[0].why}`)
	for (const v of list) console.error(`      ${v.file}:${v.line}  →  ${v.match}`)
	console.error("")
}
console.error(
	"Fix by using a semantic token / motion recipe (see packages/sable/CONTRIBUTING.md → The six hard rules),\n" +
		"or, for a genuine rare exception, add `// design-lint-disable-next-line <ruleId> -- <reason>`.",
)
process.exit(1)

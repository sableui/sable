#!/usr/bin/env node
/**
 * sable — the catalog, served at the size an agent can actually read.
 *
 *   npx sable pattern --list              # the eight page shells, one line each
 *   npx sable pattern DashboardPage --skeleton
 *   npx sable block --list                # section-sized blocks: cards, forms, lists
 *   npx sable component Button --props
 *   npx sable search "date range"
 *   npx sable doctor
 *
 * Why this exists: `registry.json` is 780KB and `llms-full.txt` is 550KB. Both
 * are complete and both are unreadable in a working context window, so in
 * practice an agent greps them, or skips them and writes what its training data
 * suggests — which for a library this new is nothing. The contract being
 * published is not the same as the contract being read.
 *
 * So the same generated artifacts get a retrieval surface: ask for one
 * component, one pattern, one token group, at one of three detail levels. It
 * runs from `node_modules`, offline, and it is versioned with the package it
 * describes, so it can't drift from your installed version. The hosted MCP
 * server (sableui.com/api/mcp, scripts/sable-mcp.mjs in the repo) answers from
 * this same file, run out of the published tarball of whichever version the
 * caller names, so the two can't disagree. The CLI stays the default because
 * it needs no network.
 *
 * Three rules this file keeps:
 *   1. **Everything is derivable.** `--json` emits `{ type, data }` with a
 *      stable discriminator, so output can be consumed without scraping prose.
 *   2. **Failures are recoverable.** Every error carries a stable `code` and
 *      concrete `suggestions`. An agent that misspells a component name should
 *      be able to fix itself from the error rather than fall back to guessing.
 *   3. **`manifest` is generated from the same table that drives `--help`.** A
 *      hand-written capability list is a capability list that lies.
 */

import { spawnSync } from "node:child_process"
import { appendFileSync, existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { dirname, join, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { skeletonize } from "../scripts/skeleton.mjs"
import { claudeStopHook, installAgentSkill, installClaudeStopHook } from "../scripts/agent-setup.mjs"
import { patchChecks } from "../scripts/patches.mjs"
import { sourcesCheck } from "../scripts/sources.mjs"
import { detectFramework, detectPackageManager, fixWiring, fontsCheck, providerSnippet, tailwindBuildCheck } from "../scripts/wiring.mjs"

const HERE = dirname(fileURLToPath(import.meta.url))
const PKG_ROOT = join(HERE, "..")
let CWD = process.cwd()

/* ── The catalog. ───────────────────────────────────────────────────────────── */

const registryPath = join(PKG_ROOT, "registry.json")
if (!existsSync(registryPath)) {
	process.stderr.write(
		JSON.stringify({
			type: "error",
			code: "ERR_REGISTRY_MISSING",
			message: `No registry.json inside ${PKG_ROOT}. The installed @sableui/react is incomplete.`,
			suggestions: ["Reinstall @sableui/react", "Report this — registry.json is in the published files list"],
		}) + "\n",
	)
	process.exit(1)
}
const R = JSON.parse(readFileSync(registryPath, "utf8"))
const LLMS_DIR = join(PKG_ROOT, "llms")

/* ── The command table. Drives --help, `manifest`, and dispatch. ────────────── */

const DETAILS = ["brief", "compact", "full"]

const GLOBAL_FLAGS = [
	{ name: "--json", value: null, describe: "Emit a { type, data } envelope instead of text." },
	{ name: "--detail", value: DETAILS.join("|"), describe: "How much to print. Default: compact (brief for lists)." },
	{ name: "--dense", value: null, describe: "Drop prose, one fact per line. Token-efficient." },
	{ name: "--help", value: null, describe: "Print usage for the command." },
]

const COMMANDS = [
	{
		name: "target",
		summary: "Retrieve an optional platform's Sable component replacements and composition rules.",
		arg: { name: "platform", required: true },
		flags: [{ name: "--component", value: "Name", describe: "Retrieve one Sable-to-platform mapping. Omit for the whole map." }],
		returns: ["target", "target.component"],
	},
	{
		name: "preset",
		summary: "Create, validate, or compile a portable Sable preset used by Canvas and builds.",
		arg: null,
		flags: [
			{ name: "--template", value: null, describe: "Print a complete editable Sable preset JSON record." },
			{ name: "--check", value: "file.json", describe: "Validate the schema, the Sable token contract, and labels on brand and status fills (accept a pair with `exceptions`)." },
			{ name: "--css", value: "file.json", describe: "Generate scoped theme CSS from a validated preset." },
		],
		returns: ["preset.template", "preset.check", "preset.css"],
	},
	{
		name: "patch",
		summary: "Fix a Sable component in place while the library fix ships: record why and how to check it, patch with your package manager, and have doctor re-check it on every upgrade.",
		arg: { name: "Component", required: false },
		flags: [
			{ name: "--reason", value: "text", describe: "What is wrong. Required to record a patch." },
			{ name: "--repro", value: "text", describe: "How to see it, so a later upgrade can be checked against it. Required to record a patch." },
			{ name: "--issue", value: "id", describe: "Where it was reported upstream." },
			{ name: "--file", value: "dist/lib/<module>.js", describe: "Also cover a shared module the component uses, or patch one on its own." },
			{ name: "--list", value: null, describe: "Each recorded patch and its state against the installed Sable." },
			{ name: "--keep", value: null, describe: "After an upgrade: the repro still fails on Sable's own files, so keep the patch against this version." },
			{ name: "--drop", value: null, describe: "The repro passes on Sable's own files: drop the record (and the patch)." },
		],
		returns: ["patch.recorded", "patch.list", "patch.kept", "patch.dropped"],
	},
	{
		name: "sources",
		summary: "Write the @source lines for just the Sable modules this app imports, so Tailwind generates their classes and no others (about 32 KB gzipped for all of Sable, a fraction for a typical app). doctor fails while the file is stale.",
		arg: null,
		flags: [{ name: "--write", value: "file.css", describe: "Write the stylesheet there (e.g. src/sable-sources.css) instead of printing it." }],
		returns: ["sources"],
	},
	{
		name: "setup",
		summary: "Install package-backed skill entry files for coding agents, preserving local edits.",
		arg: null,
		flags: [
			{ name: "--agent", value: null, describe: "Install skill entry files. Required." },
			{ name: "--target", value: "all|codex|claude|cursor", describe: "Host discovery directories. Default all; Codex and Cursor share .agents." },
			{ name: "--root", value: "dir", describe: "Write the entries in this ancestor instead, e.g. the repository root when Sable belongs to one workspace package. Run setup in that package." },
			{ name: "--update", value: null, describe: "Refresh unchanged managed entries after a package upgrade." },
			{ name: "--dry-run", value: null, describe: "Check and report the destination without writing files." },
			{ name: "--hook", value: null, describe: "Also add a Claude Code Stop hook that runs `sable check` to .claude/settings.json (Claude targets only). Without it, setup prints the hook and writes nothing there." },
		],
		returns: ["setup.agent"],
	},
	{
		name: "manifest",
		summary: "This CLI's own capability manifest — commands, flags, response types, error codes.",
		arg: null,
		flags: [],
		returns: ["manifest"],
	},
	{
		name: "search",
		summary: "One ranked result set across components, providers, patterns, blocks, layout primitives, utilities, tokens, and docs.",
		arg: { name: "query", required: true },
		flags: [
			{ name: "--type", value: "component|provider|pattern|block|example|layout|utility|token|doc", describe: "Restrict to one kind. `example` finds a component example by what it shows (\"multiple selection\", \"server errors\")." },
			{ name: "--limit", value: "n", describe: "Cap results. Default 20." },
		],
		returns: ["search"],
	},
	{
		name: "check",
		summary: "Run before declaring a build done: doctor, lint and grade in one pass, then the review steps no tool can verify. Exits 1 if any check fails.",
		arg: { name: "path...", required: false },
		flags: [
			{ name: "--ignore", value: "glob", repeatable: true, describe: "Skip matching paths in lint and grade. Repeatable." },
			{ name: "--review", value: "review.json", describe: "Also require recorded review evidence (as sable grade --review)." },
			{ name: "--icons", value: "icons.json", describe: "Icon names the app adds, as for sable grade --icons." },
			{ name: "--root", value: "dir", describe: "Check this project directory instead of the current one. Under --stop-hook it is relative to $CLAUDE_PROJECT_DIR." },
			{ name: "--stop-hook", value: null, describe: "Agent Stop-hook mode: checks the project at $CLAUDE_PROJECT_DIR (plus --root); on failure prints the summary to stderr and exits 2, so the agent keeps working instead of ending its turn." },
		],
		returns: ["check"],
	},
	{
		name: "component",
		summary: "A component's contract: props, subcomponents, a11y, tokens, examples. A provider name resolves to its provider entry.",
		arg: { name: "Name", required: false },
		flags: [
			{ name: "--list", value: null, describe: "List the catalog instead." },
			{ name: "--group", value: "Group", describe: "With --list: filter by taxonomy group." },
			{ name: "--register", value: "page|workspace|either", describe: "With --list: filter by register." },
			{ name: "--props", value: null, describe: "Props table only." },
			{ name: "--examples", value: null, describe: "Examples only, imports included." },
			{ name: "--example", value: "label", describe: "One example by its label (case-insensitive), imports included. Labels come from --examples or search." },
			{ name: "--a11y", value: null, describe: "Accessibility contract only." },
		],
		returns: ["component.list", "component.detail", "component.props", "component.examples", "component.example", "component.a11y"],
	},
	{
		name: "pattern",
		summary: "Canonical page shells. Read the skeleton first, copy the code second.",
		arg: { name: "Name", required: false },
		flags: [
			{ name: "--list", value: null, describe: "List the patterns instead." },
			{ name: "--skeleton", value: null, describe: "Composition tree only — no fixtures, no copy." },
			{ name: "--code", value: null, describe: "Full source with its import line." },
		],
		returns: ["pattern.list", "pattern.detail", "pattern.skeleton", "pattern.code"],
	},
	{
		name: "block",
		summary: "Section-sized compositions — a sign-in card, a pricing card. Smaller than a page shell; copy the code and edit its content.",
		arg: { name: "Name", required: false },
		flags: [
			{ name: "--list", value: null, describe: "List the blocks instead." },
			{ name: "--family", value: "family", describe: "With --list: one family only (e.g. \"Commerce\")." },
			{ name: "--skeleton", value: null, describe: "Composition tree only — no fixtures, no copy." },
			{ name: "--code", value: null, describe: "Full source with its import line." },
		],
		returns: ["block.list", "block.detail", "block.skeleton", "block.code"],
	},
	{
		name: "layout",
		summary: "Layout primitives and the layout doctrine.",
		arg: { name: "Name", required: false },
		flags: [
			{ name: "--list", value: null, describe: "List the primitives instead." },
			{ name: "--doctrine", value: null, describe: "The layout rules only." },
		],
		returns: ["layout.list", "layout.detail", "layout.doctrine"],
	},
	{
		name: "provider",
		summary: "App-level providers (SableThemeProvider, IconProvider, MotionProvider, ToastProvider, …): where to mount each, props, and examples.",
		arg: { name: "Name", required: false },
		flags: [
			{ name: "--list", value: null, describe: "List the providers instead." },
			{ name: "--props", value: null, describe: "Props table only." },
			{ name: "--examples", value: null, describe: "Examples only, imports included." },
		],
		returns: ["provider.list", "provider.detail", "provider.props", "provider.examples"],
	},
	{
		name: "token",
		summary: "The token contract, with intent — what each token means and what it is NOT.",
		arg: { name: "group", required: false },
		flags: [{ name: "--list", value: null, describe: "List the groups." }],
		returns: ["token.list", "token.group"],
	},
	{
		name: "utility",
		summary: "The CSS utility layer, with intent — relative surfaces, frames, state variants, scroll policies, motion recipes, type tiers — and what each replaces.",
		arg: { name: "name", required: false },
		flags: [
			{ name: "--list", value: null, describe: "List the utilities, grouped by family." },
			{ name: "--family", value: "family", describe: "With --list: one family only (e.g. \"relative surface\")." },
		],
		returns: ["utility.list", "utility.detail"],
	},
	{
		name: "docs",
		summary: "The package's own guides (AGENTS, README, CONTRIBUTING, DESIGN, CHANGELOG) and the llms/ markdown mirrors: per-component pages, task walkthroughs, token intent.",
		arg: { name: "slug", required: false },
		flags: [
			{ name: "--list", value: null, describe: "List every doc slug." },
			{ name: "--kind", value: "package|components|layout|patterns|blocks|foundations|reference|tasks|taste", describe: "With --list: one kind." },
		],
		returns: ["docs.list", "docs.detail"],
	},
	{
		name: "doctor",
		summary: "Check this project's Sable wiring. Exits 1 on any failure.",
		arg: null,
		flags: [
			{ name: "--fix", value: null, describe: "Apply the fixes that need no judgment (imports in order, @source, missing packages, Vite dedupe and Tailwind plugin, fonts, IconProvider in a starter entry), print the rest, then check again." },
			{ name: "--dry-run", value: null, describe: "Report what --fix would change without writing or installing anything." },
			{ name: "--no-install", value: null, describe: "With --fix: print install commands instead of running them." },
		],
		returns: ["doctor", "doctor.fix"],
	},
	{
		name: "init",
		summary: "Wire Sable into this app in one step: install what is missing, fix what doctor flags, install the agent skill, print the provider snippet for your root, then run doctor. Vite and Next.js get every step; other setups get the packages and stylesheet, and the rest printed.",
		arg: null,
		flags: [
			{ name: "--dry-run", value: null, describe: "Report every change without writing or installing anything." },
			{ name: "--no-agent", value: null, describe: "Skip the agent skill (sable setup --agent)." },
			{ name: "--no-install", value: null, describe: "Print install commands instead of running them." },
		],
		returns: ["init"],
	},
	{
		name: "grade",
		summary: "Static contract checks and evidence review. Original compositions carry no penalty; no automatic taste score.",
		arg: { name: "dir...", required: false },
		flags: [
			{ name: "--template", value: null, describe: "Print the review evidence JSON template." },
			{ name: "--review", value: "review.json", describe: "Check captures, observations, iterations, and the source fingerprint." },
			{ name: "--strict", value: null, describe: "Exit 1 for contract findings or missing/incomplete/unresolved review evidence." },
			{ name: "--cli-log", value: "file.jsonl", describe: "Include retrieval usage from a SABLE_CLI_LOG file." },
			{ name: "--icons", value: "icons.json", describe: 'Icon names the app adds with composeIconSets, as { "names": [...] }. Default: .sable/icons.json when present.' },
			{ name: "--ignore", value: "glob", repeatable: true, describe: "Skip matching paths in the checks, with the same globs as sable-lint --ignore. Repeatable." },
		],
		returns: ["grade.score", "grade.template"],
	},
	{
		name: "learn",
		summary: "Retrieve design lessons and record evidence-backed lessons in this project's .sable directory.",
		arg: null,
		flags: [
			{ name: "--search", value: "query", describe: "Search packaged and local design lessons." },
			{ name: "--list", value: null, describe: "List available design lessons." },
			{ name: "--show", value: "id", describe: "Read one lesson and its provenance." },
			{ name: "--template", value: null, describe: "Print a lesson JSON template." },
			{ name: "--record", value: "file.json", describe: "Validate and save a local lesson with before/after evidence." },
			{ name: "--check", value: null, describe: "Validate the local lesson collection." },
		],
		returns: ["learn.list", "learn.detail", "learn.template", "learn.recorded", "learn.check"],
	},
	{
		name: "lint",
		summary: "Run the design contract against this project (delegates to sable-lint).",
		arg: { name: "dir...", required: false },
		flags: [
			{ name: "--rules", value: null, describe: "List the rules." },
			{ name: "--ignore", value: "glob", repeatable: true, describe: "Skip matching paths. Repeatable." },
			{ name: "--since", value: "version", describe: "What the contract added since that version." },
		],
		returns: ["lint"],
	},
	{
		name: "atlas",
		summary: "Retrieve annotated visual references with viewable evidence and contrasting design approaches.",
		arg: null,
		flags: [
			{ name: "--list", value: null, describe: "List the packaged visual atlas." },
			{ name: "--search", value: "query", describe: "Find references by audience, task, material, or composition." },
			{ name: "--show", value: "id", describe: "Read one reference and verified absolute capture paths." },
			{ name: "--mode", value: "persuade|operate|read|experience", describe: "Restrict to a visitor's task mode." },
			{ name: "--family", value: "slug", describe: "Restrict to a design family." },
			{ name: "--limit", value: "n", describe: "Cap results." },
			{ name: "--contrast", value: null, describe: "Diversify relevant results across design families." },
			{ name: "--check", value: null, describe: "Verify the entire atlas schema, capture paths, and hashes." },
		],
		returns: ["atlas.list", "atlas.detail", "atlas.check"],
	},
	{
		name: "prefer",
		summary: "Remember contextual design comparisons, with human and agent judgments kept distinct.",
		arg: null,
		flags: [
			{ name: "--template", value: null, describe: "Print a preference record template." },
			{ name: "--record", value: "file.json", describe: "Save an immutable comparison and pin its evidence." },
			{ name: "--list", value: null, describe: "List recorded comparisons; human records by default." },
			{ name: "--search", value: "query", describe: "Search judgments within an explicit scope." },
			{ name: "--scope", value: "kind:value", describe: "Exact personal, project, brand, or task-type context." },
			{ name: "--reviewer", value: "human|agent|all", describe: "Include declared human choices or agent observations." },
			{ name: "--check", value: null, describe: "Validate all stored comparisons and evidence." },
		],
		returns: ["prefer.list", "prefer.template", "prefer.recorded", "prefer.check"],
	},
	{
		name: "explore",
		summary: "Validate three rendered directions and create a local anonymous comparison with preference export.",
		arg: null,
		flags: [
			{ name: "--template", value: null, describe: "Print a brief and three-direction manifest template." },
			{ name: "--check", value: "file.json", describe: "Check structural variation and desktop/mobile/interaction evidence." },
			{ name: "--compare", value: "file.json", describe: "Create a local comparison HTML page in .sable/comparisons." },
		],
		returns: ["explore.template", "explore.check", "explore.comparison"],
	},
]

const ERROR_CODES = [
	{ code: "ERR_TARGET_MISSING", when: "The installed package is missing its optional target mapping artifact." },
	{ code: "ERR_PRESET_INVALID", when: "A preset is missing required metadata, semantic values, or uses unsupported tokens or CSS." },
	{ code: "ERR_PRESET_CONTRAST", when: "A label on a brand or status fill (primary, sidebar-primary, highlight, destructive, success, tone-warning, tone-info) misses 4.5:1 or APCA Lc 60. Apply the suggested pair, or record an `exceptions` entry with a reason." },
	{ code: "ERR_AGENT_SETUP", when: "The packaged skill is missing, the destination is linked, or existing local edits would be overwritten." },
	{ code: "ERR_INIT", when: "sable init ran outside an app root (no package.json)." },
	{ code: "ERR_UNKNOWN_COMMAND", when: "The first argument is not a command." },
	{ code: "ERR_MISSING_ARGUMENT", when: "A command that requires an argument got none." },
	{ code: "ERR_UNKNOWN_COMPONENT", when: "No component by that name. `suggestions` carries near matches." },
	{ code: "ERR_UNKNOWN_PATTERN", when: "No pattern by that name." },
	{ code: "ERR_UNKNOWN_BLOCK", when: "No block by that name." },
	{ code: "ERR_UNKNOWN_LAYOUT", when: "No layout primitive by that name." },
	{ code: "ERR_UNKNOWN_TOKEN_GROUP", when: "No token group by that name." },
	{ code: "ERR_UNKNOWN_UTILITY", when: "No utility or variant by that name. `suggestions` carries near matches." },
	{ code: "ERR_UNKNOWN_DOC", when: "No package guide or doc mirror by that slug. `suggestions` carries near matches and the package guides." },
	{ code: "ERR_UNKNOWN_PROVIDER", when: "No provider by that name. `suggestions` carries near matches." },
	{ code: "ERR_UNKNOWN_EXAMPLE", when: "The component has no example with that label. `suggestions` carries near matches as commands." },
	{ code: "ERR_LINT_INPUT", when: "sable lint --json: a path to lint does not exist." },
	{ code: "ERR_CHECK_FAILED", when: "sable check: doctor, lint, or grade failed. `data.checks` names which." },
	{ code: "ERR_BAD_FLAG", when: "A flag value is outside its allowed set." },
	{ code: "ERR_NO_RESULTS", when: "A search matched nothing." },
	{ code: "ERR_REGISTRY_MISSING", when: "The installed package has no registry.json." },
	{ code: "ERR_GRADE_INPUT", when: "The grade input path, flag, or review JSON cannot be read." },
	{ code: "ERR_LESSON_INVALID", when: "A design lesson is missing required observations or evidence." },
	{ code: "ERR_LESSON_EXISTS", when: "Recording a design lesson would overwrite an existing lesson." },
	{ code: "ERR_UNKNOWN_LESSON", when: "No packaged or local design lesson has the requested id." },
	{ code: "ERR_LESSON_IO", when: "A design lesson file cannot be read or written." },
	{ code: "ERR_ATLAS_INVALID", when: "An atlas annotation, capture path, or artifact hash fails validation." },
	{ code: "ERR_ATLAS_IO", when: "The installed visual atlas cannot be read." },
	{ code: "ERR_UNKNOWN_REFERENCE", when: "No visual reference has the requested id." },
	{ code: "ERR_UNKNOWN_FAMILY", when: "The requested visual family is not present in the atlas." },
	{ code: "ERR_BAD_ARGUMENT", when: "An atlas mode or limit has an invalid value." },
	{ code: "ERR_PREFERENCE_INVALID", when: "A preference, scope, provenance, artifact, or record operation fails validation." },
	{ code: "ERR_EXPLORATION_INVALID", when: "A direction specification, artifact, or comparison operation fails validation." },
]

/* ── Args. ──────────────────────────────────────────────────────────────────── */

/**
 * Global flags belong to `sable`, not to the command, so every command accepts
 * them. The parser reads the command's own flag table to know which flags are
 * switches: a switch never takes the next word as its value, so
 * `sable component --dense Button` names Button rather than setting
 * `--dense=Button`. A command that delegates to a script gets argv with the
 * flags only `sable` understands (`--dense`, `--detail`) taken out, because the
 * scripts reject flags they do not know — which is how `sable learn --search
 * "…" --dense` used to fail with "Unknown flag: --dense" while `--help` listed
 * `--dense` as global.
 */
const argv = process.argv.slice(2)
const GLOBAL_VALUE_FLAGS = new Set(GLOBAL_FLAGS.filter((f) => f.value).map((f) => f.name.slice(2)))
const SABLE_ONLY_FLAGS = new Set(["dense", "detail"])
const command = (() => {
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i]
		if (!a.startsWith("--")) return a
		if (!a.includes("=") && GLOBAL_VALUE_FLAGS.has(a.slice(2))) i++
	}
	return undefined
})()
const SPEC = new Map(
	[...GLOBAL_FLAGS, ...(COMMANDS.find((c) => c.name === command)?.flags ?? [])].map((f) => [f.name.slice(2), f]),
)
const flags = new Map()
const positional = []
/** argv for a delegating command: everything after the command word, minus sable-only flags. */
const forwarded = []
for (let i = 0; i < argv.length; i++) {
	const a = argv[i]
	if (!a.startsWith("--")) {
		positional.push(a)
		if (positional.length > 1) forwarded.push(a)
		continue
	}
	const eq = a.indexOf("=")
	const name = eq === -1 ? a.slice(2) : a.slice(2, eq)
	const spec = SPEC.get(name)
	const takesValue = eq === -1 && argv[i + 1] !== undefined && !argv[i + 1].startsWith("--") && (spec ? spec.value !== null : true)
	const value = eq !== -1 ? a.slice(eq + 1) : takesValue ? argv[++i] : true
	// Repeatable flags (`--ignore`) keep every value; everything else keeps the last.
	if (flags.has(name) && spec?.repeatable) flags.set(name, [flags.get(name)].flat().concat(value))
	else flags.set(name, spec?.repeatable ? [value] : value)
	if (!SABLE_ONLY_FLAGS.has(name)) forwarded.push(...(eq !== -1 || value === true ? [a] : [a, value]))
}

const JSON_OUT = flags.has("json")
const DENSE = flags.has("dense")
const rest = positional.slice(1)

/* ── Usage log. Opt-in, off unless SABLE_CLI_LOG names a file. ──────────────────
 *
 * Why: when generated code comes out wrong, "the agent ignored the CLI" and "the
 * agent used the CLI and it did not help" look identical from the outside, and
 * they have opposite fixes — one is a placement problem, the other a content
 * problem. Without a record there is no way to tell them apart, so every
 * conclusion about whether this retrieval surface earns its keep is a guess.
 *
 * One JSONL line per invocation. No network, no identifiers, no arguments beyond
 * the command and flag NAMES — a search query can carry a consumer's product
 * details, so values are deliberately not recorded. Failures to write are
 * swallowed: telemetry must never be able to break the tool it observes.
 */
const LOG_PATH = process.env.SABLE_CLI_LOG
const START = Date.now()
function logInvocation(exitCode, errorCode) {
	if (!LOG_PATH) return
	try {
		appendFileSync(
			LOG_PATH,
			`${JSON.stringify({
				ts: new Date().toISOString(),
				version: R.version,
				command: command ?? null,
				flags: [...flags.keys()].sort(),
				detail: flags.get("detail") ?? null,
				json: JSON_OUT,
				exitCode,
				...(errorCode ? { errorCode } : null),
				ms: Date.now() - START,
			})}\n`,
		)
	} catch {
		/* A log that breaks the CLI is worse than no log. */
	}
}

/* ── Output. Every success is `{ type, data }`; every failure carries a code. ── */

function ok(type, data, text) {
	if (JSON_OUT) process.stdout.write(`${JSON.stringify({ type, data }, null, DENSE ? 0 : 1)}\n`)
	else process.stdout.write(`${typeof text === "function" ? text() : text}\n`)
	logInvocation(0)
	process.exit(0)
}

function fail(code, message, suggestions = []) {
	if (JSON_OUT) {
		process.stdout.write(`${JSON.stringify({ type: "error", code, message, suggestions })}\n`)
	} else {
		process.stderr.write(`[sable] ${code}: ${message}\n`)
		for (const s of suggestions) process.stderr.write(`  → ${s}\n`)
	}
	logInvocation(1, code)
	process.exit(1)
}

/**
 * Near matches for an unknown name. This is the difference between an error an
 * agent can act on and one it can only retry: "no component named `Buton`" sends
 * it back to guessing, "did you mean Button" ends the loop in one step.
 */
function nearest(name, candidates, max = 3) {
	const q = name.toLowerCase()
	const dist = (a, b) => {
		const rows = [Array.from({ length: b.length + 1 }, (_, i) => i)]
		for (let i = 1; i <= a.length; i++) {
			rows[i] = [i]
			for (let j = 1; j <= b.length; j++) {
				rows[i][j] = Math.min(
					rows[i - 1][j] + 1,
					rows[i][j - 1] + 1,
					rows[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
				)
			}
		}
		return rows[a.length][b.length]
	}
	return candidates
		.map((c) => ({ c, d: c.toLowerCase().includes(q) || q.includes(c.toLowerCase()) ? 0 : dist(q, c.toLowerCase()) }))
		.filter((x) => x.d <= Math.max(3, Math.floor(q.length / 2)))
		.sort((a, b) => a.d - b.d)
		.slice(0, max)
		.map((x) => x.c)
}

function detailLevel(fallback = "compact") {
	const v = flags.get("detail")
	if (v === undefined || v === true) return fallback
	if (!DETAILS.includes(v)) fail("ERR_BAD_FLAG", `--detail must be one of ${DETAILS.join(", ")}.`, DETAILS)
	return v
}

const bullet = (s) => `  • ${s}`
const section = (title, lines) => (lines.length ? `\n${DENSE ? title : `${title}:`}\n${lines.join("\n")}` : "")

/* ── Catalog accessors. ─────────────────────────────────────────────────────── */

const COMPONENTS = R.components ?? []
const PATTERNS = R.patterns?.items ?? []
const BLOCKS = R.blocks?.items ?? []
const PRIMITIVES = R.layoutPrimitives?.primitives ?? []
const TOKEN_GROUPS = Object.keys(R.tokens ?? {})
const UTILITIES = R.utilities?.items ?? []

const importLine = (name) => `import { ${name} } from "@sableui/react"`

const PROVIDERS = R.providers?.items ?? []
const findProvider = (name) => PROVIDERS.find((p) => p.name.toLowerCase() === String(name).toLowerCase())

function findComponent(name) {
	const hit = COMPONENTS.find((c) => c.name.toLowerCase() === name.toLowerCase())
	if (hit) return hit
	fail(
		"ERR_UNKNOWN_COMPONENT",
		`No component named "${name}".`,
		[
			...nearest(name, [...COMPONENTS, ...PROVIDERS].map((c) => c.name)).map((n) => `Did you mean ${n}?`),
			`sable search "${name}" — searches summaries and keywords too`,
			"sable component --list",
		],
	)
}

/* ── manifest ───────────────────────────────────────────────────────────────── */

function cmdManifest() {
	const data = {
		name: "sable",
		version: R.version,
		package: R.name,
		describes: { components: COMPONENTS.length, patterns: PATTERNS.length, blocks: BLOCKS.length, layoutPrimitives: PRIMITIVES.length },
		envelope: { success: "{ type, data }", error: "{ type: 'error', code, message, suggestions }" },
		globalFlags: GLOBAL_FLAGS,
		commands: COMMANDS,
		errorCodes: ERROR_CODES,
	}
	ok("manifest", data, () =>
		[
			`sable ${R.version} — ${COMPONENTS.length} components, ${PATTERNS.length} patterns, ${BLOCKS.length} blocks, ${PRIMITIVES.length} layout primitives.`,
			"",
			"Commands:",
			...COMMANDS.map((c) => `  ${(c.name + (c.arg ? ` <${c.arg.name}>` : "")).padEnd(22)}${c.summary}`),
			"",
			"Global flags:",
			...GLOBAL_FLAGS.map((f) => `  ${(f.name + (f.value ? ` <${f.value}>` : "")).padEnd(32)}${f.describe}`),
			"",
			"Machine-readable: sable manifest --json",
		].join("\n"),
	)
}

/* ── search ─────────────────────────────────────────────────────────────────── */

function cmdSearch() {
	const query = rest.join(" ").trim()
	if (!query) fail("ERR_MISSING_ARGUMENT", "search needs a query.", ['sable search "date range"'])
	const type = flags.get("type")
	const limit = Number(flags.get("limit")) || 20
	const q = query.toLowerCase()
	// Function words match nearly every entry by substring ("on" is inside
	// "background"), so in a phrase like "hover color on a surface" they only add
	// noise. Dropped unless the query is nothing but them.
	const STOPWORDS = new Set(["a", "an", "the", "on", "of", "in", "to", "for", "with", "and", "or", "is", "my"])
	const allTerms = q.split(/\s+/).filter(Boolean)
	const contentTerms = allTerms.filter((t) => !STOPWORDS.has(t))
	const terms = contentTerms.length ? contentTerms : allTerms

	/** Name hits outrank keyword hits outrank prose hits — an exact name is never buried.
	 * A keyword that IS the term (or the whole query) outranks one that merely
	 * contains it: `segmented` is what ToggleGroup is called, while the well
	 * behind it is only described as a "segmented track". */
	const score = (fields) => {
		let s = 0
		const keywords = (fields.keywords ?? []).map((k) => k.toLowerCase())
		if (terms.length > 1 && keywords.includes(q)) s += 50
		for (const t of terms) {
			if (fields.name.toLowerCase() === t) s += 100
			else if (fields.name.toLowerCase().includes(t)) s += 40
			if (keywords.includes(t)) s += 30
			else if (keywords.some((k) => k.includes(t))) s += 20
			if ((fields.text ?? "").toLowerCase().includes(t)) s += 5
		}
		return s
	}

	const pool = []
	if (!type || type === "component")
		for (const c of COMPONENTS)
			pool.push({ kind: "component", name: c.name, summary: c.summary, status: c.status, group: c.group, ...(c.composition ? { reference: true, parts: c.composition } : {}), _s: score({ name: c.name, keywords: c.keywords, text: `${c.summary} ${c.usage?.description ?? ""}` }) })
	if (!type || type === "provider")
		for (const p of PROVIDERS)
			pool.push({ kind: "provider", name: p.name, summary: p.summary, _s: score({ name: p.name, keywords: ["provider", ...(p.companions ?? [])], text: `${p.summary} ${p.placement ?? ""}` }) })
	if (!type || type === "pattern")
		for (const p of PATTERNS)
			pool.push({ kind: "pattern", name: p.name, summary: p.summary, _s: score({ name: p.name, text: `${p.summary} ${p.intent ?? ""}` }) })
	if (!type || type === "block")
		for (const b of BLOCKS)
			pool.push({ kind: "block", name: b.name, summary: b.summary, family: b.family, _s: score({ name: b.name, keywords: [b.family.toLowerCase()], text: `${b.summary} ${b.intent ?? ""}` }) })
	if (!type || type === "layout")
		for (const m of PRIMITIVES)
			pool.push({ kind: "layout", name: m.name, summary: m.summary, _s: score({ name: m.name, keywords: m.keywords, text: m.summary }) })
	if (!type || type === "utility")
		for (const u of UTILITIES)
			pool.push({ kind: "utility", name: u.name, summary: u.intent, family: u.family, _s: score({ name: u.name, keywords: u.keywords, text: `${u.intent} ${u.whenToUse}` }) })
	if (!type || type === "token")
		for (const t of R.tokens?.semantic ?? [])
			pool.push({ kind: "token", name: t.name, summary: t.intent, _s: score({ name: t.name, text: `${t.intent} ${t.whenToUse ?? ""}` }) })
	if (!type || type === "doc")
		for (const d of docSlugs())
			pool.push({ kind: "doc", name: d.slug, summary: `${d.kind} mirror`, _s: score({ name: d.slug, text: d.kind }) })
	if (!type || type === "example")
		for (const c of COMPONENTS)
			for (const e of c.examples ?? []) {
				const s = scoreExample(c, e, { q, terms })
				if (s > 0) pool.push({ kind: "example", name: `${c.name} › ${e.label}`, component: c.name, label: e.label, summary: `Uses ${exampleParts(e).join(", ")}.`, _s: s })
			}

	// Ties resolve in the order AGENTS.md tells an agent to resolve a need:
	// a component first, then a pattern or primitive, then a utility, then a
	// token. "segmented" should land on ToggleGroup before the well behind it.
	const KIND_ORDER = ["component", "provider", "pattern", "block", "example", "layout", "utility", "token", "doc"]
	// A popular label ("Controlled value") exists on dozens of components, so
	// examples are capped twice: per component, and as a share of the list, or
	// one query would bury every component under its own examples.
	const perComponent = new Map()
	let examples = 0
	const hits = pool
		.filter((h) => h._s > 0)
		.sort((a, b) => b._s - a._s || KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind))
		.filter((h) => {
			if (h.kind !== "example" || type === "example") return true
			const n = perComponent.get(h.component) ?? 0
			if (n >= 2 || examples >= Math.max(3, Math.ceil(limit / 3))) return false
			perComponent.set(h.component, n + 1)
			examples++
			return true
		})
		.slice(0, limit)
	if (!hits.length)
		fail("ERR_NO_RESULTS", `Nothing matched "${query}".`, [
			"sable component --list",
			"sable pattern --list",
			"Try a single word — search is term-wise, not phrase-wise",
		])

	// Patterns, blocks and composition components are designed arrangements,
	// not behaviour: references to use when their layout fits the brief. Marked
	// so an agent does not take the nearest one as the required answer.
	const results = hits.map(({ _s, ...h }) => ({
		...h,
		...(h.kind === "pattern" || h.kind === "block" ? { reference: true } : {}),
		retrieve:
			h.kind === "example"
				? `sable component ${h.component} --example "${h.label.replace(/"/g, '\\"')}"`
				: `sable ${h.kind === "doc" ? "docs" : h.kind} ${h.name}`,
	}))
	const anyReference = results.some((h) => h.reference)
	ok("search", { query, count: results.length, results }, () =>
		[
			...results.map((h) =>
				DENSE
					? `${h.kind}/${h.name}${h.reference ? " (reference)" : ""}`
					: `${h.kind.padEnd(9)} ${`${h.name}${h.reference ? " ◇" : ""}`.padEnd(24)} ${firstSentence(h.summary ?? "")}`,
			),
			...(anyReference && !DENSE
				? ["", "◇ a reference layout: use it when it fits the brief, or compose your own from Sable's parts. Either is fine. Behaviour components (controls, overlays, fields) are always used, never rebuilt."]
				: []),
		].join("\n"),
	)
}

/** The names an example imports: the parts it composes. */
const exampleParts = (e) =>
	(e.imports ?? "")
		.split(/[{}]/)[1]
		?.split(",")
		.map((s) => s.trim())
		.filter(Boolean) ?? []

/** Every component and prop an example's code uses, lowercased: `<Combobox multiple items=…>` → combobox, multiple, items. */
const exampleIdentifiers = (e) => {
	const ids = new Set(exampleParts(e).map((p) => p.toLowerCase()))
	for (const [, tag] of (e.code ?? "").matchAll(/<([A-Z]\w*)/g)) ids.add(tag.toLowerCase())
	for (const [, prop] of (e.code ?? "").matchAll(/\s([a-z][A-Za-z]+)(?==|[\s/>])/g)) ids.add(prop.toLowerCase())
	return ids
}

/**
 * An example is found by what it shows, not by the component it belongs to. The
 * label carries the intent ("Multiple selection", "Server errors"); the code
 * names the parts and props it relies on; the parent component's name counts,
 * but less than the component itself scores, so "Combobox" still lands on the
 * component and "multiple combobox" lands on its example. An example qualifies
 * only by its own label, or — for a phrase — by covering every term with its
 * code: otherwise every example that renders a Button answers "button".
 */
function scoreExample(c, e, { q, terms }) {
	const label = e.label.toLowerCase()
	const ids = exampleIdentifiers(e)
	const parent = c.name.toLowerCase()
	const keywords = (c.keywords ?? []).map((k) => k.toLowerCase())
	let s = terms.length > 1 && label === q ? 60 : 0
	let labelHit = false
	let codeHit = false
	let covered = 0
	for (const t of terms) {
		const inLabel = label.includes(t)
		const inCode = ids.has(t) ? 10 : [...ids].some((id) => id.includes(t)) ? 4 : 0
		const inParent = parent === t ? 15 : parent.includes(t) ? 10 : keywords.includes(t) ? 5 : 0
		s += (inLabel ? 30 : 0) + inCode + inParent
		labelHit ||= inLabel
		codeHit ||= inCode > 0
		if (inLabel || inCode || inParent) covered++
	}
	const phrase = terms.length > 1 && covered === terms.length
	if (!labelHit && !(phrase && codeHit)) return 0
	// A single word is a lookup, and the component it names is the answer; a
	// phrase is a need, and the example that covers all of it is.
	if (terms.length === 1) return Math.round(s / 2)
	return phrase ? s + 20 : Math.round((s * covered) / terms.length)
}

/**
 * First sentence, for one-line list rows. The abbreviation guard is not fussiness:
 * summaries in this catalog say things like "A human relative timestamp (e.g. 2h
 * ago)", and a naive split on the first period renders that row as "A human
 * relative timestamp (e.g." — a listing whose whole job is to be scannable.
 */
const ABBREV = /(?:^|[\s(])(?:e\.g|i\.e|etc|vs|approx|min|max|no|Dr|Mr|Ms|St|Fig)\.$/i
function firstSentence(s) {
	const text = (s ?? "").trim()
	for (const m of text.matchAll(/[.!?](?=\s|$)/g)) {
		const head = text.slice(0, m.index + 1)
		if (ABBREV.test(head)) continue
		return head
	}
	return text
}

/* ── component ──────────────────────────────────────────────────────────────── */

function cmdComponent() {
	if (flags.has("list") || !rest[0]) {
		let list = COMPONENTS
		const group = flags.get("group")
		const register = flags.get("register")
		if (group) list = list.filter((c) => c.group?.toLowerCase() === String(group).toLowerCase())
		if (register) list = list.filter((c) => c.register === register || c.register === "either")
		const level = detailLevel("brief")
		const data = list.map((c) => ({
			name: c.name,
			status: c.status,
			group: c.group,
			register: c.register,
			...(level === "brief" ? {} : { summary: c.summary }),
		}))
		return ok("component.list", { count: data.length, components: data }, () =>
			[
				DENSE ? `${data.length}` : `${data.length} components${group ? ` in ${group}` : ""}${register ? ` for the ${register} register` : ""}:\n`,
				...data.map((c) =>
					DENSE
						? `${c.name} ${c.group} ${c.register}${c.status === "deprecated" ? " DEPRECATED" : ""}`
						: `  ${c.name.padEnd(24)}${(c.group ?? "").padEnd(14)}${c.register}${c.status === "deprecated" ? "  ⚠ deprecated" : ""}${c.summary ? `\n      ${firstSentence(c.summary)}` : ""}`,
				),
			].join("\n"),
		)
	}

	// A provider is asked for the way a component is. Answer with its entry rather
	// than ERR_UNKNOWN_COMPONENT, which is what `sable component SableThemeProvider`
	// used to say.
	if (!COMPONENTS.some((c) => c.name.toLowerCase() === rest[0].toLowerCase()) && findProvider(rest[0])) return cmdProvider()
	const c = findComponent(rest[0])

	if (flags.has("props"))
		return ok("component.props", { name: c.name, props: c.props ?? [], subcomponents: c.subcomponents ?? [] }, () =>
			renderProps(c),
		)
	if (flags.has("examples"))
		return ok("component.examples", { name: c.name, examples: c.examples ?? [] }, () => renderExamples(c))
	if (flags.has("example")) {
		// The retrieve step for a search hit: one example, not the whole set.
		const want = flags.get("example")
		const labels = (c.examples ?? []).map((e) => e.label)
		const quoted = (l) => `sable component ${c.name} --example "${l.replace(/"/g, '\\"')}"`
		if (want === true) fail("ERR_MISSING_ARGUMENT", "--example needs a label.", labels.map(quoted))
		const example = (c.examples ?? []).find((e) => e.label.toLowerCase() === String(want).toLowerCase())
		if (!example) {
			const near = nearest(String(want), labels)
			fail("ERR_UNKNOWN_EXAMPLE", `${c.name} has no example labelled "${want}".`, [
				...(near.length ? near : labels).map(quoted),
				`sable component ${c.name} --examples`,
			])
		}
		return ok("component.example", { name: c.name, example }, () => renderExample(example))
	}
	if (flags.has("a11y")) return ok("component.a11y", { name: c.name, a11y: c.a11y ?? [] }, () => (c.a11y ?? []).map(bullet).join("\n"))

	const level = detailLevel("compact")
	const data = {
		name: c.name,
		status: c.status,
		group: c.group,
		register: c.register,
		import: importLine(c.name),
		summary: c.summary,
		...(c.composition ? { composition: c.composition } : {}),
	}
	if (level !== "brief") {
		data.props = c.props ?? []
		data.subcomponents = c.subcomponents ?? []
		data.related = c.related ?? []
		if (!DENSE) data.usage = c.usage
	}
	if (level === "full") {
		data.a11y = c.a11y ?? []
		data.tokensUsed = c.tokensUsed ?? []
		data.motion = c.motion
		data.examples = c.examples ?? []
	}

	ok("component.detail", data, () =>
		[
			`${c.name}  [${c.status}]  ${c.group}  register:${c.register}`,
			c.summary,
			c.composition
				? `Reference layout: use it when it fits the brief, or compose your own from ${c.composition}.`
				: "",
			`\n${data.import}`,
			level === "brief" ? "" : renderProps(c),
			level !== "full" || DENSE ? "" : renderUsage(c),
			level === "full" ? section("a11y", (c.a11y ?? []).map(bullet)) : "",
			level === "full" ? section("tokens", [`  ${(c.tokensUsed ?? []).join(", ")}`]) : "",
			level === "full" ? renderExamples(c) : "",
			level === "brief" ? "" : `\nMore: sable component ${c.name} --detail full · sable docs ${c.name}`,
		]
			.filter(Boolean)
			.join("\n"),
	)
}

function renderProps(c) {
	const props = c.props ?? []
	const lines = props.map((p) =>
		DENSE
			? `  ${p.name}:${p.type}${p.default ? `=${p.default}` : ""}`
			: `  ${p.name.padEnd(18)}${p.type}${p.default ? `  (default ${p.default})` : ""}${p.description ? `\n      ${p.description}` : ""}`,
	)
	const subs = (c.subcomponents ?? []).map((s) =>
		typeof s === "string" ? bullet(s) : bullet(`${s.name}${s.description ? ` — ${s.description}` : ""}`),
	)
	return [section("props", lines), section("subcomponents", subs)].filter(Boolean).join("\n")
}

function renderUsage(c) {
	if (!c.usage) return ""
	const dos = (c.usage.bestPractices ?? []).map((b) => `  ${b.guidance === "do" ? "✓" : "✗"} ${b.description}`)
	return [c.usage.description ? `\nWhen to use:\n  ${c.usage.description}` : "", section("guidance", dos)]
		.filter(Boolean)
		.join("\n")
}

function renderExamples(c) {
	const ex = c.examples ?? []
	if (!ex.length) return ""
	return `\nExamples:\n${ex.map((e) => `\n${renderExample(e)}`).join("\n")}`
}

function renderExample(e) {
	return `  ── ${e.label}\n  ${e.imports}\n${e.code.split("\n").map((l) => `  ${l}`).join("\n")}`
}

const slugify = (name) => name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()

/**
 * The doc mirror's slug for a catalog entry. It comes from the entry's PATH, not
 * its name, and those disagree: `ErrorState` lives in `components/error`, so its
 * page is `error.md`. Deriving the slug from the name looks right on 109 of 110
 * components and 404s on the one that matters — exactly the shape of bug an agent
 * cannot diagnose, because the name it was given is correct.
 */
function docSlugFor(name) {
	const entry =
		COMPONENTS.find((c) => c.name.toLowerCase() === name.toLowerCase()) ??
		PRIMITIVES.find((m) => m.name.toLowerCase() === name.toLowerCase()) ??
		PATTERNS.find((p) => p.name.toLowerCase() === name.toLowerCase()) ??
		BLOCKS.find((b) => b.name.toLowerCase() === name.toLowerCase())
	if (!entry?.path) return slugify(name)
	return entry.path.split("/").pop().replace(/\.tsx$/, "")
}

/* ── provider ───────────────────────────────────────────────────────────────── */

/**
 * App-level providers. Two kinds share one shape: app-wide ones documented in
 * src/providers/providers.meta.ts (props, placement, examples), and ones owned
 * by a component (`partOf`), whose full contract stays with that component.
 */
function cmdProvider() {
	if (flags.has("list") || !rest[0]) {
		const data = PROVIDERS.map((p) => ({
			name: p.name,
			...(p.partOf ? { partOf: p.partOf } : { required: p.required.startsWith("Required") }),
			summary: p.summary,
		}))
		return ok("provider.list", { count: data.length, about: R.providers?.about, providers: data }, () =>
			data
				.map((p) =>
					DENSE
						? `${p.name}${p.partOf ? ` partOf:${p.partOf}` : p.required ? " required" : ""}`
						: `  ${p.name.padEnd(24)}${(p.partOf ? `part of ${p.partOf}` : p.required ? "required" : "optional").padEnd(18)}${firstSentence(p.summary)}`,
				)
				.join("\n"),
		)
	}
	const p = findProvider(rest[0])
	if (!p)
		fail("ERR_UNKNOWN_PROVIDER", `No provider named "${rest[0]}".`, [
			...nearest(rest[0], PROVIDERS.map((x) => x.name)).map((n) => `Did you mean ${n}?`),
			"sable provider --list",
		])
	const owner = p.partOf ? COMPONENTS.find((c) => c.name === p.partOf) : null
	const props = p.props ?? []
	const contract = owner ? `sable component ${owner.name} --props` : null
	if (flags.has("props"))
		return ok("provider.props", { name: p.name, props, ...(p.signature ? { signature: p.signature } : {}), ...(contract ? { contract } : {}) }, () =>
			p.partOf ? `  ${p.name}  ${p.signature}\n\nFull contract: ${contract}` : renderProps(p),
		)
	if (flags.has("examples")) return ok("provider.examples", { name: p.name, examples: p.examples ?? [] }, () => renderExamples(p))

	const level = detailLevel("compact")
	const data = { name: p.name, kind: "provider", import: p.import, summary: p.summary }
	if (p.partOf) Object.assign(data, { partOf: p.partOf, signature: p.signature, contract })
	else Object.assign(data, { required: p.required, placement: p.placement })
	if (level !== "brief") {
		if (!p.partOf) data.props = props
		data.companions = p.companions ?? []
		data.related = p.related ?? []
		data.examples = p.examples ?? []
	}
	if (level === "full") data.notes = p.notes ?? []
	ok("provider.detail", data, () =>
		[
			`${p.name}  [provider${p.partOf ? `, part of ${p.partOf}` : ""}]`,
			p.summary,
			`\n${p.import}`,
			p.partOf ? `\n  ${p.name}  ${p.signature}\n\nFull contract: ${contract}` : "",
			p.required ? `\n${p.required}` : "",
			p.placement ? `${DENSE ? "" : "Where: "}${p.placement}` : "",
			level === "brief" || p.partOf ? "" : renderProps(p),
			level === "brief" || !(p.companions ?? []).length ? "" : `\nWith: ${p.companions.join(", ")}`,
			level === "brief" ? "" : renderExamples(p),
			level === "full" ? section("notes", (p.notes ?? []).map(bullet)) : "",
		]
			.filter(Boolean)
			.join("\n"),
	)
}

/* ── pattern / block ────────────────────────────────────────────────────────── */

/**
 * The copy-in tiers share one retrieval shape: list, detail, skeleton, code.
 * Patterns are page shells; blocks are section-sized (a card, a form) and add
 * a family and a designed width.
 */
function cmdComposition({ kind, items, about, noun, errorCode }) {
	if (flags.has("list") || !rest[0]) {
		const family = flags.get("family")
		const list = family ? items.filter((x) => x.family?.toLowerCase() === String(family).toLowerCase()) : items
		const data = list.map((x) => ({
			name: x.name,
			...(x.family ? { family: x.family } : {}),
			summary: x.summary,
			intent: x.intent,
		}))
		return ok(`${kind}.list`, { count: data.length, about, [`${kind}s`]: data }, () =>
			[
				DENSE ? "" : `${data.length} ${noun}${family ? ` in ${family}` : ""}. Read a skeleton before composing anything:\n`,
				...data.map((x) =>
					DENSE
						? `${x.name} ${firstSentence(x.summary)}`
						: `  ${x.name.padEnd(kind === "block" ? 28 : 20)}${x.family ? x.family.padEnd(20) : ""}${firstSentence(x.intent ?? x.summary)}`,
				),
				DENSE ? "" : `\n  sable ${kind} <Name> --skeleton   the composition tree, ~25 lines`,
			]
				.filter(Boolean)
				.join("\n"),
		)
	}

	const name = rest[0]
	const p = items.find((x) => x.name.toLowerCase() === name.toLowerCase())
	if (!p)
		fail(errorCode, `No ${kind} named "${name}".`, [
			...nearest(name, items.map((x) => x.name)).map((n) => `Did you mean ${n}?`),
			`sable ${kind} --list`,
		])

	if (flags.has("skeleton")) {
		const { tree, elided } = skeletonize(p.code)
		return ok(`${kind}.skeleton`, { name: p.name, tree, elidedFixtures: elided }, () =>
			[
				DENSE ? "" : `${p.name} — composition tree${elided ? ` (${elided} demo fixtures elided)` : ""}\n`,
				tree,
				DENSE ? "" : `\nFull source: sable ${kind} ${p.name} --code`,
			]
				.filter(Boolean)
				.join("\n"),
		)
	}
	if (flags.has("code"))
		return ok(`${kind}.code`, { name: p.name, imports: p.imports, code: p.code }, () => `${p.imports}\n\n${p.code}`)

	const level = detailLevel("compact")
	const data = { name: p.name, path: p.path, summary: p.summary, intent: p.intent }
	if (p.family) Object.assign(data, { family: p.family, kind: p.kind, ...(p.width ? { width: p.width } : {}) })
	if (level !== "brief") {
		data.notes = p.notes ?? []
		data.a11y = p.a11y ?? []
		data.skeleton = skeletonize(p.code).tree
	}
	if (level === "full") {
		data.imports = p.imports
		data.code = p.code
	}
	const shape = p.family ? `  ${p.family} · ${p.kind}${p.width ? ` · ${p.width.min}–${p.width.max}` : ""}` : ""
	ok(`${kind}.detail`, data, () =>
		[
			`${p.name}  (${p.path})${shape}`,
			p.summary,
			p.intent ? `\nReach for it when:\n  ${p.intent}` : "",
			level === "brief" ? "" : section("notes", (p.notes ?? []).map(bullet)),
			level === "brief" ? "" : section("a11y", (p.a11y ?? []).map(bullet)),
			level === "brief" ? "" : `\nComposition:\n${data.skeleton}`,
			level === "full" ? `\n${p.imports}\n\n${p.code}` : `\nFull source: sable ${kind} ${p.name} --code`,
		]
			.filter(Boolean)
			.join("\n"),
	)
}

function cmdPattern() {
	cmdComposition({ kind: "pattern", items: PATTERNS, about: R.patterns?.about, noun: "canonical page shells", errorCode: "ERR_UNKNOWN_PATTERN" })
}

function cmdBlock() {
	cmdComposition({ kind: "block", items: BLOCKS, about: R.blocks?.about, noun: "blocks", errorCode: "ERR_UNKNOWN_BLOCK" })
}

/* ── layout ─────────────────────────────────────────────────────────────────── */

function cmdLayout() {
	const doctrine = R.layoutPrimitives?.doctrine ?? []
	if (flags.has("doctrine")) return ok("layout.doctrine", { doctrine }, () => doctrine.map(bullet).join("\n"))

	if (flags.has("list") || !rest[0]) {
		const data = PRIMITIVES.map((m) => ({ name: m.name, status: m.status, summary: m.summary }))
		return ok("layout.list", { count: data.length, doctrine, primitives: data }, () =>
			[
				section("doctrine", doctrine.map(bullet)),
				section(
					"primitives",
					data.map((m) => (DENSE ? `  ${m.name}` : `  ${m.name.padEnd(14)}${firstSentence(m.summary)}`)),
				),
			].join("\n"),
		)
	}

	const name = rest[0]
	const m = PRIMITIVES.find((x) => x.name.toLowerCase() === name.toLowerCase())
	if (!m)
		fail("ERR_UNKNOWN_LAYOUT", `No layout primitive named "${name}".`, [
			...nearest(name, PRIMITIVES.map((x) => x.name)).map((n) => `Did you mean ${n}?`),
			"sable layout --list",
		])

	const level = detailLevel("compact")
	const data = { name: m.name, status: m.status, summary: m.summary, import: importLine(m.name) }
	if (level !== "brief") {
		data.props = m.props ?? []
		data.related = m.related ?? []
	}
	if (level === "full") {
		data.tokensUsed = m.tokensUsed ?? []
		data.examples = m.examples ?? []
	}
	ok("layout.detail", data, () =>
		[
			`${m.name}  [${m.status}]`,
			m.summary,
			`\n${data.import}`,
			level === "brief" ? "" : renderProps(m),
			level === "full" ? renderExamples(m) : "",
		]
			.filter(Boolean)
			.join("\n"),
	)
}

/* ── token ──────────────────────────────────────────────────────────────────── */

function cmdToken() {
	const group = rest[0]
	if (flags.has("list") || !group) {
		const data = TOKEN_GROUPS.map((g) => ({
			group: g,
			count: Array.isArray(R.tokens[g]) ? R.tokens[g].length : Object.keys(R.tokens[g]).length,
		}))
		return ok("token.list", { groups: data }, () =>
			data.map((d) => `  ${d.group.padEnd(21)}${String(d.count).padStart(3)} entries   sable token ${d.group}`).join("\n"),
		)
	}
	if (!TOKEN_GROUPS.includes(group))
		fail("ERR_UNKNOWN_TOKEN_GROUP", `No token group "${group}".`, TOKEN_GROUPS.map((g) => `sable token ${g}`))

	const entries = R.tokens[group]
	ok("token.group", { group, tokens: entries }, () => {
		if (!Array.isArray(entries)) return JSON.stringify(entries, null, 2)
		return entries
			.map((t) => {
				if (typeof t === "string") return `  ${t}`
				if (DENSE) return `  ${t.name} — ${t.intent}`
				return [
					`  ${t.name}`,
					t.intent ? `      ${t.intent}` : "",
					t.whenToUse ? `      use: ${t.whenToUse}` : "",
					t.insteadOf ? `      not: ${t.insteadOf}` : "",
				]
					.filter(Boolean)
					.join("\n")
			})
			.join(DENSE ? "\n" : "\n\n")
	})
}

/* ── utility ────────────────────────────────────────────────────────────────── */

/**
 * Resolve what someone would actually type: `sable-well`, `.sable-well`, a
 * variant with its colon (`sable-selected:`), or a filled-in functional utility
 * (`rounded-concentric-md/1` → `rounded-concentric-*`).
 */
function findUtility(input) {
	const name = input.replace(/^\./, "").replace(/:$/, "")
	const exact = UTILITIES.find((u) => u.name === name)
	if (exact) return exact
	const functional = UTILITIES.filter((u) => u.name.endsWith("-*")).find((u) => name.startsWith(u.name.slice(0, -1)))
	if (functional) return functional
	return TYPE_TIERS.find((u) => u.name === name)
}

/**
 * The paired `text-*` page tiers are `@utility` declarations too, documented in
 * `tokens.typography` (one home, so the two descriptions cannot disagree). An
 * agent types the class it wants to write, so `sable utility text-heading-1`
 * resolves there instead of answering ERR_UNKNOWN_UTILITY.
 */
const TYPE_TIERS = (R.tokens?.typography ?? [])
	.filter((t) => typeof t === "object" && t.name)
	.map((t) => ({
		name: `text-${t.name}`,
		kind: "utility",
		family: "typography",
		intent: t.intent,
		whenToUse: t.whenToUse,
		insteadOf: t.insteadOf,
		example: `<p className="text-${t.name}">…</p>`,
		documentedIn: "registry.json → tokens.typography",
	}))

function cmdUtility() {
	const name = rest[0]
	if (flags.has("list") || !name) {
		const family = flags.get("family")
		const families = R.utilities?.families ?? [...new Set(UTILITIES.map((u) => u.family))]
		if (family && !families.includes(family))
			fail("ERR_BAD_FLAG", `No utility family "${family}".`, families.map((f) => `sable utility --list --family "${f}"`))
		const items = UTILITIES.filter((u) => !family || u.family === family).map((u) => ({
			name: u.name,
			kind: u.kind,
			family: u.family,
			intent: u.intent,
		}))
		return ok("utility.list", { count: items.length, elsewhere: R.utilities?.elsewhere, utilities: items }, () =>
			[
				...families
					.filter((f) => !family || f === family)
					.flatMap((f) => {
						const rows = items.filter((u) => u.family === f)
						if (!rows.length) return []
						return [
							DENSE ? f : `${f}:`,
							...rows.map((u) => `  ${(u.kind === "variant" ? `${u.name}:` : u.name).padEnd(28)}${firstSentence(u.intent)}`),
						]
					}),
				...(DENSE || family ? [] : ["", ...Object.values(R.utilities?.elsewhere ?? {})]),
			].join("\n"),
		)
	}
	const u = findUtility(name)
	if (!u)
		fail("ERR_UNKNOWN_UTILITY", `No utility "${name}".`, [
			...nearest(name, [...UTILITIES, ...TYPE_TIERS].map((x) => x.name)).map((n) => `sable utility ${n}`),
			`sable search "${name}"`,
			"sable utility --list",
		])
	ok("utility.detail", u, () => {
		const label = u.kind === "variant" ? `${u.name}: (variant)` : u.name
		if (detailLevel() === "brief" || DENSE) return `${label} — ${u.intent}`
		return [
			`${label}  [${u.family}]`,
			`  ${u.intent}`,
			"",
			`  use: ${u.whenToUse}`,
			`  not: ${u.insteadOf}`,
			"",
			`  ${u.example}`,
			...(u.pairsWith?.length ? ["", `  pairs with: ${u.pairsWith.join(", ")}`] : []),
		].join("\n")
	})
}

/* ── docs ───────────────────────────────────────────────────────────────────── */

/**
 * The package's own guides, served by name. llms.txt tells an agent to read
 * AGENTS.md first, and `sable docs AGENTS` answered ERR_UNKNOWN_DOC — the one
 * document the CLI was pointing at was the one it could not serve. These ship
 * in the package's `files`, so they are always next to this CLI.
 */
const PACKAGE_DOCS = [
	{ slug: "AGENTS", file: "AGENTS.md", aliases: ["agents.md", "agent"] },
	{ slug: "README", file: "README.md", aliases: ["readme.md", "install"] },
	{ slug: "CONTRIBUTING", file: "CONTRIBUTING.md", aliases: ["contributing.md"] },
	{ slug: "DESIGN", file: "DESIGN.md", aliases: ["design.md"] },
	{ slug: "CHANGELOG", file: "CHANGELOG.md", aliases: ["changelog.md", "changes"] },
	{ slug: "llms", file: "llms.txt", aliases: ["llms.txt"] },
]

function packageDoc(name) {
	const q = String(name).toLowerCase()
	return PACKAGE_DOCS.find((d) => d.slug.toLowerCase() === q || d.aliases.includes(q))
}

function docSlugs() {
	const out = PACKAGE_DOCS.filter((d) => existsSync(join(PKG_ROOT, d.file))).map((d) => ({ kind: "package", slug: d.slug, path: join(PKG_ROOT, d.file) }))
	if (!existsSync(LLMS_DIR)) return out
	for (const kind of readdirSync(LLMS_DIR)) {
		const dir = join(LLMS_DIR, kind)
		if (!statSync(dir).isDirectory()) continue
		for (const file of readdirSync(dir)) {
			if (file.endsWith(".md")) out.push({ kind, slug: file.replace(/\.md$/, ""), path: join(dir, file) })
		}
	}
	return out
}

function cmdDocs() {
	const all = docSlugs()
	const kind = flags.get("kind")
	const kinds = [...new Set(all.map((d) => d.kind))]
	if (kind !== undefined && !kinds.includes(kind))
		fail("ERR_BAD_FLAG", `No doc kind "${kind}".`, kinds.map((k) => `sable docs --list --kind ${k}`))
	if (flags.has("list") || !rest[0]) {
		const list = kind ? all.filter((d) => d.kind === kind) : all
		return ok("docs.list", { count: list.length, docs: list.map(({ kind, slug }) => ({ kind, slug })) }, () => {
			const byKind = new Map()
			for (const d of list) byKind.set(d.kind, [...(byKind.get(d.kind) ?? []), d.slug])
			return [...byKind]
				.map(([k, slugs]) => `${k}:\n${slugs.map((s) => `  ${s}`).join("\n")}`)
				.join("\n\n")
		})
	}

	const want = docSlugFor(rest[0])
	const pkg = packageDoc(rest[0])
	const hit =
		(pkg && all.find((d) => d.kind === "package" && d.slug === pkg.slug)) ??
		all.find((d) => d.slug === rest[0]) ??
		all.find((d) => d.slug === want) ??
		all.find((d) => d.slug === slugify(rest[0]))
	if (!hit)
		fail("ERR_UNKNOWN_DOC", `No package guide or doc mirror for "${rest[0]}".`, [
			...nearest(want, all.map((d) => d.slug), 5).map((s) => `Did you mean sable docs ${s}?`),
			`Package guides: ${all.filter((d) => d.kind === "package").map((d) => d.slug).join(", ")}`,
			`Task guides: ${all.filter((d) => d.kind === "tasks").map((d) => d.slug).join(", ")}`,
			"sable docs --list — every slug, by kind",
		])
	const content = readFileSync(hit.path, "utf8")
	ok("docs.detail", { kind: hit.kind, slug: hit.slug, content }, content)
}

/* ── doctor ─────────────────────────────────────────────────────────────────── */

/**
 * Every check below corresponds to a documented way Sable fails *silently* in a
 * consuming app — no error, just wrong output: a second React resolving to an
 * invalid-hook blank page, `@source` missing so Tailwind emits none of the
 * package's classes, or `data-sable-theme` set with no theme CSS imported, which
 * renders the default theme and looks like the switcher is broken.
 */
function doctorReport() {
	const checks = []
	const add = (status, name, detail, fix) => checks.push({ status, name, detail, ...(fix ? { fix } : {}) })

	const node = process.versions.node.split(".").map(Number)
	if (node[0] >= 20) add("pass", "node", `v${process.versions.node}`)
	else add("warn", "node", `v${process.versions.node}`, "Sable's tooling is developed on Node 22.")

	let pkg = null
	try {
		pkg = JSON.parse(readFileSync(join(CWD, "package.json"), "utf8"))
	} catch {
		add("warn", "package.json", `Not found in ${CWD}.`, "Run doctor from your project root.")
	}

	if (pkg) {
		const deps = { ...pkg.dependencies, ...pkg.devDependencies, ...pkg.peerDependencies }
		const declared = deps["@sableui/react"]
		if (!declared) add("fail", "install", "@sableui/react is not a dependency of this project.", "pnpm add @sableui/react")
		else add("pass", "install", `@sableui/react ${declared} (this CLI serves the ${R.version} contract)`)

		for (const [name, want] of [["react", "19"], ["react-dom", "19"], ["tailwindcss", "4"]]) {
			const got = deps[name]
			if (!got) add("fail", name, `Missing. Sable needs ${name} ^${want}.`, `pnpm add ${name}`)
			else if (!String(got).includes(want)) add("warn", name, `${got} — Sable targets ^${want}.`)
			else add("pass", name, got)
		}
	}


	/* CSS wiring — read every stylesheet in the project, not just a guessed path. */
	const css = collectSources(/\.(css|scss)$/)
	const withoutComments = text => text.replace(/\/\*[\s\S]*?\*\//g, "")
	const cssByPath = new Map(css.map(file => [file.path, file]))
	const expandCss = (file, seen = new Set()) => {
		if (seen.has(file.path)) return ""
		const next = new Set(seen).add(file.path)
		return withoutComments(file.text).replace(/@import\s+["'](\.[^"']+)["']\s*;/g, (original, specifier) => {
			const imported = cssByPath.get(resolve(dirname(file.path), specifier))
			return imported ? expandCss(imported, next) : original
		})
	}
	const expandedCss = css.map(file => ({ ...file, text: expandCss(file) }))
	const cssText = expandedCss.map(file => file.text).join("\n")
	const tailwindImport = /@import\s+["']tailwindcss["']/
	const sableImport = /@import\s+["'](?:@sableui\/react\/|[^"']*packages\/sable\/(?:src|dist)\/)styles\.css["']/
	if (!css.length) add("warn", "css", "No stylesheet found to inspect.")
	else {
		const hasSable = sableImport.test(cssText)
		const hasTw = tailwindImport.test(cssText)
		// Either form counts: the published `@sableui/react/dist/**` specifier, or a
		// relative path into `packages/sable/src` the way a workspace consumer writes it.
		const hasSource = /@source[^;]*(@sableui\/react|packages\/sable)/.test(cssText)
		if (!hasSable)
			add("fail", "css:styles", "No @import of @sableui/react/styles.css.", '@import "@sableui/react/styles.css";')
		else if (hasTw) {
			const file = expandedCss.find(f => sableImport.test(f.text) && tailwindImport.test(f.text)) || expandedCss.find(f => sableImport.test(f.text))
			const text = withoutComments(file.text)
			const twFirst = text.search(tailwindImport)
			const sableAt = text.search(sableImport)
			if (twFirst === -1 || twFirst > sableAt)
				add("fail", "css:order", "Sable's styles.css is imported before tailwindcss.", 'tailwindcss first, then styles.css.')
			else add("pass", "css:styles", relative(CWD, file.path))
		} else add("fail", "css:tailwind", 'No @import "tailwindcss" — the consumer owns Tailwind.', '@import "tailwindcss";')

		if (hasSable && !hasSource)
			add(
				"fail",
				"css:source",
				"No @source pointing at the package — Tailwind will emit none of Sable's classes and every component renders unstyled.",
				'@source "<path-to>/@sableui/react/dist/**/*.{js,mjs}";',
			)
		else if (hasSable) add("pass", "css:source", "@source covers the package.")
		// A generated per-module list (sable sources) must cover every module the
		// app imports, or those components render unstyled.
		if (hasSable) checks.push(...sourcesCheck(PKG_ROOT, CWD, expandedCss.map(({ path }) => cssByPath.get(path))))
	}

	/* The theme trap: opting into theme switching without importing theme CSS. */
	const src = collectSources(/\.(tsx?|jsx?)$/)
	const srcText = src.map((f) => f.text).join("\n")
	// A provider used only for light/dark mode needs only the Sable theme, not alternate themes.
	const usesThemes = /ThemeSelector|data-sable-theme|applySableTheme|setThemeId|defaultThemeId/.test(srcText)
	if (usesThemes) {
		const themeCss = /@import\s+["'](?:@sableui\/react\/|[^"']*packages\/sable\/(?:src|dist)\/)(themes\.css|theme\/[a-z-]+\.css|themes\/[a-z-]+\/[a-z-]+\.css)["']/.test(cssText)
		const customCss = /\[data-sable-theme\s*=\s*["']?[a-z][a-z0-9-]*["']?\s*\][^{]*\{[^}]*--(?:background|primary|font-sans)\s*:/.test(cssText)
		if (themeCss || customCss) add("pass", "themes", themeCss ? "Theme CSS is imported." : "App-owned scoped theme CSS is present; verify its ID and loading in the rendered app.")
		else
			add(
				"fail",
				"themes",
				"This app selects a design theme but has no alternate or app-owned scoped theme CSS — the selected theme may silently render as the Sable theme.",
				'Import themes.css, one theme/<id>.css, or the scoped CSS generated by sable preset --css.',
			)
	}

	/* The icon trap: icons are opt-in, so an app that renders Sable components with
	 * no IconProvider gets every icon — its own and the ones inside Sable's
	 * components — as nothing, with no error. */
	const usesSable = /from\s+["']@sableui\/react(?:\/(?:patterns|blocks|layout))?["']/.test(srcText)
	if (usesSable) {
		if (/<IconProvider\b/.test(srcText)) add("pass", "icons", "<IconProvider> is mounted.")
		else
			add(
				"fail",
				"icons",
				"No <IconProvider> — every <Icon> renders nothing.",
				'Wrap your app in <IconProvider set={reiconIconSet}> from "@sableui/react/icons/reicon".',
			)
	}

	/* Tailwind in the build, and the theme's fonts: both fail as a page that
	 * renders, just not as Sable — unstyled, or in system fonts. */
	if (pkg) {
		const build = tailwindBuildCheck(CWD, detectFramework(CWD))
		if (build) checks.push(build)
	}
	if (usesSable || sableImport.test(cssText)) {
		const html = collectSources(/\.html$/).map((f) => f.text).join("\n")
		checks.push(fontsCheck({ css: cssText, source: srcText, html, deps: pkg ? { ...pkg.dependencies, ...pkg.devDependencies } : {} }))
	}

	/* Local patches (sable patch): each one is re-checked against the installed
	 * Sable, and fails when Sable changed a patched file, so an upgrade tells the
	 * agent to re-run the repro instead of keeping or losing a fix silently. */
	checks.push(...patchChecks(PKG_ROOT, CWD, R.version))

	if (pkg && !/resolve\s*:\s*\{[^}]*dedupe|dedupe/.test(readConfigs()))
		add("info", "dedupe", "Could not confirm React dedupe in a bundler config.", 'resolve.dedupe: ["react","react-dom"] — a second React is an invalid-hook blank page.')

	return { version: R.version, checks, failed: checks.filter((c) => c.status === "fail").length }
}

function cmdDoctor() {
	if (flags.has("fix") || flags.has("dry-run")) return cmdDoctorFix()
	const data = doctorReport()
	const { checks, failed } = data
	if (JSON_OUT) {
		process.stdout.write(`${JSON.stringify({ type: "doctor", data }, null, DENSE ? 0 : 1)}\n`)
	} else {
		process.stdout.write(doctorLines(checks))
		process.stdout.write(
			failed
				? `\n[sable doctor] ✗ ${failed} failure(s). Each one renders wrong without erroring.\n`
				: "\n[sable doctor] ✓ wiring holds.\n",
		)
	}
	logInvocation(failed ? 1 : 0)
	process.exit(failed ? 1 : 0)
}

/**
 * A fix counts as applied only once doctor, run again, stops flagging its
 * check. An edit that did not take is reported as unverified, with what doctor
 * still says, rather than as done.
 */
function verifyFixes(fixes, after) {
	for (const f of fixes) {
		if (f.status !== "applied") continue
		const c = after.checks.find((x) => x.name === f.check)
		if (c && (c.status === "fail" || c.status === "warn" || (f.check === "dedupe" && c.status === "info"))) {
			f.status = "unverified"
			f.detail = `${f.detail} Doctor still reports: ${c.detail}`
		}
	}
	return fixes
}

function fixLines(fixes, indent = "  ") {
	const mark = { applied: "+", "would-apply": "~", manual: "!", failed: "✗", unverified: "?" }
	const word = { applied: "", "would-apply": "", manual: "by hand: ", failed: "failed: ", unverified: "unverified: " }
	return fixes
		.map(
			(f) =>
				`${indent}${mark[f.status]} ${f.check.padEnd(14)}${word[f.status]}${f.file ? `${f.file} — ` : ""}${f.detail}\n` +
				(f.snippet ? `${f.snippet.split("\n").map((l) => `${indent}      ${l}`).join("\n")}\n` : ""),
		)
		.join("")
}

function cmdDoctorFix() {
	const dryRun = flags.has("dry-run")
	const before = doctorReport()
	const fixes = fixWiring({ root: CWD, pkgRoot: PKG_ROOT, report: before, framework: detectFramework(CWD), dryRun, install: !flags.has("no-install"), quiet: JSON_OUT })
	const after = dryRun ? before : doctorReport()
	verifyFixes(fixes, after)
	const { failed } = after
	if (JSON_OUT) process.stdout.write(`${JSON.stringify({ type: "doctor.fix", data: { ...after, dryRun, fixes } }, null, DENSE ? 0 : 1)}\n`)
	else
		process.stdout.write(
			[
				fixes.length ? `${dryRun ? "Would fix (dry run, nothing written):" : "Fixes:"}\n${fixLines(fixes)}` : "Nothing to fix.\n",
				`${dryRun ? "Now:" : "After:"}\n${doctorLines(after.checks)}`,
				failed ? `[sable doctor] ✗ ${failed} failure(s)${dryRun ? "" : " left; the steps marked ! need you"}.\n` : "[sable doctor] ✓ wiring holds.\n",
			].join("\n"),
		)
	logInvocation(failed ? 1 : 0)
	process.exit(failed ? 1 : 0)
}

/* ── init ───────────────────────────────────────────────────────────────────── */

/**
 * The install recipe, run: doctor --fix, the agent skill, and the provider the
 * app still has to mount. Each step is the code its own command runs, so init
 * can never wire an app differently from what doctor checks.
 */
function cmdInit() {
	if (!existsSync(join(CWD, "package.json")))
		fail("ERR_INIT", `No package.json in ${CWD}.`, ["Run sable init from your app's root.", "Starting fresh: pnpm create vite@latest my-app --template react-ts, then pnpm add @sableui/react && pnpm exec sable init"])
	const dryRun = flags.has("dry-run")
	const framework = detectFramework(CWD)
	const packageManager = detectPackageManager(CWD)
	const before = doctorReport()
	const fixes = fixWiring({ root: CWD, pkgRoot: PKG_ROOT, report: before, framework, dryRun, install: !flags.has("no-install"), quiet: JSON_OUT })

	let agent
	if (flags.has("no-agent")) agent = { status: "skipped" }
	else
		try {
			// update: an unchanged managed entry from an older Sable is refreshed;
			// one with local edits still refuses, and is reported for the user.
			const setup = installAgentSkill({ root: CWD, project: CWD, packageRoot: PKG_ROOT, target: "all", update: true, dryRun })
			agent = { status: dryRun ? "would-apply" : "applied", destinations: setup.destinations, next: setup.next }
		} catch (error) {
			agent = { status: "manual", detail: error.message, fix: "sable setup --agent --dry-run" }
		}

	const after = dryRun ? before : doctorReport()
	verifyFixes(fixes, after)
	const mounted = after.checks.find((c) => c.name === "icons")?.status === "pass"
	const providers = { ...providerSnippet(framework), mounted }
	const data = { framework: { id: framework.id, label: framework.label }, packageManager, dryRun, fixes, agent, providers, doctor: after }

	if (JSON_OUT) process.stdout.write(`${JSON.stringify({ type: "init", data }, null, DENSE ? 0 : 1)}\n`)
	else {
		const agentText = {
			applied: () => `Agent skill: installed at ${agent.destinations.join(", ")}.`,
			"would-apply": () => `Agent skill: would install at ${agent.destinations.join(", ")}.`,
			skipped: () => "Agent skill: skipped (--no-agent).",
			manual: () => `Agent skill: not installed — ${agent.detail}\n  → ${agent.fix}`,
		}[agent.status]()
		const iconsFix = fixes.find((f) => f.check === "icons")
		const providerText = mounted
			? "Providers: <IconProvider> is mounted. MotionProvider and SableThemeProvider are optional: sable provider --list."
			: iconsFix?.status === "would-apply"
				? `Providers: <IconProvider> would be mounted in ${iconsFix.file}.`
				: iconsFix?.status === "manual"
					? "Providers: mount IconProvider as shown under icons above."
					: [`Providers — mount IconProvider once, in ${providers.file}${providers.then ? `, then ${providers.then}` : ""}:`, ...providers.code.split("\n").map((l) => `    ${l}`)].join("\n")
		process.stdout.write(
			[
				`sable init — ${framework.label}, ${packageManager}${dryRun ? " (dry run: nothing written or installed)" : ""}`,
				...(framework.id === "unknown" ? ["Not Vite or Next.js: init installs the packages and wires the stylesheet it finds; the bundler and provider steps are printed for you."] : []),
				"",
				fixes.length ? `${dryRun ? "Would fix:" : "Fixes:"}\n${fixLines(fixes)}` : "Nothing to fix.\n",
				agentText,
				"",
				providerText,
				"",
				`Doctor:\n${doctorLines(after.checks)}`,
				after.failed
					? `[sable init] ✗ ${after.failed} failure(s) ${dryRun ? "now" : "left; the steps marked ! need you"}. Re-check with sable doctor.`
					: `[sable init] ✓ wiring holds. Next: ${agent.next ?? "sable docs building-with-sable"}`,
				"",
			].join("\n"),
		)
	}
	logInvocation(after.failed ? 1 : 0)
	process.exit(after.failed ? 1 : 0)
}

function doctorLines(checks, indent = "  ") {
	const mark = { pass: "✓", warn: "!", fail: "✗", info: "·" }
	return checks
		.map((c) => `${indent}${mark[c.status]} ${c.name.padEnd(14)}${c.detail}\n${c.fix ? `${indent}    → ${c.fix}\n` : ""}`)
		.join("")
}

const SKIP_DIRS = new Set(["node_modules", ".next", ".nuxt", "dist", "build", "out", "coverage", ".git", ".turbo"])
function collectSources(match, limit = 4000) {
	const out = []
	const walk = (dir) => {
		if (out.length >= limit) return
		let entries
		try {
			entries = readdirSync(dir)
		} catch {
			return
		}
		for (const name of entries) {
			if (SKIP_DIRS.has(name)) continue
			const full = join(dir, name)
			let st
			try {
				st = statSync(full)
			} catch {
				continue
			}
			if (st.isDirectory()) walk(full)
			else if (match.test(name)) out.push({ path: full, text: readFileSync(full, "utf8") })
		}
	}
	walk(CWD)
	return out
}


function readConfigs() {
	return ["vite.config.ts", "vite.config.mts", "vite.config.js", "vite.config.mjs", "next.config.ts", "next.config.js", "next.config.mjs", "webpack.config.js"]
		.map((f) => (existsSync(join(CWD, f)) ? readFileSync(join(CWD, f), "utf8") : ""))
		.join("\n")
}

/* ── lint (passthrough) ─────────────────────────────────────────────────────── */

/**
 * Run one of the package's scripts with the argv a delegating command was given,
 * minus the flags only `sable` understands. With `--json --dense`, a JSON
 * document on stdout is re-emitted on one line, so `--dense` means the same
 * thing here as on the commands `sable` answers itself.
 */
function runScript(file, args = forwarded) {
	const r = spawnSync(process.execPath, [file, ...args], { encoding: "utf8", cwd: CWD, maxBuffer: 256 * 1024 * 1024 })
	return { code: r.status ?? 1, stdout: r.stdout ?? "", stderr: r.stderr ?? "" }
}

function passThrough({ code, stdout, stderr }) {
	let out = stdout
	if (JSON_OUT && DENSE && out.trim()) {
		try {
			out = `${JSON.stringify(JSON.parse(out))}\n`
		} catch {
			/* Not one JSON document; print it as it came. */
		}
	}
	process.stdout.write(out)
	process.stderr.write(stderr)
	logInvocation(code)
	process.exit(code)
}

function cmdLint() {
	passThrough(runScript(join(HERE, "sable-lint.mjs")))
}

/* ── check ──────────────────────────────────────────────────────────────────── */

/**
 * The review steps from the skill's finish checklist that no tool can verify.
 * They are printed, numbered, after the automated checks pass or fail, because a
 * green `sable check` is a contract result, not a design approval — and an agent
 * that reads "✓" as "done" skips exactly these.
 */
const MANUAL_REVIEW = [
	{ step: "Review the rendered design", how: "sable docs reviewing-a-design — capture desktop (≥1024px) and mobile (≤480px), every promised colour mode; judge brief fit, hierarchy, rhythm, imagery." },
	{ step: "Walk the journey", how: "sable docs reviewing-a-journey — operate the primary task and its recovery path end to end; loading, empty, error and success states; keyboard and touch." },
	{ step: "Review the motion", how: "sable docs reviewing-motion — observe playback and interruption for anything that moves." },
	{ step: "Check reduced motion", how: "Turn on prefers-reduced-motion (or MotionProvider \"reduced\"): state still changes, nothing essential depends on animation, nothing keeps moving." },
	{ step: "Write the reuse inventory", how: "List the Sable components, parts, utilities and token groups used, and every app-owned UI or CSS addition with the catalog search that justified it. Start from the app-owned surfaces sable check lists (sable grade --json → inventory) and note, for each, whether you used the Sable part named beside it or kept your own. Either is fine for layout and look. Behaviour (controls, overlays, keyboard handling) comes from Sable." },
	{ step: "Record what you learned", how: "sable docs learning-from-builds — keep conditional lessons with evidence (sable learn --record); never record human approval you did not get." },
]

function cmdCheck() {
	/* Where to check. A Stop hook's command must carry no shell syntax — Claude
	 * Code runs it under Git Bash, or PowerShell 5.1 where neither `&&` nor
	 * "${VAR}" works — so it cannot `cd` first. Instead the hook runs from
	 * anywhere and `check` finds the project itself: Claude Code's
	 * CLAUDE_PROJECT_DIR, plus `--root` for a workspace package inside it. */
	const rootFlag = flags.get("root")
	if (rootFlag === true) fail("ERR_BAD_ARGUMENT", "--root needs a directory.", ["sable check --root apps/web"])
	const base = flags.has("stop-hook") && process.env.CLAUDE_PROJECT_DIR ? process.env.CLAUDE_PROJECT_DIR : CWD
	const target = rootFlag ? resolve(base, rootFlag) : base
	if (!existsSync(target) || !statSync(target).isDirectory()) fail("ERR_BAD_ARGUMENT", `Not a directory: ${target}`, ["sable check --root <project dir>"])
	if (target !== CWD) {
		process.chdir(target)
		CWD = target
	}
	const paths = rest.length ? rest : ["src"]
	const ignore = [flags.get("ignore") ?? []].flat().filter((g) => typeof g === "string").flatMap((g) => ["--ignore", g])
	const checks = []

	const doctor = doctorReport()
	const doctorFailures = doctor.checks.filter((c) => c.status === "fail")
	checks.push({
		name: "doctor",
		status: doctorFailures.length ? "fail" : "pass",
		summary: doctorFailures.length ? `${doctorFailures.length} wiring failure(s): ${doctorFailures.map((c) => c.name).join(", ")}` : "wiring holds",
		details: doctorFailures.map((c) => `${c.name}: ${c.detail}${c.fix ? ` → ${c.fix}` : ""}`),
		// Warnings and notes don't fail the check, but they are things to act on,
		// and a passing check that printed nothing else hid them from the agent.
		notes: doctor.checks.filter((c) => c.status === "warn" || c.status === "info").map((c) => `${c.name}: ${c.detail}${c.fix ? ` → ${c.fix}` : ""}`),
		data: doctor,
	})

	const parse = (r) => {
		try {
			return JSON.parse(r.stdout)
		} catch {
			return null
		}
	}
	const firstLine = (r) => (r.stderr || r.stdout).trim().split("\n")[0] ?? "no output"

	const lintRun = runScript(join(HERE, "sable-lint.mjs"), [...paths, ...ignore, "--json"])
	const lint = parse(lintRun)
	if (!lint || lint.type === "error") checks.push({ name: "lint", status: "error", summary: lint?.message ?? firstLine(lintRun), details: [] })
	else {
		const v = lint.data.violations
		checks.push({
			name: "lint",
			status: v.length ? "fail" : "pass",
			summary: v.length ? `${v.length} violation(s) in ${lint.data.filesScanned} files` : `${lint.data.filesScanned} files clean`,
			details: v.map((x) => `${x.ruleId} — ${x.file}:${x.line} → ${x.match}`),
			data: lint.data,
		})
	}

	const review = typeof flags.get("review") === "string" ? ["--review", flags.get("review")] : []
	const icons = typeof flags.get("icons") === "string" ? ["--icons", flags.get("icons")] : []
	const gradeRun = runScript(join(PKG_ROOT, "scripts", "grade.mjs"), [...paths, ...ignore, ...review, ...icons, "--json"])
	const grade = parse(gradeRun)
	if (!grade || grade.type === "error") checks.push({ name: "grade", status: "error", summary: grade?.message ?? firstLine(gradeRun), details: [] })
	else {
		// Contract violations are lint's to report; grade adds what lint cannot see.
		const LABELS = { hallucinatedComponent: "hallucinated components", hallucinatedProp: "hallucinated props", radixIdiom: "Radix idioms", hardcodedControl: "hardcoded control heights", offContractIcon: "off-contract icons" }
		const found = Object.entries(LABELS).filter(([k]) => grade.counts[k])
		const reviewMissing = review.length > 0 && grade.review?.status !== "review-recorded"
		const details = found.flatMap(([k]) => grade.findings[k].map((f) => `${LABELS[k]} — ${f.file}:${f.line} → ${f.name ?? f.prop ?? f.what ?? f.match}${f.component ? ` on ${f.component}` : ""}${f.from ? ` from ${f.from}${f.reason ? ` (${f.reason})` : ""}` : ""}`))
		if (reviewMissing) details.push(`review: ${grade.review?.status ?? "missing"}${grade.review?.problems?.length ? ` — ${grade.review.problems.join("; ")}` : ""}`)
		checks.push({
			name: "grade",
			status: found.length || reviewMissing ? "fail" : "pass",
			summary: [
				`score ${grade.score}`,
				found.length ? found.map(([k]) => `${grade.counts[k]} ${LABELS[k]}`).join(", ") : "no hallucinated components or props, Radix idioms, hardcoded heights or off-contract icons",
				reviewMissing ? `review ${grade.review?.status ?? "missing"}` : "",
			]
				.filter(Boolean)
				.join("; "),
			details,
			data: { score: grade.score, contract: grade.contract, counts: grade.counts, review: grade.review, findings: grade.findings },
		})
	}
	/* App-owned surfaces, from grade. Never a failure: the input to the reuse
	 * inventory (finish step 6), which otherwise gets written from memory. */
	const inventory = grade && grade.type !== "error" ? (grade.inventory ?? null) : null

	const failed = checks.filter((c) => c.status !== "pass").map((c) => c.name)
	// A build that still scans all of Sable ships every component's classes;
	// trimming it is a finish step, because sources are only final once the app is.
	const manual = doctor.checks.some((c) => c.name === "css:size")
		? [...MANUAL_REVIEW, { step: "Ship only the CSS you use", how: "sable sources --write src/sable-sources.css, then @import it in place of the whole-package @source (about 32 KB of CSS gzipped down to what the app imports). Re-run it whenever you import something new from Sable; sable check fails while it is stale." }]
		: MANUAL_REVIEW
	const data = { paths, passed: !failed.length, failed, checks, inventory, manualReview: manual }
	const MARK = { pass: "✓", fail: "✗", error: "✗" }
	const MAX_DETAILS = 12
	const summaryText = () =>
		[
			`sable check — ${paths.join(" ")}`,
			...checks.flatMap((c) => [
				`  ${MARK[c.status]} ${c.name.padEnd(7)}${c.summary}`,
				...c.details.slice(0, MAX_DETAILS).map((d) => `      ${d}`),
				...(c.details.length > MAX_DETAILS ? [`      … ${c.details.length - MAX_DETAILS} more: sable ${c.name}${c.name === "doctor" ? "" : ` ${paths.join(" ")}`}`] : []),
				...(c.notes ?? []).map((n) => `      note — ${n}`),
			]),
			"",
			failed.length ? `[sable check] ✗ ${failed.join(", ")} failed. Fix these and run sable check again.` : "[sable check] ✓ doctor, lint and grade pass.",
		].join("\n")
	const inventoryText = () => {
		const list = inventory?.surfaces ?? []
		if (!list.length) return ""
		return [
			"",
			`App-owned surfaces, for the reuse inventory — ${list.length}. Notes, not failures: use the Sable part named if it fits your design, or keep yours.`,
			...list.slice(0, MAX_DETAILS).map((s) => `      ${s.file}:${s.line}  <${s.tag}> ${s.kind} (${s.classes}) → Sable has ${s.consider}`),
			...(list.length > MAX_DETAILS ? [`      … ${list.length - MAX_DETAILS} more: sable grade ${paths.join(" ")} --json → inventory.surfaces`] : []),
			"",
		].join("\n")
	}
	const manualText = () =>
		[
			"",
			"Automated checks cannot judge the design. Before calling it done:",
			...manual.map((m, i) => `  ${i + 1}. ${m.step}: ${m.how}`),
		].join("\n")

	/* Stop-hook mode (Claude Code): exit 2 blocks the agent from ending its turn
	 * and feeds stderr back to it. A Stop hook that always blocks can loop, so
	 * when the agent is already continuing because of a stop hook
	 * (`stop_hook_active`), report and let it stop rather than block again. */
	if (flags.has("stop-hook")) {
		let input = {}
		try {
			input = JSON.parse(readFileSync(0, "utf8") || "{}")
		} catch {
			/* No or malformed hook input: treat it as a first stop. */
		}
		logInvocation(failed.length ? 2 : 0)
		if (!failed.length) process.exit(0)
		if (input.stop_hook_active) {
			process.stdout.write(`${summaryText()}\n(sable check still fails; not blocking a second time.)\n`)
			process.exit(0)
		}
		process.stderr.write(`${summaryText()}\n${manualText()}\n`)
		process.exit(2)
	}

	if (JSON_OUT) process.stdout.write(`${JSON.stringify({ type: "check", data }, null, DENSE ? 0 : 1)}\n`)
	else process.stdout.write(`${summaryText()}\n${inventoryText()}${manualText()}\n`)
	logInvocation(failed.length ? 1 : 0, failed.length ? "ERR_CHECK_FAILED" : undefined)
	process.exit(failed.length ? 1 : 0)
}

/* ── Dispatch. ──────────────────────────────────────────────────────────────── */

function cmdGrade() {
	const run = runScript(join(PKG_ROOT, "scripts/grade.mjs"))
	let output = run.code === 0 ? run.stdout : `${run.stdout}${run.stderr}`
	const code = run.code
	if (JSON_OUT) {
		try {
			const data = JSON.parse(output)
			output = `${JSON.stringify(data.type === "error" ? data : { type: flags.has("template") ? "grade.template" : "grade.score", data }, null, DENSE ? 0 : 1)}\n`
		} catch { fail("ERR_GRADE_INPUT", output || "Grade failed to return a report.") }
	}
	process.stdout.write(output)
	logInvocation(code)
	process.exit(code)
}

function cmdLearn() {
	cmdDesignTool("design-memory.mjs")
}

function cmdDesignTool(script) {
	passThrough(runScript(join(PKG_ROOT, "scripts", script)))
}

function cmdSetup() {
	if (!flags.has("agent") || rest.length) fail("ERR_BAD_ARGUMENT", "Use sable setup --agent from your project root.", ["sable setup --agent --dry-run"])
	const root = flags.get("root")
	if (root === true) fail("ERR_BAD_ARGUMENT", "--root needs a directory.", ["pnpm --filter <package> exec sable setup --agent --root ../.."])
	const target = flags.get("target") ?? "all"
	const forClaude = target === "all" || target === "claude"
	if (flags.has("hook") && !forClaude)
		fail("ERR_BAD_ARGUMENT", "--hook installs a Claude Code Stop hook; use it with --target claude or all.", ["sable setup --agent --target claude --hook"])
	try {
		const options = { root: root ? resolve(CWD, root) : CWD, project: CWD, packageRoot: PKG_ROOT, target, update: flags.has("update"), dryRun: flags.has("dry-run") }
		// Preflight the settings file too, so a refusal there writes nothing anywhere.
		if (flags.has("hook")) installClaudeStopHook({ ...options, dryRun: true })
		const data = installAgentSkill(options)
		/* The Stop hook changes how the user's agent behaves, so setup never adds it
		 * on its own: it prints the exact entry, and writes it only behind --hook —
		 * the same rule setup keeps for local edits. */
		if (forClaude) data.stopHook = flags.has("hook") ? installClaudeStopHook(options) : claudeStopHook(options)
		const hook = data.stopHook
		const hookText = !hook
			? ""
			: hook.installed
				? `\n${data.dryRun ? "Would add" : hook.alreadyPresent ? "Already present:" : "Added"} a Claude Code Stop hook to ${hook.settingsFile}: Claude cannot end a task while \`sable check\` fails.`
				: `\nOptional: block Claude Code from ending a task while \`sable check\` fails. Add this to ${hook.settingsFile} (merge into an existing "hooks" key), or rerun with --hook to add it:\n\n${JSON.stringify(hook.settings, null, 2)}\n\nThe hook runs: ${hook.command}`
		ok("setup.agent", data, `${data.dryRun ? "Would install" : "Installed"} Sable skill entries at ${data.destinations.map((d) => relative(CWD, join(data.root, d)).replaceAll("\\", "/")).join(", ")}.\nNext: ${data.next}${hookText}`)
	} catch (error) {
		fail("ERR_AGENT_SETUP", error.message, ["sable setup --agent --dry-run"])
	}
}

const HANDLERS = {
	target: () => {
		if (rest[0] !== "ios" || rest.length !== 1) fail("ERR_BAD_ARGUMENT", "Use sable target ios [--component Name].")
		const targetPath = join(PKG_ROOT, "targets", "ios.json")
		if (!existsSync(targetPath)) fail("ERR_TARGET_MISSING", "The installed Sable package is missing its iOS target mapping.", ["Reinstall @sableui/react"])
		const target = JSON.parse(readFileSync(targetPath, "utf8"))
		const name = flags.get("component")
		if (name === true) fail("ERR_BAD_ARGUMENT", "--component needs a Sable component name.", ["sable target ios --component Switch"])
		if (name) {
			const match = target.components[name]
			if (!match) fail("ERR_UNKNOWN_COMPONENT", `No iOS mapping for ${name}.`, nearest(String(name), Object.keys(target.components)))
			const contexts = (match.contexts ?? []).map(c => `${c.role}: ${c.strategy} → ${c.importFrom} (${c.components.join(" + ")})`).join("\n")
			ok("target.component", match, `${match.source}: ${match.strategy}\n${contexts || `${match.importFrom ?? "app"} → ${match.components.join(" + ") || match.strategy}`}\n${match.guidance}`)
		}
		ok("target", target, `iOS ${target.platformVersion}${target.status ? ` (${target.status})` : ""}: ${target.designPolicy.principle}\n${target.statusNote ? `${target.statusNote}\n` : ""}${target.designPolicy.rule}\n${(target.designPolicy.layout ?? []).map((l) => `Layout: ${l}\n`).join("")}` + Object.values(target.components).map(c => `${c.source}: ${c.strategy} → ${c.strategy === "contextual" ? "choose by role" : c.components.join(" + ") || "redesign for phone"}`).join("\n"))
	},
	preset: () => cmdDesignTool("design-presets.mjs"),
	patch: () => cmdDesignTool("patches.mjs"),
	sources: () => cmdDesignTool("sources.mjs"),
	setup: cmdSetup,
	check: cmdCheck,
	provider: cmdProvider,
	manifest: cmdManifest,
	search: cmdSearch,
	component: cmdComponent,
	pattern: cmdPattern,
	block: cmdBlock,
	layout: cmdLayout,
	token: cmdToken,
	utility: cmdUtility,
	docs: cmdDocs,
	doctor: cmdDoctor,
	init: cmdInit,
	grade: cmdGrade,
	learn: cmdLearn,
	atlas: () => cmdDesignTool("design-atlas.mjs"),
	prefer: () => cmdDesignTool("design-preferences.mjs"),
	explore: () => cmdDesignTool("design-directions.mjs"),
	lint: cmdLint,
}

if (!command || flags.has("help") || command === "help") {
	if (command && command !== "help" && HANDLERS[command]) {
		const c = COMMANDS.find((x) => x.name === command)
		process.stdout.write(
			[
				`sable ${c.name}${c.arg ? ` <${c.arg.name}>` : ""} — ${c.summary}`,
				...(c.flags.length ? ["", "Flags:", ...c.flags.map((f) => `  ${(f.name + (f.value ? ` <${f.value}>` : "")).padEnd(24)}${f.describe}`)] : []),
				"",
				`Returns: ${c.returns.join(", ")}`,
				"",
			].join("\n"),
		)
		process.exit(0)
	}
	cmdManifest()
}

// Global flags are validated once, here, so a bad value is an error on every
// command — not only on the ones that happen to read it.
if (flags.has("detail")) detailLevel()

const handler = HANDLERS[command]
if (!handler)
	fail("ERR_UNKNOWN_COMMAND", `No command "${command}".`, [
		...nearest(command, Object.keys(HANDLERS)).map((n) => `Did you mean \`sable ${n}\`?`),
		"sable manifest — the full command list",
	])

handler()

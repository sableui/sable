/**
 * The Build with Sable page's sections, modes and commands, as data.
 *
 * Two readers: the page renders them, and the nav turns each into a search
 * anchor, so "doctor" or "audit" in the palette lands on its section instead of
 * on a page that only mentions it. One list keeps the anchor ids and the
 * rendered ids from drifting apart.
 */

export interface WorkflowAnchor {
	/** The element id on the page; the palette links to `/build-with-sable#id`. */
	id: string
	label: string
	detail: string
	keywords: string[]
}

export const SECTIONS = {
	start: { id: "start", title: "Start with your idea" },
	modes: { id: "modes", title: "Pick a mode" },
	unprompted: { id: "without-sable", title: "When nobody types /sable" },
	adoption: { id: "adoption", title: "Move an existing app onto Sable" },
	design: { id: "own-design", title: "Your product keeps its own design" },
	inspire: { id: "presets", title: "Develop a preset from inspiration" },
	canvas: { id: "canvas", title: "Customize, preview, and save" },
	cli: { id: "cli", title: "The commands behind it" },
	hook: { id: "stop-hook", title: "Check before the agent stops" },
	upgrade: { id: "upgrade", title: "Keep the skill and library together" },
	mcp: { id: "mcp", title: "Look Sable up from any agent" },
} as const

export interface Mode {
	name: string
	when: string
	prompt: string
	returns: string
}

export const MODES: Mode[] = [
	{
		name: "build",
		when: "A new product, page or flow, from a brief. `create` is the same mode.",
		prompt: "/sable build a booking site for a dog groomer, with services, a calendar and a confirmation step",
		returns: "A working build from Sable's components, checked with sable check and reviewed rendered on desktop and mobile.",
	},
	{
		name: "inspire",
		when: "You have references (screenshots, sites, a description) and want a look you can reuse.",
		prompt: "/sable inspire these three screenshots into a warm, compact preset",
		returns: "A preset in .sable/presets with a component preview. It stops there; no product is built.",
	},
	{
		name: "audit",
		when: "An existing interface needs a review, including how much of it is really Sable.",
		prompt: "/sable audit our checkout for design, usability and accessibility",
		returns: "Prioritized findings: contract violations, design judgments, intentional choices, library gaps. Nothing changes unless you ask.",
	},
	{
		name: "polish",
		when: "The direction is right and the details aren't: hierarchy, spacing, states, a new preset applied.",
		prompt: "/sable polish the settings screens and fix what the audit found",
		returns: "Improvements inside the existing direction, with every affected state checked again.",
	},
	{
		name: "fix",
		when: "One scoped defect: a wrong variant, a lint finding, a broken state.",
		prompt: "/sable fix the date picker that closes when you tab out",
		returns: "The smallest change that fixes it, checked. It escalates to polish when it turns out bigger.",
	},
]

export interface Command {
	name: string
	run: string
	does: string
	when: string
	keywords: string[]
}

/** The commands a person (or the agent) reaches for, in the order a project meets them. */
export const COMMANDS: Command[] = [
	{
		name: "init",
		run: "pnpm exec sable init",
		does: "Wires Sable into the app: packages, CSS order, fonts, IconProvider, the agent skill and its AGENTS.md / CLAUDE.md block. Then runs doctor.",
		when: "Once, right after installing. --dry-run shows every change first.",
		keywords: ["install", "setup", "wire", "start"],
	},
	{
		name: "upgrade",
		run: "pnpm exec sable upgrade",
		does: "Updates @sableui/react to the latest release, then runs the new version's init: skill entries and the AGENTS.md / CLAUDE.md block refreshed, wiring checked, adoption reported.",
		when: "Whenever you update Sable. Safe on an app that is already set up. Coming from 0.17 or earlier, update the package once by hand and run init instead.",
		keywords: ["update", "upgrade", "version", "latest", "refresh"],
	},
	{
		name: "doctor",
		run: "pnpm exec sable doctor",
		does: "Checks the wiring: imports, @source, fonts, providers, dedupe. Warns when the UI barely uses Sable.",
		when: "When something renders unstyled, iconless or in system fonts. --fix repairs what needs no judgment.",
		keywords: ["wiring", "broken", "unstyled", "fix", "adoption"],
	},
	{
		name: "check",
		run: "pnpm exec sable check src",
		does: "Runs doctor, lint and grade in one pass, lists adoption and app-owned surfaces, then the review steps no tool can verify.",
		when: "Before calling any UI work done. Exits 1 on a failure.",
		keywords: ["verify", "done", "finish", "ci", "adoption"],
	},
	{
		name: "lint",
		run: "pnpm exec sable lint src",
		does: "The design contract: tokens, raw controls, look-alike components, motion, contrast.",
		when: "While iterating, or in CI on its own.",
		keywords: ["rules", "violations", "contract", "sable-lint"],
	},
	{
		name: "grade",
		run: "pnpm exec sable grade src --json",
		does: "What lint can't see: invented components and props, Radix idioms, off-contract icons, adoption.",
		when: "To measure a build, or to compare two.",
		keywords: ["score", "hallucinated", "adoption", "inventory"],
	},
	{
		name: "search",
		run: 'pnpm exec sable search "date range"',
		does: "One ranked list across components, patterns, blocks, utilities, tokens and guides.",
		when: "Before writing any component. \"dropdown\" finds Select and Menu.",
		keywords: ["find", "lookup", "catalog"],
	},
	{
		name: "component",
		run: "pnpm exec sable component Dialog --props",
		does: "One component's contract: props, parts, accessibility, tokens. --examples has working code.",
		when: "Before using a component, so the props are real.",
		keywords: ["props", "api", "examples", "contract"],
	},
	{
		name: "docs",
		run: "pnpm exec sable docs auditing-an-app",
		does: "The package's guides, offline and matched to your installed version.",
		when: "When the skill points at one, or you want the reasoning.",
		keywords: ["guides", "foundations", "read"],
	},
	{
		name: "sources",
		run: "pnpm exec sable sources --write src/sable-sources.css",
		does: "Narrows Tailwind's scan to the Sable modules the app imports.",
		when: "Before shipping: all of Sable is about 32 KB of CSS gzipped; a typical app needs a fraction.",
		keywords: ["css", "size", "bundle", "tailwind"],
	},
	{
		name: "patch",
		run: 'pnpm exec sable patch Select --reason "…" --repro "…"',
		does: "Records a local fix to a Sable component, which doctor re-checks on every upgrade.",
		when: "A bug inside Sable that can't wait for a release.",
		keywords: ["bug", "workaround", "upgrade"],
	},
	{
		name: "preset",
		run: "pnpm exec sable preset --check .sable/presets/clay.json",
		does: "Validates a preset, or compiles it to scoped CSS with --css.",
		when: "After inspire or a Canvas export, before applying it.",
		keywords: ["theme", "canvas", "tokens"],
	},
	{
		name: "setup",
		run: "pnpm exec sable setup --agent",
		does: "Installs the skill entries and the AGENTS.md / CLAUDE.md block. --update refreshes them after an upgrade; --hook adds the Stop hook.",
		when: "In an app wired by hand, and after every upgrade.",
		keywords: ["agent", "skill", "claude", "codex", "cursor", "hook"],
	},
]

/** Search anchors for the nav: each section, plus each command's row. */
export const ANCHORS: WorkflowAnchor[] = [
	{ id: SECTIONS.modes.id, label: "Sable skill modes", detail: "build, inspire, audit, polish and fix: when to use each.", keywords: ["build", "create", "inspire", "audit", "polish", "fix", "skill", "/sable", "$sable", "modes"] },
	{ id: SECTIONS.unprompted.id, label: "When nobody types /sable", detail: "How the AGENTS.md / CLAUDE.md block sends every UI request through the skill.", keywords: ["agents.md", "claude.md", "instructions", "skill", "trigger", "hybrid"] },
	{ id: SECTIONS.adoption.id, label: "Move an existing app onto Sable", detail: "Built its own components? Upgrade, check, audit, then polish or fix, a screen at a time.", keywords: ["adoption", "migrate", "migration", "hybrid", "custom components", "swap", "existing app"] },
	{ id: SECTIONS.inspire.id, label: "Develop a preset", detail: "Turn references into a reusable preset with inspire.", keywords: ["inspire", "preset", "references", "theme"] },
	{ id: SECTIONS.cli.id, label: "Sable CLI commands", detail: "init, doctor, check, lint, grade, search and the rest.", keywords: ["cli", "commands", "terminal"] },
	{ id: SECTIONS.hook.id, label: "Stop hook", detail: "Make Claude Code run sable check before it can end a task.", keywords: ["hook", "claude code", "settings.json", "check"] },
	{ id: SECTIONS.upgrade.id, label: "Upgrade Sable and its skill", detail: "One command: sable upgrade updates the package and refreshes the skill.", keywords: ["upgrade", "update", "version", "latest"] },
	{ id: SECTIONS.mcp.id, label: "Sable MCP server", detail: "Look components up from any agent, before installing.", keywords: ["mcp", "server", "cursor", "vs code"] },
	...COMMANDS.map((c) => ({ id: `cli-${c.name}`, label: `sable ${c.name}`, detail: c.does, keywords: [c.name, ...c.keywords] })),
]

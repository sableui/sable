/**
 * Guidance for the LAYOUT PRIMITIVES only.
 *
 * This file used to hold guidance for 84 entries — 71 components plus the 13
 * layout primitives — while newer components declared theirs in their own meta.
 * Two homes for one kind of data, and the resolution is `meta.X ?? central.X`:
 * per-field fall-through, with the meta winning outright. That is a quiet
 * data-loss machine. `ThemeSelector` lived in both, so the day a `usage` block
 * was added to its meta, the central entry's "use ThemeSwitcher for colour mode"
 * caution stopped being emitted — no warning, no failing test, just gone.
 *
 * All 71 component entries were migrated into their own `*.meta.ts` (verified as
 * a byte-identical no-op against the previous `registry.json` output), and
 * `build-registry` now fails if a component declares guidance in both places.
 *
 * What remains is the 13 layout primitives, which have no per-component meta file
 * to move into — `src/layout/layout.meta.ts` builds them from one module, so this
 * IS their colocated home rather than a second one.
 *
 * A new COMPONENT's guidance goes in its meta. Nothing should be added here.
 */

import type {
	AnatomyMeta,
	BestPracticeMeta,
	ComponentMeta,
} from "./meta"

export type ComponentGuidance = Pick<
	ComponentMeta,
	"keywords" | "usage" | "related"
>

type AnatomyTuple = readonly [
	name: string,
	required: boolean,
	description: string,
]

type GuidanceConfig = {
	keywords: string[]
	description: string
	dos: string[]
	donts: string[]
	anatomy?: AnatomyTuple[]
	related?: ComponentGuidance["related"]
}

function bestPractices(
	dos: readonly string[],
	donts: readonly string[],
): BestPracticeMeta[] {
	return [
		...dos.map((description) => ({
			guidance: "do" as const,
			description,
		})),
		...donts.map((description) => ({
			guidance: "dont" as const,
			description,
		})),
	]
}

function anatomy(parts: readonly AnatomyTuple[]): AnatomyMeta[] {
	return parts.map(([name, required, description]) => ({
		name,
		required,
		description,
	}))
}

function guidance({
	keywords,
	description,
	dos,
	donts,
	anatomy: parts,
	related,
}: GuidanceConfig): ComponentGuidance {
	return {
		keywords,
		usage: {
			description,
			bestPractices: bestPractices(dos, donts),
			...(parts ? { anatomy: anatomy(parts) } : {}),
		},
		...(related ? { related } : {}),
	}
}

export const componentGuidance: Partial<Record<string, ComponentGuidance>> = {
	// ThemeSelector: guidance now lives in its own meta (usage.bestPractices).
	// The entry that was here was dead code — see the dual-home check in
	// build-registry.mjs — and its "use ThemeSwitcher for colour mode" dont was
	// lost for as long as both existed. Recovered into the meta.
	Region: guidance({
		keywords: ["region", "page width", "container", "layout"],
		description:
			"Use Region as the page-width primitive that applies fluid page inset and an optional purpose-named max width.",
		dos: [
			"Choose the max value by content role, such as prose, form, feed, content, wide, or full.",
			"Use Region near the route or section boundary so inner layout stays intentional.",
		],
		donts: [
			"Do not use Region as a global wrapper that forces every page into the same max width.",
		],
		related: { components: ["Page", "Grid", "Columns"] },
	}),
	Page: guidance({
		keywords: ["page", "route shell", "region", "stack"],
		description:
			"Use Page as a route content shell that combines Region sizing with vertical rhythm.",
		dos: [
			"Use it as the top-level wrapper for route content after application chrome.",
			"Set max by the page's content role rather than by the current viewport.",
		],
		donts: [
			"Do not confuse Page with AppShell; Page is content, AppShell is the frame around routes.",
		],
		related: { components: ["Region", "Stack", "PageHeader", "AppShell"] },
	}),
	Grid: guidance({
		keywords: ["grid", "card grid", "auto fit", "layout"],
		description:
			"Use Grid for uniform grid layouts inside a Region, especially card grids that can breathe responsively.",
		dos: [
			"Prefer minItemWidth for responsive card grids that do not need breakpoint-specific spans.",
			"Keep the default track=\"fill\" for collections whose count is data (search results, shelves, galleries): sparse rows keep their empty columns, so one result stays one cell wide.",
			"Use track=\"fit\" only for a fixed set designed to span the row, such as three KPI cards.",
			"Use explicit columns only when the design truly needs a fixed track count.",
		],
		donts: [
			"Do not use Grid to set a page's reading width; use Region or Center.",
			"Do not use track=\"fit\" for results or other data-driven collections: with one or two items the empty columns collapse and each item stretches across the row (a single result rendered as a full-width cover).",
		],
		related: { components: ["Region", "Columns", "Card"] },
	}),
	Columns: guidance({
		keywords: ["columns", "12 column", "span", "layout"],
		description:
			"Use Columns and Col for proportioned layouts that need explicit spans, such as list-detail or asymmetric panes.",
		dos: [
			"Use breakpoint span maps when the same layout needs to collapse cleanly on smaller screens.",
			"Use Columns for proportional composition, not for uniform card wrapping.",
		],
		donts: [
			"Do not use column spans as a replacement for Region width or text measure.",
		],
		anatomy: [
			["Columns", true, "The explicit column track container."],
			["Col", true, "A child cell with span and optional start placement."],
		],
		related: { components: ["Grid", "SplitPane", "Region"] },
	}),
	Stack: guidance({
		keywords: ["stack", "vertical rhythm", "layout", "spacing"],
		description:
			"Use Stack for vertical flow where child spacing should follow the Sable rhythm scale.",
		dos: [
			"Use smaller gaps within a group and larger gaps between sections.",
			"Use Stack instead of ad hoc margins when siblings form a vertical composition.",
		],
		donts: [
			"Do not use Stack to create page width or grid structure; pair it with Region, Grid, or Columns.",
		],
		related: { components: ["Row", "Page", "Fieldset"] },
	}),
	Row: guidance({
		keywords: ["row", "toolbar", "horizontal", "layout"],
		description:
			"Use Row for horizontal clusters such as action groups, toolbars, metadata, and inline controls.",
		dos: [
			"Use wrap when controls may not fit on smaller screens.",
			"Use justify and align intentionally so clusters scan as one unit.",
		],
		donts: [
			"Do not use Row for navigation menus or dense tabular structure.",
		],
		related: { components: ["Stack", "Button", "Spacer"] },
	}),
	Spacer: guidance({
		keywords: ["spacer", "spacing", "grow", "layout"],
		description:
			"Use Spacer for explicit rhythm space or a flex grow pusher between siblings.",
		dos: [
			"Use grow inside Row when one side of a cluster should push to the far edge.",
			"Use fixed size only when the space has semantic rhythm value.",
		],
		donts: [
			"Do not use Spacer to patch broad layout problems that should be solved by Stack, Row, Grid, or Region.",
		],
		related: { components: ["Row", "Stack"] },
	}),
	Center: guidance({
		keywords: ["center", "measure", "reading width", "layout"],
		description:
			"Use Center to center a block and optionally cap its width inside a wider layout.",
		dos: [
			"Use it for reading columns, forms, or compact content inside a broad Region.",
			"Choose a named max when the content role matches Sable's measure tokens.",
		],
		donts: [
			"Do not use Center for full page inset or app chrome; use Region or AppShell.",
		],
		related: { components: ["Region", "Page", "Stack"] },
	}),
	AspectBox: guidance({
		keywords: ["aspect box", "aspect ratio", "media", "layout shift"],
		description:
			"Use AspectBox to reserve stable aspect-ratio space for async media, embeds, and responsive previews.",
		dos: [
			"Use it around images, video, and embeds that should not shift layout while loading.",
			"Match the ratio to the expected media or design slot.",
		],
		donts: [
			"Do not use AspectBox for content whose height should grow with text or controls.",
		],
		related: { components: ["Video", "Dialog", "Browser"] },
	}),
	Bleed: guidance({
		keywords: ["bleed", "full bleed", "media band", "layout"],
		description:
			"Use Bleed to let a band or media element escape an inset or width-capped ancestor while staying within the content area.",
		dos: [
			"Use it for hero bands, profile covers, or media that should align beyond a capped page column.",
			"Keep surrounding content inside Region or Page so the bleed remains intentional.",
		],
		donts: [
			"Do not use Bleed to place content under fixed app chrome or sidebars.",
		],
		related: { components: ["Page", "Region", "AspectBox"] },
	}),
	SplitPane: guidance({
		keywords: ["split pane", "two pane", "list detail", "responsive"],
		description:
			"Use SplitPane for responsive two-pane layouts where a primary pane and supporting pane stay conceptually linked.",
		dos: [
			"Use it for media-detail, list-detail, or editor-preview workflows.",
			"Pick a ratio that reflects the actual priority of the panes.",
		],
		donts: [
			"Do not use SplitPane for unrelated columns or uniform grids.",
		],
		related: { components: ["Columns", "Grid", "Sheet"] },
	}),
	SafeArea: guidance({
		keywords: ["safe area", "notch", "home indicator", "fixed chrome"],
		description:
			"Use SafeArea to pad fixed or native-shell surfaces away from device notches and home indicators.",
		dos: [
			"Use it around fixed headers, bottom bars, and native-shell surfaces.",
			"Target only the edges that need device inset padding when possible.",
		],
		donts: [
			"Do not wrap normal document-flow content in SafeArea unless it actually touches unsafe edges.",
		],
		related: { components: ["BottomNav", "AppHeader", "AppShell"] },
	}),
	GridOverlay: guidance({
		keywords: ["grid overlay", "debug", "layout visualizer", "docs"],
		description:
			"Use GridOverlay only as a development or documentation visualizer for the column structure.",
		dos: [
			"Use it inside a position-relative layout while debugging alignment.",
			"Keep it gated behind docs, debug, or development-only state.",
		],
		donts: [
			"Do not ship GridOverlay as visible product UI.",
		],
		related: { components: ["Grid", "Columns", "Region"] },
	}),
}

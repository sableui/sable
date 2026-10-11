/**
 * Utility intent — the `@utility` and `@custom-variant` layer in `styles.css`,
 * documented the way `themes/token-docs.ts` documents tokens.
 *
 * Sable ships a layer of CSS between the tokens and the components: relative
 * surfaces that DERIVE a hover or a well from whatever surface they sit in,
 * frames that compute their own inner radius, state variants that match Base
 * UI's data attributes and ARIA alike. None of it was in the registry, so an
 * agent searching for "well" found the `muted` token and hand-mixed
 * `color-mix(… var(--foreground) …)` — exactly what `sable-well` computes, in
 * every theme and mode. A utility nobody can find is a utility that does not
 * exist.
 *
 * `build-registry` emits this file into `registry.json → utilities` and
 * `llms/reference/utilities.md`, and fails the build if any `@utility` or
 * `@custom-variant` in `styles.css` is documented in none — or more than one —
 * of these places:
 *
 * - here (`UTILITY_DOCS`);
 * - `registry.json → tokens.typography` for the paired `text-*` tiers
 *   (`text-heading-1` is documented as `heading-1`);
 * - `registry.json → tokens.motion.recipes` for the `motion-*` / `animate-*`
 *   recipes (rationale: `sable docs motion`).
 *
 * ── Rules for writing an entry ───────────────────────────────────────────────
 *
 * - `name` is exactly as styles.css declares it; a functional utility keeps its
 *   `-*` (`rounded-concentric-*`), and the example shows the filled-in form.
 * - `insteadOf` is the field that does the work: name what an agent would
 *   hand-write without the utility, or the neighbour it gets confused with.
 * - `keywords` are the words someone SEARCHING would type, not the words in the
 *   name. `sable search` ranks a keyword hit above a prose hit.
 */

export type UtilityFamily =
	| "relative surface"
	| "frame"
	| "geometry"
	| "state variant"
	| "scroll"
	| "text"
	| "helper"

export interface UtilityDoc {
	/** As declared in styles.css. Functional utilities keep their `-*`. */
	name: string
	/** `@utility` (a class) or `@custom-variant` (a `name:` prefix). */
	kind: "utility" | "variant"
	family: UtilityFamily
	/** What it is, in one line. */
	intent: string
	/** Concretely when to reach for it. */
	whenToUse: string
	/** What you would hand-write without it, or what it gets confused with. */
	insteadOf: string
	/** A real, copyable class string. */
	example: string
	/** Search synonyms — the words someone looking for this would type. */
	keywords: string[]
	/** Utilities it is meaningless without, or composes with. */
	pairsWith?: string[]
}

/** Reading order for the families, used by the llms mirror and `sable utility`. */
export const UTILITY_FAMILIES: readonly UtilityFamily[] = [
	"relative surface",
	"frame",
	"geometry",
	"state variant",
	"scroll",
	"text",
	"helper",
]

/** Where the utilities this file deliberately does NOT document live. */
export const UTILITIES_ELSEWHERE = {
	typography:
		"The paired `text-*` page tiers (`text-heading-1`, `text-body-md`, `text-label-sm`, `text-mono-md`, …) are documented as `registry.json → tokens.typography` (named without the `text-` prefix). `sable token typography`.",
	motion:
		"The `motion-*` and `animate-*` recipes are listed in `registry.json → tokens.motion.recipes`, with the slot model in `registry.json → motionLayer`. `sable docs motion`.",
} as const

export const UTILITY_DOCS: UtilityDoc[] = [
	/* ── Relative surfaces ─────────────────────────────────────────────────── */
	{
		name: "sable-surface",
		kind: "utility",
		family: "relative surface",
		intent:
			"Paints an element as a semantic surface (card by default) and DERIVES its hover and active fills from it — background, ink, edge and both state colours from one role.",
		whenToUse:
			"A bespoke container whose rows or buttons need hover/selected fills that sit the right step off the container in every theme. Pick the role with a modifier (`sable-surface-muted`, `-popover`, `-accent`); descendants using `sable-surface-interactive` or `sable-well` then compute against it.",
		insteadOf:
			"`bg-card text-card-foreground border-border` plus a hand-mixed hover like `hover:bg-[color-mix(in_oklab,var(--foreground)_8%,var(--card))]`. The utility computes the same mix from whatever role you pick, so it stays one visible step in every preset and mode. Use a component (`Card`, `Panel`) first when one fits.",
		example: `<div className="sable-surface sable-frame sable-frame-r-lg sable-frame-p-4">…</div>`,
		keywords: [
			"surface",
			"container background",
			"card surface",
			"derived states",
			"relative colour",
			"relative color",
			"color-mix",
			"surface context",
		],
		pairsWith: ["sable-surface-interactive", "sable-well", "sable-frame"],
	},
	{
		name: "sable-surface-muted",
		kind: "utility",
		family: "relative surface",
		intent:
			"Switches a `sable-surface` to the `muted` role: recessed background, `foreground` ink, `border` edge. Sets the surface variables only; it does not paint on its own.",
		whenToUse:
			"With `sable-surface`, for a quiet, recessed container whose interactive rows still need derived hover/selected fills.",
		insteadOf:
			"`bg-muted` alone, which leaves descendants' hover fills computed against the wrong surface. For a small recessed area INSIDE another surface (a track, a pad) use `sable-well` instead.",
		example: `<div className="sable-surface sable-surface-muted sable-frame sable-frame-r-lg sable-frame-p-4">…</div>`,
		keywords: ["muted surface", "recessed container", "quiet panel", "inert surface"],
		pairsWith: ["sable-surface"],
	},
	{
		name: "sable-surface-popover",
		kind: "utility",
		family: "relative surface",
		intent:
			"Switches the surface context to the `popover` role (popover fill and ink, `border-floating` edge). Sets the variables only, so it can also be used ALONE to declare 'descendants sit on a popover'.",
		whenToUse:
			"On a hand-composed floating panel (an inspector, a toolbar over a canvas) so `sable-well` and `sable-surface-interactive` inside it derive from the popover rather than the page. Alone, alongside `bg-popover text-popover-foreground`, it is purely that context hint; with `sable-surface` it also paints.",
		insteadOf:
			"leaving the context unset. Then `sable-well` falls back to `--background`, which inside a popover in some dark modes lands within a step of the panel: the bug that tempts an outline on every well.",
		example: `<aside className="sable-surface-popover bg-popover text-popover-foreground rounded-lg ring-1 ring-border-floating shadow-lg">…</aside>`,
		keywords: ["popover surface", "floating panel", "inspector surface", "surface context", "elevated surface"],
		pairsWith: ["sable-surface", "sable-well", "sable-frame-popover"],
	},
	{
		name: "sable-surface-accent",
		kind: "utility",
		family: "relative surface",
		intent:
			"Switches a `sable-surface` to the `accent` role: the transient-state fill with its paired ink. Sets the variables only.",
		whenToUse:
			"With `sable-surface`, for a container that is itself in a highlighted/current state and still hosts interactive rows whose hover must step off it.",
		insteadOf:
			"`bg-accent text-accent-foreground` on a container whose children then hover against the page colour. Accent is a STATE, not a decoration — don't use it to make a static section stand out.",
		example: `<div className="sable-surface sable-surface-accent sable-frame sable-frame-r-md sable-frame-p-2">…</div>`,
		keywords: ["accent surface", "highlighted container", "current section"],
		pairsWith: ["sable-surface"],
	},
	{
		name: "sable-surface-interactive",
		kind: "utility",
		family: "relative surface",
		intent:
			"Hover / highlighted and pressed / selected fills for a row or button, derived from the surface it sits on. Hover = the surface's hover step (8% ink); active, selected or checked = its active step (12% ink inside a `sable-surface`, `accent` outside one).",
		whenToUse:
			"A clickable row, list item or bespoke button inside a surface, where the hover colour must be one consistent step off THAT surface. Matches `:hover`, `[data-highlighted]` / `[data-active]` and `:active`, `[data-selected]` / `[data-checked]` / `aria-selected` / `aria-checked`, so Base UI items work without extra variants. Pair with `motion-interactive` for the transition.",
		insteadOf:
			"`hover:bg-accent`, `hover:bg-muted` or a hand-written `color-mix(in oklab, var(--foreground) 8%, …)` hover. A fixed hover token is right on one surface and invisible or loud on the next; this one is computed from where the row actually is. Reach for `ListItem`, `Menu` or `Button variant=\"ghost\"` first when they fit.",
		example: `<button className="sable-surface-interactive sable-frame-inner motion-interactive px-3 py-2 text-start text-body-sm">Rename</button>`,
		keywords: [
			"hover colour",
			"hover color",
			"hover background",
			"selected background",
			"row hover",
			"surface hover",
			"pressed state",
			"active row",
			"list item hover",
		],
		pairsWith: ["sable-surface", "motion-interactive"],
	},
	{
		name: "sable-well",
		kind: "utility",
		family: "relative surface",
		intent:
			"A recessed area ON whatever surface it sits in: 7% ink mixed into the inherited surface (`--sable-surface-bg`, the page background by default), so it is the same visible step on the page, in a card or in a popover.",
		whenToUse:
			"A segmented-control track, a colour or XY pad, a preview well, a readout block inside a panel. Sable's Card (default), Popover, Dialog and Sheet declare their surface, so a well inside them derives from them automatically; on a hand-composed panel, put `sable-surface-popover` (or set `--sable-surface-bg`) on the panel yourself. Whatever sits ON the well takes the surface's own colour back (`bg-popover` inside a popover). A well takes no outline.",
		insteadOf:
			"`bg-muted`, which is fixed: inside a popover it can sit within a step of the panel in some dark modes. And never a hand-mixed `color-mix(… var(--foreground) …)` or an outline on every well to compensate — that turns a panel into a stack of boxes. For a segmented control itself, use `ToggleGroup`; the well is for what no component draws.",
		example: `<div className="sable-well rounded-md p-1">…</div>`,
		keywords: [
			"well",
			"track",
			"recessed",
			"inset",
			"sunken",
			"pad",
			"segmented track background",
			"segmented control track",
			"trough",
			"preview well",
			"inset background",
		],
		pairsWith: ["sable-surface-popover", "rounded-concentric-*"],
	},

	/* ── Frames ────────────────────────────────────────────────────────────── */
	{
		name: "sable-frame",
		kind: "utility",
		family: "frame",
		intent:
			"A bordered, padded, rounded container that computes the radius its children need: `--sable-frame-inner-radius` = radius − padding − border width, floored at `radius-sm`.",
		whenToUse:
			"A container whose children have their own rounded backgrounds (rows, tiles, a nested preview), so the corners nest concentrically and keep doing so when the radius ladder is rescaled. Defaults: `radius-lg`, `--spacing(4)` padding (1rem at the default scale, and it follows the density control), a 1px edge from the surface (`--sable-surface-edge`, else `border`). Size it with `sable-frame-r-*` / `sable-frame-p-*`; children take `sable-frame-inner`.",
		insteadOf:
			"`rounded-lg p-4 border` on the parent plus a guessed `rounded-sm` on each child — the guess is concentric only at the default ladder. For a one-off nested corner without a frame, `rounded-concentric-*`.",
		example: `<div className="sable-frame sable-surface sable-frame-r-lg sable-frame-p-4"><div className="sable-frame-inner sable-well p-3">…</div></div>`,
		keywords: ["frame", "nested container", "bordered container", "concentric container", "padded border box"],
		pairsWith: ["sable-frame-inner", "sable-frame-r-*", "sable-frame-p-*", "sable-surface"],
	},
	{
		name: "sable-frame-popover",
		kind: "utility",
		family: "frame",
		intent:
			"The popup frame recipe: `radius-md`, `--spacing(1)` padding, the `border-floating` edge and `shadow-lg`, applied over `sable-frame`.",
		whenToUse:
			"A hand-composed floating list or panel that must match Sable's menus (with `sable-frame sable-surface sable-surface-popover`); rows inside take `sable-frame-inner`.",
		insteadOf:
			"Copying a Menu's class string. And use `Menu`, `Select`, `Popover` or `Combobox` first — they own focus and dismissal; this is only for floating chrome no component covers.",
		example: `<div className="sable-frame sable-surface sable-surface-popover sable-frame-popover">…</div>`,
		keywords: ["popup frame", "floating list", "menu container", "dropdown panel"],
		pairsWith: ["sable-frame", "sable-surface-popover"],
	},
	{
		name: "sable-frame-tool",
		kind: "utility",
		family: "frame",
		intent:
			"The frame for edge-to-edge tool chrome at the theme's radius, with no padding. It publishes concentric geometry for what's inside: `--panel-inset` (row side padding, grown so rows clear the corner), `--panel-field-radius` (compact fields curve parallel to the frame) and `--panel-edge` (the first and last section's extra top and bottom). PanelSection and the xs field shell read them. Applied over `sable-frame`.",
		whenToUse:
			"Framing PanelSections, ScrubFields, a Tree, a StatusBar or a PanelGroup outside a Workspace (a docs demo, a floating inspector). Add `overflow-hidden` to clip to the corners.",
		insteadOf:
			"`rounded-lg border overflow-hidden` by hand: the panel keeps its square-column 8px inset and small field radius, so a rounded preset crowds the first label and last field into the curve.",
		example: `<div className="sable-frame sable-frame-tool overflow-hidden bg-panel" data-density="compact"><PanelSection title="Layer">…</PanelSection></div>`,
		keywords: ["panel frame", "inspector frame", "tool panel", "workspace demo", "concentric"],
		pairsWith: ["sable-frame"],
	},
	{
		name: "sable-frame-borderless",
		kind: "utility",
		family: "frame",
		intent:
			"Sets a `sable-frame`'s border width to 0 while keeping the inner-radius math correct.",
		whenToUse:
			"A frame that separates by fill or space rather than an edge (a well, a tinted group) but still needs concentric children.",
		insteadOf:
			"`border-0` on a `sable-frame`, which removes the border but leaves 1px in the inner-radius calculation.",
		example: `<div className="sable-frame sable-frame-borderless sable-well sable-frame-r-md sable-frame-p-1">…</div>`,
		keywords: ["no border frame", "borderless", "frame without edge"],
		pairsWith: ["sable-frame"],
	},
	{
		name: "sable-frame-r-*",
		kind: "utility",
		family: "frame",
		intent:
			"Sets a `sable-frame`'s outer radius from the radius ladder (`sable-frame-r-lg`) or an arbitrary value (`sable-frame-r-[14px]`).",
		whenToUse:
			"Whenever a frame should not be the default `radius-lg`. The inner radius follows automatically.",
		insteadOf:
			"`rounded-*` on a `sable-frame` — that changes the painted corner but not `--sable-frame-inner-radius`, so the children stop nesting.",
		example: `<div className="sable-frame sable-frame-r-md sable-frame-p-2">…</div>`,
		keywords: ["frame radius", "outer radius", "frame corner"],
		pairsWith: ["sable-frame", "sable-frame-inner"],
	},
	{
		name: "sable-frame-p-*",
		kind: "utility",
		family: "frame",
		intent:
			"Sets a `sable-frame`'s padding on the spacing scale (`sable-frame-p-2` = `--spacing(2)`), feeding the inner-radius math. On the scale, so the density control moves it.",
		whenToUse: "Whenever a frame's inset is not the default `--spacing(4)`.",
		insteadOf:
			"`p-*` on a `sable-frame` — the padding changes but the inner radius is still computed from the default `--spacing(4)`, so the children's corners are wrong.",
		example: `<div className="sable-frame sable-frame-r-lg sable-frame-p-2">…</div>`,
		keywords: ["frame padding", "frame inset"],
		pairsWith: ["sable-frame", "sable-frame-inner"],
	},
	{
		name: "sable-frame-inner",
		kind: "utility",
		family: "frame",
		intent:
			"Takes the radius its `sable-frame` ancestor computed (outer − inset − border), never below `radius-sm`: concentric when the child sits near the frame edge (a popover row), the theme's small radius when it sits deep inside a padded card (where the subtraction would leave a near-square row). Falls back to `radius-sm` outside a frame.",
		whenToUse: "On every rounded child of a `sable-frame`: rows, tiles, an inner well, a nested image.",
		insteadOf:
			"A hardcoded `rounded-sm` on the child, which drifts the moment a theme or the customizer rescales radii.",
		example: `<div className="sable-frame sable-frame-r-lg sable-frame-p-2"><button className="sable-frame-inner sable-surface-interactive px-3 py-2">…</button></div>`,
		keywords: ["inner radius", "nested radius", "child corner", "concentric child"],
		pairsWith: ["sable-frame"],
	},

	/* ── Geometry ──────────────────────────────────────────────────────────── */
	{
		name: "rounded-concentric-*",
		kind: "utility",
		family: "geometry",
		intent:
			"A border radius computed as an outer radius minus an inset: `rounded-concentric-<radius>/<spacing>`, floored at `radius-xs` so a deep inset never leaves a 1-2px sliver. `rounded-concentric-md/1` = `radius-md` − `spacing-1`.",
		whenToUse:
			"A one-off rounded element nested inside another — a tab trigger inside a tab list, a thumb inside a track, a row inside a well — where a `sable-frame` would be overkill. The outer radius and the inset are the parent's.",
		insteadOf:
			"Picking the next ladder step down by eye (`rounded-sm` inside `rounded-md p-1`). That is concentric only at the default ladder; the utility recomputes from live tokens. Registered in `cn()` as a radius, so it correctly overrides a component's own `rounded-*`.",
		example: `<div className="sable-well rounded-md p-1"><button className="rounded-concentric-md/1 px-2 py-1">…</button></div>`,
		keywords: ["nested radius", "inner corner", "concentric corners", "inner radius", "radius minus padding", "nested rounded"],
		pairsWith: ["sable-well", "sable-frame-inner"],
	},
	{
		name: "popup-inset",
		kind: "utility",
		family: "geometry",
		intent:
			"The padding of a popup list, derived from the popup's radius: a third of `radius-md`, at least `--spacing(1)`. A rounder popup gets more room, and the floor is on the spacing scale, so the density control moves it.",
		whenToUse:
			"On a hand-composed rounded-md popup that holds a list of rows. Sable's Menu, Select, Combobox and ContextMenu already use it.",
		insteadOf:
			"`p-1`. A fixed inset at a larger radius preset leaves the rows' corners approaching half their height, so every row turns into a pill.",
		example: `<div className="rounded-md bg-popover popup-inset shadow-md">…</div>`,
		keywords: ["popup padding", "menu padding", "list inset", "dropdown padding"],
		pairsWith: ["rounded-popup-item", "popup-bleed"],
	},
	{
		name: "rounded-popup-item",
		kind: "utility",
		family: "geometry",
		intent:
			"The row radius that nests inside a `popup-inset` popup: `radius-md` minus the popup inset, clamped at zero.",
		whenToUse: "On every row inside a `popup-inset` container.",
		insteadOf:
			"`rounded-sm` on menu rows, which matches no ladder exactly (a 12px popup with a 4px inset and 1px border wants 7px rows).",
		example: `<div role="option" className="rounded-popup-item px-2 py-1.5 sable-highlighted:bg-accent">…</div>`,
		keywords: ["menu item radius", "option radius", "row corner", "list item radius"],
		pairsWith: ["popup-inset"],
	},

	{
		name: "popup-bleed",
		kind: "utility",
		family: "geometry",
		intent:
			"A negative inline margin of exactly one `popup-inset`, so a separator inside a padded popup runs edge to edge at every radius and density.",
		whenToUse:
			"On a hand-composed separator (a 1px rule) inside a `popup-inset` popup. Sable's MenuSeparator, ContextMenuSeparator and SelectSeparator already use it.",
		insteadOf:
			"`-mx-1`, which matches the inset only at the default ladder and stops short of both edges once a rounder preset or a roomier density grows it. design-lint flags it (`popup-separator-bleed`).",
		example: `<div role="separator" className="popup-bleed my-1 h-px bg-border" />`,
		keywords: ["separator bleed", "menu divider", "full width separator", "negative margin", "edge to edge rule"],
		pairsWith: ["popup-inset"],
	},

	/* ── State variants ────────────────────────────────────────────────────── */
	{
		name: "sable-highlighted",
		kind: "variant",
		family: "state variant",
		intent:
			"A variant (`sable-highlighted:`) matching the keyboard/pointer-highlighted item: `[data-highlighted]`, `[data-active]`, `[data-active-item]`.",
		whenToUse:
			"Styling the current item in a list, menu, combobox or listbox — Base UI and ARIA-style composites mark it differently, this matches all of them.",
		insteadOf:
			"`data-[highlighted]:bg-accent data-[active]:bg-accent …` repeated per attribute, or `hover:` alone (which misses keyboard navigation).",
		example: `<div role="option" className="sable-highlighted:bg-accent sable-highlighted:text-accent-foreground">…</div>`,
		keywords: ["highlighted", "keyboard focus item", "active item", "current option", "data-highlighted"],
	},
	{
		name: "sable-selected",
		kind: "variant",
		family: "state variant",
		intent:
			"A variant (`sable-selected:`) matching a selected or checked element: `[data-selected]`, `[data-checked]`, `[aria-selected=true]`, `[aria-checked=true]`.",
		whenToUse:
			"The chosen row, the pressed segment, the checked option — whichever attribute the primitive happens to set.",
		insteadOf:
			"Separate `data-[selected]:` / `data-[checked]:` / `aria-selected:` classes, one of which is always forgotten.",
		example: `<div role="option" className="sable-selected:bg-accent sable-selected:text-accent-foreground">…</div>`,
		keywords: ["selected", "checked", "chosen", "pressed", "aria-selected", "selected state"],
	},
	{
		name: "sable-open",
		kind: "variant",
		family: "state variant",
		intent:
			"A variant (`sable-open:`) matching an open trigger or disclosure: `[data-open]`, `[data-popup-open]`, `[data-panel-open]`, `[aria-expanded=true]`.",
		whenToUse: "Rotating a chevron, holding a trigger's pressed look while its menu or panel is open.",
		insteadOf: "`data-[popup-open]:` on one trigger and `aria-expanded:` on the next.",
		example: `<button className="motion-interactive sable-open:bg-accent sable-open:text-accent-foreground">…</button>`,
		keywords: ["open", "expanded", "disclosure open", "aria-expanded", "popup open"],
	},
	{
		name: "sable-disabled",
		kind: "variant",
		family: "state variant",
		intent:
			"A variant (`sable-disabled:`) matching a disabled element: `:disabled`, `[disabled]`, `[data-disabled]`, `[aria-disabled=true]`.",
		whenToUse: "Dimming or locking a bespoke element regardless of whether it is natively or ARIA-disabled.",
		insteadOf: "`disabled:` alone, which misses `aria-disabled` and Base UI's `data-disabled` — the cases that stay focusable.",
		example: `<div className="sable-disabled:pointer-events-none sable-disabled:opacity-50">…</div>`,
		keywords: ["disabled", "aria-disabled", "inactive", "locked"],
	},
	{
		name: "sable-invalid",
		kind: "variant",
		family: "state variant",
		intent: "A variant (`sable-invalid:`) matching an invalid field: `[aria-invalid=true]`, `[data-invalid]`.",
		whenToUse: "The error edge or ink on a bespoke field wrapper. Use `Field` / `Input` first; they already style it.",
		insteadOf: "`aria-invalid:` or `data-[invalid]:` alone — Base UI's Field sets one, native validation wiring the other.",
		example: `<div className="ring-1 ring-border sable-invalid:ring-destructive">…</div>`,
		keywords: ["invalid", "error state", "aria-invalid", "validation error"],
	},

	/* ── Scroll ────────────────────────────────────────────────────────────── */
	{
		name: "scrollbar-quiet",
		kind: "utility",
		family: "scroll",
		intent:
			"A thin floating scrollbar: no stepper arrows, a 4px thumb inset from the edges, invisible at rest and fading in while the region is scrolled, hovered or focused.",
		whenToUse:
			"Every VERTICAL scroll container (anything with `overflow-y: auto` or `scroll`). Add `useScrollActivity` so the thumb also appears on touch drags and programmatic scrolls. Required by design-lint's `unmanaged-overflow`.",
		insteadOf:
			"A scroll container with no policy, which on Windows draws stepper arrows hard against the padding edge and out of any rounded corner. Never set `scrollbar-width` yourself — in Chromium it disables this utility.",
		example: `<div className="max-h-80 overflow-y-auto scrollbar-quiet">…</div>`,
		keywords: ["scrollbar", "thin scrollbar", "overlay scrollbar", "hide arrows", "scroll container", "overflow auto"],
		pairsWith: ["scrollbar-hidden"],
	},
	{
		name: "scrollbar-hidden",
		kind: "utility",
		family: "scroll",
		intent: "Scrolls without ever drawing a bar.",
		whenToUse:
			"HORIZONTAL strips whose edge fade or paging controls carry the 'there is more' affordance (it is `Scroller`'s horizontal default), a canvas panned by drag. You should be able to name what carries the affordance instead.",
		insteadOf:
			"`scrollbar-quiet` on a vertical list. A vertical region with no bar and no fade tells a reader nothing about how far through they are.",
		example: `<div className="flex gap-3 overflow-x-auto scrollbar-hidden">…</div>`,
		keywords: ["hide scrollbar", "no scrollbar", "horizontal scroll", "carousel", "strip"],
		pairsWith: ["scrollbar-quiet"],
	},

	/* ── Text ──────────────────────────────────────────────────────────────── */
	{
		name: "sable-list",
		kind: "utility",
		family: "text",
		intent:
			"A bulleted list as typography: body type, a hanging muted marker, and item rhythm. Put it on a native `<ul>`.",
		whenToUse: "Running content with bullets: release notes, a feature list, steps that are not ordered.",
		insteadOf: "A stack of `<div>`s with a hand-drawn dot, or an unstyled `<ul>` that inherits the reset (no markers, no indent).",
		example: `<ul className="sable-list"><li>Faster sync</li><li>Offline drafts</li></ul>`,
		keywords: ["bullet list", "unordered list", "ul", "bullets", "list"],
	},
	{
		name: "sable-list-numbered",
		kind: "utility",
		family: "text",
		intent: "A numbered list as typography: `sable-list` with decimal markers in tabular figures. Put it on a native `<ol>`.",
		whenToUse: "Ordered content in running text: setup steps, a ranked list. For a stepped flow with state, use Stepper.",
		insteadOf: "Numbers typed into the text, which neither renumber nor read as a list to assistive tech.",
		example: `<ol className="sable-list-numbered"><li>Install</li><li>Import the styles</li></ol>`,
		keywords: ["numbered list", "ordered list", "ol", "steps"],
	},
	{
		name: "sable-list-dl",
		kind: "utility",
		family: "text",
		intent:
			"Label/value pairs on a native `<dl>`: muted label-tier `<dt>`s and body-tier `<dd>`s on a baseline-aligned two-column grid; long values wrap inside their column. Colour a status value with a `text-*` utility on its `<dd>`.",
		whenToUse: "Read-only details: an order summary, a record's metadata, a settings summary, profile stats.",
		insteadOf: "A grid of `<div>`s (screen readers lose the term/value pairing), or Table for a single record. For editable values use Form and Field.",
		example: `<dl className="sable-list-dl"><dt>Network</dt><dd>Solana</dd><dt>Status</dt><dd className="text-success">Active</dd></dl>`,
		keywords: ["description list", "definition list", "dl", "key value", "metadata", "details", "label value"],
		pairsWith: ["sable-list-dl-2"],
	},
	{
		name: "sable-list-dl-2",
		kind: "utility",
		family: "text",
		intent:
			"Two label/value pairs a row once the nearest `@container` ancestor is at least 28rem wide. Add to `sable-list-dl`.",
		whenToUse: "A compact metadata block in a wide card or panel. Put `@container` on a parent so it measures the room it actually has.",
		insteadOf: "A viewport breakpoint, which gives a narrow card on a wide screen four columns it cannot fit.",
		example: `<div className="@container"><dl className="sable-list-dl sable-list-dl-2">…</dl></div>`,
		keywords: ["two column details", "metadata grid", "dl columns"],
		pairsWith: ["sable-list-dl"],
	},
	{
		name: "text-overline",
		kind: "utility",
		family: "text",
		intent:
			"The eyebrow / overline / kicker tier: small, letter-spaced, uppercase by default (a theme may set sentence case via `--type-overline-transform`).",
		whenToUse: "A section eyebrow above a heading, a stat's label, a badge-style category line. Sits ABOVE and categorises.",
		insteadOf:
			"`text-label-xs uppercase tracking-wider` assembled by hand, or `text-caption`, which sits BELOW and explains. In tool chrome, panel headers use `text-ui-section` instead.",
		example: `<p className="text-overline text-muted-foreground">Latest news</p>`,
		keywords: ["eyebrow", "overline", "kicker", "uppercase label", "section label", "small caps label"],
	},
	{
		name: "text-ui-md",
		kind: "utility",
		family: "text",
		intent: "Workspace-register chrome text, the default tier: ~12px at weight ~500 on 16px leading.",
		whenToUse:
			"Labels and values in tool chrome — panels, inspectors, toolbars, trees — inside the workspace register.",
		insteadOf:
			"`text-label-sm` or `text-body-sm` in a dense panel (the page register's weights read as shouting at this size), or a size class plus a weight class composed by hand.",
		example: `<span className="text-ui-md text-panel-foreground">Opacity</span>`,
		keywords: ["chrome text", "panel label", "workspace text", "inspector label", "tool ui text"],
		pairsWith: ["text-ui-sm", "text-ui-num"],
	},
	{
		name: "text-ui-sm",
		kind: "utility",
		family: "text",
		intent: "Workspace chrome text, the compact tier: ~11px at weight ~500.",
		whenToUse: "Secondary chrome: property names in a grid, status-bar items, tree rows in a compact density.",
		insteadOf: "`text-label-xs`, a page-register tier tuned for different weights and leading.",
		example: `<span className="text-ui-sm text-muted-foreground">W</span>`,
		keywords: ["small chrome text", "compact label", "status bar text", "property name"],
	},
	{
		name: "text-ui-body",
		kind: "utility",
		family: "text",
		intent: "The reading tier inside chrome: `text-ui-md`'s size at regular weight.",
		whenToUse: "Descriptions, help text and empty-state copy inside a panel or inspector.",
		insteadOf: "`text-ui-md`, whose medium weight makes a sentence read as a label; or `text-body-sm`, which is page-register.",
		example: `<p className="text-ui-body text-muted-foreground">Select a layer to edit its properties.</p>`,
		keywords: ["panel description", "help text", "chrome body", "inspector hint"],
	},
	{
		name: "text-ui-section",
		kind: "utility",
		family: "text",
		intent: "Panel section headers in tool chrome: `text-ui-sm`'s size, a little heavier and tracked — not uppercase.",
		whenToUse: "A `PanelSection` header or any group title inside a dense panel.",
		insteadOf: "`text-overline`, whose all-caps reads louder than the content it labels at this density.",
		example: `<h3 className="text-ui-section text-panel-foreground">Layout</h3>`,
		keywords: ["panel header", "section header", "inspector heading", "group title"],
	},
	{
		name: "text-ui-micro",
		kind: "utility",
		family: "text",
		intent: "The smallest chrome tier: ~10px at weight ~450. Use sparingly.",
		whenToUse: "Chrome annotations — a unit suffix, a shortcut hint, a ruler tick label.",
		insteadOf: "`text-[10px]`, which bypasses the theme and density hooks.",
		example: `<kbd className="text-ui-micro text-muted-foreground">⌘K</kbd>`,
		keywords: ["micro text", "tiny label", "annotation", "unit suffix", "shortcut hint"],
	},
	{
		name: "text-ui-num",
		kind: "utility",
		family: "text",
		intent: "Numeric values in chrome: mono, tabular figures, at the `text-ui-sm` size.",
		whenToUse: "Values in a property grid, a scrub field's readout, coordinates — any number that changes while you watch.",
		insteadOf: "`text-ui-sm` (proportional digits make a column jitter while a slider drags) or `text-mono-sm`, which is page-register.",
		example: `<span className="text-ui-num">128</span>`,
		keywords: ["number", "tabular numbers", "numeric value", "readout", "monospace number"],
	},
	{
		name: "stream-tail",
		kind: "utility",
		family: "text",
		intent:
			"The soft trailing edge of a live text stream: a slight blur plus a fading mask, so the newest token reads as 'more is coming' rather than a sentence that has ended. Static.",
		whenToUse:
			"On the last run of text while a model or source is still streaming; remove it when the stream finishes. `StreamingText` applies it for you.",
		insteadOf:
			"An animated fade or a hand-written `mask-image` gradient. Use `StreamingText` first; this is for a stream rendered without it.",
		example: `<span className="stream-tail">{latestChunk}</span>`,
		keywords: ["streaming", "stream edge", "typing", "llm output", "fade tail", "generating text"],
		pairsWith: ["motion-stream-in", "motion-caret"],
	},

	/* ── Helpers ───────────────────────────────────────────────────────────── */
	{
		name: "hit-target",
		kind: "utility",
		family: "helper",
		intent:
			"Grows an element's tap target to 44px with a transparent `::after`, without moving its layout by a pixel. `--hit-target-size` overrides the size.",
		whenToUse:
			"A deliberately small mark — a tag's remove ×, a tiny disclosure, a toast close — that must still meet the WCAG touch floor. Shrink it (`[--hit-target-size:32px]`) where targets sit side by side, or the later one steals the taps.",
		insteadOf:
			"Padding the glyph up (moves it off the row's grid and pushes siblings) or a bigger icon. Never on an `<input>` or other replaced element — pseudo-elements silently do nothing there; wrap it in a label.",
		example: `<button className="hit-target text-muted-foreground" aria-label="Remove"><Icon name="xmark" /></button>`,
		keywords: ["touch target", "tap target", "hit area", "hit slop", "44px", "wcag target size", "small button"],
	},
	{
		name: "link-underline",
		kind: "utility",
		family: "helper",
		intent:
			"An underline drawn from the font's own metrics (position and thickness `from-font`) with ink skipping descenders, so it retunes when a theme swaps typeface.",
		whenToUse: "Inline links in running text. Pair with `motion-interactive` for a colour change on hover.",
		insteadOf:
			"`underline underline-offset-4 decoration-2` — tuned to one face and wrong for the next theme's. Animating thickness or offset is not supported; a growing underline is a separate pseudo-element.",
		example: `<a href="/terms" className="link-underline motion-interactive text-primary">terms</a>`,
		keywords: ["underline", "link style", "inline link", "text link", "hyperlink"],
	},
	{
		name: "checkerboard",
		kind: "utility",
		family: "helper",
		intent:
			"The transparency checkerboard, painted from `--panel` and a derived darker step so it reads in both modes. `--checkerboard-size` (default 16px) and `--checkerboard-alt` tune it.",
		whenToUse:
			"Behind anything that can be translucent: a colour swatch with alpha, an image or artboard preview, an alpha slider track.",
		insteadOf:
			"A hand-rolled `repeating-conic-gradient` with two hardcoded greys. Deliberately not named `bg-checkerboard`, so `cn()` never merges it away against a real `bg-*` colour — you can layer a colour over it.",
		example: `<div className="checkerboard [--checkerboard-size:8px] size-6 rounded-sm" />`,
		keywords: ["transparency", "alpha background", "checker", "transparent pattern", "swatch background"],
	},
]

/** Lookup by declared name. */
export function utilityDoc(name: string): UtilityDoc | undefined {
	return UTILITY_DOCS.find((doc) => doc.name === name)
}

import type { Foundation } from "./types"

const spacing: Foundation = {
	slug: "spacing",
	title: "Spacing & sizing",
	summary:
		"One scale, derived from the type: the baseline is one line of body text, split into steps every gap, inset and line height lands on. Space is assigned by role. Controls read a height ladder that a density scope can retune all at once.",
	headline: "Baseline from the type · 8px steps · 3 roles · 1 control ladder",
	vocabularies: [
		{
			title: "Spacing by role",
			note: "Steps below 2 (8px) are optical correction only.",
			terms: [
				{ name: "Inset  p-4", value: "16px", use: "Padding inside a surface. p-3 for a dense card, px-3 py-2 for a row." },
				{ name: "Stack, within a group  gap-2", value: "1 step · 8px", use: "Label to field, title to description." },
				{ name: "Stack, between groups  gap-4 – gap-6", value: "2–3 steps · 16–24px", use: "Field to field, card to card." },
				{ name: "Stack, between sections  gap-12+", value: "48px+", use: "Major regions of a page." },
				{ name: "Inline  gap-2 – gap-3", value: "8–12px", use: "Icon to label, control to control." },
			],
		},
		{
			title: "The control ladder",
			note: "Comfortable values; data-density=\"compact\" (or <Density>) redefines every step for a region.",
			terms: [
				{ name: "h-(--control-xs)", value: "28px · compact 24", use: "Inline chips, tree rows." },
				{ name: "h-(--control-sm)", value: "32px · compact 28", use: "Compact buttons, toolbar controls." },
				{ name: "h-(--control-md)", value: "40px · compact 32", use: "The default: inputs, buttons, selects, menu triggers." },
				{ name: "h-(--control-cta)", value: "44px · compact 36", use: "The primary call to action; clears the touch floor on its own." },
				{ name: "h-(--control-lg)", value: "48px · compact 40", use: "Prominent or touch-first actions." },
			],
		},
		{
			title: "Icons and touch",
			terms: [
				{ name: "text-base (16px)", value: "sm", use: "Inline with label-md / body-sm." },
				{ name: "text-xl (20px)", value: "md · default", use: "The default UI glyph beside label-lg." },
				{ name: "hit-target", value: "44×44px", use: "Keeps a visually small control's hit area at the WCAG floor without moving layout." },
			],
		},
	],
	rules: [
		{
			rule: "Every margin, padding and gap is a step on the scale, and vertical space between blocks is whole baseline steps: an even Tailwind step (2, 4, 6, 8, 12) or a Stack/Row/Grid gap number.",
			why: "The baseline is one line of body text split into steps; line heights round to it. An odd step (3, 5) is half a baseline step. It is a rhythm to keep, not a grid to force: components stay as tall as their content.",
		},
		{
			rule: "Padding, gaps and insets in a component sit on the spacing scale: a step (p-4, gap-2) or --spacing(n) inside an arbitrary value (p-[var(--card-p,--spacing(6))]).",
			why: "--spacing derives from the baseline step and the density (Character) control moves the leading it comes from, so anything on the scale moves with it. A literal p-[1.5rem] or padding: \"12px\" stays put while everything around it tightens. Keep fixed rem/px for what must not scale: a 1px hairline, a ring width.",
			enforcedBy: "design-lint: fixed-spacing (library source)",
		},
		{
			rule: "Related things sit closer than unrelated things.",
			why: "Proximity groups content without a divider line. Use space first; reach for a border only when space is not enough.",
		},
		{
			rule: "Space lives on the container (gap), not on children (margins).",
			why: "gap survives reordering, conditional children and RTL; per-child margins do not.",
		},
		{
			rule: "Control heights read the --control-* ladder.",
			why: "A density scope retunes every control at once. A hardcoded height has to be found and overridden by hand.",
			enforcedBy: "sable-lint: raw-control-height",
		},
		{
			rule: "Single-column content inside a card stacks with flex flex-col and a gap, not CSS grid.",
			why: "A grid track sizes to its widest min-content child, so one long unbreakable string (a URL, a code line, a table) blows the column out past the card. A flex column lets children shrink to the card.",
		},
		{
			rule: "A compact surface drops one whole step; a spacious one adds one.",
			why: "Moving in whole steps keeps density changes proportional.",
		},
		{
			rule: "Every interactive element clears a 44×44px hit area.",
			why: "WCAG 2.5.5. Use padding or hit-target to grow the hit area; never a bigger glyph.",
		},
		{
			rule: "Borderless controls get roughly twice the gap of bordered ones.",
			why: "A border declares where a control ends. Two ghost buttons 12px apart read as one target.",
		},
	],
	noGos: [
		{
			never: "Arbitrary values: p-[15px], gap-[7px], mt-[13px].",
			instead: "The nearest scale step.",
			why: "Arbitrary values cannot follow density or a customized scale.",
		},
		{
			never: "h-[40px] on a control.",
			instead: "h-(--control-md).",
			why: "It will not follow <Density>.",
			enforcedBy: "sable-lint: raw-control-height",
		},
		{
			never: "Icons sized with type utilities (text-body-md on an <Icon>).",
			instead: "text-{size} scale classes.",
			why: "Type utilities carry line-height and tracking that misalign glyphs.",
		},
		{
			never: "A fixed width sized to an English label.",
			instead: "padding-inline and max-width with wrapping.",
			why: "German and Finnish run 30–50% longer.",
		},
	],
	details: [
		{
			title: "A dense region in one attribute",
			before: '<div className="[&_button]:h-8 [&_input]:h-8">…</div>',
			after: '<Density value="compact">…</Density>',
			why: "Every control, menu and popup inside retunes, including portaled overlays.",
		},
		{
			title: "Grouping by space",
			before: '<Separator /> between every field',
			after: '<Stack gap={3}> between groups (24px), <Stack gap={1}> inside a group (8px)',
			why: "Spacing steps do the work of every divider, with less ink. Stack's numeric gap counts --rhythm-unit — one baseline step — so it follows the type and the density control like every other spacing value.",
		},
	],
	related: ["shape", "typography", "sable docs building-a-tool", "sable token layout"],
}

export default spacing

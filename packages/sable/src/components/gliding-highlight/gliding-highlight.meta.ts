import type { ComponentMeta } from "../../lib/meta"

export const glidingHighlightMeta: ComponentMeta = {
	name: "GlidingHighlight",
	summary:
		"One highlight that travels to the active item, instead of each item toggling its own background. Measured, not assumed, so rows of unequal height stay exact.",
	status: "stable",
	keywords: [
		"highlight",
		"active",
		"selection",
		"indicator",
		"menu",
		"list",
		"glide",
		"slide",
		"thumb",
		"hover",
	],
	usage: {
		description:
			"Use GlidingHighlight for a set of items where one is active at a time and the pointer or arrow keys move between them — a menu, an option list, a command palette, a segmented control. It replaces per-item `hover:bg-*` with a single element that moves.",
		bestPractices: [
			{
				guidance: "do",
				description:
					"Pass `hovered ?? selected`. The fallback is what makes the pointer leaving a menu return the highlight to the current choice instead of dropping it, so the reader's place is never lost.",
			},
			{
				guidance: "do",
				description:
					"Reach for it wherever a list is keyboard-navigable. The gain is largest for arrow keys: a background that teleports between rows makes the eye re-find the highlight at every step, where one that moves can be tracked while it travels — which is what keeps a long list readable in motion rather than only at rest.",
			},
			{
				guidance: "do",
				description:
					"Keep selection semantics on the items — `aria-selected`, `aria-current`, `data-selected`. The highlight is `aria-hidden` decoration over whatever the children already announce.",
			},
			{
				guidance: "dont",
				description:
					"Do not use it for items that are not mutually exclusive. A travelling highlight says 'one of these, and it is this one'; over a multi-select list it contradicts the checkboxes beside it, and only one of the two can be right.",
			},
			{
				guidance: "dont",
				description:
					"Do not put non-item chrome among the direct children — a group heading, a separator, a footer hint. Every direct child is a measurable row, so `active` counts them, and the highlight lands one row off from the index the caller is reasoning about. Wrap the items in their own GlidingHighlight, or move the chrome outside.",
			},
			{
				guidance: "dont",
				description:
					"Do not drive it from a scroll position or a timer. It is an affordance for a set with a discrete active member; a highlight that moves without an item becoming active reads as the interface selecting things on its own.",
			},
		],
		anatomy: [
			{
				name: "Container",
				required: true,
				description:
					"Positioning context for the highlight. Each direct child is measured as one item.",
			},
			{
				name: "Highlight",
				required: true,
				description:
					"The travelling element. `aria-hidden`, absolutely positioned, invisible until something is active.",
			},
		],
	},
	related: {
		components: ["Menu", "Select", "Combobox", "CommandMenu", "SideNav"],
	},
	props: [
		{
			name: "active",
			type: "number | null",
			description:
				"Index of the item the highlight sits behind, or `null` for none. Pass `hovered ?? selected`.",
		},
		{
			name: "orientation",
			type: '"vertical" | "horizontal"',
			description:
				"Deprecated and ignored: the highlight measures both axes, so a horizontal row needs no flag.",
			deprecated: "nothing — omit it",
		},
		{
			name: "onPointerLeave",
			type: "PointerEventHandler (and every other div prop)",
			description:
				"The container is a plain div, so its props pass through. For a hover-following list, reset the hovered index here so the highlight returns to the selected row when the pointer leaves.",
		},
		{
			name: "highlightClassName",
			type: "string",
			description:
				"Class for the travelling highlight itself, for changing its fill or radius. The radius defaults to `sable-frame-inner`, so inside a `sable-frame` container it nests concentrically; in any other rounded, inset container pass `rounded-concentric-<outer>/<inset>` here and on the rows. The container's own `className` styles the list.",
		},
	],
	tokensUsed: ["accent"],
	motion: [
		{
			slot: "arrival",
			recipe: "none",
			part: "Highlight",
			why: "It deliberately does not animate in. Fading it up at rest position — usually row 0 — makes a menu look like it opened with the first item pre-selected, which is a claim about state that is not true. It stays invisible until something is genuinely active.",
		},
		{
			slot: "response",
			recipe: "none",
			part: "Container",
			why: "The container is not the control; the items are, and they own their own pointer states. This draws the result.",
		},
		{
			slot: "transition",
			recipe: "motion-interactive",
			part: "Highlight",
			why: "The travel IS the component — a highlight that jumps is just a background toggle with extra machinery. Position, size and opacity ride one declaration so a tall row's height cannot catch up after its position has, which would read as the highlight stretching into place rather than moving.",
		},
		{
			slot: "activity",
			recipe: "none",
			part: "Highlight",
			why: "Nothing here is indeterminate. A list still loading its options shows a Skeleton in place of the rows.",
		},
	],
	a11y: [
		"The highlight is `aria-hidden` and carries no semantics — it renders selection, it does not declare it. Keep `aria-selected` / `aria-current` on the items themselves.",
		"Pointer-free by construction (`pointer-events-none`), so it can never intercept a click meant for the item beneath it.",
		"Works with roving-tabindex and `aria-activedescendant` lists alike: it reads an index the caller already owns, and does not manage focus.",
		"Under reduced motion or with MotionProvider off, the highlight moves instantly rather than gliding — the active item is still shown, which is the part that carries meaning.",
	],
	examples: [
		{
			label: "A hoverable menu, returning home on leave",
			code: '<GlidingHighlight active={hovered ?? selected} className="sable-frame sable-surface sable-surface-popover sable-frame-popover" onPointerLeave={() => setHovered(null)}>{items.map((item, i) => (<button key={item.id} type="button" className="sable-frame-inner px-2 py-1.5 text-start" onPointerEnter={() => setHovered(i)} onClick={() => setSelected(i)}>{item.label}</button>))}</GlidingHighlight>',
		},
		{
			label: "Horizontal, as a segmented control",
			code: '<GlidingHighlight active={tab} className="sable-well flex gap-1 rounded-md p-1" highlightClassName="rounded-concentric-md/1">{tabs.map((t, i) => (<button key={t} type="button" className="rounded-concentric-md/1 px-3 py-1" onClick={() => setTab(i)}>{t}</button>))}</GlidingHighlight>',
		},
		{
			label: "Keyboard navigation — the case it exists for",
			code: '<GlidingHighlight active={cursor} onKeyDown={(e) => { if (e.key === "ArrowDown") setCursor((c) => (c + 1) % rows.length) }}>{rows.map((r) => (<div key={r.id} role="option" aria-selected={false}>{r.label}</div>))}</GlidingHighlight>',
		},
	],
}

import type { Foundation } from "./types"

const shape: Foundation = {
	slug: "shape",
	title: "Shape",
	summary:
		"Radius signals what something is: tight on containers, full on actions. Nested corners stay concentric, and one edge treatment marks a boundary.",
	headline: "7 radius steps · concentric nesting · 1 edge treatment per boundary",
	vocabularies: [
		{
			title: "The radius ladder",
			note: "Each step is 4px apart, so common insets land on a real step. Themes and the customizer retune every step together.",
			terms: [
				{ name: "rounded-none", value: "0", use: "Full-bleed media." },
				{ name: "rounded-xs", value: "4px", use: "Tags, kbd, small inline marks." },
				{ name: "rounded-sm", value: "8px", use: "Inputs, menu items, list rows." },
				{ name: "rounded-md", value: "12px", use: "Popovers, menus, toasts." },
				{ name: "rounded-lg", value: "16px", use: "Cards, dialogs, sheets." },
				{ name: "rounded-xl", value: "20px", use: "Hero surfaces." },
				{ name: "rounded-full", value: "pill", use: "Buttons (via --button-radius), avatars, pills, dots." },
			],
		},
		{
			title: "Edges",
			terms: [
				{ name: "border-border", value: "hairline", use: "The default edge: inputs, cards, badges." },
				{ name: "border-border-strong", value: "hairline, higher contrast", use: "Structural rules: table grids, section separators." },
				{ name: "border-border-floating", value: "faint, alpha", use: "Every floating surface: popovers, menus, selects, tooltips, dialogs, sheets, toasts. Lighter than border; the shadow carries the elevation." },
				{ name: "ring-2 ring-ring", value: "2px focus ring", use: "Focus only. Never a thick border." },
			],
		},
	],
	rules: [
		{
			rule: "Nested corners are concentric: inner radius = outer radius − inset. Write it as rounded-concentric-<outer>/<inset>, not a hardcoded step.",
			why: "A 12px popover with 4px padding takes 8px items. The utility computes the subtraction from the live tokens, so the pair stays concentric when a theme or the customizer rescales the radius ladder; a hardcoded rounded-sm drifts.",
		},
		{
			rule: "A list of rows inside a rounded popup uses popup-inset on the popup, rounded-popup-item on the rows and popup-bleed on a separator.",
			why: "All three derive from the popup's radius: the inset grows to a third of it (never below --spacing(1), so density moves it too), the rows take what is left, and a separator bleeds by exactly the inset. A rounder look gets more room instead of rows that round into pills, and the default ladder still lands on the familiar 4px inset and 8px rows.",
			enforcedBy: "sable-lint: popup-separator-bleed",
		},
		{
			rule: "A Button, Pill or Badge gets its look from a variant, never from override classes.",
			why: "border, bg, rounded, ring and shadow classes on a component fight the variant's own hover, selected and focus states, and give one call site a look no other site can ask for. Use the variant that exists (Button variant=\"floating\" over content, \"on-color\" on a fill; Pill appearance=\"outline\"; Badge appearance and tone) or add one to the component.",
			enforcedBy: "sable-lint: component-restyle",
		},
		{
			rule: "The outer radius is always at least the inner radius.",
			why: "If the inset is larger than the outer radius, square the inner element or step the container up.",
		},
		{
			rule: "Never mix radii within one component.",
			why: "A component reads as one object when its corners agree.",
		},
		{
			rule: "Actions are full; containers are tight.",
			why: "The contrast itself says 'this is a control'. A theme flattens buttons through --button-radius, not by editing each one.",
		},
		{
			rule: "High-contrast outlines (selection, emphasis) are inset rings; hairline chrome is a border.",
			why: "Rings anti-alias on rounded corners at any display scale; a 1px light border on dark snaps to the pixel grid and looks jagged.",
		},
		{
			rule: "One edge treatment per boundary: a border, a ring or a shadow.",
			why: "Stacking all three makes an edge heavier than the content it holds.",
		},
		{
			rule: "Prefer a tonal step or space over a divider line.",
			why: "The flattest thing that reads is best.",
		},
	],
	noGos: [
		{
			never: "rounded-[10px] or any off-ladder radius.",
			instead: "The ladder step for the role.",
			why: "Off-ladder radii cannot follow a theme or the customizer's radius control.",
		},
		{
			never: "A card inside a card with the same radius.",
			instead: "Flatten the inner one, or use rounded-concentric-*.",
			why: "Nested surfaces with equal corners look misaligned at every corner.",
		},
		{
			never: '<Button className="rounded-full">, <Pill className="border bg-card">, a -mx-1 separator in a popup.',
			instead: "The component's variant (add one if it is missing); popup-bleed for the separator.",
			why: "An override fights the component's own states and does not follow the radius ladder, the density or a theme.",
			enforcedBy: "sable-lint: component-restyle, popup-separator-bleed",
		},
		{
			never: "border-2 for emphasis or focus.",
			instead: "ring-2 ring-ring for focus; a tonal fill for emphasis.",
			why: "A thick border shifts layout and competes with the focus ring.",
		},
	],
	details: [
		{
			title: "Crisp selected outlines on dark surfaces",
			before: '<button className="rounded-lg border border-foreground">',
			after: '<button className="rounded-lg ring-[1.5px] ring-foreground ring-inset">',
			why: "A 1px high-contrast border on a rounded corner snaps unevenly at fractional device-pixel ratios (Windows 125%/150%) and reads as jagged, worst light-on-dark. A box-shadow ring is anti-aliased instead, and inset keeps it from changing the element's size. Keep hairline borders for low-contrast chrome, where the snapping is invisible.",
		},
		{
			title: "Concentric menu items",
			before: '<div className="rounded-md p-1"><div className="rounded-md">Item</div></div>',
			after: '<div className="rounded-md popup-inset"><div className="rounded-popup-item">Item</div></div>',
			why: "12px outer − 4px inset = 8px inner at the default ladder, and the utilities keep the subtraction right when a preset or the customizer rescales the radius or the density.",
		},
	],
	related: ["surfaces", "spacing", "sable token radii"],
}

export default shape

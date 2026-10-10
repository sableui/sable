import type { Foundation } from "./types"

const surfaces: Foundation = {
	slug: "surfaces",
	title: "Surfaces & elevation",
	summary:
		"Depth is a step up the surface ladder, chosen by how transient a surface is. Dark mode lifts with lighter tones and edge light; light mode adds soft shadows.",
	headline: "4 surface tokens · 5 elevation roles · 1 shadow per surface · 1 layer scale",
	vocabularies: [
		{
			title: "The surface ladder",
			terms: [
				{ name: "bg-background", value: "the page", use: "The document body; the furthest-back surface." },
				{ name: "bg-card", value: "+1 step", use: "Resting containers: cards, panels, dialogs." },
				{ name: "bg-muted", value: "+1 step, quieter", use: "Wells, code blocks, inactive fills inside a card." },
				{ name: "bg-popover", value: "+2 steps", use: "Anything that floats: menus, popovers, selects, tooltips. Always distinct from card, so a menu in a dialog never melts into it." },
				{ name: "bg-overlay", value: "scrim", use: "Behind modals, and pills over imagery." },
			],
		},
		{
			title: "Elevation by role",
			note: "Raise by transience — how much a surface floats over content — not by importance.",
			terms: [
				{ name: "Resting", value: "no shadow", use: "Page content and flat cards. A hairline border if it needs an edge." },
				{ name: "Raised  shadow-sm", value: "subtle", use: "A draggable card, a sticky header over scrolled content." },
				{ name: "Floating  shadow-md", value: "anchored", use: "Menus, popovers, selects, dropdowns." },
				{ name: "Modal  shadow-lg", value: "with scrim", use: "Dialogs, sheets, the command menu." },
				{ name: "Top  shadow-xl", value: "rare", use: "The toast stack." },
			],
		},
		{
			title: "Layers",
			terms: [
				{ name: "z-(--z-sticky)", value: "30", use: "Sticky in-content chrome: table headers." },
				{ name: "z-(--z-nav)", value: "40", use: "App chrome: header, sidebar, bottom nav." },
				{ name: "z-(--z-overlay)", value: "50", use: "Every portaled transient surface." },
				{ name: "z-(--z-toast)", value: "60", use: "Toasts, above modals." },
				{ name: "z-(--z-skip-link)", value: "100", use: "The skip link, above everything." },
			],
		},
	],
	rules: [
		{
			rule: "Pick the elevation role, not a shadow value.",
			why: "Elevation is a five-step system. A custom box-shadow cannot follow a theme or the light/dark split.",
		},
		{
			rule: "Floating surfaces use bg-popover, resting ones bg-card. Anything with shadow-md or above floats: menus, popovers, selects, tooltips, dialogs, sheets, toasts, a floating panel.",
			why: "In dark mode popover is guaranteed lighter than card, so a menu opened inside a dialog always reads as on top of it. In light mode several presets make background, card and popover the same colour, so the fill alone never carries elevation.",
			enforcedBy: "themes.test.ts + sable-lint: floating-surface",
		},
		{
			rule: "A floating surface's edge is border-border-floating (or ring-border-floating), never the full border-border. The shadow carries the elevation.",
			why: "A full hairline plus a shadow stacks into a heavy dark outline. border-floating is a faint alpha edge: it defines the shape against a same-coloured page in light mode and reads as a lit edge in dark mode, where shadows barely show.",
			enforcedBy: "sable-lint: floating-surface",
		},
		{
			rule: "A recessed area inside a surface (a segmented-control track, a pad, a preview well) is sable-well, and it takes no outline. Whatever sits on the well takes the surface's own colour back (bg-popover inside a popover).",
			why: "sable-well mixes a fixed amount of ink into the surface it sits in, so it is the same visible step on the page, in a card or in a floating panel, in every theme and mode. A fixed bg-muted can nearly vanish inside a popover in dark mode, and adding an outline to every well to compensate stacks a panel into boxes.",
		},
		{
			rule: "One shadow per surface; never a heavy shadow with a heavy border.",
			why: "Stacked depth cues read as decoration rather than position.",
		},
		{
			rule: "Do not elevate a static section to make it stand out.",
			why: "Elevation means 'this floats'. Use a tonal step or space for emphasis.",
		},
		{
			rule: "For modals, the scrim is the primary depth cue.",
			why: "The scrim is what tells the user the page behind is inert; the shadow is secondary.",
		},
		{
			rule: "Stack with the named layer scale.",
			why: "Overlays portal to the end of body and order themselves by open order; the layer only has to clear in-flow chrome.",
		},
	],
	noGos: [
		{
			never: "z-[9999] or any raw z-index.",
			instead: "z-(--z-overlay) and the other named layers.",
			why: "Raw z-indexes become a bidding war that a future overlay always loses.",
			enforcedBy: "sable-lint: raw-z-index",
		},
		{
			never: "shadow-[0_8px_30px_rgba(0,0,0,.2)] or any custom shadow.",
			instead: "shadow-sm … shadow-xl by role.",
			why: "Custom shadows ignore the theme's light/dark elevation recipes.",
		},
		{
			never: "bg-card on a popover, or bg-popover on a resting card.",
			instead: "Match the token to the role.",
			why: "Swapping them is how floating surfaces melt into the surface beneath.",
		},
	],
	details: [
		{
			title: "A menu inside a dialog",
			before: "Dialog bg-card · Menu bg-card — identical in dark mode",
			after: "Dialog bg-card · Menu bg-popover — one step lighter, plus edge light",
			why: "The menu reads as above the dialog without any prop.",
		},
	],
	related: ["shape", "sable docs token-intent"],
}

export default surfaces

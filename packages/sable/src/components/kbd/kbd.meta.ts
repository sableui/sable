import type { ComponentMeta } from "../../lib/meta"

export const kbdMeta: ComponentMeta = {
	name: "Kbd",
	summary:
		"A keyboard key indicator. Renders a raised <kbd> key cap sized from the surrounding text, so one Kbd fits body copy, menus and tooltips; KbdGroup sets one cap per key for a combo. `mod` renders the platform modifier (⌘ or Ctrl); `variant=\"ghost\"` is the bare label for menu rows and tooltips.",
	status: "stable",
	keywords: [
		"keyboard",
		"shortcut",
		"key",
		"kbd",
	],
	usage: {
		description: "Use Kbd to display keyboard keys or shortcuts in help text, menus, and docs.",
		bestPractices: [
			{
				guidance: "do",
				description: "Use it only for literal keyboard input such as Cmd, Enter, or Esc.",
			},
			{
				guidance: "do",
				description: "Show a combo as one cap per key inside KbdGroup — `<KbdGroup><Kbd mod /><Kbd>K</Kbd></KbdGroup>` — not several keys typed into one cap.",
			},
			{
				guidance: "do",
				description: "Use `variant=\"ghost\"` where the shortcut sits on a surface of its own — a menu row's trailing slot, a tooltip — so it reads as a hint, not a second control.",
			},
			{
				guidance: "dont",
				description: "Do not use Kbd as a decorative badge or button replacement.",
			},
			{
				guidance: "dont",
				description: "Do not set a text size on a Kbd. It sizes itself from the text around it.",
			},
			{
				guidance: "dont",
				description: "Do not hardcode ⌘ or Ctrl. The modifier differs by platform; use `<Kbd mod />`, which renders ⌘ on macOS/iOS and Ctrl elsewhere, or Windows users read Mac keys.",
			},
		],
	},
	related: {
		components: [
			"Code",
			"Menu",
			"CommandMenu",
		],
	},
	props: [
		{
			name: "mod",
			type: "boolean",
			default: "false",
			description:
				"Render the platform's shortcut modifier in place of children: ⌘ on macOS and iOS, Ctrl everywhere else. Server-rendered as Ctrl and corrected on hydration.",
		},
		{
			name: "variant",
			type: '"key" | "ghost"',
			default: '"key"',
			description:
				"`key`: a raised cap on the surface it sits on, with a heavier bottom edge as the key's lip. `ghost`: the bare label, for menu rows, tooltips and other surfaces that are already a frame.",
		},
		{
			name: "className",
			type: "string",
			description: "Merge additional classes onto the key cap.",
		},
		{
			name: "...props",
			type: "ComponentPropsWithRef<\"kbd\">",
			description: "All native <kbd> attributes (children, ref, etc.).",
		},
	],
	tokensUsed: ["border", "border-strong", "background", "muted-foreground"],
	a11y: [
		"Uses the semantic <kbd> element so assistive tech announces keyboard input.",
		"KbdGroup is itself a <kbd> around the per-key caps — the HTML spelling of one key combination — so the combo is announced as a single piece of input.",
		"Sized in em from the surrounding text, so it scales with the user's text size and never shrinks below 12px.",
	],
	examples: [
		{
			label: "Single keys",
			code: "<Kbd>Esc</Kbd>",
		},
		{
			label: "Combo",
			code: "<KbdGroup><Kbd mod /><Kbd>K</Kbd></KbdGroup>",
		},
		{
			label: "In a menu row",
			code: '<MenuItem>Search<KbdGroup className="ms-auto"><Kbd variant="ghost" mod /><Kbd variant="ghost">K</Kbd></KbdGroup></MenuItem>',
		},
	],
}

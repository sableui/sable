import type { ComponentMeta } from "../../lib/meta"

export const kbdMeta: ComponentMeta = {
	name: "Kbd",
	summary:
		"A keyboard key indicator. Renders a styled <kbd> key cap in monospace; compose several with a + between to show a shortcut combo. `mod` renders the platform modifier (⌘ or Ctrl).",
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
				description: "Keep multi-key shortcuts readable by separating individual keys.",
			},
			{
				guidance: "dont",
				description: "Do not use Kbd as a decorative badge or button replacement.",
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
	tokensUsed: ["border", "muted", "muted-foreground"],
	a11y: [
		"Uses the semantic <kbd> element so assistive tech announces keyboard input.",
		"Monospace key text keeps single keys and symbols legible at small sizes.",
	],
	examples: [
		{
			label: "Single keys",
			code: "<Kbd>Esc</Kbd>",
		},
		{
			label: "Combo",
			code: '<Row gap={1}><Kbd mod /><span>+</span><Kbd>K</Kbd></Row>',
		},
	],
}

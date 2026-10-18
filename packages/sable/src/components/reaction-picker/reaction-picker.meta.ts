import type { ComponentMeta } from "../../lib/meta"

export const reactionPickerMeta: ComponentMeta = {
	name: "ReactionPicker",
	summary:
		"The quick row of emoji you react to a message with: a toolbar of large emoji toggles that bloom in one after another as it opens and magnify under the pointer, with MenuReactions as the same row inside a right-click menu.",
	status: "stable",
	keywords: [
		"reaction",
		"reactions",
		"emoji",
		"emoji picker",
		"react",
		"tapback",
		"quick reactions",
		"message actions",
		"chat",
	],
	usage: {
		description:
			"Use ReactionPicker wherever a reader chooses a reaction for something: in a Popover from an add-reaction control (BubbleReactionAdd is that, ready-made), or as a hover bar over a message. Use MenuReactions for the same row as the first group of the menu a message opens on right-click or long-press, above Reply and Copy. Both report which emoji the reader has already used, so choosing one again removes it.",
		bestPractices: [
			{
				guidance: "do",
				description:
					"Keep the quick set short — six to eight. It is the reactions people actually use; a full emoji catalogue belongs behind a trailing \"more\" control passed as children.",
			},
			{
				guidance: "do",
				description:
					"Give every reaction a `label`. It is the accessible name and the menu's typeahead, and an emoji's own spoken name differs between platforms.",
			},
			{
				guidance: "do",
				description:
					"Pass `selected` so the reader's own reactions show pressed, and toggle in `onSelect`: choosing a reaction you already gave takes it back.",
			},
			{
				guidance: "do",
				description:
					"Offer the right-click menu and a visible add-reaction control together. A context menu is invisible until you know it is there; the pill is how a first-time reader finds reactions.",
			},
			{
				guidance: "dont",
				description:
					"Do not put a ReactionPicker inside a Menu or ContextMenu. A toolbar is not a menu item, so the menu's arrow keys would skip it; use MenuReactions there.",
				instead: ["MenuReactions"],
			},
			{
				guidance: "dont",
				description:
					"Do not use it to rate an answer or collect a verdict. Reactions are social and many-valued; a helpful / not-helpful question is Feedback.",
				instead: ["Feedback"],
			},
		],
		anatomy: [
			{
				name: "ReactionPicker",
				required: true,
				description: "The toolbar: one tab stop, arrow keys move between emoji, each a toggle with `aria-pressed`.",
			},
			{
				name: "MenuReactions",
				required: false,
				description:
					"The same row as a group of checkbox menu items, for MenuContent and ContextMenuContent. Choosing one closes the menu.",
			},
		],
	},
	related: {
		components: ["Bubble", "ContextMenu", "Popover", "Toolbar", "Feedback"],
	},
	props: [
		{
			name: "reactions",
			type: "readonly { emoji: string; label: string }[]",
			default: "DEFAULT_REACTIONS",
			description: "The choices, in order. The default is 👍 ❤️ 😂 🎉 😮 😢 🙏.",
		},
		{
			name: "selected",
			type: "readonly string[]",
			default: "[]",
			description: "The emoji the reader has already reacted with: shown pressed, and choosing one again removes it.",
		},
		{
			name: "onSelect",
			type: "(emoji: string) => void",
			description: "Called with the emoji the reader chose. Toggle it in or out of `selected`.",
		},
		{
			name: "children",
			type: "ReactNode",
			description: "ReactionPicker only: trailing controls after the emoji, such as a button that opens a full emoji picker.",
		},
		{
			name: "aria-label",
			type: "string",
			default: '"Reactions"',
			description: "The name of the toolbar or menu group.",
		},
		{
			name: "motion",
			type: '"full" | "subtle" | "off"',
			default: '"full"',
			description:
				"How much motion this component uses: `full` (default) inherits the app's policy, `subtle` keeps the press and drops the wave of emoji blooming in and the magnify, `off` stills it. It can only turn motion down.",
		},
	],
	subcomponents: [
		{
			name: "MenuReactions",
			type: "{ reactions?; selected?; onSelect?; motion? } & ComponentProps<typeof Menu.Group>",
			description:
				"The quick row as checkbox menu items, for the first group of a MenuContent or ContextMenuContent. Same props as ReactionPicker, without children.",
		},
	],
	tokensUsed: ["accent", "primary", "ring"],
	motion: [
		{
			slot: "arrival",
			recipe: "motion-bloom",
			part: "Glyph",
			why: "Opening the picker is the reader's own action, so the emoji answer it: each blooms in 24ms after the one before, a short wave from first to last. The surface it sits in (a Popover or a menu) arrives with its own motion-pop. Expressive only — under `subtle` the emoji are simply there.",
		},
		{
			slot: "response",
			recipe: "custom",
			part: "Glyph",
			why: "The emoji under the pointer or the keyboard highlight magnifies to 1.25 on a fast standard ease, so you can see which one a release will choose; each cell also carries motion-interactive and motion-press. The magnify rides an inner layer so it never fights the bloom over `scale`.",
		},
		{
			slot: "transition",
			recipe: "motion-interactive",
			part: "Cell",
			why: "Pressed and not pressed differ by a tint, eased by motion-interactive. The celebration belongs to the reaction that lands under the message (BubbleReaction), not to the picker that chose it.",
		},
		{
			slot: "activity",
			recipe: "none",
			part: "Root",
			why: "Choosing is instant; there is no in-between state to show.",
		},
	],
	a11y: [
		"ReactionPicker is a Base UI toolbar: one tab stop, Left/Right move between emoji, Home/End jump to the ends.",
		"Each emoji is a button named by its `label` and reporting `aria-pressed`, so a screen-reader user hears whether choosing it adds or removes their reaction. The glyph itself is aria-hidden.",
		"MenuReactions renders checkbox menu items (`menuitemcheckbox` with `aria-checked`), reached by the menu's arrow keys and typeahead like every other row.",
		"Under reduced motion the emoji appear at once and do not magnify; pressed state is carried by `aria-pressed` and a tint, never motion.",
	],
	examples: [
		{
			label: "In a popover",
			code: '<Popover>\n\t<PopoverTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Add reaction" />}>\n\t\t<Icon name="emoji" />\n\t</PopoverTrigger>\n\t<PopoverContent side="top" className="w-auto rounded-full p-1">\n\t\t<ReactionPicker selected={mine} onSelect={toggle} />\n\t</PopoverContent>\n</Popover>',
		},
		{
			label: "In a right-click menu",
			code: '<ContextMenu>\n\t<ContextMenuTrigger render={<Bubble />}>See you at 6.</ContextMenuTrigger>\n\t<ContextMenuContent>\n\t\t<MenuReactions selected={mine} onSelect={toggle} />\n\t\t<ContextMenuSeparator />\n\t\t<ContextMenuItem>Reply</ContextMenuItem>\n\t\t<ContextMenuItem>Copy text</ContextMenuItem>\n\t</ContextMenuContent>\n</ContextMenu>',
		},
		{
			label: "A custom set",
			code: '<ReactionPicker\n\treactions={[\n\t\t{ emoji: "✅", label: "Done" },\n\t\t{ emoji: "👀", label: "Looking" },\n\t\t{ emoji: "🚀", label: "Shipped" },\n\t]}\n\tselected={mine}\n\tonSelect={toggle}\n/>',
		},
	],
}

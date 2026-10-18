import type { ComponentMeta } from "../../lib/meta"

export const likeButtonMeta: ComponentMeta = {
	name: "LikeButton",
	summary:
		"A pressed-or-not toggle for a like, a star or a save, with its count. Pressing it on fills the glyph, which blooms while a ring and a spray of dots burst from it and the count rolls up; pressing it off is quiet.",
	status: "stable",
	keywords: [
		"like",
		"heart",
		"favorite",
		"favourite",
		"love",
		"star",
		"bookmark",
		"save",
		"upvote",
		"reaction",
		"count",
		"toggle",
	],
	usage: {
		description:
			"Use LikeButton for a personal, reversible endorsement that other people can see the tally of: liking a post, starring a repository, saving a recipe. It is the one place in Sable that celebrates, because the person chose it and it costs nothing to undo.",
		bestPractices: [
			{
				guidance: "do",
				description:
					"Pass the server's total as `count` and update it when the save lands. The button shows the viewer's own like at once, before the save, and goes back to `count` exactly whenever it changes, so a failed save that leaves `count` alone can also turn `pressed` back off.",
			},
			{
				guidance: "do",
				description:
					"Match the glyph, family and label to the meaning: `icon=\"star\" tone=\"yellow\" label=\"Star\"` for a star. The label is the accessible name, so it must say what pressing does.",
			},
			{
				guidance: "do",
				description:
					"Use `format={{ notation: \"compact\" }}` once counts pass a few thousand, so a feed of buttons keeps one width.",
			},
			{
				guidance: "dont",
				description:
					"Do not use it for a setting or a view switch (bold, mute, grid or list). Those are tools, not endorsements, and a burst on every press of a formatting control is noise; use Toggle.",
				instead: ["Toggle"],
			},
			{
				guidance: "dont",
				description:
					"Do not use it for a rating or a verdict on an answer (helpful, not helpful). That is a question with two sides; use Feedback.",
				instead: ["Feedback"],
			},
			{
				guidance: "dont",
				description:
					"Do not press it for the user. A burst is a reply to a person's choice — liking something on their behalf, or on load, turns delight into a notification.",
			},
		],
	},
	related: {
		components: ["Toggle", "Feedback", "NumberTicker", "Button"],
	},
	props: [
		{
			name: "count",
			type: "number",
			description:
				"The total, rolled when it changes. Pressing adds or removes the viewer's like at once; the button shows `count` exactly again whenever `count` changes. Omit it for a bare glyph (an icon-size button).",
		},
		{ name: "pressed", type: "boolean", description: "Controlled pressed state." },
		{ name: "defaultPressed", type: "boolean", default: "false", description: "Initial pressed state when uncontrolled." },
		{
			name: "onPressedChange",
			type: "(pressed: boolean, event) => void",
			description: "Called when the user presses it, with the new state.",
		},
		{ name: "icon", type: "string", default: '"heart"', description: "The glyph, by icon name. Its `solid` variant is shown while pressed." },
		{
			name: "tone",
			type: "PaletteColor",
			default: '"red"',
			description: "The palette family the glyph fills with while pressed, and the burst blooms from. A family, so it follows the theme.",
		},
		{ name: "label", type: "string", default: '"Like"', description: "The accessible name, read before the count." },
		{ name: "format", type: "Intl.NumberFormatOptions", description: "How to write the count, e.g. `{ notation: \"compact\" }`." },
		{ name: "variant", type: '"ghost" | "outline" | "secondary"', default: '"ghost"', description: "The Button surface." },
		{ name: "size", type: '"xs" | "sm" | "md"', default: '"sm"', description: "A Button size; without a count, the matching icon size." },
		{ name: "disabled", type: "boolean", default: "false", description: "Disables it." },
		{
			name: "motion",
			type: '"full" | "subtle" | "off"',
			default: '"full"',
			description:
				"How much motion this component uses: `full` (default) inherits the app's policy, `subtle` keeps feedback and drops the flourish, `off` stills it. It can only turn motion down — it never overrides a reader's reduce-motion setting. The bloom and the burst are the flourish; the fill and the count changing stay.",
		},
	],
	variants: {
		variant: ["ghost", "outline", "secondary"],
		size: ["xs", "sm", "md"],
		tone: ["red", "orange", "yellow", "green", "teal", "blue", "purple", "pink"],
	},
	tokensUsed: ["palette-dot", "accent", "ring"],
	motion: [
		{
			slot: "arrival",
			recipe: "none",
			part: "Root",
			why: "It arrives with the post or row it belongs to. A page that loads with likes already given must be still: nothing blooms on mount.",
		},
		{
			slot: "response",
			recipe: "motion-bloom",
			part: "Glyph",
			why: "Pressing it on is the moment. The glyph is 16px, so it needs real amplitude to read as an event: it grows from nothing past its size and settles, after a 90ms beat in which the ring leads. Inherits Button's motion-press for the press itself. Pressing off has no bloom — taking a like back is not a celebration.",
		},
		{
			slot: "transition",
			recipe: "custom",
			part: "Burst",
			why: "The follow-through: <Burst> draws a disc that hollows into a ring and shifts colour, then dots thrown outward in the theme's palette families. Expressive only — under `subtle` or reduced motion it renders nothing and the fill alone answers the press. The count rolls with NumberTicker.",
		},
		{
			slot: "activity",
			recipe: "none",
			part: "Root",
			why: "There is no in-between state to show: the like is shown at once, before it is saved.",
		},
	],
	a11y: [
		"A native <button> through Button, with `aria-pressed`. Enter and Space press it.",
		"The accessible name is the label then the count (\"Like 1,301\"); the burst is aria-hidden and the rolling digits are hidden behind the count's real text.",
		"The pressed state is carried by the filled glyph and `aria-pressed`, never by colour alone.",
		"Under reduced motion the glyph fills and the count changes at once; the bloom and the burst are dropped.",
	],
	examples: [
		{ label: "A post's likes", code: "<LikeButton count={post.likes} defaultPressed={post.liked} onPressedChange={(on) => api.like(post.id, on)} />" },
		{ label: "Star a repository", code: '<LikeButton icon="star" tone="yellow" label="Star" variant="outline" count={repo.stars} format={{ notation: "compact" }} />' },
		{ label: "Bare glyph", code: '<LikeButton label="Save recipe" />' },
	],
}

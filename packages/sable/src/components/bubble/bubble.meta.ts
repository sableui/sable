import type { ComponentMeta } from "../../lib/meta"

export const bubbleMeta: ComponentMeta = {
	name: "Bubble",
	summary:
		"The surface a message's content sits on: four treatments, an align-aware tail, a readable measure cap, and an optional row of reaction pills.",
	status: "stable",
	keywords: [
		"chat bubble",
		"message bubble",
		"speech bubble",
		"reactions",
		"conversation",
		"messaging",
		"ai chat",
	],
	usage: {
		description:
			"The tinted (or untinted) surface a turn's content sits on. Kept separate from Message because the row's layout and the content's surface change independently — an assistant's markdown answer wants no surface at all in exactly the same row a one-line reply wants a bubble.",
		bestPractices: [
			{
				guidance: "do",
				description:
					"Use `muted` for the other party and `primary` for the reader's own messages. Two treatments is the whole vocabulary a conversation needs to say who is speaking.",
			},
			{
				guidance: "do",
				description:
					'Reach for `variant="plain"` for long-form assistant output — rendered markdown, code blocks, tables. A tinted box around three paragraphs reads as a quote block rather than as a turn, and `plain` drops the measure cap with the surface.',
			},
			{
				guidance: "do",
				description:
					"Pass the same `align` you gave the enclosing Message, so the tail lands on the speaker's side.",
			},
			{
				guidance: "do",
				description:
					"Set `tail={false}` on the continuation bubbles in a grouped run — the tail marks where a speaker starts, and repeating it on every line makes a block of one person's messages look like four separate turns.",
			},
			{
				guidance: "do",
				description:
					'Let the register size it. Inside `<Density value="compact">` a Bubble sets itself in the workspace prose tier automatically — a docked agent panel needs no per-call-site sizing, and hardcoding one defeats the mechanism.',
			},
			{
				guidance: "dont",
				description:
					"Do not remove the measure cap to fill a wide window. ~42rem is a reading measure; a bubble spanning a 1600px viewport is a paragraph at 140 characters per line.",
			},
			{
				guidance: "dont",
				description:
					"Do not put the timestamp or the author name inside the bubble. Those are Message's `header` / `footer`, which stay outside the surface and so still work under `variant=\"plain\"`.",
			},
			{
				guidance: "dont",
				description:
					"Do not use a Bubble for a system note or a streaming status. Those are `Marker`, which is deliberately quieter than the message tier.",
			},
			{
				guidance: "dont",
				description:
					"Do not render reactions as static text. `BubbleReaction` is a toggle and reports `aria-pressed`, which is how a screen-reader user knows whether pressing it adds or removes their own reaction.",
			},
		],
		anatomy: [
			{
				name: "Bubble",
				required: true,
				description:
					"The surface itself. Holds the variant, the side, and the tail.",
			},
			{
				name: "BubbleReactions",
				required: false,
				description:
					"The row of reaction pills, just under the bubble at the message column's small gap, so it reads as belonging to that message rather than the next row.",
			},
			{
				name: "BubbleReaction",
				required: false,
				description:
					"One reaction pill — emoji, count (hidden at 1), and pressed state.",
			},
		],
	},
	related: {
		components: ["Message", "MessageScroller", "Marker", "Attachment"],
	},
	props: [
		{
			name: "variant",
			type: '"muted" | "primary" | "outline" | "plain"',
			default: '"muted"',
			description:
				"Surface treatment. `muted` for the other party, `primary` for the reader's own messages, `outline` for a quieter own-side, `plain` for long-form output that should not sit in a box (also drops the measure cap and padding).",
		},
		{
			name: "align",
			type: '"start" | "end"',
			default: '"start"',
			description:
				"Which side of the conversation the bubble is on — puts the tail on the speaker's side. Match it to the enclosing Message.",
		},
		{
			name: "tail",
			type: "boolean",
			default: "true",
			description:
				"Draw the tail: a small ear off the speaker-side top corner, which goes square to meet it. The same 5px in every theme's radius language, flat through fully pilled. The bubble keeps the ear's space either way, so turning it off for the continuation bubbles in a grouped run keeps the run aligned.",
		},
		{
			name: "...div props",
			type: 'ComponentPropsWithRef<"div">',
			description: "Spread onto the surface element.",
		},
	],
	subcomponents: [
		{
			name: "BubbleReactions",
			type: '{ align?: "start" | "end" } & ComponentPropsWithRef<"div">',
			description:
				"Row container for reaction pills. Match `align` to the Bubble so the row hangs off the same edge.",
		},
		{
			name: "BubbleReaction",
			type: '{ emoji: ReactNode; count?: number; active?: boolean } & ComponentPropsWithRef<"button">',
			description:
				"One reaction pill. A toggle, not a label: `active` drives `aria-pressed` as well as the styling, and `count` is hidden at 1 because the pill already says \"one\".",
		},
	],
	variants: {
		variant: ["muted", "primary", "outline", "plain"],
		align: ["start", "end"],
		tail: ["true", "false"],
	},
	tokensUsed: [
		"muted",
		"foreground",
		"primary",
		"primary-foreground",
		"border",
		"card",
		"card-foreground",
		"accent",
		"accent-foreground",
		"muted-foreground",
		"ring",
	],
	a11y: [
		"The surface is a plain container with no imposed role — a bubble is presentation, and announcing one as a region would put a landmark around every line of a conversation.",
		"Reaction pills are real buttons reporting `aria-pressed`, so the reader's own reaction is state rather than colour alone; the emoji is hidden from AT and the count is left readable.",
		"`whitespace-pre-wrap` and `break-words` keep pasted logs, long URLs, and hard-wrapped text inside the surface instead of overflowing the conversation.",
		"Every variant meets AA against its own surface, including `primary`, which pairs the primary fill with its paired foreground token rather than a hardcoded white.",
	],
	examples: [
		{
			label: "Two sides",
			code: '<>\n\t<Message messageId="m1"><Bubble>Did the deploy finish?</Bubble></Message>\n\t<Message messageId="m2" align="end"><Bubble variant="primary" align="end">Green across the board.</Bubble></Message>\n</>',
		},
		{
			label: "Long-form assistant output",
			code: '<Message messageId="a1" avatar={<Avatar size="sm" fallback="AI" />}>\n\t<Bubble variant="plain" className="space-y-3">\n\t\t<p className="text-body-md text-foreground">Three things changed in this release:</p>\n\t\t<CodeBlock code={diff} filename="CHANGELOG.md" />\n\t</Bubble>\n</Message>',
		},
		{
			label: "With reactions",
			code: '<Message messageId="m3">\n\t<Bubble>Shipped 0.45.0.</Bubble>\n\t<BubbleReactions>\n\t\t<BubbleReaction emoji="🎉" count={3} active onClick={() => toggle("🎉")} />\n\t\t<BubbleReaction emoji="👀" count={1} onClick={() => toggle("👀")} />\n\t</BubbleReactions>\n</Message>',
		},
		{
			label: "A grouped run drops the repeated tail",
			code: '<>\n\t<Message messageId="m1" align="end"><Bubble variant="primary" align="end">One more thing.</Bubble></Message>\n\t<Message messageId="m2" align="end" grouped><Bubble variant="primary" align="end" tail={false}>The staging cert expires Friday.</Bubble></Message>\n</>',
		},
	],
}

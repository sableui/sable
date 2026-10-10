import type { ComponentMeta } from "../../lib/meta"

export const messageMeta: ComponentMeta = {
	name: "Message",
	summary:
		"One row in a conversation: avatar gutter, side, and stacked header / content / footer. Layout only — the surface is Bubble, passed as children.",
	status: "stable",
	keywords: [
		"chat",
		"message",
		"conversation row",
		"turn",
		"thread",
		"messaging",
		"grouped messages",
		"ai chat",
	],
	usage: {
		description:
			"The row a single turn occupies. It owns the geometry — which side, the avatar gutter, where the name and timestamp go, where reactions and receipts go — and nothing about how the content looks. That separation is the point: an assistant's markdown answer, a one-line reply, an attachment, and a tool-call card are all the same row with different children.",
		bestPractices: [
			{
				guidance: "do",
				description:
					"Set `messageId`. It is what MessageScroller reads for `scrollToMessage`, `initialScroll`, and visibility tracking — a message without one cannot be jumped to or marked as read.",
			},
			{
				guidance: "do",
				description:
					"Pass the same `align` to Message and to the Bubble inside it, so the flattened tail corner lands on the speaker's side.",
			},
			{
				guidance: "do",
				description:
					"Use `grouped` for consecutive messages from one author. It tightens the spacing and hides the avatar while keeping its column reserved, so the run reads as one block instead of stepping left. Pass `tail={false}` to the Bubble in each continuation too, so only the first message in the run carries a tail.",
			},
			{
				guidance: "do",
				description:
					"Match `avatarSize` to the `size` of the Avatar you pass (sm/md/lg line up 1:1). The gutter is declared, not measured, because it has to hold its width when `grouped` hides the avatar.",
			},
			{
				guidance: "dont",
				description:
					"Do not justify the content to move a message to the right. `align=\"end\"` already mirrors the whole row, gutter included; adding your own justification fights it.",
			},
			{
				guidance: "dont",
				description:
					"Do not put the timestamp inside the Bubble. It belongs in `header` or `footer`, which stay outside the surface so `variant=\"plain\"` content still has one.",
			},
			{
				guidance: "dont",
				description:
					"Do not reach for Message to lay out a system note or a date break. That is `Marker`, which is deliberately quieter than the message tier.",
			},
		],
		anatomy: [
			{
				name: "Avatar gutter",
				required: false,
				description:
					"Fixed-width column for the author's Avatar. Kept (but emptied) when `grouped`, which is what keeps a run aligned.",
			},
			{
				name: "Header",
				required: false,
				description: "Author name and timestamp, above the content.",
			},
			{
				name: "Content",
				required: true,
				description:
					"The children — usually a Bubble, but equally an Attachment, a tool card, or plain rendered markdown.",
			},
			{
				name: "Footer",
				required: false,
				description: "Reactions, delivery receipts, retry actions.",
			},
		],
	},
	related: {
		components: ["Bubble", "MessageScroller", "Marker", "Attachment", "Avatar"],
	},
	props: [
		{
			name: "messageId",
			type: "string",
			description:
				"Stable id, published as `data-message-id`. The handle MessageScroller uses for scroll commands and visibility tracking.",
		},
		{
			name: "align",
			type: '"start" | "end"',
			default: '"start"',
			description:
				'Which side of the conversation. "start" is the other party or the assistant; "end" is the person reading. Mirrors the whole row, gutter included.',
		},
		{
			name: "avatar",
			type: "ReactNode",
			description:
				"Avatar node for the gutter. Omit for a message with no author identity.",
		},
		{
			name: "avatarSize",
			type: '"sm" | "md" | "lg"',
			default: '"sm"',
			description:
				"Gutter width, matching Avatar's own size scale 1:1 (32 / 40 / 48px). Declared rather than measured so it survives `grouped`.",
		},
		{
			name: "header",
			type: "ReactNode",
			description: "Author name, timestamp — anything above the content.",
		},
		{
			name: "footer",
			type: "ReactNode",
			description:
				"Reactions, receipts, retry actions — anything below the content.",
		},
		{
			name: "grouped",
			type: "boolean",
			default: "false",
			description:
				"This message continues a run from the same author: tightens the spacing (via `--message-gap`) and drops the avatar while reserving its column.",
		},
		{
			name: "...div props",
			type: 'Omit<ComponentPropsWithRef<"div">, "id">',
			description:
				"Spread onto the row. Use `messageId` rather than `id` — the scroller matches on `data-message-id`.",
		},
	],
	variants: {
		align: ["start", "end"],
		avatarSize: ["sm", "md", "lg"],
	},
	tokensUsed: ["foreground", "muted-foreground"],
	a11y: [
		"A plain container with no imposed role — the conversation's semantics belong to the list or log element you wrap it in, not to each row.",
		"`align` reverses the visual row without reordering the DOM, so reading order in assistive tech stays chronological regardless of which side a message is on.",
		"The header and footer render at the secondary type step in muted ink, keeping both below the message tier in the visual hierarchy without dropping either below the AA contrast floor.",
	],
	examples: [
		{
			label: "Incoming and outgoing",
			code: '<>\n\t<Message messageId="m1" avatar={<Avatar size="sm" fallback="CA" />} header={<><strong className="text-foreground">Carla</strong><RelativeTime date={sentAt} /></>}>\n\t\t<Bubble>Did the deploy finish?</Bubble>\n\t</Message>\n\t<Message messageId="m2" align="end">\n\t\t<Bubble variant="primary" align="end">Green across the board.</Bubble>\n\t</Message>\n</>',
		},
		{
			label: "A grouped run",
			code: '<>\n\t<Message messageId="m1" avatar={<Avatar size="sm" fallback="CA" />} header={<strong className="text-foreground">Carla</strong>}>\n\t\t<Bubble>One more thing.</Bubble>\n\t</Message>\n\t<Message messageId="m2" grouped>\n\t\t<Bubble tail={false}>The staging cert expires Friday.</Bubble>\n\t</Message>\n</>',
		},
		{
			label: "With reactions in the footer",
			code: '<Message messageId="m3" avatar={<Avatar size="sm" fallback="JR" />} footer={<BubbleReactions><BubbleReaction emoji="🎉" count={3} active /><BubbleReaction emoji="👀" /></BubbleReactions>}>\n\t<Bubble>Shipped 0.45.0.</Bubble>\n</Message>',
		},
		{
			label: "An attachment as the content",
			code: '<Message messageId="m4" align="end">\n\t<Attachment name="proposal.pdf" meta="2.4 MB · PDF" />\n</Message>',
		},
	],
}

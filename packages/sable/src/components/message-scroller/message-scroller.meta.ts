import type { ComponentMeta } from "../../lib/meta"

export const messageScrollerMeta: ComponentMeta = {
	name: "MessageScroller",
	summary:
		"Scroll container for a conversation. Auto-follows new messages until the reader scrolls away, holds position when older history is prepended, and exposes scroll commands and visibility tracking through its ref.",
	status: "stable",
	keywords: [
		"chat",
		"conversation",
		"messages",
		"thread",
		"transcript",
		"stick to bottom",
		"auto scroll",
		"streaming",
		"infinite scroll",
		"inbox",
		"ai chat",
		"support chat",
	],
	usage: {
		description:
			"The scroll region a conversation lives in. It owns the scrolling and nothing else — not your messages, not your AI state, not your transport or persistence — so you bring the content renderer and it handles the behaviors that make streaming chat feel right: pinning to the newest message, releasing when the reader scrolls up, keeping the view still when older history loads above, jumping to a specific message, restoring a saved read position, and reporting what is actually on screen.",
		bestPractices: [
			{
				guidance: "do",
				description:
					"Bound it the way you would bound any scroll box — `flex-1 min-h-0` inside a flex column, or `max-h-96`. `className` lands on the element that actually scrolls, so the obvious bound is the correct one (same contract as Scroller).",
			},
			{
				guidance: "do",
				description:
					"Give every Message a `messageId`. It is the handle for `scrollToMessage`, `initialScroll`, and `onVisibleMessagesChange` — a message without one is invisible to all three.",
			},
			{
				guidance: "do",
				description:
					"Prepend older history directly into `children` when the reader reaches the top. The scroller anchors on the first rendered message and re-adds the height that appeared above it, so the view does not jump.",
			},
			{
				guidance: "do",
				description:
					"Set the rhythm between messages with the `gap` prop, not with a flex class on `className` — the messages are laid out in a column inside the scroll region, not directly on it.",
			},
			{
				guidance: "do",
				description:
					'Restore a reopened thread with `initialScroll={{ messageId: lastRead }}` instead of dropping the reader at the bottom of a conversation they have not finished.',
			},
			{
				guidance: "do",
				description:
					'Wrap a docked agent panel in `<Density value="compact">`. The scroller tightens its rhythm and every message inside it drops to the workspace type tier — one attribute for the whole conversation, no per-component sizing.',
			},
			{
				guidance: "dont",
				description:
					"Do not call `scrollToBottom` on every incoming token. Auto-follow already does it, and doing it yourself fights the reader who scrolled up to read something.",
			},
			{
				guidance: "dont",
				description:
					"Do not expect `ref` to be the DOM node — it is a command handle (`scrollToBottom`, `scrollToMessage`, `isFollowing`). Reach for `ref.current.element` when you genuinely need the element.",
			},
			{
				guidance: "dont",
				description:
					"Do not wrap it in a positioned div to place a jump-to-latest button. It ships one, stuck to the bottom edge from inside the scroll region, which is why `className` gets to stay on the scrolling element.",
			},
			{
				guidance: "dont",
				description:
					"Do not use it for an ordinary long list. That is `Scroller` — this one's follow-the-bottom behavior is wrong for content the reader is browsing rather than receiving.",
			},
		],
		anatomy: [
			{
				name: "Scroll region",
				required: true,
				description:
					"The element that scrolls. Carries `className`: sizing, padding, and background.",
			},
			{
				name: "Message column",
				required: true,
				description:
					"The flex column holding the children, spaced by `gap`. Publishes `--message-gap` so `<Message grouped>` can close it.",
			},
			{
				name: "Jump to latest",
				required: false,
				description:
					"A control stuck to the bottom edge, shown only while the reader is scrolled away from the newest message.",
			},
		],
	},
	related: {
		components: ["Message", "Bubble", "Marker", "Attachment", "Scroller"],
	},
	props: [
		{
			name: "ref",
			type: "Ref<MessageScrollerHandle>",
			description:
				"Imperative commands, not the DOM node: `scrollToBottom(opts)`, `scrollToTop(opts)`, `scrollToMessage(id, opts)` (returns false when the message is not rendered), `isFollowing()`, and `element` for the scrolling node itself. `opts` is `ScrollCommandOptions`: `{ animate?: boolean }` (default true, and off whenever motion is), not the DOM's `behavior`.",
		},
		{
			name: "autoFollow",
			type: "boolean",
			default: "true",
			description:
				"Keep the newest message in view as content arrives, until the reader scrolls away from the bottom. Set false for a transcript that must never move under the reader.",
		},
		{
			name: "followThreshold",
			type: "number",
			default: "64",
			description:
				"Distance from the bottom, in px, that still counts as following. A band rather than a pixel, so a token arriving mid-frame does not flicker the state.",
		},
		{
			name: "onFollowChange",
			type: "(following: boolean) => void",
			description:
				"Notified when the viewport pins to, or releases from, the newest message.",
		},
		{
			name: "initialScroll",
			type: '"bottom" | "top" | { messageId: string }',
			default: '"bottom"',
			description:
				"Where a freshly mounted thread lands. Pass a messageId to restore a saved read position. Applied once, on mount — changing it later will not yank a reader mid-conversation.",
		},
		{
			name: "jumpToLatest",
			type: "boolean",
			default: "true",
			description:
				"Show the jump-to-latest control while the reader is scrolled away from the newest message.",
		},
		{
			name: "jumpToLatestLabel",
			type: "string",
			default: '"Jump to latest"',
			description: "Accessible label and tooltip for that control.",
		},
		{
			name: "gap",
			type: '"sm" | "md" | "lg"',
			default: '"md"',
			description:
				"Vertical rhythm between messages. Also published as `--message-gap`, which `<Message grouped>` reads to collapse the gap within a run.",
		},
		{
			name: "onVisibleMessagesChange",
			type: "(ids: string[]) => void",
			description:
				"Ids of the messages currently intersecting the viewport, in DOM order. The hook for read receipts, mark-as-seen, and unread counters.",
		},
		{
			name: "...div props",
			type: 'Omit<ComponentPropsWithRef<"div">, "ref">',
			description:
				"Spread onto the scrolling element. `className` bounds and pads the scroll region; `onScroll` composes with the component's own.",
		},
	],
	variants: { gap: ["sm", "md", "lg"] },
	tokensUsed: ["border", "secondary", "secondary-foreground", "ring"],
	a11y: [
		"Native overflow, so keyboard scrolling (arrows, Page Up/Down, Home/End) and the OS scrollbar work unchanged; the scrollbar is styled thin, not replaced.",
		"Overscroll is contained, so a wheel gesture that runs out of conversation does not start scrolling the page behind it.",
		"The jump-to-latest control is a real button with an accessible label, reachable by keyboard, and only present when there is somewhere to jump to.",
		"Smooth scrolling is used only when motion is enabled — `prefers-reduced-motion` and <MotionProvider> off both collapse every scroll command to an instant jump.",
	],
	examples: [
		{
			label: "Streaming conversation",
			code: '<MessageScroller className="flex-1 min-h-0 px-4 py-6">{messages.map((m) => (<Message key={m.id} messageId={m.id} align={m.mine ? "end" : "start"}><Bubble variant={m.mine ? "primary" : "muted"} align={m.mine ? "end" : "start"}>{m.body}</Bubble></Message>))}{pending ? <Marker icon="spinner" spin shimmer>Thinking…</Marker> : null}</MessageScroller>',
		},
		{
			label: "Scroll to a message on demand",
			code: 'function Thread({ messages, replyTo }) {\n\tconst thread = useRef(null)\n\treturn (\n\t\t<>\n\t\t\t<Button onClick={() => thread.current?.scrollToMessage(replyTo)}>Show original</Button>\n\t\t\t<MessageScroller ref={thread} className="max-h-96">\n\t\t\t\t{messages.map((m) => (<Message key={m.id} messageId={m.id}><Bubble>{m.body}</Bubble></Message>))}\n\t\t\t</MessageScroller>\n\t\t</>\n\t)\n}',
		},
		{
			label: "Restore a saved read position and track receipts",
			code: '<MessageScroller className="h-96" initialScroll={{ messageId: lastRead }} onVisibleMessagesChange={(ids) => markSeen(ids)}>{messages.map((m) => (<Message key={m.id} messageId={m.id}><Bubble>{m.body}</Bubble></Message>))}</MessageScroller>',
		},
		{
			label: "Prepend older history without moving the view",
			code: '<MessageScroller className="h-96" gap="sm">{hasMore ? <Button variant="secondary" loadingLabel="Loading…" onClick={loadOlder}>Load earlier messages</Button> : null}{messages.map((m) => (<Message key={m.id} messageId={m.id}><Bubble>{m.body}</Bubble></Message>))}</MessageScroller>',
		},
	],
}

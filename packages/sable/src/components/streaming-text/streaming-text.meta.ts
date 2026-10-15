import type { ComponentMeta } from "../../lib/meta"

export const streamingTextMeta: ComponentMeta = {
	name: "StreamingText",
	summary:
		"Prose arriving from a live source, a token at a time. Each token resolves out of blur, the trailing edge stays soft while more is coming, and a steady caret marks the write head.",
	status: "stable",
	keywords: [
		"streaming",
		"stream",
		"tokens",
		"typewriter",
		"generation",
		"assistant",
		"llm",
		"caret",
		"incremental",
	],
	usage: {
		description:
			"Use StreamingText for text whose final length is unknown while it renders — a model's answer, a live transcript, a log line being written. It is the counterpart to ThinkingOrb and Spinner: those cover the wait BEFORE the first token, this covers the arrival of the tokens themselves.",
		bestPractices: [
			{
				guidance: "do",
				description:
					"In a chat, read `sable docs building-a-chat`: one status drives `streaming` and the composer, a regenerated answer takes a new key (the text is append-only), and the finished turn is announced once.",
			},
			{
				guidance: "do",
				description:
					"Grow `text` and let the component do the rest. It assumes an append-only string and keys units by index, so React mounts only the new spans — re-rendering a longer string animates what was added and leaves what the reader has already read alone.",
			},
			{
				guidance: "do",
				description:
					"Drop `streaming` to false the moment the source closes. That is what removes the caret and the softened tail, and their disappearance is the only signal the reader gets that the answer is complete.",
			},
			{
				guidance: "do",
				description:
					"Turn `caret` off when something adjacent already reports the wait — a spinner in the message header, a status row beneath. Two indicators for one wait read as two things happening.",
			},
			{
				guidance: "dont",
				description:
					"Do not use it for text that is already complete. Staging known text on scroll is TextReveal (a `motion` export, not a component folder), which computes a stagger from the full string; StreamingText cannot, because nothing here knows the length. Using it for static prose animates the whole paragraph on every mount and says 'still generating' about something that finished.",
			},
			{
				guidance: "dont",
				description:
					"Do not wrap it in an aria-live region. Every token would be announced, which is unusable; the component sets `aria-busy` instead. Announce once when the turn settles, from whatever owns the turn.",
			},
			{
				guidance: "dont",
				description:
					'Do not pass `split="char"` for paragraph-length text. It is one element per character — thousands of nodes for an answer, each with its own animation — and word-splitting is indistinguishable at prose reading speed. Reserve it for a headline-length string.',
			},
		],
		anatomy: [
			{
				name: "Container",
				required: true,
				description:
					"The paragraph (or `as` element). Carries `aria-busy` while output is incomplete.",
			},
			{
				name: "Unit",
				required: true,
				description:
					"One word or character. Animates once on mount and never again; the newest one carries the softened tail while streaming.",
			},
			{
				name: "Caret",
				required: false,
				description:
					"The write head, shown while streaming. Steady rather than blinking — see `motion-caret`.",
			},
		],
	},
	related: {
		components: ["ThinkingOrb", "Message", "Bubble"],
	},
	props: [
		{
			name: "text",
			type: "string",
			description:
				"The text received so far. Assumed append-only: the component keys units by index precisely so a grown string mounts only its new spans.",
		},
		{
			name: "streaming",
			type: "boolean",
			default: "false",
			description:
				"Whether more is still coming. Drives the caret, the softened trailing edge, and `aria-busy`.",
		},
		{
			name: "as",
			type: "ElementType",
			default: '"p"',
			description: "Render container element.",
		},
		{
			name: "split",
			type: '"word" | "char"',
			default: '"word"',
			description:
				"Split granularity. `char` is one element per character — short strings only.",
		},
		{
			name: "caret",
			type: "boolean",
			default: "true",
			description:
				"Show the caret while streaming. Turn it off when something adjacent already reports the wait.",
		},
	],
	tokensUsed: ["foreground"],
	motion: [
		{
			slot: "arrival",
			recipe: "motion-stream-in",
			part: "Unit",
			why: "Each token resolves out of blur rather than fading. A fade makes every word a separate event; blur reads as the word coming into focus, so a paragraph arrives as one sentence being written instead of a queue of arrivals.",
		},
		{
			slot: "response",
			recipe: "none",
			part: "Container",
			why: "It is prose, not a control. Selecting and copying it is the only interaction, and both are native.",
		},
		{
			slot: "transition",
			recipe: "none",
			part: "Container",
			why: "There is no state to move between — streaming to complete is marked by the caret and tail leaving, not by the text changing. Animating the whole paragraph on completion would re-stage text the reader already read.",
		},
		{
			slot: "activity",
			recipe: "motion-caret",
			part: "Caret",
			why: "The caret is the write head, and it is deliberately STEADY (`data-streaming=\"true\"` suppresses the blink). A blink during arrival puts two rhythms on screen — text advancing at one rate, a caret flashing at another — and the flashing one carries no information the moving text has not already given.",
		},
	],
	a11y: [
		"The text is real text in the accessibility tree: units are ordinary spans, not aria-hidden fragments, so a screen reader concatenates them into the sentence.",
		"`aria-busy` is set on the container while `streaming` is true, marking the output incomplete without announcing each token.",
		"The caret is `aria-hidden` — it is a rendering of the write head, and a screen reader has no use for it.",
		"Under reduced motion or with MotionProvider off, no unit animates and no tail is softened; text simply appears as it arrives.",
	],
	examples: [
		{
			label: "Streaming an answer",
			code: '<StreamingText text={answer} streaming={pending} />',
		},
		{
			label: "Inside a message, with the wait reported elsewhere",
			code: '<Message align="start"><StreamingText text={answer} streaming={pending} caret={false} /></Message>',
		},
		{
			label: "A headline resolving character by character",
			code: '<StreamingText as="h2" split="char" className="text-heading-2" text={headline} streaming={pending} />',
		},
	],
}

import type { PatternMeta } from "../lib/meta"

export const chatPanelMeta: PatternMeta = {
	name: "ChatPanel",
	summary:
		"A full-height conversation surface: titled header, scrolling transcript, and a composer pinned to the bottom — the assembled shape of an AI assistant, a support thread, or a DM.",
	intent:
		"Reach for this for any conversation that owns its screen — an assistant, a support inbox thread, a DM. Not for a chat docked beside other work (compose the same three parts inside a Sheet or a PanelGroup instead), and not for a comment thread under an article, which is a FeedPage concern.",
	notes: [
		"The panel is a fixed-height column, not a growing page. `h-[calc(100dvh_-_--spacing(12))]` on the Card (the viewport minus the Page's py-6, in spacing units so density moves both together — a fixed `3rem` drifts the moment density moves the padding) and `flex-1 min-h-0` on the MessageScroller are what make the transcript scroll instead of the document — the single most common thing to get wrong here, and it fails by pushing the composer off the bottom of the screen.",
		"The panel is a Card, not a hand-built bordered section: CardHeader (title, description, CardAction), the MessageScroller and a CardFooter all inset by the card's own `--card-p`, so the three regions share one edge at any card density.",
		"`dvh` rather than `vh`: on mobile the URL bar collapses, and a `vh`-sized panel puts the composer under it exactly when someone is trying to type.",
		"Region cap is `feed` (640px) — a conversation is a reading column, and the Bubble measure cap is tuned to the same assumption.",
		"The composer sits outside the scroll region, in a bordered CardFooter, so it stays put while the transcript moves.",
		"Grouping is derived from the data (`turns[i - 1].mine === turn.mine`) rather than hand-set, and the tail is dropped on continuations — that pairing is what makes a run read as one block.",
		"What the assistant did before answering — a doc it read, a tool it ran — is a `Marker variant=\"note\"` in that message's `header`, so it reads as part of the turn rather than as an event between turns.",
		"The assistant's long-form answer uses `variant=\"plain\"` and continues the same grouped run. A tinted box around a code block reads as a quote rather than as a turn. A plain Bubble sizes to its content with no measure cap, so it takes `max-w-full` here: bounded by the column, a wide code line scrolls inside the CodeBlock instead of pushing the transcript sideways on a phone.",
		"A settled answer carries its actions (copy, regenerate) in the Message `footer` as a `Toolbar` of icon `ToolbarButton`s with tooltips — one tab stop, arrow keys between them. The answer still streaming has none: there is nothing to copy or regenerate until it settles, and Stop lives in the composer.",
		"One turn, one Message: the reader's question and the file it refers to stack inside a single end-aligned Message rather than being sent as two.",
		"Assistant turns share one Avatar with a glyph fallback and `alt=\"Assistant\"` — initials like \"AI\" read as a person, and a fallback-only avatar is otherwise unnamed.",
		"The answer in flight is a `StreamingText` in a `plain` Bubble, and ONE `pending` flag drives both it and the composer's `busy`. They are the same wait reported at the two ends of the panel; letting them drift gives you a composer still saying 'sending' under an answer that already finished.",
		"A spinner `Marker` (or `ThinkingOrb`) belongs BEFORE the first token and is replaced once tokens land, not kept alongside. Two indicators for one wait read as two things happening — which is also why `StreamingText` takes `caret={false}` when something adjacent already reports it.",
		"MessageScroller needs no configuring for this: it re-follows on \"a message grew\" (ResizeObserver) as well as \"a message arrived\", so the newest token stays pinned while a reader who has scrolled up is left alone.",
		"For a new thread, swap the transcript's children for an `<EmptyState>` inside the same MessageScroller — the panel, header and composer are unchanged, which is the point of keeping them separate.",
	],
	a11y: [
		"The panel header's title is the page's <h1> (an h1 inside CardTitle, which carries the type); the transcript is a scroll region with native overflow, so keyboard scrolling works unchanged.",
		"The answer in flight carries `aria-busy` rather than sitting in a live region. That is deliberate: a live region around streamed text announces every token, which is unusable. Announce once when the turn settles, from whatever owns the turn — the incomplete state is still exposed, just not narrated.",
		"The composer is a real <form> whose Enter handling skips IME composition, and every icon-only control in the panel carries an accessible label — the answer actions also carry a tooltip, and the stop control is named for what it stops (`stopLabel=\"Stop answering\"`).",
	],
}

import type { PatternMeta } from "../lib/meta"

export const feedPageMeta: PatternMeta = {
	name: "FeedPage",
	summary:
		"Social reading feed with a side rail: a feed-width main column (composer, For you / Following Tabs, one Card per post, an edition drop with price, supply Meter and Collect, a Skeleton for the next page) beside a sticky rail of who-to-follow and upcoming drops that drops away below lg.",
	intent:
		"Reach for this for timelines, activity streams, and any reverse-chronological reading surface where people also act on what they read. Not for record management (DashboardPage) or side-by-side browsing (ListDetailPage).",
	notes: [
		"The main column is capped at `--region-feed` (640px) inside a `wide` page, so posts keep a reading measure while the rail fills the desktop width. The rail is a fixed `w-80` aside, `sticky` at lg and `hidden` below it — its content is supplementary, so nothing is lost on mobile.",
		"Feed scope is `Tabs` (underline, stretched to the column with `flex`): peer views of the same feed. The composer sits above them because posting applies to both.",
		"The composer is a Card holding `Textarea autoResize` plus ghost icon Buttons and a secondary `Post` — not ChatComposer, which submits on Enter and is for conversations.",
		"Each post is a Card: an Entity byline in a CardList (with an OverflowMenu for post actions), body copy, then media in an AspectBox at the asset's own ratio, inset with `rounded-concentric-lg/6` so its corners follow the card's in every theme.",
		"An edition drop adds a `Badge appearance=\"overlay\"` on the artwork, title and price, the one primary Button on the page (`Collect`), and a `Meter` for supply — collected against a known maximum is a level, not task progress.",
		"Actions are ghost sm Buttons (icon + count) in a Row pulled out by the button's own padding (`-ms-3`) so the first icon sits on the text edge.",
		"Loading the next page shows a Skeleton post in the shape the post will land in, above the explicit load-more Button in its `loading` state — predictable for keyboard and AT users, unlike infinite scroll.",
	],
	a11y: [
		"Each post is an <article>, so AT users can jump between posts; the rail is a labelled <aside> landmark.",
		"Rail card titles render as h2 (CardTitle `render={<h2 />}`) under the page's one h1.",
		"Icon-only buttons and every Follow / Remind button carry aria-labels naming their target; counts stay in the accessible name.",
		"The supply Meter is role=meter with a getAriaValueText reading (\"62 of 100 collected\").",
		"The Skeleton card is aria-busy; the loading Button keeps its label (\"Loading posts\").",
	],
}

import type { PatternMeta } from "../lib/meta"

export const feedPageMeta: PatternMeta = {
	name: "FeedPage",
	summary:
		"Single-column reading feed: a feed-width region, one Card per post (Entity byline, zero-shift media, body copy, quiet action row), and explicit load-more pagination.",
	intent:
		"Reach for this for timelines, activity streams, and any reverse-chronological reading surface. Not for record management (DashboardPage) or side-by-side browsing (ListDetailPage).",
	notes: [
		"Region cap is `feed` (640px) — a single reading column; media and copy share one measure.",
		"Post media sits in an AspectBox so late-loading images never shift the column.",
		"The byline is Entity (Avatar + name + handle) in a CardList — the same row primitive as everywhere else, inset to the card padding by CardList rather than by zeroing paddings on CardHeader and Entity.",
		"Actions are ghost sm Buttons (icon + count) in a Row, pulled out by the button's own padding (`-ms-3`) so the first icon sits on the text edge: quiet chrome under content, not competing pills.",
		"Pagination is an explicit load-more Button (secondary; set `loading` while the next page fetches — `loadingLabel` names that state), not infinite scroll — predictable for keyboard and AT users.",
	],
	a11y: [
		"Each post is an <article>, so AT users can jump between posts.",
		"Icon-only action buttons carry aria-labels.",
		"Media images get meaningful alt text from the post, empty alt only if decorative.",
	],
}

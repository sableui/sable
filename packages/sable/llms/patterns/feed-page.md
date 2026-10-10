# FeedPage

Single-column reading feed: a feed-width region, one Card per post (Entity byline, zero-shift media, body copy, quiet action row), and explicit load-more pagination.

**Intent:** Reach for this for timelines, activity streams, and any reverse-chronological reading surface. Not for record management (DashboardPage) or side-by-side browsing (ListDetailPage).

## Notes

- Region cap is `feed` (640px) — a single reading column; media and copy share one measure.
- Post media sits in an AspectBox so late-loading images never shift the column.
- The byline is Entity (Avatar + name + handle) in a CardList — the same row primitive as everywhere else, inset to the card padding by CardList rather than by zeroing paddings on CardHeader and Entity.
- Actions are ghost sm Buttons (icon + count) in a Row, pulled out by the button's own padding (`-ms-3`) so the first icon sits on the text edge: quiet chrome under content, not competing pills.
- Pagination is an explicit load-more Button (secondary; set `loading` while the next page fetches — `loadingLabel` names that state), not infinite scroll — predictable for keyboard and AT users.

## Accessibility

- Each post is an <article>, so AT users can jump between posts.
- Icon-only action buttons carry aria-labels.
- Media images get meaningful alt text from the post, empty alt only if decorative.

## Source

```tsx
import { AspectBox, Avatar, Button, Card, CardContent, CardList, Entity, Icon, Page, PageHeader, Row, Stack } from "@sableui/react"

const posts = [
	{
		id: "p_01",
		author: "Ada Lovelace",
		handle: "@ada · 2h",
		initials: "AL",
		body: "New edition drops Friday — 100 signed prints, each with the on-chain original.",
		image: "/media/edition-cover.svg",
		alt: "Edition cover — Gold Rush series",
		likes: 128,
		comments: 24,
	},
	{
		id: "p_02",
		author: "Grace Hopper",
		handle: "@grace · 5h",
		initials: "GH",
		body: "Process shot from this week's series. Compilers and copper ink.",
		image: "/media/process-shot.svg",
		alt: "Work-in-progress plotter drawing in copper ink",
		likes: 86,
		comments: 9,
	},
]

export function FeedPage() {
	return (
		<Page as="main" max="feed" gap={4} className="py-6">
			<PageHeader title="Home" description="Latest posts from artists you follow." />
			<Stack gap={3}>
				{posts.map((post) => (
					<article key={post.id}>
						<Card className="overflow-hidden">
							{/* The byline is an Entity row in CardList, which insets it to the
							    card's own padding on every side — no hand-zeroed paddings. */}
							<CardList>
								<Entity
									leading={<Avatar fallback={post.initials} alt={post.author} />}
									title={post.author}
									subtitle={post.handle}
									action={
										<Button variant="ghost" size="icon-sm" aria-label="Post options">
											<Icon name="ellipsis" />
										</Button>
									}
								/>
							</CardList>
							<AspectBox ratio={16 / 9}>
								<img src={post.image} alt={post.alt} className="size-full object-cover" />
							</AspectBox>
							<CardContent className="flex flex-col gap-2">
								<p className="text-body-md text-foreground">{post.body}</p>
								{/* Pulled out by exactly a sm Button's own padding (px-3), so the
								    first icon lands on the text edge above it. Both are on the
								    spacing scale, so they stay aligned at every density. */}
								<Row gap={1} className="-ms-3">
									<Button variant="ghost" size="sm" aria-label={`Like — ${post.likes}`}>
										<Icon name="heart" />
										{post.likes}
									</Button>
									<Button variant="ghost" size="sm" aria-label={`Comments — ${post.comments}`}>
										<Icon name="comment" />
										{post.comments}
									</Button>
									<Button variant="ghost" size="sm" aria-label="Share">
										<Icon name="share" />
									</Button>
								</Row>
							</CardContent>
						</Card>
					</article>
				))}
			</Stack>
			<Button variant="secondary" loadingLabel="Loading…">Load more posts</Button>
		</Page>
	)
}
```

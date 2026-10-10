import { Icon } from "../icon"
import { Avatar } from "../components/avatar"
import { Button } from "../components/button"
import { Card, CardContent, CardList } from "../components/card"
import { Entity } from "../components/entity"
import { PageHeader } from "../components/page-header"
import { AspectBox, Page, Row, Stack } from "../layout"

// ---pattern-code---
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

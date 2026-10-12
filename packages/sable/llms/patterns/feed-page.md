# FeedPage

Social reading feed with a side rail: a feed-width main column (composer, For you / Following Tabs, one Card per post, an edition drop with price, supply Meter and Collect, a Skeleton for the next page) beside a sticky rail of who-to-follow and upcoming drops that drops away below lg.

**Intent:** Reach for this for timelines, activity streams, and any reverse-chronological reading surface where people also act on what they read. Not for record management (DashboardPage) or side-by-side browsing (ListDetailPage).

## Notes

- The main column is capped at `--region-feed` (640px) inside a `wide` page, so posts keep a reading measure while the rail fills the desktop width. The rail is a fixed `w-80` aside, `sticky` at lg and `hidden` below it — its content is supplementary, so nothing is lost on mobile.
- Feed scope is `Tabs` (underline, stretched to the column with `flex`): peer views of the same feed. The composer sits above them because posting applies to both.
- The composer is a Card holding `Textarea autoResize` plus ghost icon Buttons and a secondary `Post` — not ChatComposer, which submits on Enter and is for conversations.
- Each post is a Card: an Entity byline in a CardList (with an OverflowMenu for post actions), body copy, then media in an AspectBox at the asset's own ratio, inset with `rounded-concentric-lg/6` so its corners follow the card's in every theme.
- An edition drop adds a `Badge appearance="overlay"` on the artwork, title and price, the one primary Button on the page (`Collect`), and a `Meter` for supply — collected against a known maximum is a level, not task progress.
- Actions are ghost sm Buttons (icon + count) in a Row pulled out by the button's own padding (`-ms-3`) so the first icon sits on the text edge.
- Loading the next page shows a Skeleton post in the shape the post will land in, above the explicit load-more Button in its `loading` state — predictable for keyboard and AT users, unlike infinite scroll.

## Accessibility

- Each post is an <article>, so AT users can jump between posts; the rail is a labelled <aside> landmark.
- Rail card titles render as h2 (CardTitle `render={<h2 />}`) under the page's one h1.
- Icon-only buttons and every Follow / Remind button carry aria-labels naming their target; counts stay in the accessible name.
- The supply Meter is role=meter with a getAriaValueText reading ("62 of 100 collected").
- The Skeleton card is aria-busy; the loading Button keeps its label ("Loading posts").

## Source

```tsx
import { AspectBox, Avatar, Badge, Button, Card, CardContent, CardHeader, CardList, CardTitle, Entity, Icon, MenuItem, MenuSeparator, Meter, MeterLabel, MeterTrack, MeterValue, OverflowMenu, Page, PageHeader, Row, Skeleton, Stack, Tabs, TabsList, TabsPanel, TabsTrigger, Textarea } from "@sableui/react"

type Post = {
	id: string
	author: string
	handle: string
	initials: string
	time: string
	following: boolean
	body: string
	media?: { src: string; alt: string }
	drop?: { title: string; price: string; collected: number; supply: number }
	likes: number
	comments: number
}

const posts: Post[] = [
	{
		id: "p_01",
		author: "Ada Lovelace",
		handle: "@ada",
		initials: "AL",
		time: "2h",
		following: true,
		body: "Gold Rush is live. 100 signed prints, each paired with the on-chain original. Thank you for waiting.",
		media: { src: "/media/edition-cover.svg", alt: "Gold Rush, a gold-leaf study in overlapping arcs" },
		drop: { title: "Gold Rush", price: "$120", collected: 62, supply: 100 },
		likes: 128,
		comments: 24,
	},
	{
		id: "p_02",
		author: "Grace Hopper",
		handle: "@grace",
		initials: "GH",
		time: "5h",
		following: true,
		body: "Process shot from this week. Compilers and copper ink — the plotter ran for eleven hours on this one.",
		media: { src: "/media/process-shot.svg", alt: "Work-in-progress plotter drawing in copper ink" },
		likes: 86,
		comments: 9,
	},
	{
		id: "p_03",
		author: "Nina Simone",
		handle: "@nina",
		initials: "NS",
		time: "8h",
		following: false,
		body: "Collectors of Dusk, no. 3 — your unlockable score is now in your library. Headphones on for this one.",
		likes: 214,
		comments: 31,
	},
]

const suggestions = [
	{ id: "u_01", name: "Mary Shelley", handle: "@mary", initials: "MS" },
	{ id: "u_02", name: "Nina Simone", handle: "@nina", initials: "NS" },
]

const upcoming = [
	{ id: "d_01", title: "Quiet Harbor", artist: "Mary Shelley", initials: "MS", date: "Sat, Oct 12" },
	{ id: "d_02", title: "Dusk, no. 4", artist: "Nina Simone", initials: "NS", date: "Tue, Oct 15" },
]

const renderPost = (post: Post) => (
	<article key={post.id}>
		<Card>
			<CardList>
				<Entity
					leading={<Avatar variant="art" fallback={post.initials} alt={post.author} />}
					title={post.author}
					subtitle={`${post.handle} · ${post.time}`}
					action={
						<OverflowMenu label={`Post options for ${post.author}`} size="icon-sm">
							<MenuItem>Copy link</MenuItem>
							<MenuItem>Mute {post.handle}</MenuItem>
							<MenuSeparator />
							<MenuItem variant="destructive">Report post</MenuItem>
						</OverflowMenu>
					}
				/>
			</CardList>
			<CardContent className="flex flex-col gap-4 pt-0">
				<p className="text-body-md text-foreground">{post.body}</p>
				{post.media ? (
					<AspectBox ratio={16 / 9} className="overflow-hidden rounded-concentric-lg/6 bg-muted">
						<img src={post.media.src} alt={post.media.alt} className="size-full object-cover" />
						{post.drop ? (
							<div className="absolute start-3 top-3">
								<Badge appearance="overlay" size="sm" dot>
									Live drop
								</Badge>
							</div>
						) : null}
					</AspectBox>
				) : null}
				{post.drop ? (
					<Stack gap={1.5}>
						<Row gap={2} align="center" justify="between">
							<div className="min-w-0">
								<p className="text-title-md text-foreground">{post.drop.title}</p>
								<p className="text-body-sm text-muted-foreground">
									{`${post.drop.price} · Edition of ${post.drop.supply}`}
								</p>
							</div>
							<Button>{`Collect for ${post.drop.price}`}</Button>
						</Row>
						<Meter
							value={post.drop.collected}
							max={post.drop.supply}
							size="sm"
							getAriaValueText={(_, value) => `${value} of ${post.drop?.supply} collected`}
						>
							<Row gap={2} align="center" justify="between" className="mb-2">
								<MeterLabel>{`${post.drop.collected} collected`}</MeterLabel>
								<MeterValue>{(_, value) => `${(post.drop?.supply ?? 0) - value} left`}</MeterValue>
							</Row>
							<MeterTrack />
						</Meter>
					</Stack>
				) : null}
				{/* Pulled out by exactly a sm Button's own padding (px-3), so the
				    first icon lands on the text edge above it. */}
				<Row gap={0.5} className="-ms-3">
					<Button variant="ghost" size="sm" aria-label={`Like, ${post.likes} likes`}>
						<Icon name="heart" />
						{post.likes}
					</Button>
					<Button variant="ghost" size="sm" aria-label={`Comment, ${post.comments} comments`}>
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
)

export function FeedPage() {
	return (
		<Page as="main" max="wide" gap={4} className="py-6">
			<Row gap={4} align="start" justify="center">
				<Stack gap={3} className="min-w-0 max-w-(--region-feed) flex-1">
					<PageHeader title="Home" />
					<Card>
						<CardContent>
							<Row gap={1.5} align="start">
								<Avatar variant="art" fallback="AL" alt="Ada Lovelace" />
								<Stack gap={1.5} className="min-w-0 flex-1">
									<Textarea
										autoResize
										rows={2}
										aria-label="New post"
										placeholder="Share a process shot or an upcoming drop"
									/>
									<Row gap={1} align="center" justify="between">
										<Row gap={0.5}>
											<Button variant="ghost" size="icon-sm" aria-label="Add images">
												<Icon name="image-stack" />
											</Button>
											<Button variant="ghost" size="icon-sm" aria-label="Attach an edition">
												<Icon name="gem" />
											</Button>
										</Row>
										<Button variant="secondary" size="sm">
											Post
										</Button>
									</Row>
								</Stack>
							</Row>
						</CardContent>
					</Card>
					<Tabs defaultValue="for-you">
						<TabsList className="flex">
							<TabsTrigger value="for-you">For you</TabsTrigger>
							<TabsTrigger value="following">Following</TabsTrigger>
						</TabsList>
						<TabsPanel value="for-you">
							<Stack gap={3}>
								{posts.map(renderPost)}
								{/* The next page, in the shape it will land in, while it fetches. */}
								<Card aria-busy="true">
									<CardContent className="flex flex-col gap-4">
										<Row gap={1.5} align="center">
											<Skeleton className="size-10 rounded-full" />
											<Stack gap={1}>
												<Skeleton className="h-3 w-32" />
												<Skeleton className="h-3 w-20" />
											</Stack>
										</Row>
										<Skeleton className="h-3 w-full" />
										<Skeleton className="h-3 w-2/3" />
									</CardContent>
								</Card>
								<Button variant="secondary" loading loadingLabel="Loading posts">
									Load more posts
								</Button>
							</Stack>
						</TabsPanel>
						<TabsPanel value="following">
							<Stack gap={3}>{posts.filter((post) => post.following).map(renderPost)}</Stack>
						</TabsPanel>
					</Tabs>
				</Stack>
				<aside aria-label="Suggestions" className="sticky top-6 hidden w-80 shrink-0 lg:block">
					<Stack gap={3}>
						<Card>
							<CardHeader>
								<CardTitle render={<h2 />}>Who to follow</CardTitle>
							</CardHeader>
							<CardList>
								{suggestions.map((person) => (
									<Entity
										key={person.id}
										leading={<Avatar variant="art" fallback={person.initials} alt={person.name} />}
										title={person.name}
										subtitle={person.handle}
										action={
											<Button variant="secondary" size="sm" aria-label={`Follow ${person.name}`}>
												Follow
											</Button>
										}
									/>
								))}
							</CardList>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle render={<h2 />}>Upcoming drops</CardTitle>
							</CardHeader>
							<CardList>
								{upcoming.map((drop) => (
									<Entity
										key={drop.id}
										leading={<Avatar variant="art" fallback={drop.initials} alt={drop.artist} />}
										title={drop.title}
										subtitle={`${drop.artist} · ${drop.date}`}
										action={
											<Button variant="ghost" size="icon-sm" aria-label={`Remind me about ${drop.title}`}>
												<Icon name="bell" />
											</Button>
										}
									/>
								))}
							</CardList>
						</Card>
					</Stack>
				</aside>
			</Row>
		</Page>
	)
}
```

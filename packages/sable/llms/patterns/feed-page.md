# FeedPage

Social reading feed with a side rail: a feed-width main column (composer, For you / Following Tabs, one Card per post, an event post with price, capacity Meter and Register, a Skeleton for the next page) beside a sticky rail of who-to-follow and upcoming events that drops away below lg.

**Intent:** Reach for this for timelines, activity streams, and any reverse-chronological reading surface where people also act on what they read. Not for record management (DashboardPage) or side-by-side browsing (ListDetailPage).

## Notes

- The main column is capped at `--region-feed` (640px) inside a `wide` page, so posts keep a reading measure while the rail fills the desktop width. The rail is a fixed `w-80` aside, `sticky` at lg and `hidden` below it — its content is supplementary, so nothing is lost on mobile.
- Feed scope is `Tabs` (underline, stretched to the column with `flex`): peer views of the same feed. The composer sits above them because posting applies to both.
- The composer is a Card holding `Textarea autoResize` plus ghost icon Buttons and a secondary `Post` — not ChatComposer, which submits on Enter and is for conversations.
- Each post is a Card: an Entity byline in a CardList (with an OverflowMenu for post actions), body copy, then media in an AspectBox at the asset's own ratio, inset with `rounded-concentric-lg/6` so its corners follow the card's in every theme.
- An event post adds a `Badge appearance="overlay"` on the image, title and price, the one primary Button on the page (`Register`), and a `Meter` for capacity — seats taken against a known maximum is a level, not task progress.
- Actions are ghost sm Buttons (icon + count) in a Row pulled out by the button's own padding (`-ms-3`) so the first icon sits on the text edge.
- Loading the next page shows a Skeleton post in the shape the post will land in, above the explicit load-more Button in its `loading` state — predictable for keyboard and AT users, unlike infinite scroll.

## Accessibility

- Each post is an <article>, so AT users can jump between posts; the rail is a labelled <aside> landmark.
- Rail card titles render as h2 (CardTitle `render={<h2 />}`) under the page's one h1.
- Icon-only buttons and every Follow / Remind button carry aria-labels naming their target; counts stay in the accessible name.
- The capacity Meter is role=meter with a getAriaValueText reading ("28 of 40 seats taken").
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
	event?: { title: string; price: string; registered: number; capacity: number }
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
		body: "Registration for the spring workshop is open. Two days of plotter drawing in a small group. See you there.",
		media: { src: "/media/edition-cover.svg", alt: "Workshop poster, a gold-leaf study in overlapping arcs" },
		event: { title: "Spring plotter workshop", price: "$120", registered: 28, capacity: 40 },
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
		body: "Thanks to everyone at the Dusk listening session — the full recording is now in your library. Headphones on.",
		likes: 214,
		comments: 31,
	},
]

const suggestions = [
	{ id: "u_01", name: "Mary Shelley", handle: "@mary", initials: "MS" },
	{ id: "u_02", name: "Nina Simone", handle: "@nina", initials: "NS" },
]

const upcoming = [
	{ id: "e_01", title: "Quiet Harbor talk", host: "Mary Shelley", initials: "MS", date: "Sat, Oct 12" },
	{ id: "e_02", title: "Dusk, live", host: "Nina Simone", initials: "NS", date: "Tue, Oct 15" },
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
						{post.event ? (
							<div className="absolute start-3 top-3">
								<Badge appearance="overlay" size="sm" dot>
									Open now
								</Badge>
							</div>
						) : null}
					</AspectBox>
				) : null}
				{post.event ? (
					<Stack gap={1.5}>
						<Row gap={2} align="center" justify="between">
							<div className="min-w-0">
								<p className="text-title-md text-foreground">{post.event.title}</p>
								<p className="text-body-sm text-muted-foreground">
									{`${post.event.price} · ${post.event.capacity} seats`}
								</p>
							</div>
							<Button>{`Register for ${post.event.price}`}</Button>
						</Row>
						<Meter
							value={post.event.registered}
							max={post.event.capacity}
							size="sm"
							getAriaValueText={(_, value) => `${value} of ${post.event?.capacity} seats taken`}
						>
							<Row gap={2} align="center" justify="between" className="mb-2">
								<MeterLabel>{`${post.event.registered} registered`}</MeterLabel>
								<MeterValue>{(_, value) => `${(post.event?.capacity ?? 0) - value} left`}</MeterValue>
							</Row>
							<MeterTrack />
						</Meter>
					</Stack>
				) : null}
				{/* bleed="start" pulls the first button out by exactly its own
				    padding, so its icon lands on the text edge above it. */}
				<Row gap={0.5}>
					<Button variant="ghost" size="sm" bleed="start" aria-label={`Like, ${post.likes} likes`}>
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
										placeholder="Share a process shot or an upcoming event"
									/>
									<Row gap={1} align="center" justify="between">
										<Row gap={0.5}>
											<Button variant="ghost" size="icon-sm" aria-label="Add images">
												<Icon name="image-stack" />
											</Button>
											<Button variant="ghost" size="icon-sm" aria-label="Add an event">
												<Icon name="calendar" />
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
								<CardTitle render={<h2 />}>Upcoming events</CardTitle>
							</CardHeader>
							<CardList>
								{upcoming.map((event) => (
									<Entity
										key={event.id}
										leading={<Avatar variant="art" fallback={event.initials} alt={event.host} />}
										title={event.title}
										subtitle={`${event.host} · ${event.date}`}
										action={
											<Button variant="ghost" size="icon-sm" aria-label={`Remind me about ${event.title}`}>
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

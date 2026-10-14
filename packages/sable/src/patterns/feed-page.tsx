import { Icon } from "../icon"
import { Avatar } from "../components/avatar"
import { Badge } from "../components/badge"
import { Button } from "../components/button"
import { Card, CardContent, CardHeader, CardList, CardTitle } from "../components/card"
import { OverflowMenu } from "../components/overflow-menu"
import { Entity } from "../components/entity"
import { MenuItem, MenuSeparator } from "../components/menu"
import { Meter, MeterLabel, MeterTrack, MeterValue } from "../components/meter"
import { PageHeader } from "../components/page-header"
import { Skeleton } from "../components/skeleton"
import { Tabs, TabsList, TabsPanel, TabsTrigger } from "../components/tabs"
import { Textarea } from "../components/textarea"
import { AspectBox, Page, Row, Stack } from "../layout"

// ---pattern-code---
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

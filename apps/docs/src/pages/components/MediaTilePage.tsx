import { Badge, Button, Grid, Icon, MediaTile, mediaTileMeta } from "@sableui/react"
import type { ComponentPropsWithRef } from "react"
import { ComponentPlayground, Example, InlineCode, MetaFooter, PageHeader, Section, ledeFor } from "../../components/docs-ui"

const PHOTO = (id: string) => `https://images.unsplash.com/photo-${id}?w=480&q=60`

/** Some covers are real images and some are missing — the art stands in for those. */
const ALBUMS = [
	{ title: "Low tide, high noon", artist: "Juno Avery", cover: PHOTO("1526779259212-939e64788e3c") },
	{ title: "Untitled (gold rush)", artist: "Mara Okafor" },
	{ title: "Field recordings", artist: "Sam Rivera", cover: PHOTO("1618005182384-a83a8bd57fbe") },
	{ title: "Dusk, no. 4", artist: "Lee Park" },
	{ title: "Night bus home", artist: "Ada Brooks", cover: PHOTO("1550745165-9bc0b252726f") },
	{ title: "Salt and static", artist: "Kit Moreau" },
]

const VIDEOS = [
	{ title: "Building a synth from scratch", channel: "Undertow Sessions · 2 days ago", length: "12:04", thumb: PHOTO("1550745165-9bc0b252726f") },
	{ title: "Mixing low end on small speakers", channel: "Juno Avery · 1 week ago", length: "8:31" },
	{ title: "A morning of field recording", channel: "Sam Rivera · 3 weeks ago", length: "21:47", thumb: PHOTO("1618005182384-a83a8bd57fbe") },
]

const PHOTOS = ["Harbour, 6am", "Gold rush", "Static", "Night bus", "Low tide", "Field notes", "Dusk", "Salt"]

/** A link that stays on this page, standing in for a router's <Link>. */
function DemoLink(props: ComponentPropsWithRef<"a">) {
	return <a {...props} onClick={(event) => event.preventDefault()} />
}

function PlayButton({ title, size = "icon" }: { title: string; size?: "icon" | "icon-sm" }) {
	return (
		<Button size={size} aria-label={`Play ${title}`}>
			<Icon name="play" variant="solid" />
		</Button>
	)
}

export function MediaTilePage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Media Tile" lede={ledeFor(mediaTileMeta)} />

			<ComponentPlayground meta={mediaTileMeta} />

			<Section
				title="Album grid"
				description="Each tile is one link — click anywhere on it — while the artist is a second link and play is a button, each its own control. Hover a tile, or Tab into one: play appears. On a touch screen it is always there."
			>
				<Example>
					<div className="w-full">
						{/* Columns that divide the six items, so no row is left with an orphan. */}
						<Grid cols={{ base: 2, sm: 3, lg: 6 }} gap={3}>
							{ALBUMS.map((album) => (
								<MediaTile
									key={album.title}
									titleAs="h3"
									title={album.title}
									subtitle={album.artist}
									src={album.cover}
									render={<DemoLink href={`#album-${album.title}`} />}
									subtitleRender={<DemoLink href={`#artist-${album.artist}`} />}
									action={<PlayButton title={album.title} />}
								/>
							))}
						</Grid>
					</div>
				</Example>
			</Section>

			<Section
				title="Video"
				description='aspect="video" for a 16:9 thumbnail, and a duration in the badge slot on the cover — an overlay Badge, so it reads on any frame.'
			>
				<Example>
					<div className="w-full">
						<Grid cols={{ base: 1, md: 3 }} gap={3}>
							{VIDEOS.map((video) => (
								<MediaTile
									key={video.title}
									aspect="video"
									titleAs="h3"
									title={video.title}
									subtitle={video.channel}
									src={video.thumb}
									render={<DemoLink href={`#watch-${video.title}`} />}
									badge={<Badge appearance="overlay">{video.length}</Badge>}
								/>
							))}
						</Grid>
					</div>
				</Example>
			</Section>

			<Section
				title="Gallery"
				description='size="sm" with no links: a static tile, captioned. Pass alt when the picture says more than its caption.'
			>
				<Example>
					<div className="w-full">
						<Grid cols={{ base: 4, md: 8 }} gap={2}>
							{PHOTOS.map((caption) => (
								<MediaTile key={caption} size="sm" title={caption} />
							))}
						</Grid>
					</div>
				</Example>
			</Section>

			<Section
				title="Sizes"
				description="One axis moves the type tier, the gap under the cover, the corner and how far the action sits in from it."
			>
				<Example>
					<div className="flex w-full flex-wrap items-start gap-6">
						{(["sm", "md", "lg"] as const).map((size, i) => (
							<div key={size} className={["w-32", "w-44", "w-56"][i]}>
								<MediaTile
									size={size}
									title="Salt and static"
									subtitle={`Kit Moreau · ${size}`}
									href={`#size-${size}`}
									action={<PlayButton title="Salt and static" size={size === "sm" ? "icon-sm" : "icon"} />}
								/>
							</div>
						))}
					</div>
				</Example>
			</Section>

			<Section
				title="Product tile"
				description="meta holds the lines under the subtitle: a price beside its sale price, a count of finishes, a status. srcSet and sizes pass responsive covers to the image. If your shop's tile wants a different layout, compose it from AspectBox, MediaImage and Badge instead."
			>
				<Example>
					<Grid minItemWidth="12rem" gap={4} className="w-full">
						{[
							{ name: "Oak lounge chair", material: "Solid oak, wool", price: "$1,240", was: "$1,450", finishes: 3, isNew: true },
							{ name: "Brass pendant", material: "Spun brass", price: "$380", finishes: 2, isNew: false },
							{ name: "Linen sofa", material: "Washed linen", price: "$2,900", finishes: 5, isNew: false },
						].map((p) => (
							<MediaTile
								key={p.name}
								aspect={4 / 5}
								title={p.name}
								subtitle={p.material}
								href={`#${p.name}`}
								badge={p.isNew ? <Badge appearance="overlay">New</Badge> : undefined}
								meta={
									<>
										<span className="text-foreground">{p.price}</span>
										{p.was ? <span className="line-through">{p.was}</span> : null}
										<span>{p.finishes} finishes</span>
									</>
								}
							/>
						))}
					</Grid>
				</Example>
			</Section>

			<Section
				title="Why not a Card link"
				description="A card rendered as a link cannot hold the artist link or the play button: interactive content cannot nest, browsers re-parent the inner one, and a screen reader reads the whole card as one long link. MediaTile makes the title the link and stretches it over the tile instead."
			>
				<p className="max-w-(--measure-prose) text-body-md text-muted-foreground">
					Both halves are public utilities for your own items: <InlineCode>stretched-link</InlineCode> on the primary link,{" "}
					<InlineCode>relative z-10</InlineCode> on every other control, and <InlineCode>reveal-on-hover</InlineCode> with{" "}
					<InlineCode>group</InlineCode> on the item for an action that waits for hover.
				</p>
			</Section>

			<MetaFooter meta={mediaTileMeta} />
		</>
	)
}

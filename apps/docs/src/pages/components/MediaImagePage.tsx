import { AspectBox, Button, Entity, Grid, Icon, MediaImage, mediaImageMeta } from "@sableui/react"
import { Example, MetaFooter, PageHeader, Section, ledeFor } from "../../components/docs-ui"

const COVER = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=480&q=60"
/** A URL that will not load, to show the failure path. */
const BROKEN = "https://images.unsplash.com/photo-0000000000000-000000000000?w=480&q=60"

const STATES = [
	{ label: "Loaded", src: COVER },
	{ label: "No src", src: undefined },
	{ label: "Broken URL", src: BROKEN },
]

const TRACKS = [
	{ title: "Low tide, high noon", artist: "Juno Avery", art: COVER },
	{ title: "Untitled (gold rush)", artist: "Mara Okafor" },
	{ title: "Night bus home", artist: "Ada Brooks", art: BROKEN },
]

export function MediaImagePage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Media Image" lede={ledeFor(mediaImageMeta)} />

			<Section
				title="Three states"
				description="A loaded image fades in. With no src, or a URL that fails, the box paints GradientArt seeded by the item — the same seed gives the same art everywhere it appears."
			>
				<Example>
					<Grid cols={3} gap={2} className="w-full max-w-lg">
						{STATES.map((state) => (
							<figure key={state.label} className="flex flex-col gap-2">
								<AspectBox ratio={1} className="rounded-md">
									<MediaImage src={state.src} seed="Field recordings" />
								</AspectBox>
								<figcaption className="text-caption text-muted-foreground">{state.label}</figcaption>
							</figure>
						))}
					</Grid>
				</Example>
			</Section>

			<Section
				title="Row thumbnail"
				description="Sized and rounded on MediaImage itself, as the leading slot of an Entity row. The third track's cover URL is broken; its row still has its own art."
			>
				<Example>
					<div className="flex w-full max-w-sm flex-col">
						{TRACKS.map((track) => (
							<Entity
								key={track.title}
								leading={<MediaImage src={track.art} seed={track.title} className="size-12 shrink-0 rounded-sm" />}
								title={track.title}
								subtitle={track.artist}
								action={
									<Button variant="ghost" size="icon-sm" aria-label={`Like ${track.title}`}>
										<Icon name="heart" />
									</Button>
								}
							/>
						))}
					</div>
				</Example>
			</Section>

			<Section
				title="Contain"
				description='fit="contain" letterboxes on the muted surface instead of cropping — a logo, or a product that must be seen whole.'
			>
				<Example>
					<Grid cols={2} gap={2} className="w-full max-w-md">
						{(["cover", "contain"] as const).map((fit) => (
							<figure key={fit} className="flex flex-col gap-2">
								<AspectBox ratio={16 / 9} className="rounded-lg">
									<MediaImage src={COVER} fit={fit} />
								</AspectBox>
								<figcaption className="text-caption text-muted-foreground">{fit}</figcaption>
							</figure>
						))}
					</Grid>
				</Example>
			</Section>

			<MetaFooter meta={mediaImageMeta} />
		</>
	)
}

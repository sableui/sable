import { Card, CardContent, CardDescription, CardTitle, Carousel, carouselMeta } from "@sableui/react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

/*
 * Each tone fill paired with its OWN ink. This was five different tone
 * backgrounds all carrying one hardcoded near-black palette step — which
 * happens to read in the default theme and breaks in any theme with a light
 * tone,
 * because nothing retunes the ink when the surface changes. Tone and
 * tone-foreground are a pair; using half of it is the bug the pairing exists
 * to prevent.
 */
const TONES = [
	"bg-tone-standard text-tone-standard-foreground",
	"bg-tone-collectible text-tone-collectible-foreground",
	"bg-tone-edition text-tone-edition-foreground",
	"bg-tone-info text-tone-info-foreground",
	"bg-tone-warning text-tone-warning-foreground",
]

function Panel({ n }: { n: number }) {
	return (
		<div
			className={`flex aspect-video size-full items-center justify-center rounded-lg ${TONES[n % TONES.length]} text-heading-1`}
		>
			{n + 1}
		</div>
	)
}

export function CarouselPage() {
	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="Carousel"
				lede={ledeFor(carouselMeta)}
			/>

			<Section
				title="Looping, draggable"
				description="Drag or use the arrows, and the last slide wraps back to the first."
			>
				<Example className="block">
					<Carousel loop dots counter label="Featured" className="w-full">
						{Array.from({ length: 5 }, (_, i) => (
							<Panel key={i} n={i} />
						))}
					</Carousel>
				</Example>
			</Section>

			<Section
				title="Multiple per view"
				description="Several slides share the view, with a gap between them. One on a phone, two on a tablet, three on a desktop."
			>
				<Example className="block">
					<Carousel
						slidesToShow={{ base: 1, sm: 2, lg: 3 }}
						gap="calc(var(--spacing) * 4)"
						loop
						label="Cards"
						className="w-full"
					>
						{Array.from({ length: 8 }, (_, i) => (
							<Card key={i} className="h-full">
								<CardContent className="space-y-1.5">
									<CardTitle>Item {i + 1}</CardTitle>
									<CardDescription>
										A slide that shares the viewport with its neighbours.
									</CardDescription>
								</CardContent>
							</Card>
						))}
					</Carousel>
				</Example>
			</Section>

			<Section
				title="Autoplay"
				description="Advances on a timer, with a pause button. Hovering also pauses it."
			>
				<Example className="block">
					<Carousel
						loop
						autoplay={4000}
						counter
						dots={false}
						label="Highlights"
						className="w-full"
					>
						{Array.from({ length: 4 }, (_, i) => (
							<Panel key={i} n={i} />
						))}
					</Carousel>
				</Example>
			</Section>

			<MetaFooter meta={carouselMeta} />
		</>
	)
}

# FeatureGridBlock

A feature section: an overline, an h2 and a lede over a grid of article cards, each with an icon in a well, a title and one sentence — 1, 2 then 3 columns.

**Intent:** Reach for this to explain what a product does in six or fewer points. For a sequence (first this, then that), use StepsBlock; for one proof point with numbers, TestimonialBlock.

**Block:** Marketing · section

## Notes

- Copied from the LandingPage page shell's features section.
- Six features fill 3 × 2 evenly; keep the count a multiple of three, or drop to cols={{ lg: 2 }}.
- Each body is one sentence. A feature that needs a paragraph needs its own section.
- Icons sit in a `sable-well`, which derives its fill from the card surface it is on.

## Accessibility

- Each feature is an <article> with an h3 under the section's h2.
- The icons are decorative; each title says what the feature is.

## Source

```tsx
import { useId } from "react"
import { Card, CardContent, cn, Grid, Icon, Region, Stack } from "@sableui/react"

const intro = {
	eyebrow: "Why Sable",
	title: "A design system with the rules written down",
	lede: "The decisions a senior designer would make are encoded once, so every screen your team or your agent builds starts from them.",
}

const features = [
	{ icon: "component", title: "Behavior built in", body: "Focus management, keyboard navigation, and ARIA come from Base UI primitives under every control." },
	{ icon: "eyedropper", title: "Semantic tokens end to end", body: "Re-theme the whole product, light and dark, from one preset without touching a component." },
	{ icon: "layout", title: "Pages, not just parts", body: "Landing, dashboard, settings, auth, and list-detail shells to copy and adapt." },
	{ icon: "book", title: "A contract agents can read", body: "registry.json, llms.txt, and a CLI hand agents the exact props, examples, and rules." },
	{ icon: "circle-check", title: "Lint that knows the design", body: "sable-lint flags raw colors, hand-built controls, and motion that ignores reduced motion." },
	{ icon: "play", title: "Motion with an off switch", body: "Named recipes run on one scale variable, so reduced motion stops every transition at once." },
]

export interface FeatureGridBlockProps {
	className?: string
}

export function FeatureGridBlock({ className }: FeatureGridBlockProps) {
	const titleId = useId()
	return (
		<Region as="section" aria-labelledby={titleId} max="wide" className={cn("w-full py-16 sm:py-24", className)}>
			<Stack gap={10}>
				<Stack gap={3} className="max-w-2xl">
					<p className="text-overline text-muted-foreground">{intro.eyebrow}</p>
					<h2 id={titleId} className="text-balance text-heading-1">
						{intro.title}
					</h2>
					<p className="text-body-lg text-muted-foreground">{intro.lede}</p>
				</Stack>
				<Grid cols={{ base: 1, sm: 2, lg: 3 }} gap={4}>
					{features.map((feature) => (
						<Card key={feature.title} render={<article />} className="h-full">
							<CardContent className="flex flex-col gap-3">
								<span className="grid size-10 place-items-center rounded-md sable-well">
									<Icon name={feature.icon} className="text-xl" />
								</span>
								<h3 className="pt-2 text-title-lg">{feature.title}</h3>
								<p className="text-body-sm text-muted-foreground">{feature.body}</p>
							</CardContent>
						</Card>
					))}
				</Grid>
			</Stack>
		</Region>
	)
}
```

import { useId } from "react"
import { Card, CardContent } from "../components/card"
import { Icon } from "../icon"
import { cn } from "../lib/cn"
import { Grid, Region, Stack } from "../layout"

// ---block-code---
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

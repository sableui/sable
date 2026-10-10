import { Icon } from "../icon"
import { Badge } from "../components/badge"
import { Button } from "../components/button"
import { Card, CardContent } from "../components/card"
import { Reveal } from "../motion"
import { Grid, Region, Row, Stack } from "../layout"

// ---pattern-code---
const features = [
	{
		icon: "sparkles" as const,
		title: "Own the surface",
		body: "Semantic tokens end-to-end — re-theme the whole product without touching a component.",
	},
	{
		icon: "component" as const,
		title: "Behavior included",
		body: "Focus, keyboard nav, and ARIA ride on Base UI primitives under every surface.",
	},
	{
		icon: "layout" as const,
		title: "Pages, not just parts",
		body: "Purpose-named regions, an 8px rhythm, and canonical page shells for the routes every product needs.",
	},
]

export function LandingPage() {
	return (
		<div className="min-h-dvh bg-background">
			<header>
				<Region as="nav" aria-label="Main" className="grid h-16 grid-cols-[1fr_auto_1fr] items-center">
					<span className="justify-self-start text-title-sm">Sable</span>
					<Row gap={1} className="justify-self-center max-sm:hidden">
						<Button variant="ghost" size="sm" render={<a href="/docs" />}>
							Docs
						</Button>
						<Button variant="ghost" size="sm" render={<a href="/patterns" />}>
							Patterns
						</Button>
						<Button variant="ghost" size="sm" render={<a href="/themes" />}>
							Themes
						</Button>
					</Row>
					<Button size="sm" className="justify-self-end" render={<a href="/signup" />}>
						Get started
					</Button>
				</Region>
			</header>
			<main>
				<Region as="section" max="wide" className="py-24">
					<Stack gap={4} align="center" className="text-center">
						<Badge appearance="outline" size="sm">
							Now in beta
						</Badge>
						<h1 className="max-w-4xl text-balance text-display-2xl">
							Ship product UI your agents can't get wrong
						</h1>
						<p className="max-w-(--measure-prose) text-body-lg text-muted-foreground">
							An owned, themeable component system with enforced tokens, typography,
							and motion — documented for machines as carefully as for people.
						</p>
						<Row gap={2} justify="center">
							<Button size="cta">Get started</Button>
							<Button size="cta" variant="outline">
								Read the docs
							</Button>
						</Row>
					</Stack>
				</Region>
				<Region as="section" max="wide" className="pb-24">
					<Reveal>
						{/* Three-up that reflows on its own width (minItemWidth), one Card
						    per feature — never a hand-drawn bordered grid. */}
						<Grid minItemWidth="calc(var(--spacing) * 64)">
							{features.map((feature) => (
								<Card key={feature.title}>
									<CardContent className="flex flex-col gap-2">
										<Icon name={feature.icon} className="text-xl text-muted-foreground" />
										<h2 className="text-title-lg">{feature.title}</h2>
										<p className="text-body-sm text-muted-foreground">{feature.body}</p>
									</CardContent>
								</Card>
							))}
						</Grid>
					</Reveal>
				</Region>
			</main>
			<footer className="border-t border-border">
				<Region className="flex h-16 items-center justify-between">
					<span className="text-caption text-muted-foreground">© 2026 Sable</span>
					<Row gap={3}>
						<a href="/github" className="text-caption text-muted-foreground motion-interactive hover:text-foreground">
							GitHub
						</a>
						<a href="/changelog" className="text-caption text-muted-foreground motion-interactive hover:text-foreground">
							Changelog
						</a>
					</Row>
				</Region>
			</footer>
		</div>
	)
}

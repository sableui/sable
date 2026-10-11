# HeroBlock

A centred hero: an outline Badge eyebrow, the page's h1 at display size, a lede, a primary and an outline call to action, and an install command in a CodeBlock.

**Intent:** Reach for this to open a product or developer-tool landing page. A brand page that leads with a product scene beside the headline is the BrandLandingPage page shell's hero.

**Block:** Marketing · section

## Notes

- Copied from the LandingPage page shell's hero.
- The headline is the page's only h1 — place one HeroBlock per page.
- Two actions, one primary. The install command is the third, quieter way in for developers who already decided.
- The lede is capped at the prose measure and the headline at max-w-4xl, so both stay readable on wide screens.

## Accessibility

- Calls to action are links styled as Buttons (render={<a />}), because they navigate.
- The CodeBlock's copy button is labelled and announces when it has copied.

## Source

```tsx
import { Badge, Button, cn, CodeBlock, Icon, Region, Row, Stack } from "@sableui/react"

const hero = {
	eyebrow: "Open source · MIT licensed",
	title: "Product UI your agents can't get wrong",
	lede: "Sable is a themeable React component library with enforced tokens, typography, and motion, documented for coding agents as carefully as for people.",
	primary: { label: "Get started", href: "/docs/getting-started" },
	secondary: { label: "Browse components", href: "/components" },
	install: "pnpm add @sableui/react",
}

export interface HeroBlockProps {
	className?: string
}

export function HeroBlock({ className }: HeroBlockProps) {
	return (
		<Region as="section" max="wide" className={cn("w-full py-16 sm:py-24", className)}>
			<Stack gap={8} align="center">
				<Stack gap={4} align="center" className="text-center">
					<Badge appearance="outline" size="sm" icon={<Icon name="sparkles" />}>
						{hero.eyebrow}
					</Badge>
					<h1 className="max-w-4xl text-balance text-display-lg sm:text-display-2xl">{hero.title}</h1>
					<p className="max-w-(--measure-prose) text-pretty text-body-lg text-muted-foreground">{hero.lede}</p>
					<Row gap={2} justify="center" wrap className="pt-2">
						<Button size="cta" render={<a href={hero.primary.href} />}>
							{hero.primary.label}
						</Button>
						<Button size="cta" variant="outline" render={<a href={hero.secondary.href} />}>
							{hero.secondary.label}
						</Button>
					</Row>
				</Stack>
				<div className="w-full max-w-sm">
					<CodeBlock prompt="$" code={hero.install} />
				</div>
			</Stack>
		</Region>
	)
}
```

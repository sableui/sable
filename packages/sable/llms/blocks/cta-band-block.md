# CtaBandBlock

A closing call to action: a centred h2 and one-line lede on a card, with a primary and an outline action.

**Intent:** Reach for this as the last section before the footer, repeating the hero's primary action once the reader has seen the case. Mid-page prompts to sign up belong inline, not in a band.

**Block:** Marketing · section

## Notes

- Copied from the LandingPage page shell's closing call to action.
- The primary action matches the hero's, so the page asks for one thing twice rather than two things once.
- Sitting on a Card lifts it from the page without a coloured band, so it follows any preset.

## Accessibility

- The section is labelled by its h2.
- Both actions are links styled as Buttons, because they navigate.

## Source

```tsx
import { useId } from "react"
import { Button, Card, CardContent, cn, Region, Row, Stack } from "@sableui/react"

const cta = {
	title: "Build the product, not another component library",
	lede: "Install Sable, pick a preset, and ship the first screen today.",
	primary: { label: "Get started", href: "/docs/getting-started" },
	secondary: { label: "Star on GitHub", href: "/github" },
}

export interface CtaBandBlockProps {
	className?: string
}

export function CtaBandBlock({ className }: CtaBandBlockProps) {
	const titleId = useId()
	return (
		<Region as="section" aria-labelledby={titleId} max="wide" className={cn("w-full py-16", className)}>
			<Card>
				<CardContent>
					<Stack gap={4} align="center" className="py-8 text-center sm:py-12">
						<h2 id={titleId} className="max-w-2xl text-balance text-heading-1">
							{cta.title}
						</h2>
						<p className="max-w-(--measure-prose) text-body-lg text-muted-foreground">{cta.lede}</p>
						<Row gap={2} justify="center" wrap className="pt-2">
							<Button size="cta" render={<a href={cta.primary.href} />}>
								{cta.primary.label}
							</Button>
							<Button size="cta" variant="outline" render={<a href={cta.secondary.href} />}>
								{cta.secondary.label}
							</Button>
						</Row>
					</Stack>
				</CardContent>
			</Card>
		</Region>
	)
}
```

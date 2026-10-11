import { useId } from "react"
import { Button } from "../components/button"
import { Card, CardContent } from "../components/card"
import { cn } from "../lib/cn"
import { Region, Row, Stack } from "../layout"

// ---block-code---
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

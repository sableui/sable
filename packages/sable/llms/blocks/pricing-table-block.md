# PricingTableBlock

A three-tier pricing section: heading, a Monthly/Yearly ToggleGroup, and three equal-height plan cards with the recommended one outlined in primary and badged "Most popular".

**Intent:** Reach for this on a pricing page or the pricing band of a landing page, to compare plans side by side. A single plan on offer (an upgrade prompt, a paywall) is PricingCardBlock.

**Block:** Commerce · section

## Notes

- One featured tier at most: it takes the primary button and a primary outline; the others take outline buttons so the recommendation is unmistakable.
- Cards stretch to the tallest one and push their buttons to the bottom, so the calls to action line up across the row.
- The yearly saving is stated in the toggle itself, where the choice is made. `onChoose` receives the tier id and the period showing.

## Accessibility

- Each plan is an <article> with an h3 under the section's h2, so the tiers are navigable by heading.
- The ToggleGroup is labelled "Billing period"; prices update in place and stay in the reading order of each card.

## Source

```tsx
import { useState, useId } from "react"
import { Badge, Button, Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, cn, Grid, Icon, Region, Stack, Toggle, ToggleGroup } from "@sableui/react"

const tiers = [
	{
		id: "starter",
		name: "Starter",
		blurb: "For one person shipping their first editions.",
		monthly: 0,
		yearly: 0,
		cta: "Start for free",
		featured: false,
		features: ["3 live editions", "Collector profiles", "Community support"],
	},
	{
		id: "studio",
		name: "Studio",
		blurb: "For working artists with a steady release schedule.",
		monthly: 20,
		yearly: 16,
		cta: "Start free trial",
		featured: true,
		features: ["Unlimited editions", "Scheduled drops", "Sales analytics", "Priority support"],
	},
	{
		id: "collective",
		name: "Collective",
		blurb: "For galleries and teams releasing together.",
		monthly: 48,
		yearly: 40,
		cta: "Talk to sales",
		featured: false,
		features: ["Everything in Studio", "Up to 10 seats", "Shared payouts", "Roles and approvals"],
	},
]

type Period = "monthly" | "yearly"

export interface PricingTableBlockProps {
	className?: string
	/** Called with the chosen tier and the billing period showing. */
	onChoose?: (tier: string, period: Period) => void
}

export function PricingTableBlock({ className, onChoose }: PricingTableBlockProps) {
	const [period, setPeriod] = useState<Period>("yearly")
	const titleId = useId()
	return (
		<Region as="section" aria-labelledby={titleId} max="wide" className={cn("w-full py-16", className)}>
			<Stack gap={10}>
				<Stack gap={4} align="center" className="text-center">
					<h2 id={titleId} className="text-balance text-heading-1">
						Pricing that grows with your practice
					</h2>
					<p className="max-w-(--measure-prose) text-body-lg text-muted-foreground">
						Every plan includes unlimited collectors and no fees on your first $1,000 in sales.
					</p>
					<ToggleGroup value={[period]} onValueChange={(v: unknown[]) => v[0] && setPeriod(v[0] as Period)} aria-label="Billing period">
						<Toggle value="monthly">Monthly</Toggle>
						<Toggle value="yearly">Yearly · save 20%</Toggle>
					</ToggleGroup>
				</Stack>
				<Grid cols={{ base: 1, md: 3 }} gap={4} className="items-stretch">
					{tiers.map((tier) => (
						<Card
							key={tier.id}
							render={<article />}
							className={cn("flex flex-col", tier.featured && "border-primary ring-1 ring-primary")}
						>
							<CardHeader>
								<CardTitle render={<h3 />}>{tier.name}</CardTitle>
								<CardDescription>{tier.blurb}</CardDescription>
								{tier.featured ? (
									<CardAction>
										<Badge tone="edition" size="sm">
											Most popular
										</Badge>
									</CardAction>
								) : null}
							</CardHeader>
							<CardContent className="flex flex-1 flex-col gap-5">
								<div className="flex items-baseline gap-1.5">
									<span className="text-heading-2">${tier[period]}</span>
									<span className="text-body-sm text-muted-foreground">per seat / month</span>
								</div>
								<ul className="flex flex-col gap-2 text-body-sm">
									{tier.features.map((feature) => (
										<li key={feature} className="flex items-center gap-2">
											<Icon name="check" className="text-success" />
											{feature}
										</li>
									))}
								</ul>
							</CardContent>
							<CardFooter>
								<Button className="w-full" variant={tier.featured ? "primary" : "outline"} onClick={() => onChoose?.(tier.id, period)}>
									{tier.cta}
								</Button>
							</CardFooter>
						</Card>
					))}
				</Grid>
			</Stack>
		</Region>
	)
}
```

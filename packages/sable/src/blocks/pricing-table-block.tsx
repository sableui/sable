import { useId, useState } from "react"
import { Badge } from "../components/badge"
import { Button } from "../components/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/card"
import { Toggle, ToggleGroup } from "../components/toggle"
import { Icon } from "../icon"
import { cn } from "../lib/cn"
import { Grid, Region, Stack } from "../layout"

// ---block-code---
const tiers = [
	{
		id: "starter",
		name: "Starter",
		blurb: "For one person getting a first project going.",
		monthly: 0,
		yearly: 0,
		cta: "Start for free",
		featured: false,
		features: ["3 active projects", "Shared docs", "Community support"],
	},
	{
		id: "studio",
		name: "Studio",
		blurb: "For small teams shipping on a steady schedule.",
		monthly: 20,
		yearly: 16,
		cta: "Start free trial",
		featured: true,
		features: ["Unlimited projects", "Scheduled reports", "Usage analytics", "Priority support"],
	},
	{
		id: "business",
		name: "Business",
		blurb: "For companies running several teams at once.",
		monthly: 48,
		yearly: 40,
		cta: "Talk to sales",
		featured: false,
		features: ["Everything in Studio", "Up to 10 seats", "SSO and audit log", "Roles and approvals"],
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
						Pricing that grows with your team
					</h2>
					<p className="max-w-(--measure-prose) text-body-lg text-muted-foreground">
						Every plan includes unlimited guests, and you can switch plans at any time.
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
							className={cn("flex flex-col", tier.featured && "outline-primary ring-1 ring-primary")}
						>
							<CardHeader>
								<CardTitle render={<h3 />}>{tier.name}</CardTitle>
								<CardDescription>{tier.blurb}</CardDescription>
								{tier.featured ? (
									<CardAction>
										<Badge tone="1" size="sm">
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

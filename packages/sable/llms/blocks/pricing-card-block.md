# PricingCardBlock

A single-plan pricing card: a Monthly/Yearly ToggleGroup, the price and billing note, a checked feature list, and one full-width call to action.

**Intent:** Reach for this when one plan is on offer — an upgrade prompt, a paywall, a plan summary in billing settings. Comparing several tiers side by side is a pricing table, not three of these.

**Block:** Commerce · card · designed for 18rem–20rem wide (fills its container up to the max)

## Notes

- The period switch is a ToggleGroup (a segmented control), not Tabs: it changes a value in place rather than showing another panel.
- The price is a heading tier because it is the card's headline; its unit and billing note sit beside and below it in muted body text.
- `onStart` receives the period showing, so checkout opens on the plan the person was looking at.

## Accessibility

- The ToggleGroup carries aria-label="Billing period"; each Toggle's text is its name.
- The check icons are decorative beside each feature's text.

## Source

```tsx
import { useState } from "react"
import { Button, Card, CardContent, cn, Icon, Toggle, ToggleGroup } from "@sableui/react"

const plan = {
	monthly: { price: "$20", note: "Billed monthly. Cancel anytime." },
	yearly: { price: "$16", note: "Billed $192 yearly. You save 20%." },
	features: ["Unlimited projects", "Version history", "Priority support"],
}

type Period = "monthly" | "yearly"

export interface PricingCardBlockProps {
	className?: string
	/** false drops the card's surface and border — for a muted section that already frames it. */
	framed?: boolean
	/** Called with the billing period showing when the trial starts. */
	onStart?: (period: Period) => void
}

export function PricingCardBlock({ className, framed = true, onStart }: PricingCardBlockProps) {
	const [period, setPeriod] = useState<Period>("yearly")
	return (
		<Card variant={framed ? "default" : "flat"} className={cn("w-full max-w-xs", className)}>
			<CardContent className="flex flex-col gap-5">
				<ToggleGroup
					value={[period]}
					onValueChange={(v: unknown[]) => v[0] && setPeriod(v[0] as Period)}
					aria-label="Billing period"
					className="w-full"
				>
					<Toggle value="monthly" className="flex-1">
						Monthly
					</Toggle>
					<Toggle value="yearly" className="flex-1">
						Yearly
					</Toggle>
				</ToggleGroup>
				<div className="flex flex-col gap-1">
					<div className="flex items-baseline gap-1.5">
						<span className="text-heading-2">{plan[period].price}</span>
						<span className="text-body-sm text-muted-foreground">per seat / month</span>
					</div>
					<span className="text-body-sm text-muted-foreground">{plan[period].note}</span>
				</div>
				<ul className="flex flex-col gap-2 text-body-sm">
					{plan.features.map((feature) => (
						<li key={feature} className="flex items-center gap-2">
							<Icon name="check" className="text-success" />
							{feature}
						</li>
					))}
				</ul>
				<Button className="w-full" onClick={() => onStart?.(period)}>
					Start free trial
				</Button>
			</CardContent>
		</Card>
	)
}
```

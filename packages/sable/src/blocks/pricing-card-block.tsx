import { useState } from "react"
import { Button } from "../components/button"
import { Card, CardContent } from "../components/card"
import { Toggle, ToggleGroup } from "../components/toggle"
import { Icon } from "../icon"
import { cn } from "../lib/cn"

// ---block-code---
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

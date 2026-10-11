# RevenueBreakdownBlock

A stat card with a breakdown: the KPI in the metric mono tier, its trend Badge, a SegmentedBar of how the total divides, and a StatusDot legend.

**Intent:** Reach for this when a headline number is worth splitting into a few categories — revenue by product, storage by type, tickets by priority. A plain KPI with no split is a smaller stat card (see DashboardPage's stat row).

**Block:** Dashboard · card · designed for 18rem–20rem wide (fills its container up to the max)

## Notes

- The value is `text-mono-xl` — tabular figures, never a heading tier — and the label above it is CardDescription.
- The legend reflows from two columns to one by measuring in em, so larger type or a narrower card never truncates a label.
- Each category keeps the same tone in the bar and its legend dot; reuse those tones wherever the category appears.

## Accessibility

- The SegmentedBar is one image whose name reads every share; the legend repeats it visually and is aria-hidden so it is not announced twice.
- The trend Badge states the change as text (+8.2%), not by colour.

## Source

```tsx
import { Badge, Card, CardAction, CardContent, CardDescription, CardHeader, cn, Grid, SegmentedBar, StatusDot } from "@sableui/react"

const revenue = { label: "Revenue this month", total: "$12,480", change: "+8.2%" }

const segments = [
	{ label: "Editions", value: 42, tone: "edition" },
	{ label: "Collectibles", value: 27, tone: "collectible" },
	{ label: "Standard", value: 19, tone: "standard" },
	{ label: "Commissions", value: 12, tone: "info" },
] as const

export interface RevenueBreakdownBlockProps {
	className?: string
	/** false drops the card's surface and border — for a muted section that already frames it. */
	framed?: boolean
}

export function RevenueBreakdownBlock({ className, framed = true }: RevenueBreakdownBlockProps) {
	return (
		<Card variant={framed ? "default" : "flat"} className={cn("w-full max-w-xs", className)}>
			<CardHeader>
				<CardDescription>{revenue.label}</CardDescription>
				<CardAction>
					<Badge tone="success" size="sm">
						{revenue.change}
					</Badge>
				</CardAction>
			</CardHeader>
			<CardContent className="flex flex-col gap-4 pt-2">
				<span className="text-mono-xl">{revenue.total}</span>
				<SegmentedBar label="Revenue by type" segments={[...segments]} size="lg" />
				{/* Two columns while each entry fits whole, one when they would not:
				    sized in em, so a larger type or a narrower card drops to one.
				    aria-hidden: the bar already reads every share aloud. */}
				<Grid aria-hidden minItemWidth="9.5em" gap="calc(var(--spacing) * 1.5) calc(var(--spacing) * 4)">
					{segments.map((s) => (
						<div key={s.label} className="flex items-center gap-2 text-body-sm">
							<StatusDot tone={s.tone} />
							<span className="flex-1 text-muted-foreground">{s.label}</span>
							<span className="text-mono-caption">{s.value}%</span>
						</div>
					))}
				</Grid>
			</CardContent>
		</Card>
	)
}
```

# StatRowBlock

A KPI row: four stat cards, each a label, the value in the metric mono tier, and a trend Badge with its comparison note — 2 × 2 on a phone, one row from xl.

**Intent:** Reach for this at the top of a dashboard or report, above the tables and charts it summarises. One headline number worth splitting into categories is RevenueBreakdownBlock.

**Block:** Dashboard · section

## Notes

- Copied from the DashboardPage page shell's stat row.
- Values are `text-mono-xl` — tabular figures, never a heading tier — so the four numbers align digit for digit.
- The trend Badge sits with its note in CardContent, so the value keeps the full card width when the row folds to 2 × 2.
- Keep it to four. A fifth stat is a sign one of them belongs in a table.

## Accessibility

- The trend is stated in text (+8.2%) with an arrow icon; the tone is reinforcement, not the signal.
- Each card's label is read before its value, in source order.

## Source

```tsx
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, cn, Grid, Icon, Row } from "@sableui/react"

const stats = [
	{ label: "Revenue", value: "$18,240", delta: "+8.2%", up: true, note: "vs. $16,857" },
	{ label: "Orders", value: "1,284", delta: "+3.1%", up: true, note: "182 first-time" },
	{ label: "New customers", value: "312", delta: "+12.4%", up: true, note: "Best month yet" },
	{ label: "Conversion", value: "3.4%", delta: "−0.2%", up: false, note: "6 open trials" },
]

export interface StatRowBlockProps {
	className?: string
}

export function StatRowBlock({ className }: StatRowBlockProps) {
	return (
		<Grid cols={{ base: 2, xl: 4 }} gap={3} className={cn("w-full", className)}>
			{stats.map((stat) => (
				<Card key={stat.label}>
					<CardHeader>
						<CardDescription>{stat.label}</CardDescription>
						<CardTitle className="text-mono-xl">{stat.value}</CardTitle>
					</CardHeader>
					<CardContent>
						<Row gap={1} wrap>
							<Badge tone={stat.up ? "success" : "warning"} size="sm" icon={<Icon name={stat.up ? "arrow-up" : "arrow-down"} />}>
								{stat.delta}
							</Badge>
							<span className="text-caption text-muted-foreground">{stat.note}</span>
						</Row>
					</CardContent>
				</Card>
			))}
		</Grid>
	)
}
```

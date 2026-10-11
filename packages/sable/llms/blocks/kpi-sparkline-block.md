# KpiSparklineBlock

A KPI row with trends: three stat cards, each the value in the metric mono tier, a Sparkline of its last twelve weeks, and the change as a Badge.

**Intent:** Reach for this at the top of a dashboard or a landing page's proof section, where each number needs its recent shape. Without the trend, StatRowBlock is calmer; for one headline trend, TrafficTrendBlock.

**Block:** Dashboard · section

## Notes

- Each sparkline is coloured by what its measure is, and the change Badge by whether it is good: churn falling is good news in a warning-toned trend.
- The sparklines draw on as the row scrolls into view.
- One column on a phone, three from sm.

## Accessibility

- Each Sparkline is an image named by the measure and the period, with its range spoken.
- The change is stated in text (+8.2% vs last quarter) with an arrow icon; colour only reinforces it.

## Source

```tsx
import { Badge, Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle, cn, Grid, Icon, Sparkline } from "@sableui/react"

const kpis = [
	{ label: "Revenue", value: "$18,240", delta: "+8.2%", up: true, trend: [12, 14, 13, 17, 16, 19, 18, 21, 20, 24, 23, 26], tone: "success" },
	{ label: "Active users", value: "3,912", delta: "+3.1%", up: true, trend: [30, 31, 29, 33, 34, 33, 36, 35, 37, 38, 37, 39], tone: "info" },
	{ label: "Churn", value: "4.1%", delta: "−0.6%", up: false, trend: [9, 8, 9, 7, 8, 6, 7, 5, 6, 4, 5, 4], tone: "warning" },
] as const

export interface KpiSparklineBlockProps {
	className?: string
}

export function KpiSparklineBlock({ className }: KpiSparklineBlockProps) {
	return (
		<Grid cols={{ base: 1, sm: 3 }} gap={3} className={cn("w-full", className)}>
			{kpis.map((kpi) => (
				<Card key={kpi.label}>
					<CardHeader>
						<CardDescription>{kpi.label}</CardDescription>
						<CardTitle className="text-mono-xl">{kpi.value}</CardTitle>
						<CardAction>
							<Sparkline label={`${kpi.label}, last 12 weeks`} data={[...kpi.trend]} variant="area" tone={kpi.tone} />
						</CardAction>
					</CardHeader>
					<CardContent>
						<Badge tone={kpi.up ? "success" : "neutral"} size="sm" icon={<Icon name={kpi.up ? "arrow-up" : "arrow-down"} />}>
							{kpi.delta} vs last quarter
						</Badge>
					</CardContent>
				</Card>
			))}
		</Grid>
	)
}
```

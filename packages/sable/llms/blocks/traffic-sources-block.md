# TrafficSourcesBlock

A share card: a donut PieChart of where a total comes from, the total in the hole, a legend, and the headline share in words in the footer.

**Intent:** Reach for this for a split of one total into four or fewer parts — traffic sources, revenue by plan, tickets by channel. More parts, or values to compare exactly, belong in a horizontal BarChart.

**Block:** Dashboard · card · designed for 18rem–24rem wide (fills its container up to the max)

## Notes

- The total sits in the donut's hole, so the card answers "how many" and "from where" at once.
- The footer puts the biggest share in a sentence — the takeaway does not depend on reading the slices.
- The slices sweep in clockwise as the card scrolls into view.

## Accessibility

- The chart's data table lists every source and its count; the legend repeats it visually.
- Hovering or arrowing through the slices pulls each out and announces it.

## Source

```tsx
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, cn, PieChart } from "@sableui/react"

const sources = [
	{ source: "Search", visitors: 4280 },
	{ source: "Direct", visitors: 2910 },
	{ source: "Social", visitors: 1840 },
	{ source: "Email", visitors: 960 },
]

const total = sources.reduce((sum, s) => sum + s.visitors, 0)

export interface TrafficSourcesBlockProps {
	className?: string
	/** false drops the card's surface and border — for a muted section that already frames it. */
	framed?: boolean
}

export function TrafficSourcesBlock({ className, framed = true }: TrafficSourcesBlockProps) {
	return (
		<Card variant={framed ? "default" : "flat"} className={cn("w-full max-w-sm", className)}>
			<CardHeader>
				<CardTitle render={<h2 />}>Traffic sources</CardTitle>
				<CardDescription>Where this month's visitors came from.</CardDescription>
			</CardHeader>
			<CardContent>
				<PieChart
					label="Visitors by source, this month"
					data={sources}
					index="source"
					valueKey="visitors"
					donut
					centerLabel={{ value: total.toLocaleString("en-US"), label: "Visitors" }}
				/>
			</CardContent>
			<CardFooter className="text-body-sm text-muted-foreground">
				Search brings {Math.round((sources[0].visitors / total) * 100)}% of visitors.
			</CardFooter>
		</Card>
	)
}
```

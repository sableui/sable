import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/card"
import { PieChart } from "../components/pie-chart"
import { cn } from "../lib/cn"

// ---block-code---
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

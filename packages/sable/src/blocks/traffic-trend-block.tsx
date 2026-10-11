import { useState } from "react"
import { AreaChart } from "../components/area-chart"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/card"
import { Toggle, ToggleGroup } from "../components/toggle"
import { Icon } from "../icon"
import { cn } from "../lib/cn"

// ---block-code---
/** 90 days of visitors — replace with your own rows ({ date, desktop, mobile }). */
const days = Array.from({ length: 90 }, (_, i) => {
	const wave = Math.sin(i / 6) * 60 + Math.sin(i / 2.3) * 25
	return {
		date: new Date(2026, 6, 1 + i).toISOString().slice(0, 10),
		desktop: Math.round(240 + wave + (i % 7) * 9),
		mobile: Math.round(160 + wave * 0.7 + ((i * 3) % 11) * 6),
	}
})

const series = [
	{ key: "desktop", label: "Desktop" },
	{ key: "mobile", label: "Mobile" },
]

const ranges = [
	{ id: "90d", label: "3 months", days: 90 },
	{ id: "30d", label: "30 days", days: 30 },
	{ id: "7d", label: "7 days", days: 7 },
]

const shortDate = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" })

export interface TrafficTrendBlockProps {
	className?: string
	/** false drops the card's surface and border — for a muted section that already frames it. */
	framed?: boolean
}

export function TrafficTrendBlock({ className, framed = true }: TrafficTrendBlockProps) {
	const [range, setRange] = useState("90d")
	const shown = days.slice(-(ranges.find((r) => r.id === range)?.days ?? 90))
	return (
		<Card variant={framed ? "default" : "flat"} className={cn("w-full max-w-3xl", className)}>
			<CardHeader>
				<CardTitle render={<h2 />}>Visitors</CardTitle>
				<CardDescription>Desktop and mobile, by day.</CardDescription>
				<CardAction>
					<ToggleGroup value={[range]} onValueChange={(v: unknown[]) => v[0] && setRange(String(v[0]))} aria-label="Time range">
						{ranges.map((r) => (
							<Toggle key={r.id} value={r.id}>
								{r.label}
							</Toggle>
						))}
					</ToggleGroup>
				</CardAction>
			</CardHeader>
			<CardContent>
				<AreaChart
					label={`Visitors per day, last ${ranges.find((r) => r.id === range)?.label}`}
					data={shown}
					index="date"
					series={series}
					indexFormatter={shortDate}
					tooltip={{ labelFormatter: (d) => new Date(`${d}T00:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) }}
					stacked
					gradient
					className="h-64"
				/>
			</CardContent>
			<CardFooter className="gap-1.5 text-body-sm">
				<Icon name="arrow-up" className="text-success" />
				<span>
					Up 5.2% on the previous period <span className="text-muted-foreground">· desktop leads every week</span>
				</span>
			</CardFooter>
		</Card>
	)
}

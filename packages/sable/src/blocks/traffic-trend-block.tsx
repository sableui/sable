"use client"

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

// One formatter, built once: toLocaleDateString builds a new one per call,
// and a chart formats every tick on every render.
const SHORT_DATE = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" })
const shortDate = (iso: string) => SHORT_DATE.format(new Date(`${iso}T00:00:00`))
const LONG_DATE = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" })

export interface TrafficTrendBlockProps {
	className?: string
	/** false drops the card's surface and border — for a muted section that already frames it. */
	framed?: boolean
}

export function TrafficTrendBlock({ className, framed = true }: TrafficTrendBlockProps) {
	const [range, setRange] = useState("90d")
	const shown = days.slice(-(ranges.find((r) => r.id === range)?.days ?? 90))
	return (
		<Card variant={framed ? "default" : "flat"} className={cn("@container/trend w-full max-w-3xl", className)}>
			<CardHeader className="@max-sm/trend:has-data-[slot=card-action]:grid-cols-1">
				<CardTitle render={<h2 />}>Visitors</CardTitle>
				<CardDescription>Desktop and mobile, by day.</CardDescription>
				{/* Beside the title on a wide card; under it on a narrow one, where three
				    ranges would squeeze the title and description into a sliver. */}
				<CardAction className="@max-sm/trend:col-start-1 @max-sm/trend:row-span-1 @max-sm/trend:row-start-auto @max-sm/trend:mt-2 @max-sm/trend:justify-self-start">
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
					tooltip={{ labelFormatter: (d) => LONG_DATE.format(new Date(`${d}T00:00:00`)) }}
					stacked
					gradient
					className="h-64"
				/>
			</CardContent>
			{/* One line where it fits. In a narrow card the observation takes its own
			    line (and drops the separator) rather than wrapping mid-phrase. */}
			<CardFooter className="flex-wrap gap-x-1.5 gap-y-0.5 text-body-sm">
				<Icon name="arrow-up" className="text-success" />
				<span>Up 5.2% on the previous period</span>
				<span className="text-muted-foreground @max-md/trend:basis-full">
					<span aria-hidden className="@max-md/trend:hidden">· </span>
					Desktop leads every week
				</span>
			</CardFooter>
		</Card>
	)
}

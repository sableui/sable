"use client"

import { useState } from "react"
import { BarChart } from "../components/bar-chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/card"
import { Toggle, ToggleGroup } from "../components/toggle"
import { cn } from "../lib/cn"

// ---block-code---
/** The 30 days to today — replace with your own rows ({ date, desktop, mobile }). */
const today = new Date()
const days = Array.from({ length: 30 }, (_, i) => ({
	date: new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() - 29 + i)).toISOString().slice(0, 10),
	desktop: Math.round(320 + Math.sin(i / 3) * 90 + (i % 5) * 14),
	mobile: Math.round(260 + Math.cos(i / 4) * 80 + (i % 4) * 18),
}))

const series = [
	{ key: "desktop", label: "Desktop" },
	{ key: "mobile", label: "Mobile" },
] as const

// One formatter, built once: toLocaleDateString builds a new one per call,
// and a chart formats every tick on every render.
const SHORT_DATE = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" })
const shortDate = (iso: string) => SHORT_DATE.format(new Date(`${iso}T00:00:00`))

export interface DeviceComparisonBlockProps {
	className?: string
	/** false drops the card's surface and border — for a muted section that already frames it. */
	framed?: boolean
}

export function DeviceComparisonBlock({ className, framed = true }: DeviceComparisonBlockProps) {
	const [active, setActive] = useState<string>("desktop")
	const totals = Object.fromEntries(series.map((s) => [s.key, days.reduce((sum, d) => sum + d[s.key], 0)]))
	const current = series.find((s) => s.key === active) ?? series[0]
	return (
		// overflow-hidden: the square tiles meet the card's rounded corner.
		<Card variant={framed ? "default" : "flat"} className={cn("@container/devices w-full max-w-3xl overflow-hidden", className)}>
			<div className="flex flex-col border-b border-border @lg/devices:flex-row">
				<CardHeader className="flex-1 pb-[var(--card-p,--spacing(6))]">
					<CardTitle render={<h2 />}>Visitors by device</CardTitle>
					<CardDescription>The last 30 days. Pick a device to plot it.</CardDescription>
				</CardHeader>
				{/* The totals ARE the switch: one pressed tile per series. The tiles
				    divide themselves; this edge sets them off from the header, under
				    it when narrow and beside it when wide. */}
				<div className="border-t border-border @lg/devices:border-t-0 @lg/devices:border-s">
					<ToggleGroup
						appearance="tiles"
						value={[active]}
						onValueChange={(v: unknown[]) => v[0] && setActive(String(v[0]))}
						aria-label="Device"
						className="h-full"
					>
						{series.map((s) => (
							<Toggle key={s.key} value={s.key}>
								<span className="text-caption text-muted-foreground">{s.label}</span>
								<span className="text-mono-lg">{totals[s.key].toLocaleString("en-US")}</span>
							</Toggle>
						))}
					</ToggleGroup>
				</div>
			</div>
			<CardContent>
				<BarChart
					label={`${current.label} visitors per day, last 30 days`}
					data={days}
					index="date"
					series={[current]}
					indexFormatter={shortDate}
					radius={3}
					className="h-64"
				/>
			</CardContent>
		</Card>
	)
}

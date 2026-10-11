import { useState } from "react"
import { BarChart } from "../components/bar-chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/card"
import { Toggle, ToggleGroup } from "../components/toggle"
import { cn } from "../lib/cn"

// ---block-code---
/** 30 days of visitors — replace with your own rows ({ date, desktop, mobile }). */
const days = Array.from({ length: 30 }, (_, i) => ({
	date: new Date(2026, 8, 1 + i).toISOString().slice(0, 10),
	desktop: Math.round(320 + Math.sin(i / 3) * 90 + (i % 5) * 14),
	mobile: Math.round(260 + Math.cos(i / 4) * 80 + (i % 4) * 18),
}))

const series = [
	{ key: "desktop", label: "Desktop" },
	{ key: "mobile", label: "Mobile" },
] as const

const shortDate = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" })

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
		<Card variant={framed ? "default" : "flat"} className={cn("w-full max-w-3xl overflow-hidden", className)}>
			<div className="flex flex-col border-b border-border sm:flex-row">
				<CardHeader className="flex-1 pb-[var(--card-p,--spacing(6))]">
					<CardTitle render={<h2 />}>Visitors by device</CardTitle>
					<CardDescription>The last 30 days. Pick a device to plot it.</CardDescription>
				</CardHeader>
				{/* The totals ARE the switch: one pressed tile per series. */}
				<ToggleGroup
					value={[active]}
					onValueChange={(v: unknown[]) => v[0] && setActive(String(v[0]))}
					aria-label="Device"
					className="items-stretch gap-0"
				>
					{series.map((s) => (
						<Toggle
							key={s.key}
							value={s.key}
							className="h-auto flex-1 flex-col items-start justify-center gap-1 rounded-none border-border px-6 py-4 text-start text-foreground max-sm:border-t sm:border-s"
						>
							<span className="text-caption text-muted-foreground">{s.label}</span>
							<span className="text-mono-lg">{totals[s.key].toLocaleString("en-US")}</span>
						</Toggle>
					))}
				</ToggleGroup>
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

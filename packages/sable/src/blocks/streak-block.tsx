"use client"

import { useState } from "react"
import { ActivityHeatmap } from "../components/activity-heatmap"
import { Button } from "../components/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "../components/card"
import { NumberTicker } from "../components/number-ticker"
import { Pill } from "../components/pill"
import { SimpleTooltip } from "../components/tooltip"
import { Icon } from "../icon"
import { cn } from "../lib/cn"

// ---block-code---
const habit = { title: "Reading", rule: "A day counts once you read 10 pages." }

// What can be shown on the grid, and the word for one of each.
const measures = [
	{ id: "pages", label: "Pages", unit: { one: "page", other: "pages" } },
	{ id: "minutes", label: "Minutes", unit: { one: "minute", other: "minutes" } },
] as const

type Measure = (typeof measures)[number]["id"]

// Sixteen weeks ending today, as calendar days in UTC so no time zone moves one.
// Replace `log` with your own days: { date: "YYYY-MM-DD", pages, minutes }.
const DAY = 86_400_000
const today = new Date()
const last = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
const span = 16 * 7
const log = Array.from({ length: span }, (_, index) => {
	const spread = (index * 37 + 11) % 17
	const read = index >= span - 12 || (index >= 40 && index < 63) || spread >= 3
	return {
		date: new Date(last - (span - 1 - index) * DAY).toISOString().slice(0, 10),
		pages: read ? 10 + spread * 2 : 0,
		minutes: read ? 15 + ((index * 53) % 41) : 0,
	}
})

// Runs of days read: the one still going, and the longest.
const runs = log.reduce(
	(acc, day) => {
		const current = day.pages > 0 ? acc.current + 1 : 0
		return { current, longest: Math.max(acc.longest, current) }
	},
	{ current: 0, longest: 0 },
)

export interface StreakBlockProps {
	className?: string
	/** false drops the card's surface and border — for a dashboard section that already frames it. */
	framed?: boolean
	/** Called with the day, as "YYYY-MM-DD", when one is chosen on the grid. */
	onSelectDay?: (date: string) => void
}

export function StreakBlock({ className, framed = true, onSelectDay }: StreakBlockProps) {
	const [measure, setMeasure] = useState<Measure>("pages")
	const [day, setDay] = useState<string | null>(null)
	const shown = measures.find((item) => item.id === measure) ?? measures[0]

	return (
		<Card variant={framed ? "default" : "flat"} className={cn("w-full max-w-xs", className)}>
			<CardHeader>
				<CardTitle render={<h2 />}>{habit.title}</CardTitle>
				<CardDescription>Last 16 weeks</CardDescription>
				<CardAction>
					{/* The rule is a hint, not an instruction, so it can live in a tooltip.
					    The button still has its own name. */}
					<SimpleTooltip content={habit.rule}>
						<Button variant="ghost" size="icon-sm" aria-label="How a streak is counted">
							<Icon name="info" />
						</Button>
					</SimpleTooltip>
				</CardAction>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				<div className="flex items-baseline justify-between gap-3">
					<div className="flex items-baseline gap-2">
						<NumberTicker className="text-mono-xl" value={runs.current} />
						<span className="text-body-sm text-muted-foreground">{runs.current === 1 ? "day in a row" : "days in a row"}</span>
					</div>
					{/* One whole string per plural form, so it can be translated. */}
					<span className="text-body-sm text-muted-foreground">
						{runs.longest === 1 ? "Longest 1 day" : `Longest ${runs.longest} days`}
					</span>
				</div>
				<div className="flex gap-1">
					{measures.map((item) => (
						<Pill key={item.id} selected={item.id === measure} onClick={() => setMeasure(item.id)}>
							{item.label}
						</Pill>
					))}
				</div>
				{/* Changing the measure cross-fades each cell to its new level. */}
				<ActivityHeatmap
					label={`${shown.label} read, last 16 weeks`}
					data={log.map((entry) => ({ date: entry.date, value: entry[measure] }))}
					start={log[0].date}
					end={log[span - 1].date}
					unit={shown.unit}
					size="sm"
					weekdayLabels="none"
					selectedDate={day}
					onSelectDate={(date: string) => {
						setDay(date)
						onSelectDay?.(date)
					}}
				/>
			</CardContent>
		</Card>
	)
}

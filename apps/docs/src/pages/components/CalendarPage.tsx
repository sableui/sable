import { Calendar, calendarMeta } from "@sableui/react"
import { useState } from "react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

function SingleCalendar() {
	const [date, setDate] = useState<Date | undefined>(new Date())
	return (
		<div className="flex flex-col items-start gap-3">
			<Calendar mode="single" selected={date} onSelect={setDate} />
			<p className="text-body-sm text-muted-foreground">
				{date ? date.toDateString() : "No date selected"}
			</p>
		</div>
	)
}

// Mirrors react-day-picker's DateRange shape so the docs page stays free of a
// direct react-day-picker dependency.
type DateRange = { from: Date | undefined; to?: Date | undefined }

function RangeCalendar() {
	const [range, setRange] = useState<DateRange | undefined>()
	return (
		<div className="flex flex-col items-start gap-3">
			<Calendar
				mode="range"
				numberOfMonths={2}
				selected={range}
				onSelect={setRange}
			/>
			<p className="text-body-sm text-muted-foreground">
				{range?.from
					? `${range.from.toDateString()} → ${
							range.to ? range.to.toDateString() : "…"
						}`
					: "No range selected"}
			</p>
		</div>
	)
}

export function CalendarPage() {
	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="Calendar"
				lede={ledeFor(calendarMeta)}
			/>

			<Section title="Single date">
				<Example code={'const [date, setDate] = useState<Date>()\n<Calendar mode="single" selected={date} onSelect={setDate} />'}>
					<SingleCalendar />
				</Example>
			</Section>

			<Section
				title="Range"
				description="Pick a start and an end. Two months side by side make longer ranges easier."
			>
				<Example code={'const [range, setRange] = useState<DateRange>()\n<Calendar mode="range" numberOfMonths={2} selected={range} onSelect={setRange} />'}>
					<RangeCalendar />
				</Example>
			</Section>

			<Section
				title="Disabled days"
				description="Days that can't be picked are dimmed. Here, every day before today."
			>
				<Example code='<Calendar mode="single" disabled={{ before: new Date() }} />'>
					<Calendar mode="single" disabled={{ before: new Date() }} />
				</Example>
			</Section>

			<MetaFooter meta={calendarMeta} />
		</>
	)
}

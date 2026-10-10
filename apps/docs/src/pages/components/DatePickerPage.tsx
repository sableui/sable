import { DatePicker, datePickerMeta, Field } from "@sableui/react"
import { useState, useSyncExternalStore } from "react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

/**
 * The reader's zone, named — "your local timezone" names nothing. Read on the
 * client only: the page is prerendered, and the build machine's zone is not the
 * reader's.
 */
const noopSubscribe = () => () => {}
function useTimeZone() {
	return useSyncExternalStore(
		noopSubscribe,
		() => Intl.DateTimeFormat().resolvedOptions().timeZone,
		() => "your local time zone",
	)
}

export function DatePickerPage() {
	const timeZone = useTimeZone()
	const [date, setDate] = useState<Date>()
	const [scheduled, setScheduled] = useState<Date>()
	const [when, setWhen] = useState<Date>()
	const [drop, setDrop] = useState<Date>()

	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="Date Picker"
				lede={ledeFor(datePickerMeta)}
			/>

			<Section
				title="Basic"
				description="Picking a day fills the button and closes the calendar."
			>
				<Example className="flex-col items-start gap-3">
					<DatePicker value={date} onValueChange={setDate} />
					<p className="text-body-sm text-muted-foreground">
						{date
							? `Selected: ${date.toLocaleDateString()}`
							: "No date selected yet."}
					</p>
				</Example>
			</Section>

			<Section
				title="Custom placeholder"
				description="The empty label can say what the date is for."
			>
				<Example className="flex-col items-start gap-3">
					<DatePicker
						value={scheduled}
						onValueChange={setScheduled}
						placeholder="Schedule for…"
					/>
					<p className="text-body-sm text-muted-foreground">
						{scheduled
							? `Scheduled: ${scheduled.toLocaleDateString()}`
							: "Nothing scheduled."}
					</p>
				</Example>
			</Section>

			<Section
				title="Date and time"
				description="With granularity set to minute, an hour and minute row joins the calendar. Pick the day and the time in either order; the popover stays open until you're done."
			>
				<Example className="flex-col items-start gap-3">
					<DatePicker granularity="minute" value={when} onValueChange={setWhen} />
					<p className="text-body-sm text-muted-foreground">
						{when ? `Selected: ${when.toLocaleString()}` : "Nothing selected yet."}
					</p>
				</Example>
			</Section>

			<Section
				title="Scheduled drop"
				description="Past days are disabled, the first pick lands at noon, and minutes step by 15."
			>
				<Example className="flex-col items-start gap-3">
					<DatePicker
						granularity="minute"
						value={drop}
						onValueChange={setDrop}
						minDate={new Date()}
						defaultTime="12:00"
						minuteStep={15}
						placeholder="Schedule the drop"
					/>
					<p className="text-body-sm text-muted-foreground">
						{drop ? `Drops: ${drop.toLocaleString()}` : "No drop scheduled."}
					</p>
				</Example>
			</Section>

			<Section
				title="In a Field"
				description="With a label, and helper text that names the timezone."
			>
				<Example className="!block">
					<Field
						className="w-full max-w-sm"
						label="Publish at"
						description={`Times are in ${timeZone}.`}
					>
						<DatePicker granularity="minute" defaultTime="09:00" />
					</Field>
				</Example>
			</Section>

			<Section
				title="Disabled"
				description="The field dims and the calendar won't open."
			>
				<Example>
					<DatePicker disabled placeholder="Unavailable" />
				</Example>
			</Section>

			<MetaFooter meta={datePickerMeta} />
		</>
	)
}

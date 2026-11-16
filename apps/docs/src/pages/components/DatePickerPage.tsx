import {
	Button,
	DatePicker,
	type DateRange,
	datePickerMeta,
	Field,
	Form,
	PanelSection,
	PropertyRow,
} from "@sableui/react"
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
	const [launch, setLaunch] = useState<Date>()
	const [due, setDue] = useState<Date | undefined>(() => new Date(2026, 9, 23))
	const [stay, setStay] = useState<DateRange>()
	const [opens, setOpens] = useState<Date>()
	const [submitted, setSubmitted] = useState<string>()

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
				title="Scheduled launch"
				description="Past days are disabled, the first pick lands at noon, and minutes step by 15."
			>
				<Example className="flex-col items-start gap-3">
					<DatePicker
						granularity="minute"
						value={launch}
						onValueChange={setLaunch}
						minDate={new Date()}
						defaultTime="12:00"
						minuteStep={15}
						placeholder="Schedule the launch"
					/>
					<p className="text-body-sm text-muted-foreground">
						{launch ? `Launches: ${launch.toLocaleString()}` : "No launch scheduled."}
					</p>
				</Example>
			</Section>

			<Section
				title="Date range"
				description='mode="range" holds both ends in one control. The first pick sets the start, the second the end, in either order, and the popover closes.'
			>
				<Example className="flex-col items-start gap-3">
					<DatePicker
						mode="range"
						value={stay}
						onValueChange={setStay}
						minDate={new Date()}
						placeholder="Check-in – check-out"
					/>
					<p className="text-body-sm text-muted-foreground">
						{stay?.from && stay.to
							? `${stay.from.toLocaleDateString()} to ${stay.to.toLocaleDateString()}`
							: stay?.from
								? "Now pick the check-out day."
								: "No dates chosen yet."}
					</p>
				</Example>
			</Section>

			<Section
				title="Time only"
				description='granularity="time" is the hour and minute row with no calendar.'
			>
				<Example className="flex-col items-start gap-3">
					<DatePicker
						granularity="time"
						value={opens}
						onValueChange={setOpens}
						minuteStep={15}
						defaultTime="09:00"
						placeholder="Opening time"
					/>
					<p className="text-body-sm text-muted-foreground">
						{opens
							? `Opens at ${opens.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
							: "No time set."}
					</p>
				</Example>
			</Section>

			<Section
				title="In a form"
				description="With a name, the picker submits its value: yyyy-MM-dd for a day, HH:mm for a time, yyyy-MM-dd/yyyy-MM-dd for a range. A required picker blocks the submit while it is empty and moves focus to itself."
			>
				<Example className="!block">
					<Form
						className="w-full max-w-sm"
						onSubmit={(event) => {
							event.preventDefault()
							const data = new FormData(event.currentTarget)
							setSubmitted(
								[...data.entries()].map(([key, value]) => `${key}=${String(value)}`).join(", "),
							)
						}}
					>
						<Field label="Stay" required>
							<DatePicker mode="range" name="stay" minDate={new Date()} />
						</Field>
						<Field label="Arrival time">
							<DatePicker name="arrival" granularity="time" minuteStep={30} defaultTime="15:00" />
						</Field>
						<Button type="submit" variant="secondary" className="self-start">
							Book
						</Button>
						<p className="text-body-sm text-muted-foreground" aria-live="polite">
							{submitted ? `Submitted: ${submitted}` : "Nothing submitted yet."}
						</p>
					</Form>
				</Example>
			</Section>

			<Section
				title="In a toolbar"
				description='size="sm" is a rung down from the form field, the same height as an sm SelectTrigger and sm buttons in a filter row.'
			>
				<Example>
					<DatePicker size="sm" aria-label="From date" placeholder="From" />
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
				title="In an inspector"
				description='size="xs" is the property-grid rung: the inset well SelectTrigger and ScrubField use on the neighbouring rows. formatOptions writes the date the way the rest of the screen does.'
			>
				<Example
					code={`<PanelSection title="Properties">
	<PropertyRow label="Due date">
		<DatePicker size="xs" aria-label="Due date" value={due} onValueChange={setDue} formatOptions={{ month: "short", day: "numeric" }} />
	</PropertyRow>
</PanelSection>`}
				>
					<div data-density="compact" className="sable-frame sable-frame-tool w-64 overflow-hidden bg-panel">
						<PanelSection title="Properties" className="border-t-0">
							<PropertyRow label="Due date">
								<DatePicker
									size="xs"
									aria-label="Due date"
									value={due}
									onValueChange={setDue}
									formatOptions={{ month: "short", day: "numeric" }}
									className="w-28"
								/>
							</PropertyRow>
						</PanelSection>
					</div>
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

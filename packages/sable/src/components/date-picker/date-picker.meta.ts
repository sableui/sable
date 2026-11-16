import type { ComponentMeta } from "../../lib/meta"

export const datePickerMeta: ComponentMeta = {
	name: "DatePicker",
	summary:
		"Date, date-range, date-and-time or time picker: a field-shaped trigger (the Input / SelectTrigger shell) opens a Popover holding Sable's Calendar. With granularity=\"day\" selecting a day fires onValueChange and closes; granularity=\"minute\" adds an hour + minute row of Selects and keeps the time-of-day when the day changes; granularity=\"time\" is that row alone; mode=\"range\" picks a start and an end day. With a name it submits its value in a form.",
	status: "stable",
	keywords: [
		"date picker",
		"due date",
		"property row",
		"inspector",
		"calendar",
		"date input",
		"date time picker",
		"date range picker",
		"range",
		"time picker",
		"time field",
		"time",
		"schedule",
		"form",
	],
	usage: {
		description: "Use DatePicker when users need to choose one date — or, with granularity=\"minute\", one date and time; with granularity=\"time\", a time of day; with mode=\"range\", a start and an end day — from a compact control.",
		bestPractices: [
			{
				guidance: "do",
				description: "Use it in forms where a typed date alone would be error-prone.",
			},
			{
				guidance: "do",
				description: "Show clear selected and disabled states when date rules apply.",
			},
			{
				guidance: "do",
				description: "Set granularity=\"minute\" when a time matters, with a minuteStep that matches the real precision (15 for meetings, 5 for scheduled posts).",
			},
			{
				guidance: "do",
				description: "Use mode=\"range\" for a stay, a report period or a leave request — one control holding both ends — rather than two DatePickers whose order the user has to police.",
			},
			{
				guidance: "do",
				description: "Give it a name inside a form: it submits yyyy-MM-dd (a day), yyyy-MM-ddTHH:mm (a minute), HH:mm (a time) or yyyy-MM-dd/yyyy-MM-dd (a range), the formats a server already parses from native date inputs. Wrap it in <Field required> and an empty picker blocks the submit.",
			},
			{
				guidance: "dont",
				description: "Do not show a time without saying which zone it is in. A meeting time with no zone is wrong for everyone not in yours — wrap the picker in a Field whose description names the zone.",
			},
			{
				guidance: "dont",
				description: "Do not leave the format ambiguous. `03/04` is two different dates depending on the reader's locale — the trigger shows a formatted date precisely so the interpretation is not guessed.",
			},
		],
	},
	related: {
		components: [
			"Calendar",
			"Field",
		],
	},
	props: [
		{
			name: "mode",
			type: '"single" | "range"',
			default: '"single"',
			description:
				'One date, or a { from, to } range. In range mode the first pick sets the start, the second the end (in either order) and closes the popover; value, defaultValue and onValueChange take a DateRange (exported), and granularity is always "day".',
		},
		{
			name: "value",
			type: "Date | DateRange",
			description:
				"The selected date (controlled), or the { from, to } range under mode=\"range\" (to is unset while only the start is picked). When absent, the trigger shows a muted placeholder.",
		},
		{
			name: "defaultValue",
			type: "Date | DateRange",
			description: "Initial value when uncontrolled (no `value` prop).",
		},
		{
			name: "onValueChange",
			type: "((date: Date | undefined) => void) | ((range: DateRange | undefined) => void)",
			description:
				"Fired when the day is chosen or cleared, and under granularity=\"minute\" / \"time\" when the hour or minute changes. With granularity=\"day\" it also closes the popover. In range mode it fires on both picks: with only from after the first, with both after the second.",
		},
		{
			name: "onChange",
			type: "(date: Date | undefined) => void",
			description:
				"Deprecated alias for onValueChange, kept for backwards compatibility. Both fire when set; prefer onValueChange.",
			deprecated: "onValueChange",
		},
		{
			name: "granularity",
			type: '"day" | "minute" | "time"',
			default: '"day"',
			description:
				'What the picker chooses. "minute" adds an hour + minute row and keeps the popover open so day and time can be set in any order. "time" is the hour + minute row alone, with no calendar: the value is a Date that keeps its day (today when there was none).',
		},
		{
			name: "minuteStep",
			type: "number",
			default: "5",
			description: 'Minute increment for the time row (granularity="minute" or "time").',
		},
		{
			name: "defaultTime",
			type: "string",
			default: '"00:00"',
			description:
				'Time-of-day shown and applied while nothing is selected yet, as 24h "HH:mm" — the first day pick lands on this time instead of midnight (granularity="minute" or "time").',
		},
		{
			name: "placeholder",
			type: "string",
			default: '"Pick a date" ("Pick date & time" for minute, "Pick a time" for time, "Pick a date range" in range mode)',
			description: "Trigger label shown when no date is selected.",
		},
		{
			name: "disabled",
			type: "boolean",
			description: "Disable the trigger and block selection.",
		},
		{
			name: "readOnly",
			type: "boolean",
			description: "Show the value without letting it change: the popover does not open, and the submitted value is not validated.",
		},
		{
			name: "name",
			type: "string",
			description:
				"Name of the submitted value. A visually hidden input carries it into FormData: yyyy-MM-dd for a day, yyyy-MM-ddTHH:mm (local, the datetime-local format) for a minute, HH:mm for a time, and an ISO 8601 interval yyyy-MM-dd/yyyy-MM-dd for a range (empty until both ends are picked). Empty when nothing is selected. It reaches native FormData and onSubmit, not Form's onFormSubmit values object, which lists Base UI controls only.",
		},
		{
			name: "form",
			type: "string",
			description: "The id of the <form> the value belongs to, when the picker sits outside it.",
		},
		{
			name: "required",
			type: "boolean",
			description:
				"A value is needed before the form submits: the trigger is aria-required, and a native or Sable Form submit is blocked while empty, with focus moved to the trigger. A wrapping <Field required> sets it.",
		},
		{
			name: "minDate",
			type: "Date",
			description:
				"Earliest selectable day (inclusive). Earlier days are disabled and navigation is bounded.",
		},
		{
			name: "maxDate",
			type: "Date",
			description:
				"Latest selectable day (inclusive). Later days are disabled and navigation is bounded.",
		},
		{
			name: "size",
			type: '"md" | "sm" | "xs"',
			default: '"md"',
			description:
				"The trigger's rung. md is the form field beside Input and Select. sm is md one rung down, the same raised field: a date filter in a toolbar beside an sm SelectTrigger and sm buttons. xs is the property-grid rung (24px in a workspace): an inset panel-field well with no border, the same shape as SelectTrigger size=\"xs\" and ScrubField on the neighbouring rows of an inspector — use it for a due date in a PropertyRow instead of a native date input.",
		},
		{
			name: "locale",
			type: "Locale (date-fns)",
			description:
				"The date-fns locale for the calendar (month and weekday names, first day of the week) and for the trigger's label, so both speak one language. Without it both are English (en-US), identical on the server and the client. import { de } from \"date-fns/locale\".",
		},
		{
			name: "formatOptions",
			type: "Intl.DateTimeFormatOptions",
			description:
				"How the trigger writes the chosen date, as Intl.DateTimeFormat options in locale (en-US without one) — { month: \"short\", day: \"numeric\" } for \"Oct 23\" where the rest of a list writes dates that way. Omitted: \"Oct 23, 2026\" (with \"at 14:30\" under granularity=\"minute\").",
		},
		{
			name: "timeLabel",
			type: "string",
			default: '"Time"',
			description: "Accessible name of the time row's group.",
		},
		{
			name: "hourLabel",
			type: "string",
			default: '"Hour"',
			description: "Accessible name of the hour Select.",
		},
		{
			name: "minuteLabel",
			type: "string",
			default: '"Minute"',
			description: "Accessible name of the minute Select.",
		},
		{
			name: "className",
			type: "string",
			description: "Extra classes merged onto the trigger.",
		},
		{
			name: "ref / id / aria-* / …",
			type: "button attributes",
			description:
				"ref and every other button attribute are forwarded to the trigger, so a wrapping Field ties its label to the picker and announces its description and error, and a ref can focus it. Pass the aria attributes yourself only when labelling the picker without a Field.",
		},
	],
	tokensUsed: [
		"primary",
		"primary-foreground",
		"accent",
		"accent-foreground",
		"foreground",
		"muted-foreground",
		"popover",
		"popover-foreground",
		"border",
		"field-border",
		"field",
		"ring",
	],
	a11y: [
		"Trigger opens on click/Enter/Space; the popover traps focus and restores it to the trigger on close (Base UI Popover).",
		"The calendar grid (react-day-picker) provides a roving tabindex, arrow-key day navigation, and aria-selected on the chosen day.",
		"Navigation chevrons render through the Icon adapter and inherit the calendar's button labels.",
		"Esc and outside press dismiss the popover.",
		"In a form the value rides a visually hidden, aria-hidden input with tabIndex -1 (not type=hidden, which constraint validation skips). When a required, empty picker blocks a submit the browser focuses that input, which hands focus straight to the trigger.",
		"With granularity=\"minute\" the hour and minute Selects are full Base UI listboxes (typeahead, ARIA) labelled \"Hour\" and \"Minute\" (hourLabel / minuteLabel) inside a group named \"Time\" (timeLabel); selecting a day keeps the chosen time-of-day, so day and time can be set in any order.",
	],
	examples: [
		{
			label: "In an inspector row",
			code: `<PanelSection title="Properties">
	<PropertyRow label="Due date">
		<DatePicker size="xs" aria-label="Due date" value={due} onValueChange={setDue} formatOptions={{ month: "short", day: "numeric" }} />
	</PropertyRow>
</PanelSection>`,
		},
		{
			label: "Controlled",
			code: "const [date, setDate] = useState<Date>()\n<DatePicker value={date} onValueChange={setDate} />",
		},
		{
			label: "Custom placeholder",
			code: '<DatePicker placeholder="Schedule for…" value={date} onValueChange={setDate} />',
		},
		{
			label: "Date and time",
			code: 'const [start, setStart] = useState<Date>()\n<DatePicker granularity="minute" value={start} onValueChange={setStart} minDate={new Date()} defaultTime="09:00" minuteStep={15} />',
		},
		{
			label: "Date range",
			code: 'const [stay, setStay] = useState<DateRange>()\n<DatePicker mode="range" value={stay} onValueChange={setStay} minDate={new Date()} placeholder="Check-in – check-out" />',
		},
		{
			label: "In a form",
			code: `<Form onSubmit={(event) => { event.preventDefault(); save(new FormData(event.currentTarget)) }}>
	<Field label="Check-in" required>
		<DatePicker name="checkin" minDate={new Date()} />
	</Field>
	<Field label="Opens at">
		<DatePicker name="opens" granularity="time" minuteStep={15} defaultTime="09:00" />
	</Field>
	<Button type="submit">Book</Button>
</Form>`,
		},
		{
			label: "Localised (de from date-fns/locale)",
			code: '<DatePicker locale={de} value={date} onValueChange={setDate} placeholder="Datum wählen" />',
		},
		{
			label: "Disabled",
			code: "<DatePicker disabled />",
		},
		{
			label: "Bounded (no past dates)",
			code: "<DatePicker value={date} onValueChange={setDate} minDate={new Date()} />",
		},
	],
}

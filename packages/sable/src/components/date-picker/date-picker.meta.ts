import type { ComponentMeta } from "../../lib/meta"

export const datePickerMeta: ComponentMeta = {
	name: "DatePicker",
	summary:
		"Date (and optionally time) picker: a field-shaped trigger (the Input / SelectTrigger shell) opens a Popover holding Sable's Calendar. With granularity=\"day\" selecting a day fires onValueChange and closes; granularity=\"minute\" adds an hour + minute row of Selects and keeps the time-of-day when the day changes.",
	status: "stable",
	keywords: [
		"date picker",
		"due date",
		"property row",
		"inspector",
		"calendar",
		"date input",
		"date time picker",
		"time",
		"schedule",
		"form",
	],
	usage: {
		description: "Use DatePicker when users need to choose one date — or, with granularity=\"minute\", one date and time — from a compact control.",
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
			name: "value",
			type: "Date",
			description:
				"The selected date (controlled). When absent, the trigger shows a muted placeholder.",
		},
		{
			name: "defaultValue",
			type: "Date",
			description: "Initial value when uncontrolled (no `value` prop).",
		},
		{
			name: "onValueChange",
			type: "(date: Date | undefined) => void",
			description:
				"Fired when the day is chosen or cleared, and under granularity=\"minute\" when the hour or minute changes. With granularity=\"day\" it also closes the popover.",
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
			type: '"day" | "minute"',
			default: '"day"',
			description:
				'What the picker chooses. "minute" adds an hour + minute row and keeps the popover open so day and time can be set in any order.',
		},
		{
			name: "minuteStep",
			type: "number",
			default: "5",
			description: 'Minute increment for the time row (granularity="minute" only).',
		},
		{
			name: "defaultTime",
			type: "string",
			default: '"00:00"',
			description:
				'Time-of-day shown and applied while nothing is selected yet, as 24h "HH:mm" — the first day pick lands on this time instead of midnight (granularity="minute" only).',
		},
		{
			name: "placeholder",
			type: "string",
			default: '"Pick a date" ("Pick date & time" with granularity="minute")',
			description: "Trigger label shown when no date is selected.",
		},
		{
			name: "disabled",
			type: "boolean",
			description: "Disable the trigger and block selection.",
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
			type: '"md" | "xs"',
			default: '"md"',
			description:
				"The trigger's rung. md is the form field beside Input and Select. xs is the property-grid rung (24px in a workspace): an inset panel-field well with no border, the same shape as SelectTrigger size=\"xs\" and ScrubField on the neighbouring rows of an inspector — use it for a due date in a PropertyRow instead of a native date input.",
		},
		{
			name: "formatOptions",
			type: "Intl.DateTimeFormatOptions",
			description:
				"How the trigger writes the chosen date, as Intl.DateTimeFormat options in the reader's locale — { month: \"short\", day: \"numeric\" } for \"Oct 23\" where the rest of a list writes dates that way. Omitted: \"Oct 23, 2026\" (with \"at 14:30\" under granularity=\"minute\").",
		},
		{
			name: "className",
			type: "string",
			description: "Extra classes merged onto the trigger.",
		},
		{
			name: "id / aria-label / aria-labelledby / aria-describedby / aria-invalid / aria-required",
			type: "button attributes",
			description:
				"Forwarded to the trigger, so a wrapping Field ties its label to the picker and announces its description and error. Pass them yourself only when labelling the picker without a Field.",
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
		"With granularity=\"minute\" the hour and minute Selects are full Base UI listboxes (typeahead, ARIA) labelled \"Hour\" and \"Minute\"; selecting a day keeps the chosen time-of-day, so day and time can be set in any order.",
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
			label: "Disabled",
			code: "<DatePicker disabled />",
		},
		{
			label: "Bounded (no past dates)",
			code: "<DatePicker value={date} onValueChange={setDate} minDate={new Date()} />",
		},
	],
}

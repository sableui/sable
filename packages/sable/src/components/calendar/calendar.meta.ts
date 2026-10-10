import type { ComponentMeta } from "../../lib/meta"

export const calendarMeta: ComponentMeta = {
	name: "Calendar",
	summary:
		"Date picker grid wrapping react-day-picker v9, themed entirely with semantic tokens (no external stylesheet). Supports single, multiple, and range selection; nav chevrons render through the injected icon set.",
	status: "stable",
	keywords: [
		"calendar",
		"date grid",
		"month",
		"schedule",
	],
	usage: {
		description: "Use Calendar to browse or choose dates in a month grid, especially when relative date position matters.",
		bestPractices: [
			{
				guidance: "do",
				description: "Use it when users need to compare weekdays, ranges, or nearby dates.",
			},
			{
				guidance: "do",
				description: "Provide selected, disabled, and today states when date choice is interactive.",
			},
			{
				guidance: "dont",
				description: "Do not use Calendar when a compact DatePicker (with granularity=\"minute\" for a time) would be faster.",
			},
			{
				guidance: "dont",
				description: "Do not use it as the only way to enter a date. A grid is slow for a date far from today and unusable for someone who knows the value — always pair it with a text input.",
			},
		],
	},
	related: {
		components: [
			"DatePicker",
		],
	},
	props: [
		{
			name: "mode",
			type: '"single" | "multiple" | "range"',
			description:
				"Selection behavior. Pair with the matching selected/onSelect shape (Date, Date[], or DateRange).",
		},
		{
			name: "selected",
			type: "Date | Date[] | DateRange | undefined",
			description:
				"The controlled selection. Shape follows mode.",
		},
		{
			name: "onSelect",
			type: "(value, triggerDate, modifiers, event) => void",
			description:
				"Fires when a day is chosen. The first argument's type follows mode.",
		},
		{
			name: "defaultMonth",
			type: "Date",
			description:
				"The month shown on first render (uncontrolled navigation).",
		},
		{
			name: "month",
			type: "Date",
			description:
				"Controlled displayed month; pair with onMonthChange.",
		},
		{
			name: "numberOfMonths",
			type: "number",
			default: "1",
			description: "How many month grids to render side by side.",
		},
		{
			name: "disabled",
			type: "Matcher | Matcher[]",
			description:
				"Days matching this are dimmed and non-selectable (e.g. { before: new Date() }).",
		},
		{
			name: "showOutsideDays",
			type: "boolean",
			default: "true",
			description:
				"Render leading/trailing days from adjacent months, dimmed.",
		},
		{
			name: "bare",
			type: "boolean",
			default: "false",
			description:
				"Drop the card frame (border, fill, padding) so the grid sits flush inside a surface that already has one, such as a Popover. DatePicker renders its Calendar this way.",
		},
		{
			name: "className",
			type: "string",
			description:
				"Merged onto the bordered card container that wraps the grid.",
		},
		{
			name: "classNames",
			type: "Partial<ClassNames>",
			description:
				"Per-part class overrides merged over the themed defaults. Themed slots: months, month, nav, button_previous, button_next, month_caption, caption_label, month_grid, weekdays, weekday, week, day, day_button, range_start, range_middle, range_end, selected, today, outside, disabled, hidden. Selection/state slots (selected/today/range_*/outside/disabled) style the day CELL; the inner day button is targeted via the [&>button] descendant.",
		},
		{
			name: "components",
			type: "Partial<CustomComponents>",
			description:
				"Render overrides for RDP parts. Chevron is supplied by default and merged with yours.",
		},
	],
	variants: {
		mode: ["single", "multiple", "range"],
	},
	tokensUsed: [
		"card",
		"card-foreground",
		"border",
		"primary",
		"primary-foreground",
		"accent",
		"accent-foreground",
		"muted-foreground",
		"ring",
	],
	a11y: [
		"react-day-picker manages the roving-tabindex grid, arrow-key navigation, and ARIA roles/labels for the calendar.",
		"Selected days use bg-primary/text-primary-foreground for AA contrast; today is marked with a dot under the number (not a ring, which is reserved for keyboard focus) rather than color alone.",
		"Disabled and outside days are dimmed and removed from the tab order.",
		"Nav chevrons resolve through the injected IconProvider; ensure chevron-left and chevron-right are registered in the icon set.",
	],
	examples: [
		{
			label: "Single date",
			code: 'const [date, setDate] = useState<Date>()\n<Calendar mode="single" selected={date} onSelect={setDate} />',
		},
		{
			label: "Range",
			code: 'const [range, setRange] = useState<DateRange>()\n<Calendar mode="range" selected={range} onSelect={setRange} numberOfMonths={2} />',
		},
	],
}

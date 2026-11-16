"use client";

import {
	type Locale,
	format,
	isSameDay,
	setHours,
	setMilliseconds,
	setMinutes,
	setSeconds,
} from "date-fns"
import { type ComponentPropsWithRef, type FocusEvent, useId, useMemo, useRef, useState } from "react"
import type { Matcher } from "react-day-picker"
import type { DateRange } from "../calendar/calendar"
import { Icon } from "../../icon"
import { cn } from "../../lib/cn"
import { useDensity, useTypeTier } from "../../lib/density"
import { FIELD_INVALID, FIELD_SHELL, FIELD_SHELL_XS, MOBILE_FIELD_TIER } from "../../lib/field-shell"
import { mergeRefs } from "../../lib/refs"
import { Calendar } from "../calendar/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../popover/popover"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
} from "../select/select"

export type { DateRange }

/**
 * Everything a `<button>` takes, forwarded to the trigger — so a `ref`, a
 * `Field`'s id / `aria-describedby` / `aria-invalid`, a test id or a handler
 * all land on the control a reader actually operates. The value props, `name`
 * and `form` are DatePicker's own: they describe the submitted value, which a
 * hidden input carries, not the button.
 */
type TriggerAttributes = Omit<
	ComponentPropsWithRef<"button">,
	"value" | "defaultValue" | "onChange" | "type" | "children" | "name" | "form"
>

interface DatePickerBaseProps extends TriggerAttributes {
	/** Minute increment for the time row (`granularity="minute"` / `"time"`). @default 5 */
	minuteStep?: number
	/**
	 * Time-of-day shown and applied while nothing is selected yet, as 24h
	 * `"HH:mm"` — the first day pick lands on this time instead of midnight
	 * (`granularity="minute"` / `"time"`).
	 * @default "00:00"
	 */
	defaultTime?: string
	/**
	 * Trigger label shown when nothing is selected.
	 * @default "Pick a date" ("Pick date & time" for minute, "Pick a time" for time, "Pick a date range" in range mode)
	 */
	placeholder?: string
	/** Disable the trigger and block selection. */
	disabled?: boolean
	/**
	 * Show the value without letting it change: the popover does not open and the
	 * submitted value is not validated (a read-only control is never required).
	 */
	readOnly?: boolean
	/**
	 * Name of the submitted value. With it the picker takes part in a form: a
	 * hidden input carries the value into `FormData` — `yyyy-MM-dd` for a day,
	 * `yyyy-MM-ddTHH:mm` (local, the `datetime-local` format) for a minute, `HH:mm`
	 * for a time, and an ISO 8601 interval `yyyy-MM-dd/yyyy-MM-dd` for a range
	 * (empty until both ends are picked). Empty when nothing is selected.
	 */
	name?: string
	/** The id of a `<form>` the value belongs to, when the picker sits outside it. */
	form?: string
	/**
	 * A value is needed before the form submits. Marks the trigger
	 * `aria-required` and blocks a native (or Sable `Form`) submit while empty,
	 * moving focus to the trigger. A wrapping `<Field required>` sets it.
	 */
	required?: boolean
	/** Earliest selectable day (inclusive); earlier days are disabled. */
	minDate?: Date
	/** Latest selectable day (inclusive); later days are disabled. */
	maxDate?: Date
	/**
	 * The trigger's rung. `md` is the form field, beside Input and Select. `sm`
	 * is `md` one rung down, the same raised field: a filter in a toolbar beside
	 * an `sm` SelectTrigger and `sm` buttons. `xs` is the property-grid rung
	 * (24px in a workspace): an inset `panel-field` well with no border, the same
	 * shape as SelectTrigger `size="xs"` and ScrubField on the neighbouring rows
	 * of an inspector.
	 * @default "md"
	 */
	size?: "md" | "sm" | "xs"
	/**
	 * The date-fns locale for the calendar (month and weekday names, first day of
	 * the week) and the trigger's label. Without it both are English (en-US),
	 * on the server and the client alike.
	 */
	locale?: Locale
	/**
	 * How the trigger writes the chosen date, as `Intl.DateTimeFormat` options
	 * — `{ month: "short", day: "numeric" }` for "Oct 23" where the rest of a
	 * list writes dates that way. Written in `locale` (en-US without one), the
	 * same language as the calendar. Omitted: "Oct 23, 2026" (and
	 * "Oct 23, 2026 at 14:30" under `granularity="minute"`).
	 */
	formatOptions?: Intl.DateTimeFormatOptions
	/** Accessible name of the time row. @default "Time" */
	timeLabel?: string
	/** Accessible name of the hour Select. @default "Hour" */
	hourLabel?: string
	/** Accessible name of the minute Select. @default "Minute" */
	minuteLabel?: string
	/** Extra classes for the trigger button. */
	className?: string
}

export interface DatePickerSingleProps extends DatePickerBaseProps {
	/** One date (the default), or a `{ from, to }` range. @default "single" */
	mode?: "single"
	/** The selected date (controlled). Under `granularity="minute"` / `"time"` it carries the time too. */
	value?: Date
	/** Initial date when uncontrolled. */
	defaultValue?: Date
	/** Fired when the day (or the time) changes or the day is cleared. */
	onValueChange?: (date: Date | undefined) => void
	/**
	 * @deprecated Use `onValueChange`. Kept as an alias; both fire when set.
	 */
	onChange?: (date: Date | undefined) => void
	/**
	 * What the picker chooses. `"day"` picks a date and closes on selection;
	 * `"minute"` adds an hour + minute row and stays open so day and time can be
	 * set in any order; `"time"` is the hour + minute row alone, with no
	 * calendar (the value keeps its day, today when there was none).
	 * @default "day"
	 */
	granularity?: "day" | "minute" | "time"
}

export interface DatePickerRangeProps extends DatePickerBaseProps {
	mode: "range"
	/** The selected range (controlled). `to` is unset while only the start is picked. */
	value?: DateRange
	/** Initial range when uncontrolled. */
	defaultValue?: DateRange
	/** Fired on each pick: with only `from` after the first, with both after the second. */
	onValueChange?: (range: DateRange | undefined) => void
	/** Ranges are whole days. @default "day" */
	granularity?: "day"
}

export type DatePickerProps = DatePickerSingleProps | DatePickerRangeProps

/** Build react-day-picker `disabled` matchers from an optional min/max bound. */
export function rangeMatchers(
	minDate?: Date,
	maxDate?: Date,
): Matcher[] | undefined {
	const matchers: Matcher[] = []
	if (minDate) matchers.push({ before: minDate })
	if (maxDate) matchers.push({ after: maxDate })
	return matchers.length ? matchers : undefined
}

const HOURS = Array.from({ length: 24 }, (_, h) => h)

function pad(n: number) {
	return String(n).padStart(2, "0")
}

/** Parse a 24h "HH:mm" string into clamped [hours, minutes]; malformed input → midnight. */
function parseDefaultTime(time: string): [number, number] {
	const match = /^(\d{1,2}):(\d{1,2})$/.exec(time)
	if (!match) return [0, 0]
	return [
		Math.min(23, Math.max(0, Number(match[1]))),
		Math.min(59, Math.max(0, Number(match[2]))),
	]
}

function atTime(date: Date, hours: number, minutes: number) {
	return setMilliseconds(setSeconds(setMinutes(setHours(date, hours), minutes), 0), 0)
}

/**
 * The submitted value. Formats the HTML date inputs use, so a server that
 * already parses `<input type="date">` / `datetime-local` / `time` parses this.
 */
function serialise(
	value: Date | DateRange | undefined,
	granularity: "day" | "minute" | "time",
): string {
	if (!value) return ""
	if (!(value instanceof Date)) {
		return value.from && value.to
			? `${format(value.from, "yyyy-MM-dd")}/${format(value.to, "yyyy-MM-dd")}`
			: ""
	}
	if (granularity === "time") return format(value, "HH:mm")
	if (granularity === "minute") return format(value, "yyyy-MM-dd'T'HH:mm")
	return format(value, "yyyy-MM-dd")
}

/**
 * Hidden from sight and from assistive tech, but not `type="hidden"`: a hidden
 * input is barred from constraint validation, so `required` would never block
 * a submit. This is Base UI's own pattern for Select's value input.
 */
const VISUALLY_HIDDEN_INPUT = {
	position: "absolute",
	width: 1,
	height: 1,
	margin: -1,
	padding: 0,
	border: 0,
	overflow: "hidden",
	clipPath: "inset(50%)",
	whiteSpace: "nowrap",
} as const

/**
 * Themed date picker. A field-shaped trigger (the same shell as Input and
 * SelectTrigger) shows the formatted value (or a muted placeholder) and opens a
 * Popover holding Sable's `<Calendar>`. With the
 * default `granularity="day"`, picking a day fires `onValueChange` and closes
 * the popover. `granularity="minute"` adds an hour + minute row of Selects;
 * picking a day keeps the current time-of-day and the popover stays open.
 * `granularity="time"` is the row alone. `mode="range"` picks a start and an
 * end day, closing after the second.
 *
 *   <DatePicker value={date} onValueChange={setDate} />
 *   <DatePicker granularity="minute" value={start} onValueChange={setStart} minuteStep={15} />
 *   <DatePicker mode="range" value={stay} onValueChange={setStay} name="stay" />
 */
export function DatePicker(props: DatePickerProps) {
	const {
		mode = "single",
		value: valueProp,
		defaultValue,
		onValueChange,
		granularity = "day",
		minuteStep = 5,
		defaultTime = "00:00",
		placeholder,
		disabled,
		readOnly,
		name,
		form,
		required,
		minDate,
		maxDate,
		size = "md",
		locale,
		formatOptions,
		timeLabel = "Time",
		hourLabel = "Hour",
		minuteLabel = "Minute",
		className,
		ref,
		"aria-required": ariaRequired,
		...rest
	} = props
	// `onChange` exists on the single-mode props only; keep it off the button.
	const { onChange, ...triggerProps } = rest as typeof rest & {
		onChange?: (date: Date | undefined) => void
	}
	const timeLabelId = useId()
	const tier = useTypeTier()
	const density = useDensity()
	const triggerRef = useRef<HTMLButtonElement | null>(null)
	const mergedRef = useMemo(() => mergeRefs(triggerRef, ref), [ref])
	const [open, setOpen] = useState(false)
	const [uncontrolled, setUncontrolled] = useState<Date | DateRange | undefined>(defaultValue)
	// Range mode: the start picked in this opening, waiting for its end.
	const [anchor, setAnchor] = useState<Date | undefined>()
	// Controlled whenever `value` is passed at all — `value={undefined}` from an
	// empty `useState<Date>()` is still controlled, as it always was.
	const controlled = "value" in props
	const value = controlled ? valueProp : uncontrolled
	const range = mode === "range"
	const effectiveGranularity = range ? "day" : granularity
	const withTime = effectiveGranularity !== "day"
	const withCalendar = effectiveGranularity !== "time"
	const date = value instanceof Date ? value : undefined
	const dateRange = range && value && !(value instanceof Date) ? value : undefined

	function commit(next: Date | DateRange | undefined) {
		if (!controlled) setUncontrolled(next)
		;(onValueChange as ((v: Date | DateRange | undefined) => void) | undefined)?.(next)
		if (!range) onChange?.(next as Date | undefined)
	}

	function handleOpenChange(next: boolean) {
		if (next && readOnly) return
		if (next) setAnchor(undefined)
		setOpen(next)
	}

	const [defaultHours, defaultMinutes] = parseDefaultTime(defaultTime)
	const hours = date?.getHours() ?? defaultHours
	const minutes = date?.getMinutes() ?? defaultMinutes

	const step = Math.max(1, Math.floor(minuteStep))
	const steps = Array.from({ length: Math.ceil(60 / step) }, (_, i) => i * step)
	// Keep an off-grid incoming minute selectable (e.g. a legacy :30 with step 7),
	// so the Select still reflects the real value instead of going blank.
	const minuteOptions = steps.includes(minutes)
		? steps
		: [...steps, minutes].sort((a, b) => a - b)

	function handleDay(next: Date | undefined) {
		if (!withTime) {
			commit(next)
			setOpen(false)
			return
		}
		// Preserve the current time-of-day on the newly chosen day.
		commit(next ? atTime(next, hours, minutes) : undefined)
	}

	// Two picks make a range: the first sets the start, the second the end
	// (either order), then the popover closes. react-day-picker's own range
	// logic turns a first pick into a one-day range and a repeat pick into
	// "clear", which reads as the picker forgetting what was chosen.
	//
	// The first pick is held here, shown in the calendar as the start, and
	// nothing is committed until the second: dismissing in between (Escape, a
	// click outside) leaves the value as it was. Committing the half range threw
	// away a complete one on a stray click, and left a form field empty.
	function handleRangeDay(_: DateRange | undefined, day: Date) {
		if (!anchor) {
			setAnchor(day)
			return
		}
		const [from, to] = day < anchor ? [day, anchor] : [anchor, day]
		setAnchor(undefined)
		commit({ from, to })
		setOpen(false)
	}

	// A stable base carrying the displayed h:mm with seconds/ms zeroed — so a
	// time pick emits a Date that matches the row, never wall-clock minutes.
	function timeBase() {
		return atTime(date ?? new Date(), hours, minutes)
	}

	function handleHour(next: string | null) {
		if (next == null) return
		commit(setHours(timeBase(), Number(next)))
	}

	function handleMinute(next: string | null) {
		if (next == null) return
		commit(setMinutes(timeBase(), Number(next)))
	}

	function formatDate(d: Date) {
		if (formatOptions) return new Intl.DateTimeFormat(locale?.code ?? "en-US", formatOptions).format(d)
		// 24-hour, matching the hour / minute Selects below — the trigger and
		// the row that sets it must not show the same time two ways.
		if (effectiveGranularity === "time") return format(d, "HH:mm")
		if (effectiveGranularity === "minute") {
			return locale
				? `${format(d, "PP", { locale })} ${format(d, "HH:mm")}`
				: format(d, "MMM d, yyyy 'at' HH:mm")
		}
		return format(d, "PP", { locale })
	}

	function formatRange({ from, to }: DateRange) {
		if (!from) return ""
		if (!to) return `${formatDate(from)} –`
		if (isSameDay(from, to)) return formatDate(from)
		return `${formatDate(from)} – ${formatDate(to)}`
	}

	// While a start is held, the trigger shows it ("Oct 12 –"), so the control
	// never reads as the old range while the calendar shows a new start.
	const shownRange = anchor ? { from: anchor, to: undefined } : dateRange
	const selectedLabel = range ? (shownRange?.from ? formatRange(shownRange) : "") : date ? formatDate(date) : ""
	const emptyLabel =
		placeholder ??
		(range
			? "Pick a date range"
			: effectiveGranularity === "minute"
				? "Pick date & time"
				: effectiveGranularity === "time"
					? "Pick a time"
					: "Pick a date")
	const label = selectedLabel || emptyLabel
	const xs = size === "xs"
	const isRequired = Boolean(required)

	const timeRow = withTime && (
		// One group named "Time" holding the two Selects, rather than a
		// <label> — a label names one control, and this names a pair.
		<div
			role="group"
			aria-labelledby={timeLabelId}
			className={cn("flex items-center gap-2", withCalendar && "mt-3 border-t border-border pt-3")}
		>
			<span id={timeLabelId} className="text-label-md text-muted-foreground">
				{timeLabel}
			</span>
			<div className="ms-auto flex items-center gap-1">
				<Select value={pad(hours)} onValueChange={handleHour}>
					<SelectTrigger aria-label={hourLabel} className="w-18" />
					<SelectContent>
						{HOURS.map((h) => (
							<SelectItem key={h} value={pad(h)}>
								{pad(h)}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<span className="text-muted-foreground">:</span>
				<Select value={pad(minutes)} onValueChange={handleMinute}>
					<SelectTrigger aria-label={minuteLabel} className="w-18" />
					<SelectContent>
						{minuteOptions.map((m) => (
							<SelectItem key={m} value={pad(m)}>
								{pad(m)}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		</div>
	)

	return (
		<>
			<Popover open={open} onOpenChange={handleOpenChange}>
				<PopoverTrigger
					render={
						// The field shell, not an outline Button: in a form a date sits
						// beside Inputs and Selects, and has to be the same shape they
						// are (soft-square field radius, input border, card surface) —
						// an outline Button is a pill in most themes. CommandMenuTrigger
						// is the same move: a button wearing the field.
						// design-lint-disable-next-line raw-button -- a field-shaped trigger (FIELD_SHELL, like CommandMenuTrigger), not a button-shaped action
						<button
							{...triggerProps}
							ref={mergedRef}
							type="button"
							aria-required={isRequired || ariaRequired || undefined}
							data-readonly={readOnly ? "" : undefined}
							disabled={disabled}
							className={cn(
								"inline-flex items-center text-start text-foreground",
								xs && "h-(--control-xs) gap-1 px-1.5",
								size === "sm" && "h-(--control-sm) gap-1.5 ps-2.5 pe-2.5",
								size === "md" && "h-(--control-md) gap-2 ps-3 pe-3",
								// Select's type: the density tier, plus the 16px phone tier
								// its form-row neighbours take (lib/field-shell). Only the md
								// rung stands in a page-register form row, as on SelectTrigger.
								tier.body,
								density === "comfortable" && size === "md" && MOBILE_FIELD_TIER,
								FIELD_SHELL,
								// After FIELD_SHELL, so its well replaces the outlined field.
								xs && FIELD_SHELL_XS,
								FIELD_INVALID,
								className,
							)}
						>
							<Icon
								name={effectiveGranularity === "time" ? "clock" : "calendar"}
								className={cn("shrink-0 text-muted-foreground", xs ? "text-xs" : "text-sm")}
							/>
							<span className={cn("truncate", !selectedLabel && "text-muted-foreground")}>
								{label}
							</span>
						</button>
					}
				/>
				<PopoverContent align="start" className="w-auto p-3">
					{withCalendar &&
						(range ? (
							<Calendar
								bare
								mode="range"
								locale={locale}
								selected={anchor ? { from: anchor, to: undefined } : dateRange}
								onSelect={handleRangeDay}
								disabled={rangeMatchers(minDate, maxDate)}
								defaultMonth={dateRange?.from ?? minDate}
								startMonth={minDate}
								endMonth={maxDate}
							/>
						) : (
							<Calendar
								bare
								mode="single"
								locale={locale}
								selected={date}
								onSelect={handleDay}
								disabled={rangeMatchers(minDate, maxDate)}
								defaultMonth={date ?? minDate}
								startMonth={minDate}
								endMonth={maxDate}
							/>
						))}
					{timeRow}
				</PopoverContent>
			</Popover>
			{name || isRequired ? (
				<input
					name={name}
					form={form}
					value={serialise(value, effectiveGranularity)}
					onChange={() => {}}
					required={isRequired}
					disabled={disabled}
					readOnly={readOnly}
					tabIndex={-1}
					aria-hidden
					style={VISUALLY_HIDDEN_INPUT}
					// A blocked submit focuses the first invalid control: hand that
					// focus to the trigger the reader can actually operate.
					onFocus={(event: FocusEvent<HTMLInputElement>) => {
						event.preventDefault()
						triggerRef.current?.focus()
					}}
				/>
			) : null}
		</>
	)
}
DatePicker.displayName = "DatePicker"

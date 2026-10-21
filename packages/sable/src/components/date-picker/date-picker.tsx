"use client";

import {
	format,
	setHours,
	setMilliseconds,
	setMinutes,
	setSeconds,
} from "date-fns"
import { type ComponentProps, useId, useState } from "react"
import type { Matcher } from "react-day-picker"
import { Icon } from "../../icon"
import { cn } from "../../lib/cn"
import { useDensity, useTypeTier } from "../../lib/density"
import { FIELD_INVALID, FIELD_SHELL, FIELD_SHELL_XS, MOBILE_FIELD_TIER } from "../../lib/field-shell"
import { Calendar } from "../calendar/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../popover/popover"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
} from "../select/select"

/**
 * The trigger attributes a `Field` (or a hand-rolled label) wires onto its
 * control. Forwarded to the trigger button, so `<Field label=…><DatePicker /></Field>`
 * ties the label to the trigger and announces the description and error.
 */
type TriggerAttributes = Pick<
	ComponentProps<"button">,
	| "id"
	| "aria-label"
	| "aria-labelledby"
	| "aria-describedby"
	| "aria-invalid"
	| "aria-required"
>

export interface DatePickerProps extends TriggerAttributes {
	/** The selected date (controlled). Under `granularity="minute"` it carries the time too. */
	value?: Date
	/** Initial date when uncontrolled. */
	defaultValue?: Date
	/** Fired when the day (or, under `granularity="minute"`, the time) changes or the day is cleared. */
	onValueChange?: (date: Date | undefined) => void
	/**
	 * @deprecated Use `onValueChange`. Kept as an alias; both fire when set.
	 */
	onChange?: (date: Date | undefined) => void
	/**
	 * What the picker chooses. `"day"` picks a date and closes on selection;
	 * `"minute"` adds an hour + minute row and stays open so day and time can be
	 * set in any order.
	 * @default "day"
	 */
	granularity?: "day" | "minute"
	/** Minute increment for the time row (`granularity="minute"` only). @default 5 */
	minuteStep?: number
	/**
	 * Time-of-day shown and applied while nothing is selected yet, as 24h
	 * `"HH:mm"` — the first day pick lands on this time instead of midnight
	 * (`granularity="minute"` only).
	 * @default "00:00"
	 */
	defaultTime?: string
	/**
	 * Trigger label shown when nothing is selected.
	 * @default "Pick a date" ("Pick date & time" under granularity="minute")
	 */
	placeholder?: string
	/** Disable the trigger and block selection. */
	disabled?: boolean
	/** Earliest selectable day (inclusive); earlier days are disabled. */
	minDate?: Date
	/** Latest selectable day (inclusive); later days are disabled. */
	maxDate?: Date
	/**
	 * The trigger's rung. `md` is the form field, beside Input and Select. `xs`
	 * is the property-grid rung (24px in a workspace): an inset `panel-field`
	 * well with no border, the same shape as SelectTrigger `size="xs"` and
	 * ScrubField on the neighbouring rows of an inspector.
	 * @default "md"
	 */
	size?: "md" | "xs"
	/**
	 * How the trigger writes the chosen date, as `Intl.DateTimeFormat` options
	 * in the reader's locale — `{ month: "short", day: "numeric" }` for "Oct 23"
	 * where the rest of a list writes dates that way. Omitted: "Oct 23, 2026"
	 * (and "Oct 23, 2026 at 14:30" under `granularity="minute"`).
	 */
	formatOptions?: Intl.DateTimeFormatOptions
	/** Extra classes for the trigger button. */
	className?: string
}

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
 * Themed date picker. A field-shaped trigger (the same shell as Input and
 * SelectTrigger) shows the formatted value (or a muted placeholder) and opens a
 * Popover holding Sable's `<Calendar>`. With the
 * default `granularity="day"`, picking a day fires `onValueChange` and closes
 * the popover. `granularity="minute"` adds an hour + minute row of Selects;
 * picking a day keeps the current time-of-day and the popover stays open.
 *
 *   <DatePicker value={date} onValueChange={setDate} />
 *   <DatePicker granularity="minute" value={start} onValueChange={setStart} minuteStep={15} />
 */
export function DatePicker(props: DatePickerProps) {
	const {
		value: valueProp,
		defaultValue,
		onValueChange,
		onChange,
		granularity = "day",
		minuteStep = 5,
		defaultTime = "00:00",
		placeholder,
		disabled,
		minDate,
		maxDate,
		size = "md",
		formatOptions,
		className,
		id,
		"aria-label": ariaLabel,
		"aria-labelledby": ariaLabelledBy,
		"aria-describedby": ariaDescribedBy,
		"aria-invalid": ariaInvalid,
		"aria-required": ariaRequired,
	} = props
	const timeLabelId = useId()
	const tier = useTypeTier()
	const density = useDensity()
	const [open, setOpen] = useState(false)
	const [uncontrolled, setUncontrolled] = useState<Date | undefined>(defaultValue)
	// Controlled whenever `value` is passed at all — `value={undefined}` from an
	// empty `useState<Date>()` is still controlled, as it always was.
	const controlled = "value" in props
	const value = controlled ? valueProp : uncontrolled
	const withTime = granularity === "minute"

	function commit(next: Date | undefined) {
		if (!controlled) setUncontrolled(next)
		onValueChange?.(next)
		onChange?.(next)
	}

	const [defaultHours, defaultMinutes] = parseDefaultTime(defaultTime)
	const hours = value?.getHours() ?? defaultHours
	const minutes = value?.getMinutes() ?? defaultMinutes

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

	// A stable base carrying the displayed h:mm with seconds/ms zeroed — so a
	// time pick emits a Date that matches the row, never wall-clock minutes.
	function timeBase() {
		return atTime(value ?? new Date(), hours, minutes)
	}

	function handleHour(next: string | null) {
		if (next == null) return
		commit(setHours(timeBase(), Number(next)))
	}

	function handleMinute(next: string | null) {
		if (next == null) return
		commit(setMinutes(timeBase(), Number(next)))
	}

	const label = value
		? formatOptions
			? new Intl.DateTimeFormat(undefined, formatOptions).format(value)
			: // 24-hour, matching the hour / minute Selects below — the trigger
				// and the row that sets it must not show the same time two ways.
				format(value, withTime ? "MMM d, yyyy 'at' HH:mm" : "PP")
		: (placeholder ?? (withTime ? "Pick date & time" : "Pick a date"))
	const xs = size === "xs"

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger
				render={
					// The field shell, not an outline Button: in a form a date sits
					// beside Inputs and Selects, and has to be the same shape they
					// are (soft-square field radius, input border, card surface) —
					// an outline Button is a pill in most themes. CommandMenuTrigger
					// is the same move: a button wearing the field.
					// design-lint-disable-next-line raw-button -- a field-shaped trigger (FIELD_SHELL, like CommandMenuTrigger), not a button-shaped action
					<button
						type="button"
						id={id}
						aria-label={ariaLabel}
						aria-labelledby={ariaLabelledBy}
						aria-describedby={ariaDescribedBy}
						aria-invalid={ariaInvalid}
						aria-required={ariaRequired}
						disabled={disabled}
						className={cn(
							"inline-flex items-center text-start text-foreground",
							xs ? "h-(--control-xs) gap-1 px-1.5" : "h-(--control-md) gap-2 ps-3 pe-3",
							// Select's type: the density tier, plus the 16px phone tier
							// its form-row neighbours take (lib/field-shell). The xs rung
							// never sits in a page-register form row, so it skips it.
							tier.body,
							density === "comfortable" && !xs && MOBILE_FIELD_TIER,
							FIELD_SHELL,
							// After FIELD_SHELL, so its well replaces the outlined field.
							xs && FIELD_SHELL_XS,
							FIELD_INVALID,
							className,
						)}
					>
						<Icon name="calendar" className={cn("shrink-0 text-muted-foreground", xs ? "text-xs" : "text-sm")} />
						<span className={cn("truncate", !value && "text-muted-foreground")}>
							{label}
						</span>
					</button>
				}
			/>
			<PopoverContent align="start" className="w-auto p-3">
				<Calendar
					bare
					mode="single"
					selected={value}
					onSelect={handleDay}
					disabled={rangeMatchers(minDate, maxDate)}
					defaultMonth={value ?? minDate}
					startMonth={minDate}
					endMonth={maxDate}
				/>
				{withTime && (
					// One group named "Time" holding the two Selects, rather than a
					// <label> — a label names one control, and this names a pair.
					<div
						role="group"
						aria-labelledby={timeLabelId}
						className="mt-3 flex items-center gap-2 border-t border-border pt-3"
					>
						<span id={timeLabelId} className="text-label-md text-muted-foreground">
							Time
						</span>
						<div className="ms-auto flex items-center gap-1">
							<Select value={pad(hours)} onValueChange={handleHour}>
								<SelectTrigger aria-label="Hour" className="w-18" />
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
								<SelectTrigger aria-label="Minute" className="w-18" />
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
				)}
			</PopoverContent>
		</Popover>
	)
}
DatePicker.displayName = "DatePicker"

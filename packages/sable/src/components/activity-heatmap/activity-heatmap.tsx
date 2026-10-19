"use client"

import {
	type ComponentPropsWithRef,
	type CSSProperties,
	type FocusEvent,
	type KeyboardEvent,
	type PointerEvent,
	type ReactNode,
	useCallback,
	useId,
	useMemo,
	useRef,
	useState,
} from "react"
import { type ActivityData, normalizeActivity } from "../../lib/chart/activity"
import { activityGrid, dayNumber, gridPosition, isoDay, localeWeekStart, today, utcDate, weekday } from "../../lib/chart/calendar"
import { ChartLegend } from "../../lib/chart/chart-legend"
import { ChartTooltipContent } from "../../lib/chart/chart-tooltip"
import { centerValueFormat } from "../../lib/chart/format"
import { type ActivityScale, activityLevels, heatColor, levelNames } from "../../lib/chart/heat"
import { riseTransition, stagger } from "../../lib/chart/motion"
import { type ChartCategories, type ChartTone, categoryStyle, toneColor } from "../../lib/chart/types"
import { useArrival } from "../../lib/chart/use-arrival"
import { cn } from "../../lib/cn"
import { mergeRefs } from "../../lib/refs"
import { useIsomorphicLayoutEffect } from "../../lib/use-isomorphic-layout-effect"
import { useResizeObserver } from "../../lib/use-resize-observer"
import { type MotionLevel, motionAttribute, useMotionLevel } from "../../motion/MotionProvider"
import { Scroller } from "../scroller"

/** A day as the heatmap resolved it — what `tooltip`, `renderCell` and the callbacks receive. */
export interface ActivityHeatmapDay {
	date: string
	value: number
	level: number
	category?: string
}

/** What `renderCell` is told about the cell it draws into. */
export interface ActivityHeatmapCell {
	level: number
	/** The cell's fill, as a CSS colour. */
	color: string
	/** The cell's edge length in px. */
	size: number
}

export interface ActivityHeatmapProps extends Omit<ComponentPropsWithRef<"figure">, "children"> {
	/** What the grid shows ("Contributions in 2026") — its caption and accessible name. */
	label: string
	/** The days, as a list or a map of date to value. Sparse is fine; a missing day is 0. */
	data: ActivityData
	/** First day drawn, "YYYY-MM-DD". @default 53 weeks before `end`, from the start of that week */
	start?: string
	/** Last day drawn, "YYYY-MM-DD". @default today */
	end?: string
	/** Draw Jan 1 – Dec 31 of this year. Wins over `start` / `end`. */
	year?: number
	/** 0 puts Sunday on top, 1 Monday. @default the locale's */
	weekStart?: 0 | 1
	/** How many levels, including the empty level 0. @default 5 */
	levels?: number
	/** How a value becomes a level. A day's own `level` always wins. @default "quantile" */
	levelScale?: ActivityScale
	/** The hue of the intensity ramp. Decorative tones lead; `"success"` gives the GitHub look. @default "1" */
	tone?: ChartTone
	/** Colour cells by `day.category` instead of one ramp — a label and tone (or colour) per key. */
	categories?: ChartCategories
	/** Names the value in the tooltip and each cell's name: "contributions", or `{ one, other }` to pluralise. */
	unit?: string | { one: string; other: string }
	/** Formats a value. @default in full up to 9,999, compact past it */
	formatValue?: (value: number) => string
	/** Show a tooltip on hover, focus and tap; a function replaces its content. @default true */
	tooltip?: boolean | ((day: ActivityHeatmapDay) => ReactNode)
	/** The Less–More ramp, or swatches for categories. @default true */
	legend?: boolean
	/** The ramp's end words. @default ["Less", "More"] */
	legendLabels?: [string, string]
	/** Short month names over each month's first week. @default true */
	monthLabels?: boolean
	/** Which weekday names to show beside the rows. @default "alternate" (Mon, Wed, Fri) */
	weekdayLabels?: "alternate" | "all" | "none"
	/** The smallest a cell may get before the grid scrolls instead of shrinking: 10, 12 or 14 px. @default "md" */
	size?: "sm" | "md" | "lg"
	/** Grow cells to fill the width, up to 20 px. @default true */
	stretch?: boolean
	/** The hovered or focused day, controlled. */
	activeDate?: string | null
	defaultActiveDate?: string | null
	onActiveDateChange?: (date: string | null) => void
	/** The selected day, controlled. Selection is on only when `onSelectDate` is set. */
	selectedDate?: string | null
	/** Called when a day is clicked or chosen with Enter / Space — as GitHub filters its feed below. */
	onSelectDate?: (date: string) => void
	/** Draw something into a cell (an icon for a milestone, a reward, an outage). Rendered over the fill. */
	renderCell?: (day: ActivityHeatmapDay, cell: ActivityHeatmapCell) => ReactNode
	/** Draw the empty grid, shimmering, while data loads. */
	loading?: boolean
	/**
	 * How much motion this component uses: `full` (default) inherits the app's
	 * policy, `subtle` keeps feedback and drops the flourish, `off` stills it.
	 * The weeks fading in as the grid scrolls into view is the flourish.
	 */
	motion?: MotionLevel
	/** BCP 47 locale for month and weekday names, numbers and plurals. */
	locale?: string
}

const CELL_FLOOR = { sm: 10, md: 12, lg: 14 } as const
const CELL_MAX = 20
/** The padding round the table that keeps a cell's focus ring inside the scroller's clip. */
const PAD = 4
const SHOWN_WEEKDAYS = new Set([1, 3, 5])

/** A fifth of the cell, on quarter pixels, rounded down so the grid never outgrows the width it was fitted to. */
const gapFor = (cell: number) => Math.max(2, Math.floor(cell * 0.2 * 4) / 4)

/**
 * The largest cell, between the floor and the cap, whose grid fits the width:
 * `weeks` cells and `weeks + 1` gaps of a fifth of a cell. Quarter pixels, not
 * whole ones — rounding both to integers stepped the gap from 3 to 4 px at once
 * and left up to a cell's width of slack at the end of the row.
 */
function fitCell(width: number | null, weeks: number, floor: number, stretch: boolean): number {
	if (!stretch || !width) return floor
	const fit = (width - PAD * 2) / (weeks * 1.2 + 0.2)
	return Math.max(floor, Math.min(CELL_MAX, Math.floor(fit * 4) / 4))
}

/**
 * A calendar heatmap: one value per day as a grid of weeks by weekdays — the
 * GitHub contribution graph, for any daily measure (commits, habits, sales,
 * uptime). Levels come from the data by quartile unless a day brings its own;
 * categories colour days by source instead of intensity.
 *
 * The grid is a real `role="grid"` table, as GitHub's is: one tab stop, arrow
 * keys between days, each cell named with its date and value. It fills the
 * width down to `size`; narrower than that, the weeks scroll sideways (opening
 * on the latest) while the weekday labels and legend stay put.
 */
export function ActivityHeatmap({
	label,
	data,
	start,
	end,
	year,
	weekStart,
	levels = 5,
	levelScale = "quantile",
	tone = "1",
	categories,
	unit,
	formatValue,
	tooltip = true,
	legend = true,
	legendLabels = ["Less", "More"],
	monthLabels = true,
	weekdayLabels = "alternate",
	size = "md",
	stretch = true,
	activeDate,
	defaultActiveDate = null,
	onActiveDateChange,
	selectedDate,
	onSelectDate,
	renderCell,
	loading = false,
	motion,
	locale,
	className,
	style,
	ref,
	...props
}: ActivityHeatmapProps) {
	const uid = useId()
	const { expressive } = useMotionLevel(motion)
	const [arrivalRef, inView] = useArrival<HTMLElement>()
	const figureRef = useMemo(() => mergeRefs(arrivalRef, ref), [arrivalRef, ref])
	const shown = !expressive || inView

	// ── The range and its grid ────────────────────────────────────────────────
	const todayN = today()
	const firstDay = weekStart ?? localeWeekStart(locale)
	const endN = year != null ? dayNumber(`${year}-12-31`) : end ? dayNumber(end) : todayN
	const startN = useMemo(() => {
		if (year != null) return dayNumber(`${year}-01-01`)
		if (start) return dayNumber(start)
		const back = endN - 364
		return back - ((weekday(back) - firstDay + 7) % 7)
	}, [year, start, endN, firstDay])
	const grid = useMemo(() => activityGrid({ start: startN, end: endN, weekStart: firstDay }), [startN, endN, firstDay])
	const last = Math.min(endN, todayN)
	const navigable = useCallback((n: number | null | undefined): n is number => n != null && n >= startN && n <= last, [startN, last])

	// ── Values, levels and colours ────────────────────────────────────────────
	const days = useMemo(() => (loading ? new Map() : normalizeActivity(data)), [data, loading])
	const scaleLevels = useMemo(
		() => activityLevels([...days.values()].map((d) => d.value), { levels, scale: levelScale }),
		[days, levels, levelScale],
	)
	const categoryKeys = categories ? Object.keys(categories) : []
	const base = toneColor(tone)
	const resolve = (n: number): ActivityHeatmapDay & { color: string; categoryLabel?: string } => {
		const d = days.get(n)
		const value = d?.value ?? 0
		const level = d?.level != null ? Math.min(levels - 1, Math.max(0, d.level)) : scaleLevels.level(value)
		const known = d?.category != null && categories?.[d.category] ? d.category : undefined
		const cat = known ? categoryStyle(categories, known, categoryKeys.indexOf(known)) : undefined
		return { date: isoDay(n), value, level, category: d?.category, color: heatColor(cat?.color ?? base, level, levels), categoryLabel: cat?.label }
	}

	// ── Words ─────────────────────────────────────────────────────────────────
	const words = useMemo(() => {
		const long = new Intl.DateTimeFormat(locale, { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" })
		const short = new Intl.DateTimeFormat(locale, { weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })
		const crossesYear = utcDate(startN).getUTCFullYear() !== utcDate(endN).getUTCFullYear()
		const monthLong = new Intl.DateTimeFormat(locale, { month: "long", ...(crossesYear ? { year: "numeric" } : {}), timeZone: "UTC" })
		const monthShort = new Intl.DateTimeFormat(locale, { month: "short", timeZone: "UTC" })
		const dayLong = new Intl.DateTimeFormat(locale, { weekday: "long", timeZone: "UTC" })
		const dayShort = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" })
		const plural = new Intl.PluralRules(locale)
		const number = (v: number) => formatValue?.(v) ?? new Intl.NumberFormat(locale, centerValueFormat(v)).format(v)
		const unitWord = (v: number) => (unit == null ? "" : typeof unit === "string" ? unit : plural.select(v) === "one" ? unit.one : unit.other)
		const none = unit == null ? "no activity" : `no ${typeof unit === "string" ? unit : unit.other}`
		return {
			long: (n: number) => long.format(utcDate(n)),
			short: (n: number) => short.format(utcDate(n)),
			monthLong: (n: number) => monthLong.format(utcDate(n)),
			monthShort: (n: number) => monthShort.format(utcDate(n)),
			// 1970-01-04 (day 3) was a Sunday, so day 3 + d is weekday d.
			dayLong: (d: number) => dayLong.format(utcDate(3 + d)),
			dayShort: (d: number) => dayShort.format(utcDate(3 + d)),
			number,
			value: (v: number) => (v > 0 ? [number(v), unitWord(v)].filter(Boolean).join(" ") : none),
			unitTitle: unit == null ? "Value" : (typeof unit === "string" ? unit : unit.other).replace(/^./, (c) => c.toUpperCase()),
		}
	}, [locale, startN, endN, formatValue, unit])
	const names = levelNames(levels)

	// ── Cell size: fill the width, down to the floor, then scroll ─────────────
	const areaRef = useRef<HTMLDivElement>(null)
	const scrollRef = useRef<HTMLDivElement>(null)
	const [width, setWidth] = useState<number | null>(null)
	const measure = useCallback(() => setWidth(areaRef.current?.clientWidth ?? null), [])
	useResizeObserver(measure, [areaRef])
	const cell = fitCell(width, grid.weeks.length, CELL_FLOOR[size], stretch)
	const gap = gapFor(cell)

	// Open on the latest day lived — today, or the range's end if that is earlier:
	// the recent end is what people check, and a strip that starts at the oldest
	// week hides it on every phone. Not the range's end: a calendar year opened on
	// December would show an empty future.
	const opened = useRef(false)
	useIsomorphicLayoutEffect(() => {
		const region = scrollRef.current
		if (!region || width == null || opened.current) return
		opened.current = true
		const latest = last >= startN ? cellAt(last) : null
		if (!latest) return
		const overshoot = latest.getBoundingClientRect().right - region.getBoundingClientRect().right
		region.scrollLeft = Math.max(0, region.scrollLeft + overshoot + PAD + gap)
	}, [width, cell])

	// ── Focus, active and selected days ───────────────────────────────────────
	const latestActive = useMemo(() => {
		for (let n = last; n >= startN; n--) if ((days.get(n)?.value ?? 0) > 0) return n
		return last >= startN ? last : null
	}, [days, last, startN])
	const [focusState, setFocusState] = useState<number | null>(null)
	const focusDay = navigable(focusState) ? focusState : latestActive

	const [uncontrolledActive, setUncontrolledActive] = useState<number | null>(defaultActiveDate ? dayNumber(defaultActiveDate) : null)
	const active = activeDate !== undefined ? (activeDate ? dayNumber(activeDate) : null) : uncontrolledActive
	const setActive = (n: number | null) => {
		if (n === active) return
		if (activeDate === undefined) setUncontrolledActive(n)
		onActiveDateChange?.(n == null ? null : isoDay(n))
	}
	const [dismissed, setDismissed] = useState(false)

	const selectable = onSelectDate != null
	const [uncontrolledSelected, setUncontrolledSelected] = useState<number | null>(null)
	const selected = selectedDate !== undefined ? (selectedDate ? dayNumber(selectedDate) : null) : uncontrolledSelected
	const select = (n: number) => {
		if (selectedDate === undefined) setUncontrolledSelected(n)
		onSelectDate?.(isoDay(n))
	}

	const tableRef = useRef<HTMLTableElement>(null)
	const cellAt = (n: number) => tableRef.current?.querySelector<HTMLElement>(`[data-date="${isoDay(n)}"]`) ?? null
	const dayOf = (target: EventTarget | null) => {
		const el = (target as Element | null)?.closest?.("td[data-date]") as HTMLElement | null
		return el?.dataset.date ? dayNumber(el.dataset.date) : null
	}

	/** Where a key moves from `n`, or null when it would leave the navigable days. ARIA grid: no wrapping. */
	const moveFrom = (n: number, event: KeyboardEvent): number | null => {
		const { week, row } = gridPosition(grid, n)
		const inRow = (w: number) => grid.weeks[w]?.days[row]
		const inColumn = (r: number) => grid.weeks[week].days[r]
		const firstOf = <T,>(items: T[], pick: (item: T) => number | null | undefined) => {
			for (const item of items) {
				const d = pick(item)
				if (navigable(d)) return d
			}
			return null
		}
		const weeks = grid.weeks.map((_, i) => i)
		const rows = [0, 1, 2, 3, 4, 5, 6]
		switch (event.key) {
			case "ArrowUp":
				return row > 0 ? n - 1 : null
			case "ArrowDown":
				return row < 6 ? n + 1 : null
			case "ArrowLeft":
				return n - 7
			case "ArrowRight":
				return n + 7
			case "Home":
				return event.ctrlKey || event.metaKey ? startN : firstOf(weeks, inRow)
			case "End":
				return event.ctrlKey || event.metaKey ? last : firstOf([...weeks].reverse(), inRow)
			case "PageUp":
				return firstOf(rows, inColumn)
			case "PageDown":
				return firstOf([...rows].reverse(), inColumn)
			default:
				return null
		}
	}

	const onKeyDown = (event: KeyboardEvent<HTMLTableElement>) => {
		const from = dayOf(event.target)
		if (from == null) return
		if (event.key === "Escape") {
			setDismissed(true)
			return
		}
		if ((event.key === "Enter" || event.key === " ") && selectable) {
			event.preventDefault()
			select(from)
			return
		}
		const handled = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End", "PageUp", "PageDown"].includes(event.key)
		if (!handled) return
		event.preventDefault()
		const next = moveFrom(from, event)
		if (!navigable(next)) return
		setFocusState(next)
		const el = cellAt(next)
		el?.focus({ preventScroll: true })
		el?.scrollIntoView({ block: "nearest", inline: "nearest" })
	}

	const onFocus = (event: FocusEvent<HTMLTableElement>) => {
		const n = dayOf(event.target)
		if (n == null) return
		setFocusState(n)
		setDismissed(false)
		setActive(n)
	}
	const onBlur = (event: FocusEvent<HTMLTableElement>) => {
		if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setActive(null)
	}
	const onPointerOver = (event: PointerEvent<HTMLTableElement>) => {
		const n = dayOf(event.target)
		if (!navigable(n)) return
		setDismissed(false)
		setActive(n)
	}
	const onPointerLeave = (event: PointerEvent<HTMLTableElement>) => {
		// A day focused by keyboard or tap keeps its tooltip after the pointer leaves.
		const focused = event.currentTarget.contains(document.activeElement) ? dayOf(document.activeElement) : null
		setActive(focused)
	}

	// ── The tooltip, anchored to the active cell ─────────────────────────────
	const bodyRef = useRef<HTMLDivElement>(null)
	const [tip, setTip] = useState<{ x: number; y: number; align: "start" | "center" | "end" } | null>(null)
	const showTip = tooltip !== false && !loading && !dismissed && navigable(active)
	useIsomorphicLayoutEffect(() => {
		if (!showTip || active == null) {
			setTip(null)
			return
		}
		const place = () => {
			const el = cellAt(active)
			const host = bodyRef.current
			if (!el || !host) return setTip(null)
			const c = el.getBoundingClientRect()
			const h = host.getBoundingClientRect()
			const x = c.left - h.left + c.width / 2
			setTip({ x, y: c.top - h.top, align: x < h.width * 0.2 ? "start" : x > h.width * 0.8 ? "end" : "center" })
		}
		place()
		const region = scrollRef.current
		region?.addEventListener("scroll", place, { passive: true })
		return () => region?.removeEventListener("scroll", place)
	}, [showTip, active, cell])

	const tipDay = active != null && showTip ? resolve(active) : null
	const tipContent =
		tipDay == null ? null : typeof tooltip === "function" ? (
			<ChartTooltipContent label={tooltip(tipDay)} rows={[]} />
		) : (
			<ChartTooltipContent
				label={words.short(dayNumber(tipDay.date))}
				rows={[{ key: "value", label: tipDay.categoryLabel ?? words.unitTitle, value: tipDay.value > 0 ? words.number(tipDay.value) : "0", color: tipDay.color }]}
			/>
		)

	// ── Render ────────────────────────────────────────────────────────────────
	const weeksCount = grid.weeks.length
	const showWeekday = (r: number) => weekdayLabels === "all" || (weekdayLabels === "alternate" && SHOWN_WEEKDAYS.has((firstDay + r) % 7))
	const vars = { "--heat-cell": `${cell}px`, "--heat-gap": `${gap}px` } as CSSProperties

	return (
		<figure
			ref={figureRef}
			data-reveal={shown ? "in" : "out"}
			data-motion={motionAttribute(motion)}
			className={cn("m-0 flex w-full min-w-0 flex-col gap-2", className)}
			style={{ ...vars, ...style }}
			{...props}
		>
			<div ref={bodyRef} className="relative flex min-w-0 items-start">
				{weekdayLabels !== "none" ? (
					// Outside the scroller on purpose: labels that sat inside it, pinned
					// over the cells, let the weeks slide under them on a phone.
					<div aria-hidden className="flex shrink-0 flex-col gap-(--heat-gap) pe-1 pt-[calc(var(--heat-gap)+--spacing(1))] text-caption text-muted-foreground">
						{monthLabels ? <span className="h-5" /> : null}
						{[0, 1, 2, 3, 4, 5, 6].map((r) => (
							<span key={r} className="flex h-(--heat-cell) items-center leading-none">
								{showWeekday(r) ? words.dayShort((firstDay + r) % 7) : null}
							</span>
						))}
					</div>
				) : null}
				<div ref={areaRef} className="min-w-0 flex-1">
					<Scroller ref={scrollRef} orientation="horizontal" tabIndex={-1} role="presentation" aria-label={undefined}>
						{/* relative: the sr-only headers are absolutely positioned, and without a
						    positioned box inside the scroller they escape its clip and widen the page. */}
						<div className="relative w-max p-1">
							<table
								ref={tableRef}
								role="grid"
								aria-readonly={selectable ? undefined : true}
								aria-busy={loading || undefined}
								aria-labelledby={`${uid}-caption`}
								onKeyDown={onKeyDown}
								onFocus={onFocus}
								onBlur={onBlur}
								onPointerOver={onPointerOver}
								onPointerLeave={onPointerLeave}
								onClick={(event) => {
									const n = dayOf(event.target)
									if (selectable && navigable(n)) select(n)
								}}
								className="border-separate border-spacing-(--heat-gap)"
							>
								<caption id={`${uid}-caption`} className="sr-only">
									{label}
								</caption>
								{monthLabels ? (
									<thead>
										<tr>
											<td className="sr-only" />
											{grid.months.map((m, i) => (
												<th
													key={m.day}
													scope="col"
													colSpan={m.span}
													className="h-5 overflow-visible whitespace-nowrap p-0 text-start align-bottom text-caption text-muted-foreground"
												>
													<span className="sr-only">{words.monthLong(m.day)}</span>
													{/* A label needs about two weeks of room; the range's partial opening month needs three. */}
													<span aria-hidden>{m.span >= 3 || (i > 0 && m.span >= 2) ? words.monthShort(m.day) : null}</span>
												</th>
											))}
										</tr>
									</thead>
								) : null}
								<tbody>
									{[0, 1, 2, 3, 4, 5, 6].map((r) => (
										<tr key={r}>
											<th scope="row" className="sr-only">
												{words.dayLong((firstDay + r) % 7)}
											</th>
											{grid.weeks.map((week, w) => {
												const n = week.days[r]
												if (n == null) return <td key={w} aria-hidden className="p-0" />
												if (n > last) {
													// Inside the range but not yet lived: drawn hollow, skipped by the keyboard.
													return <td key={w} aria-hidden className="size-(--heat-cell) rounded-xs border border-border-strong p-0" />
												}
												const day = resolve(n)
												const isActive = n === active && showTip
												return (
													<td
														key={w}
														role="gridcell"
														data-date={day.date}
														data-level={day.level}
														data-active={isActive || undefined}
														tabIndex={n === focusDay ? 0 : -1}
														aria-label={`${words.long(n)}: ${words.value(day.value)}${day.categoryLabel ? `, ${day.categoryLabel}` : ""}`}
														aria-describedby={`${uid}-level-${day.level}`}
														aria-selected={selectable ? n === selected : undefined}
														className={cn(
															"relative size-(--heat-cell) rounded-[min(var(--radius-xs),calc(var(--heat-cell)/4))] p-0 outline-offset-1 outline-ring",
															"focus-visible:outline-2 data-active:outline-2 aria-selected:outline-2 aria-selected:outline-foreground",
															"[[data-reveal=out]_&]:opacity-0",
															// Forced colours flatten every fill to one system colour, so the
															// level becomes the size of an inner square instead.
															"forced-colors:forced-color-adjust-none forced-colors:bg-[CanvasText] forced-colors:[clip-path:inset(var(--heat-inset))]",
															loading && "motion-shimmer",
														)}
														style={
															{
																backgroundColor: day.color,
																"--heat-inset": `${Math.round(((levels - 1 - day.level) / Math.max(1, levels - 1)) * 40)}%`,
																transition: `${riseTransition(stagger(Math.round((w * 24) / Math.max(1, weeksCount - 1))))}, background-color var(--motion-duration-base) var(--motion-ease-standard)`,
															} as CSSProperties
														}
													>
														{renderCell ? (
															<span className="absolute inset-0 flex items-center justify-center">
																{renderCell(day, { level: day.level, color: day.color, size: cell })}
															</span>
														) : null}
													</td>
												)
											})}
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</Scroller>
				</div>
				{tip && tipContent ? (
					<div
						aria-hidden
						className="pointer-events-none absolute start-0 top-0 z-10 transition-transform duration-(--motion-duration-fast) ease-standard"
						style={{ transform: `translate(${Math.round(tip.x)}px, ${Math.round(tip.y)}px)` }}
					>
						<div
							className={cn(
								"w-max -translate-y-full pb-2",
								tip.align === "center" && "-translate-x-1/2",
								tip.align === "end" && "-translate-x-full",
							)}
						>
							{tipContent}
						</div>
					</div>
				) : null}
			</div>

			{/* Each level's words, for the cells' descriptions to point at. */}
			<div hidden>
				{names.map((name, k) => (
					<span key={name} id={`${uid}-level-${k}`}>
						{name}
					</span>
				))}
			</div>

			{legend && categories ? (
				<ChartLegend
					className="justify-start"
					items={categoryKeys.map((key, i) => ({ key, ...categoryStyle(categories, key, i) }))}
				/>
			) : legend ? (
				<div aria-hidden className="flex items-center justify-end gap-1 text-caption text-muted-foreground">
					<span className="me-1">{legendLabels[0]}</span>
					{names.map((name, k) => (
						<span key={name} className="size-2.5 rounded-[2px]" style={{ backgroundColor: heatColor(base, k, levels) }} />
					))}
					<span className="ms-1">{legendLabels[1]}</span>
				</div>
			) : null}
		</figure>
	)
}
ActivityHeatmap.displayName = "ActivityHeatmap"

"use client"

import { type CSSProperties, type ReactNode, useId } from "react"
import { cn } from "../cn"
import { ChartFrame, type ChartSize } from "./chart-frame"
import { ChartLegend } from "./chart-legend"
import { ChartTooltipContent } from "./chart-tooltip"
import { approxTextWidth, categoryText, chartFormatters } from "./format"
import { areaPath, type ChartCurve, linePath, type Point, rectPath } from "./geometry"
import { GLIDE, barTransition, drawTransition, morphTransition, pathStyle, riseTransition, stagger } from "./motion"
import { bandScale, extent, linearScale, niceTicks, pointScale, stack } from "./scale"
import {
	type ChartDatum,
	type ChartSeries,
	type ChartTone,
	type ChartTooltipOptions,
	type ChartValueFormatter,
	chartColor,
	numberValue,
	resolveSeries,
	toneColor,
} from "./types"

/** Props every cartesian chart (area, bar, line) shares. */
export interface CartesianBaseProps {
	/** The rows to plot, in order along the category axis. */
	data: ChartDatum[]
	/** The datum field naming each row's category (a month, a day, a channel). */
	index: string
	/** The measures to plot, with labels and colours. */
	series: ChartSeries[]
	/** What the chart shows — its accessible name and the data table's caption. */
	label: string
	className?: string
	/** Format values on the axis, in labels, the tooltip and the data table. Default: compact on the axis, full elsewhere. */
	valueFormatter?: ChartValueFormatter
	/** Format category labels on the axis ("January" → "Jan"). The tooltip keeps the full value. */
	indexFormatter?: (value: string) => string
	/** BCP 47 locale for default number and date formatting. */
	locale?: string
	/** Show a tooltip on hover and keyboard focus, or pass options. @default true */
	tooltip?: boolean | ChartTooltipOptions
	/** Show the legend. @default true when there is more than one series */
	legend?: boolean
	/** Hairline gridlines along the value axis. @default true (false for horizontal bars) */
	grid?: boolean
	/** The horizontal axis. @default true for categories (columns), false for values (horizontal bars) */
	xAxis?: boolean
	/** The vertical axis. @default false for values (columns), true for categories (horizontal bars) */
	yAxis?: boolean
	/** Play the arrival when the chart scrolls into view. @default true */
	animate?: boolean
	/** The highlighted row (controlled). `null` for none. */
	activeIndex?: number | null
	/** The row highlighted at first — a tooltip that is open before anyone hovers. */
	defaultActiveIndex?: number | null
	onActiveIndexChange?: (index: number | null) => void
}

export interface CartesianChartProps extends CartesianBaseProps {
	kind: "area" | "line" | "bar"
	curve?: ChartCurve
	stacked?: boolean | "expand"
	gradient?: boolean
	dots?: boolean
	labels?: boolean | "inside"
	orientation?: "vertical" | "horizontal"
	colorBy?: "series" | "index"
	negativeTone?: ChartTone
	radius?: number
	barWidth?: number
}

const AXIS_TEXT = "fill-muted-foreground text-caption tabular-nums"
/** Grid and axis rules recede: a hairline of ink, the same weight on every surface. */
const RULE = "stroke-foreground/10"
/** The surface the chart sits on — for the gaps between marks and the rings around dots. */
const SURFACE = "stroke-(--sable-surface-bg,var(--background))"
/** Touching marks (stacked segments, grouped bars) are separated by this much surface. */
const GAP = 2

/**
 * The engine behind AreaChart, LineChart and BarChart: one layout (scales,
 * axes, grid, margins), one interaction model, and the marks for each kind.
 *
 * Mark specs: 2px lines with round joins; bars capped in thickness with a 4px
 * rounded data-end and a square baseline; a 2px surface gap between touching
 * marks; 8px dots with a 2px surface ring; area fills a wash, not a block;
 * hairline gridlines that recede; labels that never run past the plot.
 */
export function CartesianChart(props: CartesianChartProps) {
	const {
		kind,
		data,
		index,
		series: rawSeries,
		label,
		className,
		valueFormatter,
		indexFormatter,
		locale,
		tooltip = true,
		legend,
		animate = true,
		activeIndex,
		defaultActiveIndex,
		onActiveIndexChange,
		curve = "smooth",
		stacked = false,
		gradient = false,
		dots = false,
		labels = false,
		orientation = "vertical",
		colorBy = "series",
		negativeTone,
		radius = 4,
		barWidth = 24,
	} = props
	const horizontal = kind === "bar" && orientation === "horizontal"
	const xAxis = props.xAxis ?? !horizontal
	const yAxis = props.yAxis ?? horizontal
	const grid = props.grid ?? !horizontal
	const uid = useId().replace(/:/g, "")
	const series = resolveSeries(rawSeries)
	const fmt = chartFormatters(locale, valueFormatter)
	const expand = stacked === "expand"
	const percent = new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 0 })
	const n = data.length
	const values = series.map((s) => data.map((d) => numberValue(d[s.key])))
	const stacks = stacked ? stack(values, expand) : null
	const categories = data.map((d) => categoryText(d[index], locale))
	const tickText = (i: number) => (indexFormatter ? indexFormatter(categories[i]) : categories[i])
	const tooltipOptions: ChartTooltipOptions = typeof tooltip === "object" ? tooltip : {}
	const showLegend = legend ?? series.length > 1
	const hasNegative = values.some((s) => s.some((v) => v < 0))

	const domainValues = stacks ? stacks.flatMap((s) => s.map(([a, b]) => [a, b])) : values
	const [lo, hi] = expand ? [0, 1] : extent(domainValues, kind !== "line")
	const colorAt = (s: number, i: number) => {
		if (negativeTone && values[s][i] < 0) return toneColor(negativeTone)
		if (colorBy === "index") return chartColor(i)
		return series[s].colorValue
	}
	const axisValue = (v: number) => (expand ? percent.format(v) : fmt.axis(v))
	const fullValue = (s: number, i: number) => {
		const v = values[s][i]
		if (!expand || !stacks) return fmt.full(v)
		const [a, b] = stacks[s][i]
		return `${fmt.full(v)} (${percent.format(Math.abs(b - a))})`
	}

	const layoutFor = (size: ChartSize) => {
		const valueSpan = horizontal ? size.width : size.height
		const ticks = niceTicks(lo, hi, Math.max(2, Math.min(6, Math.round(valueSpan / 56))))
		const domain: [number, number] = expand ? [0, 1] : [ticks[0], ticks[ticks.length - 1]]
		const valueTicks = expand ? [0, 0.25, 0.5, 0.75, 1] : ticks
		const categoryWidth = Math.max(0, ...categories.map((_, i) => approxTextWidth(tickText(i))))
		const valueWidth = Math.max(0, ...valueTicks.map((t) => approxTextWidth(axisValue(t))))
		const labelRoom = labels ? (horizontal ? Math.max(...values.flat().map((v) => approxTextWidth(fmt.full(v)))) + 8 : 20) : 0
		// Dots and line caps reach past their point; keep them inside the box.
		const inset = kind === "bar" ? 0 : dots ? 6 : 2
		const left = (yAxis ? (horizontal ? categoryWidth : valueWidth) + 10 : 0) + inset
		const right = inset + (horizontal ? labelRoom : 0)
		const top = (dots ? 6 : 4) + (horizontal ? 0 : labelRoom)
		const bottom = xAxis ? 26 : dots ? 6 : 2
		const x0 = left
		const x1 = Math.max(x0 + 1, size.width - right)
		const y0 = top
		const y1 = Math.max(y0 + 1, size.height - bottom)
		const value = horizontal ? linearScale(domain, [x0, x1]) : linearScale(domain, [y1, y0])
		const base = value(Math.max(domain[0], Math.min(domain[1], 0)))
		const catRange: [number, number] = horizontal ? [y0, y1] : [x0, x1]
		const band = kind === "bar" ? bandScale(n, catRange, series.length > 1 && !stacked ? 0.2 : 0.3, 0) : null
		const point = kind === "bar" ? null : pointScale(n, catRange)
		const center = (i: number) => (band ? band.at(i) + band.bandwidth / 2 : (point?.at(i) ?? 0))
		return { x0, x1, y0, y1, value, base, valueTicks, band, point, center }
	}

	const hitTest = (x: number, y: number, size: ChartSize) => {
		if (!n) return null
		const L = layoutFor(size)
		const pos = horizontal ? y : x
		let best = 0
		let dist = Number.POSITIVE_INFINITY
		for (let i = 0; i < n; i++) {
			const d = Math.abs(L.center(i) - pos)
			if (d < dist) {
				dist = d
				best = i
			}
		}
		return best
	}

	const describe = (i: number) => `${categories[i]}: ${series.map((s, k) => `${s.label} ${fullValue(k, i)}`).join(", ")}`

	const tooltipFor = (i: number, size: ChartSize) => {
		const L = layoutFor(size)
		const total = values.reduce((sum, s) => sum + s[i], 0)
		const content = (
			<ChartTooltipContent
				indicator={tooltipOptions.indicator}
				label={
					tooltipOptions.hideLabel
						? undefined
						: tooltipOptions.labelFormatter
							? tooltipOptions.labelFormatter(categories[i], data[i])
							: categories[i]
				}
				rows={series.map((s, k) => ({ key: s.key, label: s.label, value: fullValue(k, i), color: colorAt(k, i), icon: s.icon }))}
				total={tooltipOptions.showTotal ? fmt.full(total) : undefined}
			/>
		)
		// Anchored to the data: beside the row's longest bar, or level with the
		// plot's middle — never chasing the pointer, which made the card wobble.
		if (horizontal) {
			const end = Math.max(0, ...series.map((_, k) => (stacks ? stacks[k][i][1] : values[k][i])))
			return { content, x: Math.min(L.value(end), L.x1), y: L.center(i) }
		}
		return { content, x: L.center(i), y: (L.y0 + L.y1) / 2 }
	}

	const table = {
		headers: [index.charAt(0).toUpperCase() + index.slice(1), ...series.map((s) => s.label)],
		rows: data.map((_, i) => [categories[i], ...series.map((_, k) => fullValue(k, i))]),
	}

	return (
		<ChartFrame
			label={label}
			className={className}
			count={n}
			interactive={tooltip !== false}
			animate={animate}
			activeIndex={activeIndex}
			defaultActiveIndex={defaultActiveIndex}
			onActiveIndexChange={onActiveIndexChange}
			hitTest={hitTest}
			tooltip={tooltip === false ? undefined : tooltipFor}
			describe={describe}
			table={table}
			legend={showLegend ? <ChartLegend items={series.map((s) => ({ key: s.key, label: s.label, color: s.colorValue, icon: s.icon }))} /> : null}
		>
			{({ size, activeIndex: active }) => {
				const L = layoutFor(size)
				const marks: ReactNode[] = []
				// Hover dots sit above EVERY series: drawn with their own series, a
				// stacked area painted after it covered the dot below.
				const activeDots: ReactNode[] = []

				/* Category labels: thinned from the LATEST row back, so the newest
				   date always shows, and clamped inside the plot so the end labels
				   never hang past its edges. */
				const widths = categories.map((_, i) => approxTextWidth(tickText(i)))
				const slot = ((horizontal ? L.y1 - L.y0 : L.x1 - L.x0) / Math.max(1, n)) || 1
				const every = Math.max(1, Math.ceil((horizontal ? 18 : Math.max(0, ...widths) + 12) / slot))
				const categoryAxis = categories.map((_, i) => {
					if ((n - 1 - i) % every !== 0) return null
					const p = L.center(i)
					if (horizontal) {
						return (
							<text key={`c${i}`} x={L.x0 - 10} y={p} dy="0.32em" textAnchor="end" className={AXIS_TEXT}>
								{tickText(i)}
							</text>
						)
					}
					const half = widths[i] / 2
					const x = Math.min(Math.max(p, L.x0 + half), L.x1 - half)
					return (
						<text key={`c${i}`} x={x} y={L.y1 + 18} textAnchor="middle" className={AXIS_TEXT}>
							{tickText(i)}
						</text>
					)
				})

				const gridLines = L.valueTicks.map((t) => {
					const p = L.value(t)
					return horizontal ? (
						<line key={`g${t}`} x1={p} x2={p} y1={L.y0} y2={L.y1} className={RULE} />
					) : (
						<line key={`g${t}`} x1={L.x0} x2={L.x1} y1={p} y2={p} className={RULE} />
					)
				})
				const valueAxis = L.valueTicks.map((t) => {
					const p = L.value(t)
					return horizontal ? (
						<text key={`v${t}`} x={p} y={L.y1 + 18} textAnchor="middle" className={AXIS_TEXT}>
							{axisValue(t)}
						</text>
					) : (
						<text key={`v${t}`} x={L.x0 - 10} y={p} dy="0.32em" textAnchor="end" className={AXIS_TEXT}>
							{axisValue(t)}
						</text>
					)
				})

				/* Cursor behind the marks. Drawn once at the origin and moved with a
				   transform, so it glides from one position to the next instead of
				   jumping; a band is the band's own width, so it never runs past the
				   plot's edges. */
				let cursor: ReactNode = null
				if (active != null && active < n) {
					const c = L.center(active)
					const move = { transform: horizontal ? `translate(0px, ${c}px)` : `translate(${c}px, 0px)`, transition: GLIDE } as CSSProperties
					if (L.band) {
						const w = L.band.bandwidth
						cursor = (
							<g style={move}>
								{horizontal ? (
									<rect x={L.x0} y={-w / 2} width={L.x1 - L.x0} height={w} rx={6} className="fill-foreground/5" />
								) : (
									<rect x={-w / 2} y={L.y0} width={w} height={L.y1 - L.y0} rx={6} className="fill-foreground/5" />
								)}
							</g>
						)
					} else {
						cursor = (
							<g style={move}>
								<line x1={0} x2={0} y1={L.y0} y2={L.y1} className="stroke-foreground/25" />
							</g>
						)
					}
				}

				if (kind === "bar" && L.band) {
					const band = L.band
					const groups = stacked ? 1 : series.length
					// Bars are capped in thickness and centred in their band: the
					// band's leftover is air, not a fatter bar.
					const thickness = Math.max(2, Math.min(barWidth, (band.bandwidth - GAP * (groups - 1)) / groups))
					const groupSize = thickness * groups + GAP * (groups - 1)
					series.forEach((_, k) => {
						for (let i = 0; i < n; i++) {
							const [a, b] = stacks ? stacks[k][i] : [0, values[k][i]]
							if (a === b) continue
							const offset = band.at(i) + (band.bandwidth - groupSize) / 2 + (stacked ? 0 : k * (thickness + GAP))
							const positive = b >= a
							// A segment sitting on another takes a surface gap at its base.
							const onAnother = stacks ? stacks.some((other, j) => j < k && other[i][0] !== other[i][1] && Math.sign(other[i][1] - other[i][0]) === Math.sign(b - a)) : false
							// Round only the far end; in a stack, only the outermost segment.
							const outer = !stacks || !stacks.some((other, j) => j > k && other[i][0] !== other[i][1] && Math.sign(other[i][1] - other[i][0]) === Math.sign(b - a))
							const r = outer ? radius : 0
							const p0 = L.value(a)
							const p1 = L.value(b)
							const dir = Math.sign(p1 - p0) || 1
							const start = p0 + (onAnother ? GAP * dir : 0)
							let d: string
							let origin: string
							if (horizontal) {
								const x = Math.min(start, p1)
								const w = Math.max(1, Math.abs(p1 - start))
								d = rectPath(x, offset, w, thickness, positive ? [0, r, r, 0] : [r, 0, 0, r])
								origin = `${L.base}px 0px`
							} else {
								const y = Math.min(start, p1)
								const h = Math.max(1, Math.abs(p1 - start))
								d = rectPath(offset, y, thickness, h, positive ? [r, r, 0, 0] : [0, 0, r, r])
								origin = `0px ${L.base}px`
							}
							const dim = active != null && active !== i
							marks.push(
								<path
									key={`b${k}-${i}`}
									d={d}
									className={cn(
										horizontal ? "[[data-reveal=out]_&]:scale-x-0" : "[[data-reveal=out]_&]:scale-y-0",
										dim && "opacity-40",
									)}
									style={{
										...pathStyle(d),
										fill: colorAt(k, i),
										transformOrigin: origin,
										transition: barTransition(stagger(i)),
									} as CSSProperties}
								/>,
							)
							if (labels && (!stacked || outer)) {
								const end = stacks ? stacks[k][i][1] : values[k][i]
								const text = stacked ? fmt.full(values.reduce((sum, sv) => sum + sv[i], 0)) : fmt.full(values[k][i])
								const shown = expand ? percent.format(1) : text
								const labelClass = "fill-foreground text-caption tabular-nums [[data-reveal=out]_&]:opacity-0"
								if (labels === "inside" && horizontal && thickness >= 16) {
									marks.push(
										<text key={`li${k}-${i}`} x={Math.min(p0, p1) + 8} y={offset + thickness / 2} dy="0.32em" className="fill-background text-label-sm [[data-reveal=out]_&]:opacity-0" style={{ transition: riseTransition(stagger(i)) }}>
											{categories[i]}
										</text>,
									)
								}
								marks.push(
									horizontal ? (
										<text key={`l${k}-${i}`} x={L.value(end) + (end >= 0 ? 6 : -6)} y={offset + thickness / 2} dy="0.32em" textAnchor={end >= 0 ? "start" : "end"} className={labelClass} style={{ transition: riseTransition(stagger(i)) }}>
											{shown}
										</text>
									) : (
										<text key={`l${k}-${i}`} x={offset + thickness / 2} y={L.value(end) + (end >= 0 ? -7 : 15)} textAnchor="middle" className={labelClass} style={{ transition: riseTransition(stagger(i)) }}>
											{shown}
										</text>
									),
								)
							}
						}
					})
				} else if (L.point) {
					const pts = (k: number, which: 0 | 1): Point[] =>
						data.map((_, i) => [L.center(i), L.value(stacks ? stacks[k][i][which] : which === 0 ? 0 : values[k][i])])
					// Areas paint back to front so the first series sits on top of an overlap.
					const order = series.map((_, k) => k)
					if (kind === "area" && !stacks) order.reverse()
					for (const k of order) {
						const s = series[k]
						const top = pts(k, 1)
						if (kind === "area") {
							const bottom = stacks ? pts(k, 0) : top.map(([x]) => [x, L.base] as Point)
							const d = areaPath(top, bottom, curve)
							const fillId = `${uid}-fill-${k}`
							if (gradient) {
								marks.push(
									<defs key={`d${k}`}>
										<linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
											<stop offset="0%" stopColor={s.colorValue} stopOpacity={stacks ? 0.5 : 0.22} />
											<stop offset="100%" stopColor={s.colorValue} stopOpacity={0.02} />
										</linearGradient>
									</defs>,
								)
							}
							marks.push(
								<path
									key={`a${k}`}
									d={d}
									className="[[data-reveal=out]_&]:scale-y-0 [[data-reveal=out]_&]:opacity-0"
									style={{
										...pathStyle(d),
										fill: gradient ? `url(#${fillId})` : s.colorValue,
										// A wash where areas overlap; firmer when stacked, where each band is its own.
										fillOpacity: gradient ? 1 : stacks ? 0.32 : 0.14,
										transformOrigin: `0px ${L.base}px`,
										transition: riseTransition(stagger(k, 80)),
									} as CSSProperties}
								/>,
							)
						}
						const line = linePath(top, curve)
						marks.push(
							<path
								key={`s${k}`}
								d={line}
								pathLength={1}
								fill="none"
								strokeWidth={2}
								strokeLinecap="round"
								strokeLinejoin="round"
								className="[stroke-dasharray:1] [stroke-dashoffset:0] [[data-reveal=out]_&]:[stroke-dashoffset:1]"
								style={{ ...pathStyle(line), stroke: s.colorValue, transition: drawTransition(stagger(k, 120)) } as CSSProperties}
							/>,
						)
						if (dots || labels) {
							top.forEach(([x, y], i) => {
								if (dots)
									marks.push(
										<circle
											key={`p${k}-${i}`}
											cx={x}
											cy={y}
											r={4}
											strokeWidth={2}
											className={cn(SURFACE, "[[data-reveal=out]_&]:opacity-0")}
											style={{ fill: colorBy === "index" ? colorAt(k, i) : s.colorValue, transition: morphTransition(), transitionDelay: `calc(${300 + i * 25}ms * var(--motion-scale, 1))` }}
										/>,
									)
								if (labels)
									marks.push(
										<text key={`t${k}-${i}`} x={x} y={y - 12} textAnchor="middle" className="fill-foreground text-caption tabular-nums [[data-reveal=out]_&]:opacity-0" style={{ transition: morphTransition() }}>
											{fmt.full(values[k][i])}
										</text>,
									)
							})
						}
						if (active != null && active < n) {
							const [x, y] = top[active]
							// One dot per series, kept mounted while hovering, so it glides from
							// point to point instead of blinking out and in.
							activeDots.push(<circle key={`ap${k}`} cx={x} cy={y} r={5} strokeWidth={2} className={SURFACE} style={{ fill: s.colorValue, cx: x, cy: y, transition: GLIDE } as CSSProperties} />)
						}
					}
				}

				const zero = kind === "bar" && (hasNegative || !grid)
				return (
					<>
						{grid ? <g>{gridLines}</g> : null}
						{cursor}
						<g>{marks}</g>
						<g>{activeDots}</g>
						{zero ? (
							horizontal ? (
								<line x1={L.base} x2={L.base} y1={L.y0} y2={L.y1} className="stroke-foreground/20" />
							) : (
								<line x1={L.x0} x2={L.x1} y1={L.base} y2={L.base} className="stroke-foreground/20" />
							)
						) : null}
						{(horizontal ? xAxis : yAxis) ? <g>{valueAxis}</g> : null}
						{(horizontal ? yAxis : xAxis) ? <g>{categoryAxis}</g> : null}
					</>
				)
			}}
		</ChartFrame>
	)
}

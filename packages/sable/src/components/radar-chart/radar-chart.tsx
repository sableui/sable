"use client"

import type { CSSProperties } from "react"
import { ChartFrame, type ChartSize } from "../../lib/chart/chart-frame"
import { ChartLegend } from "../../lib/chart/chart-legend"
import { ChartTooltipContent } from "../../lib/chart/chart-tooltip"
import { approxTextWidth, categoryText, chartFormatters } from "../../lib/chart/format"
import { type Point, polar } from "../../lib/chart/geometry"
import { morphTransition, pathStyle, riseTransition, stagger } from "../../lib/chart/motion"
import { niceTicks } from "../../lib/chart/scale"
import {
	type ChartDatum,
	type ChartSeries,
	type ChartTooltipOptions,
	type ChartValueFormatter,
	numberValue,
	resolveSeries,
} from "../../lib/chart/types"
import { cn } from "../../lib/cn"

export interface RadarChartProps {
	/** One row per spoke (a skill, a month, a dimension). */
	data: ChartDatum[]
	/** The datum field naming each spoke. */
	index: string
	/** The measures drawn as polygons. */
	series: ChartSeries[]
	/** What the chart shows — its accessible name and the data table's caption. */
	label: string
	className?: string
	/** The web behind the polygons: straight rings, round rings, or none. @default "polygon" */
	grid?: "polygon" | "circle" | "none"
	/** Tint the web's outer ring. @default false */
	gridFill?: boolean
	/** Fill each polygon; `false` draws outlines only. @default true */
	filled?: boolean
	/** Mark every vertex with a dot. @default false */
	dots?: boolean
	/** Print the ring values along the top spoke. @default false */
	radiusAxis?: boolean
	/** Show the legend. @default true when there is more than one series */
	legend?: boolean
	/** Show a tooltip on hover and keyboard focus, or pass options. @default true */
	tooltip?: boolean | ChartTooltipOptions
	valueFormatter?: ChartValueFormatter
	locale?: string
	/** Grow the polygons from the centre when the chart scrolls into view. @default true */
	animate?: boolean
	activeIndex?: number | null
	defaultActiveIndex?: number | null
	onActiveIndexChange?: (index: number | null) => void
}

/**
 * Several measures compared around a centre — a profile's shape at a glance
 * (skills, product scores, a month-by-month cycle). Best with five to eight
 * spokes and one to three series. Polygons grow out from the centre as the
 * chart scrolls into view.
 */
export function RadarChart({
	data,
	index,
	series: rawSeries,
	label,
	className,
	grid = "polygon",
	gridFill = false,
	filled = true,
	dots = false,
	radiusAxis = false,
	legend,
	tooltip = true,
	valueFormatter,
	locale,
	animate = true,
	activeIndex,
	defaultActiveIndex,
	onActiveIndexChange,
}: RadarChartProps) {
	const series = resolveSeries(rawSeries)
	const fmt = chartFormatters(locale, valueFormatter)
	const n = data.length
	const spokes = data.map((d) => categoryText(d[index], locale))
	const values = series.map((s) => data.map((d) => Math.max(0, numberValue(d[s.key]))))
	const ticks = niceTicks(0, Math.max(0, ...values.flat()), 4)
	const max = ticks[ticks.length - 1] || 1
	const angleAt = (i: number) => (i / Math.max(1, n)) * Math.PI * 2
	const tooltipOptions: ChartTooltipOptions = typeof tooltip === "object" ? tooltip : {}

	const geometry = (size: ChartSize) => {
		const labelW = Math.max(0, ...spokes.map(approxTextWidth))
		const outer = Math.max(8, Math.min(size.width / 2 - labelW - 10, size.height / 2 - 22))
		return { cx: size.width / 2, cy: size.height / 2, outer }
	}
	const ringPoints = (g: ReturnType<typeof geometry>, r: number): Point[] => spokes.map((_, i) => polar(g.cx, g.cy, r, angleAt(i)))
	const toPath = (pts: Point[]) => (pts.length ? `M${pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join("L")}Z` : "")

	const hitTest = (x: number, y: number, size: ChartSize) => {
		const g = geometry(size)
		if (Math.hypot(x - g.cx, y - g.cy) > g.outer + 24 || !n) return null
		const angle = (Math.atan2(x - g.cx, -(y - g.cy)) + Math.PI * 2) % (Math.PI * 2)
		return Math.round(angle / ((Math.PI * 2) / n)) % n
	}
	const describe = (i: number) => `${spokes[i]}: ${series.map((s, k) => `${s.label} ${fmt.full(values[k][i])}`).join(", ")}`
	const tooltipFor = (i: number, size: ChartSize) => {
		const g = geometry(size)
		const [x, y] = polar(g.cx, g.cy, g.outer, angleAt(i))
		return {
			x,
			y,
			content: (
				<ChartTooltipContent
					indicator={tooltipOptions.indicator}
					label={tooltipOptions.hideLabel ? undefined : tooltipOptions.labelFormatter ? tooltipOptions.labelFormatter(spokes[i], data[i]) : spokes[i]}
					rows={series.map((s, k) => ({ key: s.key, label: s.label, value: fmt.full(values[k][i]), color: s.colorValue, icon: s.icon }))}
				/>
			),
		}
	}

	return (
		<ChartFrame
			label={label}
			className={cn("h-72", className)}
			count={n}
			interactive={tooltip !== false}
			animate={animate}
			activeIndex={activeIndex}
			defaultActiveIndex={defaultActiveIndex}
			onActiveIndexChange={onActiveIndexChange}
			hitTest={hitTest}
			tooltip={tooltip === false ? undefined : tooltipFor}
			describe={describe}
			table={{
				headers: [index.charAt(0).toUpperCase() + index.slice(1), ...series.map((s) => s.label)],
				rows: data.map((_, i) => [spokes[i], ...series.map((_, k) => fmt.full(values[k][i]))]),
			}}
			legend={(legend ?? series.length > 1) ? <ChartLegend items={series.map((s) => ({ key: s.key, label: s.label, color: s.colorValue, icon: s.icon }))} /> : null}
		>
			{({ size, activeIndex: active }) => {
				const g = geometry(size)
				const rings = ticks.slice(1).map((t) => (t / max) * g.outer)
				return (
					<>
						{gridFill ? (
							grid === "circle" ? (
								<circle cx={g.cx} cy={g.cy} r={g.outer} className="fill-foreground/[0.04]" />
							) : (
								<path d={toPath(ringPoints(g, g.outer))} className="fill-foreground/[0.04]" />
							)
						) : null}
						{grid !== "none" ? (
							<g className="fill-none stroke-foreground/10">
								{rings.map((r) =>
									grid === "circle" ? <circle key={r} cx={g.cx} cy={g.cy} r={r} /> : <path key={r} d={toPath(ringPoints(g, r))} />,
								)}
								{spokes.map((s, i) => {
									const [x, y] = polar(g.cx, g.cy, g.outer, angleAt(i))
									return <line key={s} x1={g.cx} y1={g.cy} x2={x} y2={y} />
								})}
							</g>
						) : null}
						{series.map((s, k) => {
							const pts = values[k].map((v, i) => polar(g.cx, g.cy, (v / max) * g.outer, angleAt(i)))
							const d = toPath(pts)
							return (
								<g key={s.key}>
									<path
										d={d}
										strokeWidth={2}
										strokeLinejoin="round"
										className="[[data-reveal=out]_&]:scale-0 [[data-reveal=out]_&]:opacity-0"
										style={{
											...pathStyle(d),
											stroke: s.colorValue,
											fill: filled ? s.colorValue : "none",
											fillOpacity: filled ? 0.24 : 0,
											transformOrigin: `${g.cx}px ${g.cy}px`,
											transition: riseTransition(stagger(k, 120)),
										} as CSSProperties}
									/>
									{dots || active != null
										? pts.map(([x, y], i) =>
												dots || active === i ? (
													<circle
														key={spokes[i]}
														cx={x}
														cy={y}
														r={active === i ? 5 : 4}
														strokeWidth={2}
														className="stroke-(--sable-surface-bg,var(--background)) [[data-reveal=out]_&]:opacity-0"
														style={{ fill: s.colorValue, transition: morphTransition() }}
													/>
												) : null,
											)
										: null}
								</g>
							)
						})}
						{spokes.map((s, i) => {
							const a = angleAt(i)
							const [x, y] = polar(g.cx, g.cy, g.outer + 12, a)
							const anchor = Math.sin(a) > 0.1 ? "start" : Math.sin(a) < -0.1 ? "end" : "middle"
							return (
								<text key={s} x={x} y={y} dy="0.32em" textAnchor={anchor} className={cn("text-caption", active === i ? "fill-foreground" : "fill-muted-foreground")}>
									{s}
								</text>
							)
						})}
						{radiusAxis
							? ticks.slice(1, -1).map((t) => (
									<text key={t} x={g.cx + 4} y={g.cy - (t / max) * g.outer} dy="-0.2em" className="fill-muted-foreground text-caption tabular-nums">
										{fmt.axis(t)}
									</text>
								))
							: null}
					</>
				)
			}}
		</ChartFrame>
	)
}
RadarChart.displayName = "RadarChart"

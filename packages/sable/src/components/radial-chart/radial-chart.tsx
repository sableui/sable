"use client"

import type { CSSProperties } from "react"
import { ChartFrame, type ChartSize } from "../../lib/chart/chart-frame"
import { ChartLegend } from "../../lib/chart/chart-legend"
import { ChartTooltipContent } from "../../lib/chart/chart-tooltip"
import { categoryText, centerValueText, chartFormatters } from "../../lib/chart/format"
import { polar, strokeArcPath } from "../../lib/chart/geometry"
import { drawTransition, morphTransition, pathStyle, stagger } from "../../lib/chart/motion"
import {
	type ChartCategories,
	type ChartCenterLabel,
	type ChartDatum,
	type ChartTooltipOptions,
	type ChartValueFormatter,
	categoryStyle,
	numberValue,
} from "../../lib/chart/types"
import { cn } from "../../lib/cn"

export interface RadialChartProps {
	/** One row per ring, outermost first. */
	data: ChartDatum[]
	/** The datum field naming each ring. */
	index: string
	/** The datum field holding each ring's amount. */
	valueKey: string
	/** What the chart shows — its accessible name and the data table's caption. */
	label: string
	/** Labels, tones and icons per ring, keyed by the ring's name. Unlisted rings take the tones in order. */
	categories?: ChartCategories
	className?: string
	/** The value a full ring stands for. @default the largest value */
	max?: number
	/** How far round a full ring runs, in degrees: 360 for a circle, 180 for a gauge. @default 360 */
	sweep?: number
	/** Stack every row along ONE ring (a split gauge) instead of a ring each. @default false */
	stacked?: boolean
	/** Draw each ring's full track behind it in the muted surface. @default true */
	track?: boolean
	/** Name each ring at its start. @default false */
	labels?: boolean
	/** A value and caption in the middle — the total, or the headline ring. */
	centerLabel?: ChartCenterLabel
	/** Show the legend. @default true unless rings are labelled */
	legend?: boolean
	/** Show a tooltip on hover and keyboard focus, or pass options. @default true */
	tooltip?: boolean | ChartTooltipOptions
	valueFormatter?: ChartValueFormatter
	locale?: string
	/** Draw the rings round from their start when the chart scrolls into view. @default true */
	animate?: boolean
	activeIndex?: number | null
	defaultActiveIndex?: number | null
	onActiveIndexChange?: (index: number | null) => void
}

/**
 * Progress or share drawn as rings — goals met, plan usage, a score. One ring
 * per row (outermost first), each against a muted track; `sweep={180}` makes a
 * gauge and `stacked` splits one ring between rows. Rings draw round from 12
 * o'clock (or the gauge's left) as the chart scrolls into view.
 */
export function RadialChart({
	data,
	index,
	valueKey,
	label,
	categories,
	className,
	max,
	sweep = 360,
	stacked = false,
	track = true,
	labels = false,
	centerLabel,
	legend,
	tooltip = true,
	valueFormatter,
	locale,
	animate = true,
	activeIndex,
	defaultActiveIndex,
	onActiveIndexChange,
}: RadialChartProps) {
	const fmt = chartFormatters(locale, valueFormatter)
	const names = data.map((d) => categoryText(d[index], locale))
	const styles = names.map((name, i) => categoryStyle(categories, name, i))
	const values = data.map((d) => Math.max(0, numberValue(d[valueKey])))
	const total = values.reduce((a, b) => a + b, 0)
	// Labelled rings sit in the quarter before 12 o'clock, so by default the
	// longest ring stops at three quarters instead of running over them.
	const full = (max ?? (stacked ? total : Math.max(0, ...values) / (labels ? 0.75 : 1))) || 1
	const span = (Math.min(360, Math.max(10, sweep)) * Math.PI) / 180
	const start = -span / 2 + (sweep >= 360 ? span / 2 : 0)
	const tooltipOptions: ChartTooltipOptions = typeof tooltip === "object" ? tooltip : {}
	const gauge = sweep < 360

	const geometry = (size: ChartSize) => {
		// A gauge sits on its flat edge, so it can use nearly the full height.
		const outer = gauge ? Math.min(size.width / 2, size.height * (sweep <= 180 ? 0.92 : 0.6)) - 8 : Math.min(size.width, size.height) / 2 - 8
		const cx = size.width / 2
		const cy = gauge && sweep <= 180 ? size.height - 8 : size.height / 2
		const rings = stacked ? 1 : data.length
		const inner = outer * (centerLabel ? 0.62 : 0.4)
		const pitch = (outer - inner) / Math.max(1, rings)
		const thickness = stacked ? Math.min(28, outer - inner) : Math.max(4, pitch * 0.72)
		return { cx, cy, outer, pitch, thickness }
	}

	const arcs = (() => {
		let acc = 0
		return values.map((v, i) => {
			if (stacked) {
				const a0 = start + (acc / full) * span
				acc += v
				return { ring: 0, a0, a1: start + (acc / full) * span, i }
			}
			return { ring: i, a0: start, a1: start + (Math.min(v, full) / full) * span, i }
		})
	})()
	const radiusOf = (g: ReturnType<typeof geometry>, ring: number) => (stacked ? g.outer - g.thickness / 2 : g.outer - g.pitch * ring - g.pitch / 2)

	const hitTest = (x: number, y: number, size: ChartSize) => {
		const g = geometry(size)
		const r = Math.hypot(x - g.cx, y - g.cy)
		const angle = Math.atan2(x - g.cx, -(y - g.cy))
		if (stacked) {
			if (Math.abs(r - radiusOf(g, 0)) > g.thickness / 2 + 4) return null
			const hit = arcs.findIndex((a) => angle >= a.a0 && angle <= a.a1)
			return hit < 0 ? null : hit
		}
		const hit = arcs.findIndex((a) => Math.abs(r - radiusOf(g, a.ring)) <= g.pitch / 2)
		return hit < 0 ? null : hit
	}
	const describe = (i: number) => `${styles[i].label}: ${fmt.full(values[i])}`
	const tooltipFor = (i: number, size: ChartSize) => {
		const g = geometry(size)
		const [x, y] = polar(g.cx, g.cy, radiusOf(g, arcs[i].ring), arcs[i].a1)
		return {
			x,
			y,
			content: (
				<ChartTooltipContent
					indicator={tooltipOptions.indicator}
					rows={[{ key: names[i], label: styles[i].label, value: fmt.full(values[i]), color: styles[i].color, icon: styles[i].icon }]}
				/>
			),
		}
	}

	return (
		<ChartFrame
			label={label}
			className={cn("h-64", className)}
			count={data.length}
			interactive={tooltip !== false}
			animate={animate}
			activeIndex={activeIndex}
			defaultActiveIndex={defaultActiveIndex}
			onActiveIndexChange={onActiveIndexChange}
			hitTest={hitTest}
			tooltip={tooltip === false ? undefined : tooltipFor}
			describe={describe}
			table={{
				headers: [index.charAt(0).toUpperCase() + index.slice(1), valueKey.charAt(0).toUpperCase() + valueKey.slice(1)],
				rows: data.map((_, i) => [styles[i].label, fmt.full(values[i])]),
			}}
			legend={(legend ?? !labels) ? <ChartLegend items={names.map((n, i) => ({ key: n, label: styles[i].label, color: styles[i].color, icon: styles[i].icon }))} /> : null}
		>
			{({ size, activeIndex: active }) => {
				const g = geometry(size)
				const ringCount = stacked ? 1 : data.length
				return (
					<>
						{track
							? Array.from({ length: ringCount }, (_, ring) => (
									<path
										key={`t${ring}`}
										d={strokeArcPath(g.cx, g.cy, radiusOf(g, ring), start, start + span)}
										fill="none"
										strokeWidth={g.thickness}
										strokeLinecap={stacked ? "butt" : "round"}
										className="stroke-muted"
									/>
								))
							: null}
						{arcs.map((a) => {
							if (values[a.i] === 0) return null
							const d = strokeArcPath(g.cx, g.cy, radiusOf(g, a.ring), a.a0, a.a1)
							return (
								<path
									key={names[a.i]}
									d={d}
									pathLength={1}
									fill="none"
									strokeWidth={g.thickness}
									strokeLinecap={stacked ? "butt" : "round"}
									className={cn("[stroke-dasharray:1] [stroke-dashoffset:0] [[data-reveal=out]_&]:[stroke-dashoffset:1]", active != null && active !== a.i && "opacity-60")}
									style={{ ...pathStyle(d), stroke: styles[a.i].color, transition: drawTransition(stagger(a.i, 90)) } as CSSProperties}
								/>
							)
						})}
						{labels && !stacked
							? arcs.map((a) => {
									const [x, y] = polar(g.cx, g.cy, radiusOf(g, a.ring), start)
									return (
										<text key={`l${a.i}`} x={x - 8} y={y} dy="0.32em" textAnchor="end" className="fill-muted-foreground text-caption">
											{styles[a.i].label}
										</text>
									)
								})
							: null}
						{centerLabel ? (
							<text
								x={g.cx}
								y={gauge && sweep <= 180 ? g.cy - 6 : g.cy}
								textAnchor="middle"
								className="[[data-reveal=out]_&]:opacity-0"
								style={{ transition: morphTransition() }}
							>
								<tspan x={g.cx} dy={gauge && sweep <= 180 ? (centerLabel.label ? "-1.4em" : "0") : "0.35em"} className="fill-foreground text-heading-2 tabular-nums">
									{centerValueText(centerLabel.value, locale)}
								</tspan>
								{centerLabel.label ? (
									<tspan x={g.cx} dy={gauge && sweep <= 180 ? "1.6em" : "1.9em"} className="fill-muted-foreground text-caption">
										{centerLabel.label}
									</tspan>
								) : null}
							</text>
						) : null}
					</>
				)
			}}
		</ChartFrame>
	)
}
RadialChart.displayName = "RadialChart"

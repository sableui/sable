"use client"

import { type CSSProperties, useId } from "react"
import { ChartCenter } from "../../lib/chart/chart-center"
import { ChartFrame, type ChartSize, chartMotion } from "../../lib/chart/chart-frame"
import { ChartLegend } from "../../lib/chart/chart-legend"
import { ChartTooltipContent } from "../../lib/chart/chart-tooltip"
import { FILL_HOVER, dimmed } from "../../lib/chart/dim"
import { categoryText, chartFormatters } from "../../lib/chart/format"
import { arcPath, polar } from "../../lib/chart/geometry"
import { DRAW_DURATION, morphTransition, pathStyle } from "../../lib/chart/motion"
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
import type { MotionLevel } from "../../motion/MotionProvider"

export interface PieChartProps {
	/** One row per slice. */
	data: ChartDatum[]
	/** The datum field naming each slice. */
	index: string
	/** The datum field holding each slice's amount — or several fields, drawn as concentric rings (outer first). */
	valueKey: string | string[]
	/** What the chart shows — its accessible name and the data table's caption. */
	label: string
	/** Labels, tones and icons per slice, keyed by the slice's name. Unlisted slices take the tones in order. */
	categories?: ChartCategories
	className?: string
	/** Cut out the middle: `true` for a ring at 60% of the radius, or a ratio (0–0.9). @default false */
	donut?: boolean | number
	/** A value and caption in the hole of a donut — the total, or the headline slice. */
	centerLabel?: ChartCenterLabel
	/** A hairline in the surface colour between slices. @default true */
	separator?: boolean
	/** Label each slice outside the pie or inside it. @default "none" */
	labels?: "none" | "outside" | "inside"
	/** What a slice label says. @default "value" */
	labelContent?: "value" | "percent" | "name"
	/** Show the legend. @default true unless slices are labelled */
	legend?: boolean
	/** Show a tooltip on hover and keyboard focus, or pass options. @default true */
	tooltip?: boolean | ChartTooltipOptions
	valueFormatter?: ChartValueFormatter
	locale?: string
	/**
	 * How much motion this component uses: `full` (default) inherits the app's
	 * policy, `subtle` keeps feedback and drops the flourish, `off` stills it. It
	 * can only turn motion down — it never overrides a reader's reduce-motion
	 * setting. The sweep, the slice morph and the rolling centre number are the
	 * flourish; the hover pull-out and dim are the feedback `subtle` keeps.
	 */
	motion?: MotionLevel
	/**
	 * Sweep the slices in clockwise when the chart scrolls into view.
	 * `animate={false}` is `motion="subtle"`.
	 * @deprecated Use `motion="subtle"` (what `animate={false}` now maps to: no arrival, hover kept) or `motion="off"`.
	 */
	animate?: boolean
	/** The pulled-out slice (controlled). */
	activeIndex?: number | null
	/** The slice pulled out at first — the one the caption is about. */
	defaultActiveIndex?: number | null
	onActiveIndexChange?: (index: number | null) => void
}

/**
 * Parts of a whole as slices — share of traffic, budget split, survey answers.
 * Best with two to six slices; past that, a BarChart compares more honestly.
 * A donut leaves room in the middle for the total. The slices sweep in
 * clockwise from 12 o'clock as the chart scrolls into view, and the active
 * slice pulls outward.
 */
export function PieChart({
	data,
	index,
	valueKey,
	label,
	categories,
	className,
	donut = false,
	centerLabel,
	separator = true,
	labels = "none",
	labelContent = "value",
	legend,
	tooltip = true,
	valueFormatter,
	locale,
	motion,
	animate,
	activeIndex,
	defaultActiveIndex,
	onActiveIndexChange,
}: PieChartProps) {
	const uid = useId().replace(/:/g, "")
	const keys = Array.isArray(valueKey) ? valueKey : [valueKey]
	const fmt = chartFormatters(locale, valueFormatter)
	const percent = new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 0 })
	const names = data.map((d) => categoryText(d[index], locale))
	const styles = names.map((name, i) => categoryStyle(categories, name, i))
	const rings = keys.map((key) => {
		const vals = data.map((d) => Math.max(0, numberValue(d[key])))
		const total = vals.reduce((a, b) => a + b, 0) || 1
		let acc = 0
		return vals.map((v) => {
			const a0 = (acc / total) * Math.PI * 2
			acc += v
			return { v, share: v / total, a0, a1: (acc / total) * Math.PI * 2 }
		})
	})
	const tooltipOptions: ChartTooltipOptions = typeof tooltip === "object" ? tooltip : {}
	const level = chartMotion(motion, animate)
	const ratio = donut === true ? 0.6 : typeof donut === "number" ? Math.min(0.9, Math.max(0, donut)) : 0

	const geometry = (size: ChartSize) => {
		const margin = labels === "outside" ? 30 : 8
		const outer = Math.max(8, Math.min(size.width, size.height) / 2 - margin)
		const inner = outer * ratio
		const cx = size.width / 2
		const cy = size.height / 2
		const ringWidth = (outer - inner) / keys.length
		return { cx, cy, outer, inner, ringWidth }
	}

	const hitTest = (x: number, y: number, size: ChartSize) => {
		const g = geometry(size)
		const dx = x - g.cx
		const dy = y - g.cy
		const r = Math.hypot(dx, dy)
		if (r > g.outer + 8 || r < g.inner) return null
		const angle = (Math.atan2(dx, -dy) + Math.PI * 2) % (Math.PI * 2)
		const ring = Math.min(keys.length - 1, Math.max(0, Math.floor((g.outer - r) / g.ringWidth)))
		const hit = rings[ring].findIndex((s) => angle >= s.a0 && angle < s.a1)
		return hit < 0 ? null : hit
	}

	const sliceText = (ring: number, i: number) =>
		labelContent === "percent" ? percent.format(rings[ring][i].share) : labelContent === "name" ? styles[i].label : fmt.full(rings[ring][i].v)

	const describe = (i: number) =>
		`${styles[i].label}: ${keys.map((k, r) => `${keys.length > 1 ? `${k} ` : ""}${fmt.full(rings[r][i].v)} (${percent.format(rings[r][i].share)})`).join(", ")}`

	const tooltipFor = (i: number, size: ChartSize) => {
		const g = geometry(size)
		const s = rings[0][i]
		const [x, y] = polar(g.cx, g.cy, g.outer, (s.a0 + s.a1) / 2)
		return {
			x,
			y,
			content: (
				<ChartTooltipContent
					indicator={tooltipOptions.indicator}
					label={tooltipOptions.hideLabel || keys.length === 1 ? undefined : styles[i].label}
					rows={keys.map((k, r) => ({
						key: k,
						label: keys.length === 1 ? styles[i].label : k,
						value: fmt.full(rings[r][i].v),
						color: styles[i].color,
						icon: styles[i].icon,
					}))}
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
			motion={level}
			activeIndex={activeIndex}
			defaultActiveIndex={defaultActiveIndex}
			onActiveIndexChange={onActiveIndexChange}
			hitTest={hitTest}
			tooltip={tooltip === false ? undefined : tooltipFor}
			describe={describe}
			table={{
				headers: [index.charAt(0).toUpperCase() + index.slice(1), ...keys],
				rows: data.map((_, i) => [styles[i].label, ...keys.map((_, r) => fmt.full(rings[r][i].v))]),
			}}
			legend={(legend ?? labels === "none") ? <ChartLegend items={names.map((n, i) => ({ key: n, label: styles[i].label, color: styles[i].color, icon: styles[i].icon }))} /> : null}
			overlay={
				centerLabel && ratio > 0
					? ({ size }) => {
							const g = geometry(size)
							return <ChartCenter center={centerLabel} x={g.cx} y={g.cy} locale={locale} motion={level} />
						}
					: undefined
			}
		>
			{({ size, activeIndex: active }) => {
				const g = geometry(size)
				const maskId = `${uid}-sweep`
				return (
					<>
						{/* The sweep: a ring of stroke that draws on clockwise from 12
						    o'clock and reveals the slices under it. */}
						<mask id={maskId}>
							<circle
								cx={g.cx}
								cy={g.cy}
								r={g.outer / 2 + 4}
								fill="none"
								stroke="white"
								strokeWidth={g.outer + 8}
								pathLength={1}
								transform={`rotate(-90 ${g.cx} ${g.cy})`}
								className="[stroke-dasharray:1] [stroke-dashoffset:0] [[data-reveal=out]_&]:[stroke-dashoffset:1]"
								style={{ transition: `stroke-dashoffset ${DRAW_DURATION} var(--motion-ease-decelerate)` }}
							/>
						</mask>
						<g mask={`url(#${maskId})`}>
							{rings.map((ring, r) =>
								ring.map((s, i) => {
									if (s.v === 0) return null
									const outer = g.outer - r * g.ringWidth + (active === i && r === 0 ? 6 : 0)
									const inner = Math.max(g.inner, g.outer - (r + 1) * g.ringWidth)
									const d = arcPath(g.cx, g.cy, inner, outer, s.a0, s.a1)
									return (
										<path
											key={`${r}-${names[i]}`}
											d={d}
											strokeWidth={separator ? 2 : 0}
											strokeLinejoin="round"
											className={cn(separator && "stroke-(--sable-surface-bg,var(--background))")}
											style={{
												...pathStyle(d),
												// Stepped back toward the surface rather than faded (see lib/chart/dim).
												fill: active != null && active !== i ? dimmed(styles[i].color, 60) : styles[i].color,
												transition: `${morphTransition()}, ${FILL_HOVER}`,
											} as CSSProperties}
										/>
									)
								}),
							)}
						</g>
						{labels !== "none"
							? rings[0].map((s, i) => {
									if (s.v === 0) return null
									const mid = (s.a0 + s.a1) / 2
									const inside = labels === "inside"
									const r = inside ? g.outer - g.ringWidth / 2 : g.outer + 14
									const [x, y] = polar(g.cx, g.cy, r, mid)
									const anchor = inside ? "middle" : Math.sin(mid) > 0.1 ? "start" : Math.sin(mid) < -0.1 ? "end" : "middle"
									return (
										<text
											key={`l-${names[i]}`}
											x={x}
											y={y}
											dy="0.32em"
											textAnchor={anchor}
											className={cn("text-caption tabular-nums [[data-reveal=out]_&]:opacity-0", inside ? "fill-background text-label-sm" : "fill-foreground")}
											style={{ transition: morphTransition(), transitionDelay: "var(--motion-duration-slower)" }}
										>
											{sliceText(0, i)}
										</text>
									)
								})
							: null}
					</>
				)
			}}
		</ChartFrame>
	)
}
PieChart.displayName = "PieChart"

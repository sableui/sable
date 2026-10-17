"use client"

import type { ComponentPropsWithRef, CSSProperties } from "react"
import { areaPath, linePath, type Point } from "../../lib/chart/geometry"
import { drawTransition, riseTransition, stagger } from "../../lib/chart/motion"
import { type ChartTone, toneColor } from "../../lib/chart/types"
import { cn } from "../../lib/cn"
import { type MotionLevel, motionAttribute, useMotionLevel } from "../../motion/MotionProvider"
import { chartMotion } from "../../lib/chart/chart-frame"
import { useArrival } from "../../lib/chart/use-arrival"

export interface SparklineProps extends Omit<ComponentPropsWithRef<"svg">, "children" | "aria-label"> {
	/** The values, oldest first. */
	data: number[]
	/** What the line tracks ("Revenue, last 30 days"). The spoken summary adds the range and latest value. */
	label: string
	/** A line, a line over a soft fill, or columns. @default "line" */
	variant?: "line" | "area" | "bar"
	/** Colour by role. @default "primary" */
	tone?: ChartTone
	/**
	 * How much motion this component uses: `full` (default) inherits the app's
	 * policy, `subtle` keeps feedback and drops the flourish, `off` stills it. It
	 * can only turn motion down — it never overrides a reader's reduce-motion
	 * setting. Drawing on (or rising) as it scrolls into view is the
	 * flourish, so `subtle` shows the finished line.
	 */
	motion?: MotionLevel
	/**
	 * Draw on (or rise) when it scrolls into view. `animate={false}` is
	 * `motion="subtle"`.
	 * @deprecated Use `motion="subtle"` (what `animate={false}` now maps to) or `motion="off"`.
	 */
	animate?: boolean
	/** BCP 47 locale for the spoken numbers. */
	locale?: string
}

const W = 100
const H = 32

/**
 * A word-sized chart: the shape of a trend with no axes, inside a stat card,
 * a table cell or a sentence. Sized by className (h-8 w-24 by default) and
 * stretched to fit, so it follows its container. For values a reader needs
 * to look up, use AreaChart or LineChart.
 */
export function Sparkline({ data, label, variant = "line", tone = "primary", motion, animate, locale, className, ...props }: SparklineProps) {
	const level = chartMotion(motion, animate)
	// The arrival is expressive: under subtle, off or reduced motion the line is simply there.
	const { expressive } = useMotionLevel(level)
	const [ref, inView] = useArrival<SVGSVGElement>()
	const shown = !expressive || inView
	const color = toneColor(tone)
	// A line or area shows the shape, so it spans the data's own range. Pinned
	// to zero, a run from 12 to 26 used the top half of the box: a flat
	// squiggle over a solid slab. Bars keep zero, because a bar's length is
	// the value.
	const min = data.length ? Math.min(...data) : 0
	const max = data.length ? Math.max(...data) : 1
	const [lo, hi] =
		variant === "bar"
			? [Math.min(0, min), Math.max(max, Math.min(0, min) + 1)]
			: min === max
				? [min - 1, max + 1] // a flat series sits mid-height
				: [min, max]
	const y =(v: number) => H - 2 - ((v - lo) / (hi - lo)) * (H - 4)
	const nf = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 })
	const summary = data.length
		? `${label}: from ${nf.format(data[0])} to ${nf.format(data[data.length - 1])}, low ${nf.format(Math.min(...data))}, high ${nf.format(Math.max(...data))}`
		: label

	let marks = null
	if (variant === "bar") {
		const step = W / Math.max(1, data.length)
		marks = data.map((v, i) => (
			<rect
				// biome-ignore lint/suspicious/noArrayIndexKey: positions are the identity of a sparkline's bars
				key={i}
				x={i * step + step * 0.15}
				width={step * 0.7}
				y={Math.min(y(v), y(0))}
				height={Math.max(0.5, Math.abs(y(0) - y(v)))}
				className="[[data-reveal=out]_&]:scale-y-0"
				style={{ fill: color, transformOrigin: `0px ${y(0)}px`, transition: riseTransition(stagger(i, 20)) } as CSSProperties}
			/>
		))
	} else {
		const pts: Point[] = data.map((v, i) => [data.length > 1 ? (i / (data.length - 1)) * W : W / 2, y(v)])
		marks = (
			<>
				{variant === "area" ? (
					<path
						d={areaPath(pts, pts.map(([x]) => [x, H] as Point))}
						className="[[data-reveal=out]_&]:opacity-0"
						style={{ fill: color, fillOpacity: 0.16, transition: riseTransition("var(--motion-duration-slow)") } as CSSProperties}
					/>
				) : null}
				<path
					d={linePath(pts)}
					pathLength={1}
					fill="none"
					strokeWidth={1.5}
					strokeLinecap="round"
					strokeLinejoin="round"
					vectorEffect="non-scaling-stroke"
					className="[stroke-dasharray:1] [stroke-dashoffset:0] [[data-reveal=out]_&]:[stroke-dashoffset:1]"
					style={{ stroke: color, transition: drawTransition() } as CSSProperties}
				/>
			</>
		)
	}

	return (
		<svg
			ref={ref}
			role="img"
			aria-label={summary}
			viewBox={`0 0 ${W} ${H}`}
			preserveAspectRatio="none"
			data-reveal={shown ? "in" : "out"}
			data-motion={motionAttribute(level)}
			className={cn("inline-block h-8 w-24 shrink-0 overflow-visible align-middle", className)}
			{...props}
		>
			{marks}
		</svg>
	)
}
Sparkline.displayName = "Sparkline"

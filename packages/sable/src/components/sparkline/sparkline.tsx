"use client"

import type { ComponentPropsWithRef, CSSProperties } from "react"
import { areaPath, linePath, type Point } from "../../lib/chart/geometry"
import { drawTransition, riseTransition, stagger } from "../../lib/chart/motion"
import { type ChartTone, toneColor } from "../../lib/chart/types"
import { cn } from "../../lib/cn"
import { useMotion } from "../../motion/MotionProvider"
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
	/** Draw on (or rise) when it scrolls into view. @default true */
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
export function Sparkline({ data, label, variant = "line", tone = "primary", animate = true, locale, className, ...props }: SparklineProps) {
	const { enabled } = useMotion()
	const [ref, inView] = useArrival<SVGSVGElement>()
	const shown = !animate || !enabled || inView
	const color = toneColor(tone)
	const lo = Math.min(0, ...data)
	const hi = Math.max(...data, lo + 1)
	const y = (v: number) => H - 2 - ((v - lo) / (hi - lo)) * (H - 4)
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
			className={cn("inline-block h-8 w-24 shrink-0 overflow-visible align-middle", className)}
			{...props}
		>
			{marks}
		</svg>
	)
}
Sparkline.displayName = "Sparkline"

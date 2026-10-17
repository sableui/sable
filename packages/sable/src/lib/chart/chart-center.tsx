"use client"

import { NumberTicker } from "../../components/number-ticker/number-ticker"
import type { MotionLevel } from "../../motion/MotionProvider"
import { cn } from "../cn"
import { centerValueFormat } from "./format"
import { morphTransition } from "./motion"
import type { ChartCenterLabel } from "./types"

export interface ChartCenterProps {
	center: ChartCenterLabel
	/** The anchor in plot coordinates. */
	x: number
	y: number
	/**
	 * `middle`: the number's middle on the anchor, the caption hanging below — the
	 * pair never splits the centre between them. `gauge`: the pair stands on the
	 * anchor, for a half ring whose middle is its flat edge.
	 */
	placement?: "middle" | "gauge"
	locale?: string
	motion?: MotionLevel
}

/**
 * The figure in the hole of a donut or a radial chart, as HTML over the plot.
 * A number rolls to its new value (NumberTicker) when the data changes, so a
 * total that moves is seen moving; a string is shown as written. It fades in
 * with the marks on arrival.
 */
export function ChartCenter({ center, x, y, placement = "middle", locale, motion }: ChartCenterProps) {
	const value =
		typeof center.value === "number" ? (
			<NumberTicker value={center.value} format={centerValueFormat(center.value)} locales={locale} motion={motion} className="text-heading-2 text-foreground" />
		) : (
			<span className="text-heading-2 text-foreground tabular-nums">{center.value}</span>
		)
	const middle = placement === "middle"
	return (
		<div
			className="absolute whitespace-nowrap [[data-reveal=out]_&]:opacity-0"
			style={{ left: x, top: y, transform: middle ? "translate(-50%, -50%)" : "translate(-50%, -100%)", transition: morphTransition() }}
		>
			<div className={cn("relative flex flex-col items-center", !middle && center.label && "pb-4")}>
				{value}
				{center.label ? (
					middle ? (
						// Out of flow, so the number alone is centred; centred by flex so a
						// caption wider than the number overhangs it evenly on both sides.
						<span className="absolute inset-x-0 top-full mt-1 flex justify-center">
							<span className="text-caption text-muted-foreground">{center.label}</span>
						</span>
					) : (
						<span className="text-caption text-muted-foreground">{center.label}</span>
					)
				) : null}
			</div>
		</div>
	)
}

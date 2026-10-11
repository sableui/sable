"use client"

import { type KeyboardEvent, type PointerEvent, type ReactNode, useEffect, useId, useRef, useState } from "react"
import { useMotion } from "../../motion/MotionProvider"
import { useArrival } from "./use-arrival"
import { cn } from "../cn"

export interface ChartSize {
	width: number
	height: number
}

export interface ChartTooltipPlacement {
	content: ReactNode
	/** Anchor point in plot coordinates. */
	x: number
	y: number
}

export interface ChartFrameProps {
	/** What the chart shows — its accessible name and the data table's caption. */
	label: string
	className?: string
	/** How many data positions keyboard navigation steps through. */
	count: number
	/** Whether hovering or focusing shows a tooltip and a cursor. */
	interactive: boolean
	/** Play the arrival when the chart scrolls into view. */
	animate: boolean
	activeIndex?: number | null
	defaultActiveIndex?: number | null
	onActiveIndexChange?: (index: number | null) => void
	/** Plot coordinates → the data position under them, or null. */
	hitTest?: (x: number, y: number, size: ChartSize) => number | null
	/** The tooltip for a data position. */
	tooltip?: (index: number, size: ChartSize, pointer: { x: number; y: number } | null) => ChartTooltipPlacement | null
	/** One sentence describing a data position, announced as the keyboard moves. */
	describe: (index: number) => string
	legend?: ReactNode
	/** The same data as a table, for assistive tech. */
	table: { headers: string[]; rows: string[][] }
	children: (state: { size: ChartSize; activeIndex: number | null }) => ReactNode
}

/**
 * The shell every Sable chart draws inside. It sizes the plot to its box
 * (className sets the height; it defaults to h-60), plays the arrival once the
 * chart is on screen, tracks the active data position from pointer and keyboard,
 * floats the tooltip, and carries the data as a visually hidden table — the
 * drawing itself is aria-hidden, so the numbers reach assistive tech as text.
 */
export function ChartFrame({
	label,
	className,
	count,
	interactive,
	animate,
	activeIndex: controlled,
	defaultActiveIndex = null,
	onActiveIndexChange,
	hitTest,
	tooltip,
	describe,
	legend,
	table,
	children,
}: ChartFrameProps) {
	const { enabled } = useMotion()
	const [viewRef, inView] = useArrival<HTMLElement>()
	const plotRef = useRef<HTMLDivElement>(null)
	const [size, setSize] = useState<ChartSize | null>(null)
	const [shown, setShown] = useState(!animate)
	const [uncontrolled, setUncontrolled] = useState<number | null>(defaultActiveIndex)
	const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null)
	const [viaKeyboard, setViaKeyboard] = useState(false)
	const appeared = useRef(true)
	const tableId = useId()
	const active = controlled !== undefined ? controlled : uncontrolled

	const setActive = (index: number | null) => {
		if (index === active) return
		appeared.current = active == null
		if (controlled === undefined) setUncontrolled(index)
		onActiveIndexChange?.(index)
	}

	useEffect(() => {
		const el = plotRef.current
		if (!el) return
		const measure = () => {
			const r = el.getBoundingClientRect()
			const next = { width: Math.round(r.width), height: Math.round(r.height) }
			setSize((prev) => (prev && prev.width === next.width && prev.height === next.height ? prev : next))
		}
		measure()
		if (typeof ResizeObserver === "undefined") return
		const observer = new ResizeObserver(measure)
		observer.observe(el)
		return () => observer.disconnect()
	}, [])

	// Arrival: the marks render in their "out" pose first, then flip to "in" a
	// painted frame later so the transition runs. With motion off they start in.
	useEffect(() => {
		if (shown) return
		if (!animate || !enabled) {
			setShown(true)
			return
		}
		if (!size || !inView) return
		let inner = 0
		const outer = requestAnimationFrame(() => {
			inner = requestAnimationFrame(() => setShown(true))
		})
		return () => {
			cancelAnimationFrame(outer)
			cancelAnimationFrame(inner)
		}
	}, [shown, animate, enabled, size, inView])

	const local = (event: PointerEvent<HTMLDivElement>) => {
		const r = event.currentTarget.getBoundingClientRect()
		return { x: event.clientX - r.left, y: event.clientY - r.top }
	}

	const onPointer = (event: PointerEvent<HTMLDivElement>) => {
		if (!interactive || !size || !hitTest) return
		const p = local(event)
		setPointer(p)
		setViaKeyboard(false)
		setActive(hitTest(p.x, p.y, size))
	}

	const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		if (!interactive || !count) return
		const step: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }
		let next: number | null | undefined
		if (event.key in step) next = active == null ? 0 : Math.min(count - 1, Math.max(0, active + step[event.key]))
		else if (event.key === "Home") next = 0
		else if (event.key === "End") next = count - 1
		else if (event.key === "Escape") next = null
		if (next === undefined) return
		event.preventDefault()
		setPointer(null)
		setViaKeyboard(true)
		setActive(next)
	}

	const placement = size && active != null && tooltip ? tooltip(active, size, pointer) : null
	// Flip to the left of the anchor past the plot's midline, so the card never runs off the edge.
	const flip = placement && size ? placement.x > size.width / 2 : false

	return (
		<figure
			ref={viewRef}
			data-reveal={shown ? "in" : "out"}
			className={cn("m-0 flex h-60 w-full min-w-0 flex-col gap-3", className)}
		>
			<div
				ref={plotRef}
				role="group"
				aria-roledescription="chart"
				aria-label={label}
				aria-describedby={tableId}
				tabIndex={interactive ? 0 : undefined}
				onPointerMove={onPointer}
				onPointerDown={onPointer}
				onPointerLeave={() => {
					setPointer(null)
					if (!viaKeyboard) setActive(null)
				}}
				onKeyDown={onKeyDown}
				onBlur={() => viaKeyboard && setActive(null)}
				className="relative min-h-0 flex-1 touch-pan-y rounded-sm outline-none motion-interactive focus-visible:ring-2 focus-visible:ring-ring"
			>
				{size && size.width > 0 && size.height > 0 ? (
					<svg
						aria-hidden
						width={size.width}
						height={size.height}
						viewBox={`0 0 ${size.width} ${size.height}`}
						className="absolute inset-0 overflow-visible"
					>
						{children({ size, activeIndex: interactive ? active : null })}
					</svg>
				) : null}
				{placement ? (
					<div
						aria-hidden
						className={cn(
							"pointer-events-none absolute start-0 top-0 z-10",
							!appeared.current && "transition-transform duration-(--motion-duration-fast) ease-standard",
						)}
						style={{ transform: `translate(${Math.round(placement.x)}px, ${Math.round(placement.y)}px)` }}
					>
						<div className={cn("w-max -translate-y-1/2", flip ? "-translate-x-[calc(100%+0.75rem)]" : "translate-x-3")}>
							{placement.content}
						</div>
					</div>
				) : null}
			</div>
			{legend}
			<table id={tableId} className="sr-only">
				<caption>{label}</caption>
				<thead>
					<tr>
						{table.headers.map((h) => (
							<th key={h} scope="col">
								{h}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{table.rows.map((row) => (
						<tr key={row[0]}>
							{row.map((cell, i) =>
								i === 0 ? (
									<th key={`h-${cell}`} scope="row">
										{cell}
									</th>
								) : (
									<td key={`${table.headers[i]}`}>{cell}</td>
								),
							)}
						</tr>
					))}
				</tbody>
			</table>
			<div aria-live="polite" className="sr-only">
				{viaKeyboard && active != null ? describe(active) : ""}
			</div>
		</figure>
	)
}

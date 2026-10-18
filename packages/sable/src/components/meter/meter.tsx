import { Meter as Base } from "@base-ui/react/meter"
import { type ComponentProps, createContext, useContext, useState } from "react"
import { cn } from "../../lib/cn"
import {
	meterIndicatorVariants,
	meterRingValueVariants,
	meterRingVariants,
	meterSegmentedTrackVariants,
	meterTickVariants,
	meterTrackVariants,
} from "./meter.variants"

export type MeterTone = "primary" | "3" | "success" | "warning" | "destructive"

export type MeterSize = "sm" | "md" | "lg"

const ToneContext = createContext<MeterTone>("primary")
const SizeContext = createContext<MeterSize | undefined>(undefined)

/** Set by a bar Meter with `segments`: what MeterTrack needs to draw its ticks. */
type SegmentsState = { count: number; value: number | null; min: number; max: number }
const SegmentsContext = createContext<SegmentsState | null>(null)

/**
 * How many of `count` ticks a reading fills. None at (or below) the minimum;
 * otherwise at least one, so a non-zero reading never looks empty — €2 of a
 * €2,000 limit is one tick, not none.
 */
function filledTicks({ count, value, min, max }: SegmentsState): number {
	if (value == null || value <= min) return 0
	const ratio = max === min ? 1 : Math.min(1, (value - min) / (max - min))
	return Math.min(count, Math.max(1, Math.round(ratio * count)))
}

type RootProps = Omit<ComponentProps<typeof Base.Root>, "className"> & {
	className?: string
	/**
	 * Fill colour, mapped to a semantic token. Choose it from your own
	 * thresholds — 90% of a disk is `warning`, 90% of a quota-free plan is not.
	 * @default "primary"
	 */
	tone?: MeterTone
	/**
	 * `bar` (the default) is a horizontal track; `ring` is a circular gauge —
	 * what Gauge was, now with Meter's min/max/format and labelling. @default "bar"
	 */
	shape?: "bar" | "ring"
	/**
	 * Ring diameter (40 / 64 / 96px at the default spacing), or bar thickness on
	 * the same sm / md / lg rails Progress uses. @default "md"
	 */
	size?: MeterSize
	/** Ring stroke width in viewBox units (of 100). @default 6 */
	strokeWidth?: number
	/** Print the value in the ring's centre. */
	showValue?: boolean
	/**
	 * Draw the bar as this many separate ticks instead of a continuous fill —
	 * a quota, score or spend limit read at a glance (▮▮▮▮▮▮▯▯▯▯). Any reading
	 * above `min` fills at least one tick. Bar only: ignored for `shape="ring"`.
	 */
	segments?: number
}

const RING_TONE_STROKE: Record<MeterTone, string> = {
	primary: "var(--primary)",
	"3": "var(--tone-3-mark)",
	success: "var(--success-mark)",
	warning: "var(--tone-warning-mark)",
	destructive: "var(--destructive-mark)",
}

/** A circular meter: the same value semantics as the bar, drawn as an arc. */
function MeterRing({
	value,
	min = 0,
	max = 100,
	strokeWidth,
	showValue,
	tone,
	size,
}: { value: number | null; min?: number; max?: number; strokeWidth: number; showValue?: boolean; tone: MeterTone; size?: MeterSize }) {
	const ratio = value == null || max === min ? 0 : Math.min(1, Math.max(0, (value - min) / (max - min)))
	const radius = 50 - strokeWidth
	const circumference = 2 * Math.PI * radius
	return (
		<>
			<svg viewBox="0 0 100 100" className="size-full" aria-hidden="true" focusable="false">
				<circle cx={50} cy={50} r={radius} fill="none" strokeWidth={strokeWidth} style={{ stroke: "var(--secondary)" }} />
				<circle
					cx={50}
					cy={50}
					r={radius}
					fill="none"
					strokeWidth={strokeWidth}
					strokeLinecap="round"
					strokeDasharray={circumference}
					strokeDashoffset={circumference * (1 - ratio)}
					transform="rotate(-90 50 50)"
					className="transition-[stroke-dashoffset] duration-(--motion-duration-slow) ease-decelerate"
					style={{ stroke: RING_TONE_STROKE[tone] }}
				/>
			</svg>
			{showValue ? (
				<MeterValue className={meterRingValueVariants({ size })} />
			) : null}
		</>
	)
}

/**
 * Meter — a static measurement within a known range, over Base UI's Meter.
 *
 * Meter and Progress look alike and mean different things, and the difference
 * is announced: Meter is `role="meter"` (how full something is — storage,
 * quota, password strength, battery), Progress is `role="progressbar"` (how
 * far a task has got). A storage bar built from Progress tells a screen-reader
 * user an upload is running.
 *
 *   <Meter value={72} aria-label="Storage used" />
 *
 *   <Meter value={7.2} max={10} tone="warning" format={{ style: "unit", unit: "gigabyte" }}>
 *     <div className="mb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
 *       <MeterLabel>Storage</MeterLabel>
 *       <MeterValue />
 *     </div>
 *     <MeterTrack />
 *   </Meter>
 *
 * `shape="ring"` draws the same measurement as a circular gauge (it was Gauge).
 * `segments={20}` draws the bar as a row of ticks — a spend limit or a score
 * read at a glance (bar only).
 */
export function Meter({ className, children, tone = "primary", shape = "bar", size, strokeWidth = 6, showValue, segments, ...props }: RootProps) {
	if (shape === "ring") {
		return (
			<ToneContext.Provider value={tone}>
				<Base.Root className={cn(meterRingVariants({ size }), className)} {...props}>
					{children ?? (
						<MeterRing value={props.value ?? null} min={props.min} max={props.max} strokeWidth={strokeWidth} showValue={showValue} tone={tone} size={size} />
					)}
				</Base.Root>
			</ToneContext.Provider>
		)
	}
	const count = segments != null && Number.isFinite(segments) && segments >= 1 ? Math.floor(segments) : 0
	const segmented: SegmentsState | null = count
		? { count, value: props.value ?? null, min: props.min ?? 0, max: props.max ?? 100 }
		: null
	return (
		<ToneContext.Provider value={tone}>
			<SizeContext.Provider value={size}>
				<SegmentsContext.Provider value={segmented}>
					<Base.Root className={cn("w-full", className)} {...props}>
						{children ?? <MeterTrack />}
					</Base.Root>
				</SegmentsContext.Provider>
			</SizeContext.Provider>
		</ToneContext.Provider>
	)
}
Meter.displayName = "Meter"

type TrackProps = Omit<ComponentProps<typeof Base.Track>, "className"> & {
	className?: string
	/** Bar thickness. Inherits the Meter's `size` unless set here. @default "md" */
	size?: MeterSize
}

/**
 * The rail. Renders a MeterIndicator child by default — or, when the Meter has
 * `segments`, its row of ticks (children are not rendered then: there is no
 * single fill to put in it).
 */
export function MeterTrack({ className, children, size, ...props }: TrackProps) {
	const inherited = useContext(SizeContext)
	const tone = useContext(ToneContext)
	const segments = useContext(SegmentsContext)
	if (segments) {
		return (
			<Base.Track
				data-segmented=""
				className={cn(meterSegmentedTrackVariants({ size: size ?? inherited }), className)}
				{...props}
			>
				<MeterTicks count={segments.count} filled={filledTicks(segments)} tone={tone} />
			</Base.Track>
		)
	}
	return (
		<Base.Track
			className={cn(meterTrackVariants({ size: size ?? inherited }), className)}
			{...props}
		>
			{children ?? <MeterIndicator />}
		</Base.Track>
	)
}
MeterTrack.displayName = "MeterTrack"

/**
 * The ticks of a segmented track. When the reading changes, the fill runs
 * through the ticks from the edge it is leaving — left to right as it grows,
 * right to left as it shrinks — instead of every tick switching at once, so
 * the eye follows the change rather than meeting a different bar.
 *
 * The stagger is EXPRESSIVE: a share of the slow token (a full 0 → N sweep
 * takes one slow duration, whatever N is), multiplied by --motion-expressive.
 * The token already carries --motion-scale, so `subtle` lands every tick
 * together on the fast colour ease, and off / reduced motion is instant.
 */
function MeterTicks({ count, filled, tone }: { count: number; filled: number; tone: MeterTone }) {
	// The previous reading, so the stagger can start from its edge. Derived
	// during render (React's "adjusting state on a prop change"), so the new
	// fill and its delays land in the same paint.
	const [shown, setShown] = useState(filled)
	const [from, setFrom] = useState(filled)
	if (filled !== shown) {
		setFrom(shown)
		setShown(filled)
	}
	return Array.from({ length: count }, (_, i) => {
		const isFilled = i < filled
		const step =
			filled > from && i >= from && i < filled ? i - from : filled < from && i >= filled && i < from ? from - 1 - i : 0
		return (
			<span
				// biome-ignore lint/suspicious/noArrayIndexKey: ticks are positional and never reorder.
				key={i}
				aria-hidden="true"
				data-slot="meter-tick"
				data-filled={isFilled ? "" : undefined}
				className={meterTickVariants({ tone, filled: isFilled })}
				style={
					step
						? { transitionDelay: `calc(var(--motion-duration-slow) * ${Number((step / count).toFixed(4))} * var(--motion-expressive, 1))` }
						: undefined
				}
			/>
		)
	})
}

type IndicatorProps = Omit<ComponentProps<typeof Base.Indicator>, "className"> & {
	className?: string
	/** Override the Meter's tone for this fill. */
	tone?: MeterTone
}

/** The fill. Base UI sets its width from the value; the tone comes from the Meter. */
export function MeterIndicator({ className, tone, ...props }: IndicatorProps) {
	const inherited = useContext(ToneContext)
	return (
		<Base.Indicator
			className={cn(meterIndicatorVariants({ tone: tone ?? inherited }), className)}
			{...props}
		/>
	)
}
MeterIndicator.displayName = "MeterIndicator"

type LabelProps = Omit<ComponentProps<typeof Base.Label>, "className"> & {
	className?: string
}

/** Visible name for the meter; wires `aria-labelledby` on the Root. */
export function MeterLabel({ className, ...props }: LabelProps) {
	return (
		<Base.Label
			className={cn("text-label-md text-foreground", className)}
			{...props}
		/>
	)
}
MeterLabel.displayName = "MeterLabel"

type ValueProps = Omit<ComponentProps<typeof Base.Value>, "className"> & {
	className?: string
}

/**
 * The formatted reading ("72%", "7.2 GB"). Pass a render-function child —
 * `(formatted, value) => …` — for "7.2 of 10 GB".
 */
export function MeterValue({ className, ...props }: ValueProps) {
	return (
		<Base.Value
			className={cn("text-mono-sm text-muted-foreground", className)}
			{...props}
		/>
	)
}
MeterValue.displayName = "MeterValue"

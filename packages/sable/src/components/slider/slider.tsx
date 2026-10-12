"use client";

import { Slider as Base } from "@base-ui/react/slider"
import type { SliderRoot as BaseSliderRoot } from "@base-ui/react/slider"
import type { ComponentProps, ReactNode } from "react"
import { cn } from "../../lib/cn"

/**
 * Slider — themed wrapper over Base UI's Slider (pointer + keyboard control,
 * ARIA slider wiring, range support via multiple thumbs all come from Base UI).
 * The default export composes Root + Control + Track + Indicator + Thumb so a
 * single value slider is one element:
 *
 *   <Slider defaultValue={50} />
 *
 * For a range, pass an array value and the component renders one Thumb per entry:
 *
 *   const [range, setRange] = useState([20, 60])
 *   <Slider value={range} onValueChange={setRange} />
 *
 * Need custom internals (e.g. a Value readout)? Compose the parts directly with
 * SliderRoot + SliderControl + SliderTrack + SliderIndicator + SliderThumb.
 * Drag state surfaces via Base UI data-attributes: data-[dragging] on the Root
 * and data-[dragging]/data-[focused] on each Thumb.
 */
export const SliderRoot = Base.Root
export const SliderValue = Base.Value

type ControlProps = Omit<ComponentProps<typeof Base.Control>, "className"> & {
	className?: string
}

/** The interactive track lane. Relative so the indicator + thumbs position within it. */
export function SliderControl({ className, ...props }: ControlProps) {
	return (
		<Base.Control
			className={cn(
				"relative flex h-5 w-full items-center data-[disabled]:opacity-50",
				// Vertical: the same lane turned on its side. Give the slider a
				// height (h-40, flex-1) — a vertical track has no intrinsic length.
				"data-[orientation=vertical]:h-full data-[orientation=vertical]:w-5 data-[orientation=vertical]:justify-center",
				className,
			)}
			{...props}
		/>
	)
}

type TrackProps = Omit<ComponentProps<typeof Base.Track>, "className"> & {
	className?: string
}

/** The full-range rail beneath the indicator. */
export function SliderTrack({ className, ...props }: TrackProps) {
	return (
		<Base.Track
			className={cn("h-1.5 w-full rounded-full bg-secondary data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5", className)}
			{...props}
		/>
	)
}

type IndicatorProps = Omit<
	ComponentProps<typeof Base.Indicator>,
	"className"
> & { className?: string }

/** The filled portion from min (or the lower thumb) to the current value. */
export function SliderIndicator({ className, ...props }: IndicatorProps) {
	return (
		<Base.Indicator
			className={cn("h-full rounded-full bg-primary data-[orientation=vertical]:w-full", className)}
			{...props}
		/>
	)
}

type ThumbProps = Omit<ComponentProps<typeof Base.Thumb>, "className"> & {
	className?: string
}

/**
 * A draggable handle. Range sliders render one per value; pass `index` for SSR.
 *
 * Two elements, deliberately: the Base UI thumb is the **hit target** and keeps
 * a fixed `size-4` box at every state, and a decorative inner dot carries all
 * the paint and is the only thing that changes size. Quiet at rest (`scale-75`,
 * a 12px dot), full size on hover / keyboard focus / drag.
 *
 * Why not just scale the thumb itself:
 *  - WCAG 2.5.8 target size is measured **at rest**, and a target that grows
 *    under the cursor is a target you cannot learn — the gesture has to land
 *    where the pointer already is.
 *  - Base UI measures `thumbRef.getBoundingClientRect()` to place an `inset`
 *    slider's thumbs. A transform on the thumb feeds bad numbers back into that
 *    math; a transform on a child does not.
 *
 * Focus is on the nested `input[type=range]`, never on this div, so the ring
 * hangs off `has-[:focus-visible]` — a plain `focus-visible:` here never fires.
 */
export function SliderThumb({ className, children, ...props }: ThumbProps) {
	return (
		<Base.Thumb
			className={cn(
				// The hit target: fixed box, no paint, no transform. Never resize this.
				"group/thumb size-4 rounded-full motion-interactive",
				"has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
				"data-[disabled]:pointer-events-none",
				className,
			)}
			{...props}
		>
			<span
				aria-hidden
				className={cn(
					"pointer-events-none absolute inset-0 rounded-full border-2 border-primary bg-background shadow-(--knob-shadow)",
					// The only thing that resizes. Scale (not width/height) so the box
					// metrics — and the row height around them — never move.
					"scale-75 motion-interactive ease-spring",
					"group-hover/thumb:scale-100 group-has-[:focus-visible]/thumb:scale-100",
					"group-data-[dragging]/thumb:scale-110",
				)}
			/>
			{children}
		</Base.Thumb>
	)
}

type SliderValueType = number | readonly number[]

type SliderProps<Value extends SliderValueType> = Omit<
	ComponentProps<typeof Base.Root>,
	"className" | "value" | "defaultValue" | "onValueChange" | "render"
> & {
	className?: string
	/** Controlled value. Pass an array for a range slider (one thumb per entry). */
	value?: Value
	/** Uncontrolled initial value. Pass an array for a range slider. */
	defaultValue?: Value
	/** Fires on every value change. */
	onValueChange?: (
		value: Value extends number ? number : Value,
		eventDetails: BaseSliderRoot.ChangeEventDetails,
	) => void
}

/**
 * The all-in-one Slider: Root + Control + Track + Indicator + Thumb(s).
 * Renders a single thumb for a scalar value, or one thumb per entry when the
 * value is an array (range slider). Forwards value / defaultValue /
 * onValueChange / min / max / step (and the rest of the Root props).
 */
export function Slider<Value extends SliderValueType = number>({
	className,
	...props
}: SliderProps<Value>): ReactNode {
	const current = props.value ?? props.defaultValue
	const thumbCount = Array.isArray(current) ? current.length : 1

	return (
		<Base.Root
			className={cn("w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-auto", className)}
			{...props}
		>
			<SliderControl>
				<SliderTrack>
					<SliderIndicator />
					{Array.from({ length: thumbCount }, (_, i) => (
						<SliderThumb key={i} index={thumbCount > 1 ? i : undefined} />
					))}
				</SliderTrack>
			</SliderControl>
		</Base.Root>
	)
}
Slider.displayName = "Slider"

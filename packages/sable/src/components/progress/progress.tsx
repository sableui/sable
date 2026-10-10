import { Progress as Base } from "@base-ui/react/progress"
import { type ComponentProps, createContext, useContext } from "react"
import { cn } from "../../lib/cn"
import { progressTrackVariants } from "./progress.variants"

export type ProgressSize = "sm" | "md" | "lg"

const SizeContext = createContext<ProgressSize | undefined>(undefined)

/**
 * Progress — themed wrapper over Base UI's Progress (Root + Track + Indicator,
 * plus optional Label and Value). Base UI computes the indicator width from
 * `value` / `min` / `max`, exposes `aria-valuenow` / `aria-valuetext`, and
 * surfaces status via `data-progressing`, `data-complete`, and
 * `data-indeterminate` on every part. Compose:
 *
 *   <Progress value={64} aria-label="Upload" />
 *
 *   <Progress value={64}>
 *     <div className="mb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
 *       <ProgressLabel>Uploading</ProgressLabel>
 *       <ProgressValue />
 *     </div>
 *     <ProgressTrack />
 *   </Progress>
 *
 * Pass `value={null}` (or omit it) for an indeterminate bar — the fill spans the
 * full track and pulses while work is in flight.
 */
type RootProps = Omit<
	ComponentProps<typeof Base.Root>,
	"className" | "value"
> & {
	className?: string
	/**
	 * Current value, 0–100 by default (see `min`/`max`). Omit or pass `null`
	 * for the indeterminate state.
	 * @default null
	 */
	value?: number | null
	/** Bar thickness — the same sm / md / lg rails as Meter. @default "md" */
	size?: ProgressSize
}

/**
 * Groups all parts and reports completion status to assistive tech. When no
 * children are supplied it renders a default Track + Indicator so the common
 * case is a single self-contained element.
 */
export function Progress({
	className,
	children,
	value = null,
	size,
	...props
}: RootProps) {
	return (
		<SizeContext.Provider value={size}>
			<Base.Root value={value} className={cn("w-full", className)} {...props}>
				{children ?? <ProgressTrack />}
			</Base.Root>
		</SizeContext.Provider>
	)
}
Progress.displayName = "Progress"

type TrackProps = Omit<ComponentProps<typeof Base.Track>, "className"> & {
	className?: string
	/** Bar thickness. Inherits the Progress's `size` unless set here. @default "md" */
	size?: ProgressSize
}

/**
 * The rail that contains the indicator. Renders a ProgressIndicator child by
 * default; pass children to override. Indeterminate state pulses the fill.
 */
export function ProgressTrack({ className, children, size, ...props }: TrackProps) {
	const inherited = useContext(SizeContext)
	return (
		<Base.Track
			className={cn(progressTrackVariants({ size: size ?? inherited }), className)}
			{...props}
		>
			{children ?? <ProgressIndicator />}
		</Base.Track>
	)
}
ProgressTrack.displayName = "ProgressTrack"

type IndicatorProps = Omit<ComponentProps<typeof Base.Indicator>, "className"> & {
	className?: string
}

/**
 * The filled portion. Base UI sets its width from the value; for the
 * indeterminate state (no width) we span the full track and pulse it.
 */
export function ProgressIndicator({ className, ...props }: IndicatorProps) {
	return (
		<Base.Indicator
			className={cn(
				"h-full rounded-full bg-primary transition-[width] duration-(--motion-duration-slower) ease-decelerate",
				"data-[indeterminate]:w-full data-[indeterminate]:motion-pulse",
				className,
			)}
			{...props}
		/>
	)
}
ProgressIndicator.displayName = "ProgressIndicator"

type LabelProps = Omit<ComponentProps<typeof Base.Label>, "className"> & {
	className?: string
}

/** Accessible label for the bar; wires `aria-labelledby` on the Root. */
export function ProgressLabel({ className, ...props }: LabelProps) {
	return (
		<Base.Label
			className={cn("text-label-md text-foreground", className)}
			{...props}
		/>
	)
}
ProgressLabel.displayName = "ProgressLabel"

type ValueProps = Omit<ComponentProps<typeof Base.Value>, "className"> & {
	className?: string
}

/**
 * The formatted value readout (e.g. "64%"). Renders "—" while indeterminate.
 * Pass a render-function child to format it yourself.
 */
export function ProgressValue({ className, ...props }: ValueProps) {
	return (
		<Base.Value
			className={cn("text-mono-sm text-muted-foreground", className)}
			{...props}
		/>
	)
}
ProgressValue.displayName = "ProgressValue"

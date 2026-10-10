import type { ComponentPropsWithRef } from "react"
import { Icon } from "../../icon"
import { cn } from "../../lib/cn"
import { useTypeTier } from "../../lib/density"
import { Separator } from "../separator/separator"
import { markerRuleVariants, markerVariants } from "./marker.variants"

export interface MarkerProps extends ComponentPropsWithRef<"div"> {
	/**
	 * `status` for live activity, `note` for a system event, `bordered` for a
	 * note that needs containing, `separator` for a labelled rule (date breaks).
	 * @default "status"
	 */
	variant?: "status" | "note" | "bordered" | "separator"
	/** Semantic icon name shown before the label. */
	icon?: string
	/** Spin the icon — pair with `icon="spinner"` for work in flight. @default false */
	spin?: boolean
	/**
	 * Sweep the label while something is streaming. Uses the scale-aware
	 * `motion-text-shimmer` recipe, so it freezes with the rest of the system
	 * under reduced motion instead of animating forever.
	 * @default false
	 */
	shimmer?: boolean
	/**
	 * Announce the label to assistive tech as it changes. On for `status` —
	 * "Thinking…" → "Writing the answer" is information a screen-reader user
	 * needs and would otherwise never receive.
	 * @default true for `status`, false otherwise
	 */
	live?: boolean
}

/**
 * Marker — a non-message row in a conversation.
 *
 * Date breaks, "Carla joined", "Thinking…", "Ran search(3 results)", "Message
 * failed to send". They are one component because they share one job: annotate
 * the stream without competing with it. Every variant is quieter than the
 * message tier by design — a marker styled like a message turns the transcript
 * into a list of alerts.
 *
 *   <Marker icon="spinner" spin shimmer>Thinking…</Marker>
 *   <Marker variant="separator">Yesterday</Marker>
 *   <Marker variant="note" icon="user">Carla joined the conversation</Marker>
 *   <Marker variant="bordered" icon="warning">This thread will be archived in 7 days</Marker>
 *
 * `status` markers are `aria-live` regions by default. A sighted reader watches
 * "Thinking…" become "Writing the answer"; without the live region a
 * screen-reader user gets silence for the entire generation and no way to tell
 * a slow answer from a dead one.
 */
export function Marker({
	variant = "status",
	icon,
	spin = false,
	shimmer = false,
	live,
	className,
	children,
	...props
}: MarkerProps) {
	const announce = live ?? variant === "status"
	const tier = useTypeTier()

	return (
		<div
			role={announce ? "status" : undefined}
			aria-live={announce ? "polite" : undefined}
			className={cn(markerVariants({ variant }), tier.secondary, className)}
			{...props}
		>
			{variant === "separator" ? (
				<Separator aria-hidden className={markerRuleVariants()} />
			) : null}
			{icon ? (
				<Icon name={icon} spin={spin} className="shrink-0 text-[1.15em]" />
			) : null}
			<span className={cn("min-w-0", shimmer && "motion-text-shimmer")}>
				{children}
			</span>
			{variant === "separator" ? (
				<Separator aria-hidden className={markerRuleVariants()} />
			) : null}
		</div>
	)
}
Marker.displayName = "Marker"

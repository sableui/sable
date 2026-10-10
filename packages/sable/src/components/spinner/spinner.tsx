import type { ComponentPropsWithRef } from "react"
import { cn } from "../../lib/cn"

export interface SpinnerProps extends ComponentPropsWithRef<"span"> {
	label?: string
	/** `ring` (the default) or three bouncing `dots` — what LoadingDots was. */
	appearance?: "ring" | "dots"
	/** One scale for both appearances. A `size-*` className still overrides the ring. @default "md" */
	size?: "sm" | "md" | "lg"
	/** Ring stroke width, in viewBox units. */
	thickness?: number
}

const RING_SIZE = { sm: "size-3.5", md: "size-4", lg: "size-6" } as const
const DOT_SIZE = { sm: "size-1", md: "size-1.5", lg: "size-2" } as const
const DOT_DELAYS = ["0ms", "150ms", "300ms"] as const

export function Spinner({ label = "Loading", appearance = "ring", size = "md", thickness = 2.5, className, ref, ...props }: SpinnerProps) {
	if (appearance === "dots") {
		return (
			<span ref={ref} role="status" aria-label={label} className={cn("inline-flex items-center gap-1", className)} {...props}>
				{DOT_DELAYS.map((delay) => (
					<span key={delay} className={cn("shrink-0 rounded-full bg-current motion-dot-bounce", DOT_SIZE[size])} style={{ animationDelay: delay }} />
				))}
			</span>
		)
	}
	return (
		<span
			ref={ref}
			role="status"
			aria-label={label}
			className={cn("inline-flex items-center justify-center", RING_SIZE[size], className)}
			{...props}
		>
			<svg
				viewBox="0 0 24 24"
				fill="none"
				aria-hidden="true"
				className="size-full motion-spin"
			>
				{/* Faint full track so the ring always reads as a complete circle. */}
				<circle
					cx="12"
					cy="12"
					r="9"
					stroke="currentColor"
					strokeWidth={thickness}
					className="opacity-20"
				/>
				{/* The moving arc — ~25% of the circle, with rounded caps. */}
				<circle
					cx="12"
					cy="12"
					r="9"
					stroke="currentColor"
					strokeWidth={thickness}
					strokeLinecap="round"
					strokeDasharray="15 42"
				/>
			</svg>
		</span>
	)
}
Spinner.displayName = "Spinner"

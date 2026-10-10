import type { VariantProps } from "class-variance-authority"
import type { ComponentPropsWithRef } from "react"
import { cn } from "../../lib/cn"
import { statusDotVariants } from "./status-dot.variants"

export interface StatusDotProps
	extends ComponentPropsWithRef<"span">,
		VariantProps<typeof statusDotVariants> {
	/** Add an animated ping ring behind the dot to signal a live/active state. */
	pulse?: boolean
}

/**
 * A small colored status dot. Purely decorative — rendered aria-hidden, so
 * pair it with adjacent text for meaning. Set `pulse` for a live indicator.
 */
export function StatusDot({
	tone,
	size,
	pulse = false,
	className,
	...props
}: StatusDotProps) {
	const dot = statusDotVariants({ tone, size })

	if (pulse) {
		return (
			<span
				aria-hidden="true"
				className={cn("relative inline-flex shrink-0", className)}
				{...props}
			>
				<span
					className={cn(
						dot,
						"absolute inset-0 motion-ping opacity-75",
					)}
				/>
				<span className={cn(dot, "relative")} />
			</span>
		)
	}

	return <span aria-hidden="true" className={cn(dot, className)} {...props} />
}
StatusDot.displayName = "StatusDot"

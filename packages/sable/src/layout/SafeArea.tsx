import type { ComponentPropsWithRef } from "react"
import { cn } from "../lib/cn"
import { type Edge, safeAreaInsets } from "./_safeArea"

export interface SafeAreaProps extends ComponentPropsWithRef<"div"> {
	/** Which edges get `env(safe-area-inset-*)` padding. Default all four. */
	edges?: Edge[]
}

/** Pads for device safe-areas (notch, home indicator) on fixed/native surfaces. */
export function SafeArea({
	edges = ["top", "bottom", "left", "right"],
	className,
	style,
	children,
	ref,
	...rest
}: SafeAreaProps) {
	return (
		<div
			ref={ref}
			className={cn(className)}
			style={{ ...safeAreaInsets(edges), ...style }}
			{...rest}
		>
			{children}
		</div>
	)
}

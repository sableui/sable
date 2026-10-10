import type { ComponentPropsWithRef, ReactNode } from "react"
import { cn } from "../../lib/cn"
import { Progress } from "../progress/progress"

export interface PageLoaderProps extends ComponentPropsWithRef<"div"> {
	/** Brand mark / logo shown at center. Falls back to a neutral pulsing mark. */
	children?: ReactNode
	/** Caption beneath the mark (also the accessible label). @default "Loading" */
	label?: string
	/** Cover the viewport (fixed) vs fill the nearest positioned parent. @default true */
	fullscreen?: boolean
	/** Hide the indeterminate bar under the mark. @default false */
	hideBar?: boolean
}

/**
 * PageLoader — a full-screen branded loading splash. The container fades in, the
 * mark breathes (a gentle pulse), and an indeterminate Progress bar pulses below.
 * All motion is token-driven, so it freezes to a calm static screen when motion
 * is off/reduced. Drop your logo in as children:
 *
 *   <PageLoader label="Loading Studio">
 *     <BrandLogo className="h-10 w-auto" />
 *   </PageLoader>
 */
export function PageLoader({
	children,
	label = "Loading",
	fullscreen = true,
	hideBar = false,
	className,
	ref,
	...props
}: PageLoaderProps) {
	return (
		<div
			ref={ref}
			role="status"
			aria-label={label}
			className={cn(
				fullscreen ? "fixed inset-0" : "absolute inset-0",
				"z-(--z-overlay) flex flex-col items-center justify-center gap-6 bg-background animate-fade-in",
				className,
			)}
			{...props}
		>
			<div className="motion-pulse">
				{children ?? (
					<span className="block size-12 rounded-xl bg-foreground/90" aria-hidden />
				)}
			</div>
			{label ? (
				<p className="text-label-md text-muted-foreground">{label}</p>
			) : null}
			{hideBar ? null : (
				<Progress aria-hidden size="sm" className="w-24" />
			)}
		</div>
	)
}
PageLoader.displayName = "PageLoader"

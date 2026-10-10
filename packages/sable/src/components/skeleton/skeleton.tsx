import type { ComponentPropsWithRef } from "react"
import { cn } from "../../lib/cn"

/**
 * Skeleton — a loading placeholder. A muted block with a shimmer sweep that stands in for
 * content while it loads. Style the shape with utilities on the caller side:
 *
 *   <Skeleton className="h-4 w-40" />            // a text line
 *   <Skeleton className="size-10 rounded-full" /> // a circular avatar
 *   <Skeleton className="h-40 w-full" />          // a media block
 *
 * Soft-square (rounded-md) by default; override to rounded-full for circles.
 * Purely presentational — mark the loading region with aria-busy on a parent.
 */
export function Skeleton({ className, ...props }: ComponentPropsWithRef<"div">) {
	return (
		<div
			className={cn("motion-shimmer rounded-md bg-muted", className)}
			{...props}
		/>
	)
}
Skeleton.displayName = "Skeleton"

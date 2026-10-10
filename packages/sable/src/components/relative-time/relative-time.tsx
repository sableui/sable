import { format, formatDistanceToNow } from "date-fns"
import type { ComponentPropsWithRef } from "react"
import { cn } from "../../lib/cn"
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "../tooltip"

export interface RelativeTimeProps
	extends Omit<ComponentPropsWithRef<"time">, "dateTime" | "children"> {
	/** The instant to render. Accepts a Date, an ISO/parseable string, or an epoch number (ms). */
	date: Date | string | number
}

/** Coerce the loose `date` prop into a Date for date-fns. */
function toDate(date: Date | string | number): Date {
	return date instanceof Date ? date : new Date(date)
}

/**
 * RelativeTime — a human "3 minutes ago" timestamp that reveals the full
 * absolute time on hover/focus. The relative label comes from date-fns
 * `formatDistanceToNow(date, { addSuffix: true })`; the tooltip shows the
 * fully-resolved `format(date, "PPpp")` (e.g. "Apr 29, 2025, 4:05:12 PM").
 *
 *   <TooltipProvider>
 *     <RelativeTime date={post.createdAt} />
 *   </TooltipProvider>
 *
 * Renders a native `<time>` element with a machine-readable `dateTime` (ISO)
 * attribute. Wrap one or more in <TooltipProvider> so the shared open/close
 * delay applies. Extra span/time props (className, id, …) pass through to the
 * trigger element. It takes the type size of the text around it, and is
 * keyboard-focusable so the tooltip is reachable without a pointer.
 */
export function RelativeTime({ date, className, ...props }: RelativeTimeProps) {
	const parsed = toDate(date)
	const relative = formatDistanceToNow(parsed, { addSuffix: true })
	const absolute = format(parsed, "PPpp")

	return (
		<Tooltip>
			<TooltipTrigger
				render={
					// design-lint-disable-next-line static-interactive -- the only hover change is text-decoration, which motion-interactive does not list and CSS cannot tween: text-decoration-line is discrete, so the underline lands in one frame either way. Adding the recipe would declare a transition that animates nothing and imply the snap had been handled.
					<time
						dateTime={parsed.toISOString()}
						// A <time> is not focusable on its own, and the absolute time must
						// be reachable without a pointer: the tooltip opens on focus.
						tabIndex={0}
						className={cn(
							// No type size of its own: it inherits the line it sits in (a
							// feed meta row, a message header), so it never jumps a tier.
							"rounded-xs underline-offset-2 decoration-dotted hover:underline focus-visible:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
							className,
						)}
						{...props}
					/>
				}
			>
				{relative}
			</TooltipTrigger>
			<TooltipContent>{absolute}</TooltipContent>
		</Tooltip>
	)
}
RelativeTime.displayName = "RelativeTime"

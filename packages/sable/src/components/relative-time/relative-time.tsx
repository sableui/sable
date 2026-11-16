import { format, formatDistance, type Locale } from "date-fns"
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
	/**
	 * The instant "ago" is measured from. Pass the same value on the server and
	 * the client (a request timestamp, a value from your loader) and both render
	 * the same words, so the page hydrates without a mismatch; leave it out to
	 * measure from the reader's clock.
	 * @default Date.now()
	 */
	now?: Date | number
	/**
	 * A date-fns locale for the words and the absolute time
	 * (`import { fr } from "date-fns/locale"`).
	 * @default English (en-US)
	 */
	locale?: Locale
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
 *
 * A date that does not parse renders its input as plain text, with no tooltip
 * and no `dateTime`: one malformed record shows what it holds instead of
 * throwing a RangeError that takes the whole list down. Measured from the
 * reader's clock the words cannot match the server's, so the `<time>` carries
 * `suppressHydrationWarning`; pass `now` to make both renders agree.
 */
export function RelativeTime({ date, now, locale, className, ...props }: RelativeTimeProps) {
	const parsed = toDate(date)
	if (Number.isNaN(parsed.getTime())) {
		return (
			<time className={className} {...props}>
				{String(date)}
			</time>
		)
	}
	const relative = formatDistance(parsed, now ?? Date.now(), { addSuffix: true, locale })
	const absolute = format(parsed, "PPpp", { locale })

	return (
		<Tooltip>
			<TooltipTrigger
				render={
					// design-lint-disable-next-line static-interactive -- the only hover change is text-decoration, which motion-interactive does not list and CSS cannot tween: text-decoration-line is discrete, so the underline lands in one frame either way. Adding the recipe would declare a transition that animates nothing and imply the snap had been handled.
					<time
						dateTime={parsed.toISOString()}
						suppressHydrationWarning
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

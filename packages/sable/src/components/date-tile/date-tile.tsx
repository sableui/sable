import type { ComponentPropsWithRef } from "react"
import { cn } from "../../lib/cn"

export interface DateTileProps extends Omit<ComponentPropsWithRef<"time">, "children" | "dateTime"> {
	/** The day to show. Read in local time — the tile names a calendar day, not an instant. */
	date: Date
	/** BCP 47 locale for the month name. Defaults to the runtime's. */
	locale?: string
}

/** YYYY-MM-DD from the local calendar day, for `<time dateTime>`. */
function isoDay(date: Date) {
	const pad = (n: number) => String(n).padStart(2, "0")
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/**
 * A calendar-page date: the month on a primary band over the day number. The
 * leading visual of an event, booking or deadline row — where a date is the
 * thing you scan for, not a detail in a sentence (that is `RelativeTime`, or
 * plain text).
 *
 * The corner follows the look up to a cap: past about the band's own height,
 * the curve starts cutting into the band and its text. `h-fit`, because the
 * tile usually sits in a flex row beside two lines of text and must not
 * stretch to their height.
 */
export function DateTile({ date, locale, className, ...props }: DateTileProps) {
	const month = new Intl.DateTimeFormat(locale, { month: "short" }).format(date)
	return (
		<time
			dateTime={isoDay(date)}
			className={cn(
				"grid h-fit w-14 shrink-0 overflow-hidden rounded-[min(var(--radius-md),--spacing(3))] bg-muted text-center text-foreground",
				className,
			)}
			{...props}
		>
			<span className="bg-primary py-0.5 text-label-sm text-primary-foreground">{month}</span>
			{/* Lining figures: a display face with old-style numerals (Prism's)
			    drops the 4 of "14" below the line and the day sits low. */}
			<span className="flex h-9 items-center justify-center text-heading-3 leading-none tabular-nums lining-nums">{date.getDate()}</span>
		</time>
	)
}
DateTile.displayName = "DateTile"

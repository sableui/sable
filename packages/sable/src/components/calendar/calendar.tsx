"use client";

import { Icon } from "../../icon"
import { cn } from "../../lib/cn"
import { buttonVariants } from "../button/button.variants"
import {
	type ChevronProps,
	DayPicker,
	type DayPickerProps,
} from "react-day-picker"

/**
 * Chevron override — renders our semantic <Icon> instead of the bundled SVG so
 * the nav arrows resolve through the consumer's IconProvider. RDP v9 passes an
 * `orientation` of "up" | "down" | "left" | "right"; the month nav only ever
 * uses left/right.
 */
function CalendarChevron({ orientation }: ChevronProps) {
	return (
		<Icon
			name={orientation === "left" ? "chevron-left" : "chevron-right"}
			className="text-sm"
		/>
	)
}

export type CalendarProps = DayPickerProps & {
	/**
	 * Drop the card frame (border, fill, padding) so the grid sits flush inside
	 * a surface that already provides one — a Popover, as DatePicker does.
	 * @default false
	 */
	bare?: boolean
}

/**
 * Calendar — an owned wrapper over react-day-picker v9, themed entirely with
 * our semantic tokens (no external stylesheet import). Every RDP part is styled
 * through a complete `classNames` map, and the nav chevrons render via <Icon>
 * so they follow the injected icon set. Forwards all DayPicker props (mode,
 * selected, onSelect, month, defaultMonth, numberOfMonths, disabled, …) plus
 * className.
 *
 *   const [date, setDate] = useState<Date>()
 *   <Calendar mode="single" selected={date} onSelect={setDate} />
 */
export function Calendar({
	className,
	classNames,
	showOutsideDays = true,
	components,
	bare = false,
	...props
}: CalendarProps) {
	return (
		<DayPicker
			data-slot="calendar"
			showOutsideDays={showOutsideDays}
			className={cn(
				// relative: the nav is absolutely positioned (react-day-picker v9
				// renders it inside `months`, not inside each month), and with no
				// positioned ancestor of our own the chevrons escaped to whatever
				// the host page had positioned — top of the page, in the docs.
				"relative inline-block",
				!bare &&
					"rounded-lg border border-border bg-card p-3 text-card-foreground",
				className,
			)}
			classNames={{
				months: "relative flex flex-col gap-4 sm:flex-row",
				month: "relative flex flex-col gap-4",
				nav: "absolute inset-x-0 top-0 z-10 flex items-center justify-between px-1",
				// The month arrows are Sable's ghost icon button — same height ladder,
				// radius (--button-radius), hover and focus ring — not a lookalike.
				button_previous: buttonVariants({ variant: "ghost", size: "icon-sm" }),
				button_next: buttonVariants({ variant: "ghost", size: "icon-sm" }),
				month_caption:
					"relative flex h-(--control-sm) items-center justify-center px-(--control-sm)",
				caption_label: "text-title-sm",
				month_grid: "w-full border-collapse",
				weekdays: "flex",
				weekday:
					"flex size-9 items-center justify-center text-caption text-muted-foreground",
				week: "mt-1 flex w-full",
				day: "p-0 text-center",
				day_button:
					"inline-flex size-9 items-center justify-center rounded-md text-body-sm motion-interactive outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring",
				// Range fill lives on the CELL so it forms one continuous bar; only the
				// outer ends are rounded. The selected (primary) endpoint buttons sit on
				// top — their rounded corners reveal the accent fill, connecting them to
				// the middle instead of leaving a card-colored gap.
				range_start: "rounded-s-md bg-accent",
				// `selected` also lands on every middle day, so its primary fill/text
				// competes with ours at equal specificity (and Tailwind's alphabetical
				// utility order lets `text-primary-foreground` win). Force the in-range
				// button to stay transparent with accent-foreground text so it always
				// wins — otherwise the numbers render near-invisible (primary-on-accent).
				range_middle:
					"rounded-none bg-accent [&>button]:rounded-none [&>button]:bg-transparent! [&>button]:text-accent-foreground! [&>button]:hover:bg-transparent! [&>button]:hover:text-accent-foreground!",
				range_end: "rounded-e-md bg-accent",
				selected:
					"[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground",
				// Today is a dot under the number, in the button's own ink — never a
				// ring, which is what keyboard focus draws and would be mistaken for it.
				today:
					"[&>button]:relative [&>button]:after:absolute [&>button]:after:bottom-1 [&>button]:after:size-1 [&>button]:after:rounded-full [&>button]:after:bg-current",
				// Muted ink alone (4.5:1+): these are live, clickable days. At 50%
				// opacity they measured 2.2:1 and looked exactly like `disabled`.
				outside: "[&>button]:text-muted-foreground",
				disabled:
					"[&>button]:pointer-events-none [&>button]:text-muted-foreground [&>button]:opacity-50",
				hidden: "invisible",
				...classNames,
			}}
			components={{ Chevron: CalendarChevron, ...components }}
			{...props}
		/>
	)
}
Calendar.displayName = "Calendar"

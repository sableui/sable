# ReserveTableBlock

A booking card: a bare Calendar for the day, a NumberField for the party size, a Reserve button that names the day picked, then a confirmation that replaces the picker with a DateTile, the party size and a ConfirmButton to cancel.

**Intent:** Reach for this to book one slot on one day — a table, a class, a viewing, a pickup. Picking a range of nights is a Calendar in range mode; a date inside a longer form is DatePicker.

**Block:** Commerce · card · designed for 18rem–20rem wide (fills its container up to the max)

## Notes

- The Calendar is `bare`: the card is already the surface, and a framed calendar inside it would read as a card in a card.
- The button says what it will do with the choice ("Reserve for Fri, Nov 13"), so the day is confirmed before the press, not after.
- Days before the first bookable one are disabled rather than hidden, so the month keeps its shape.
- Once booked, the picker leaves and the card becomes the confirmation: "Table booked" as its title, the day as a DateTile, and the party size. A disabled calendar with a small status line under it buries the one thing the person wants to know.
- The card eases to the confirmation's shorter height (`useAutoSize`) rather than snapping.
- Cancel is a ConfirmButton, not a dialog: a second press is enough for something this easy to redo. It returns to the picker with the day and party size kept, so it also serves as change.

## Accessibility

- Focus moves to the confirmation's header when the picker leaves, and back to Reserve after a cancel. The header is a role=status region, so "Table booked" is announced.
- The party size is a labelled NumberField clamped to the venue's range by typing, arrows and steppers alike.
- ConfirmButton announces that it is armed and what a second press does.

## Source

```tsx
"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Button, Calendar, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, cn, ConfirmButton, DateTile, Field, Icon, NumberField, TextSwap, useAutoSize, useToday } from "@sableui/react"

const venue = { name: "Osteria Lina", service: "Dinner, from 6 pm", maxParty: 8 }

const dayLabel = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" })
const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long" })

export interface ReserveTableBlockProps {
	className?: string
	/** false drops the card's surface and border — for a Sheet or muted section that already frames it. */
	framed?: boolean
	/** Called with the booking when the person reserves. */
	onReserve?: (booking: { date: Date; guests: number }) => void
	/** Called when the person cancels the booking they just made. */
	onCancel?: () => void
}

export function ReserveTableBlock({ className, framed = true, onReserve, onCancel }: ReserveTableBlockProps) {
	// The first day that can still be booked (today), and the day picked on
	// arrival (two days out), so the sample never opens on a day that has
	// already gone; use your venue's own availability. useToday, not
	// new Date(): the server and the reader may be on different days.
	const opens = useToday()
	const [picked, setDate] = useState<Date | null>(null)
	const date = useMemo(() => picked ?? new Date(opens.getFullYear(), opens.getMonth(), opens.getDate() + 2), [picked, opens])
	const [guests, setGuests] = useState(2)
	const [reserved, setReserved] = useState(false)

	// Booking swaps the whole card for its confirmation, so focus follows it
	// instead of falling back to the top of the page.
	const action = useRef<HTMLButtonElement>(null)
	const outcome = useRef<HTMLDivElement>(null)
	const was = useRef(reserved)
	useEffect(() => {
		if (was.current !== reserved) (reserved ? outcome : action).current?.focus()
		was.current = reserved
	}, [reserved])

	// The confirmation is much shorter than the picker: the card eases to it.
	const size = useAutoSize<HTMLDivElement, HTMLDivElement>({ axis: "height" })

	return (
		<Card variant={framed ? "default" : "flat"} className={cn("w-full max-w-xs", className)}>
			<div ref={size.outerRef} className="motion-size">
				<div ref={size.innerRef}>
					{reserved ? (
						<>
							{/* The picker has done its job, so it leaves. What is left is the
							    answer: that it worked, and what was booked. */}
							<CardHeader ref={outcome} tabIndex={-1} role="status" className="outline-none">
								<CardTitle render={<h2 />} className="flex items-center gap-2">
									<Icon name="circle-check" variant="solid" className="text-success" />
									<span>Table booked</span>
								</CardTitle>
								<CardDescription>{venue.name}</CardDescription>
							</CardHeader>
							<CardContent className="flex items-center gap-4">
								<DateTile date={date} />
								<div className="flex min-w-0 flex-col">
									<span className="text-title-lg">Table for {guests}</span>
									<span className="text-body-sm text-muted-foreground">
										{weekday.format(date)} · {venue.service}
									</span>
								</div>
							</CardContent>
							<CardFooter actions>
								{/* Two presses, not a dialog: cancelling is easy to undo by booking
								    again, and it returns to the picker with the choices kept. */}
								<ConfirmButton
									variant="outline"
									confirmLabel="Cancel this booking?"
									onConfirm={() => {
										setReserved(false)
										onCancel?.()
									}}
								>
									Cancel booking
								</ConfirmButton>
							</CardFooter>
						</>
					) : (
						<>
							<CardHeader>
								<CardTitle render={<h2 />}>{venue.name}</CardTitle>
								<CardDescription>{venue.service}</CardDescription>
							</CardHeader>
							<CardContent className="flex flex-col gap-4">
								{/* Bare: the card is already the surface, so the calendar brings no frame of its own. */}
								<Calendar
									bare
									mode="single"
									required
									selected={date}
									onSelect={(next: Date | undefined) => next && setDate(next)}
									defaultMonth={date}
									disabled={{ before: opens }}
									className="w-full"
								/>
								<Field label="Guests">
									<NumberField
										min={1}
										max={venue.maxParty}
										value={guests}
										onValueChange={(next: number | null) => setGuests(next ?? 1)}
									/>
								</Field>
							</CardContent>
							<CardFooter actions>
								<Button
									ref={action}
									className="w-full"
									onClick={() => {
										setReserved(true)
										onReserve?.({ date, guests })
									}}
								>
									{/* One span, so the words keep a word space between them, not the button's icon gap. */}
									<span>
										Reserve for <TextSwap text={dayLabel.format(date)} />
									</span>
								</Button>
							</CardFooter>
						</>
					)}
				</div>
			</div>
		</Card>
	)
}
```

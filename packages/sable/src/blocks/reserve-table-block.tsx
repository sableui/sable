"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "../components/button"
import { Calendar } from "../components/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/card"
import { ConfirmButton } from "../components/confirm-button"
import { DateTile } from "../components/date-tile"
import { Field } from "../components/form"
import { NumberField } from "../components/number-field"
import { TextSwap } from "../components/text-swap"
import { Icon } from "../icon"
import { cn } from "../lib/cn"
import { useAutoSize } from "../motion/useAutoSize"

// ---block-code---
const venue = { name: "Osteria Lina", service: "Dinner, from 6 pm", maxParty: 8 }
// The first day that can still be booked (today), and the day picked on
// arrival (two days out). Relative to the page load, so the sample never
// opens on a day that has already gone; use your venue's own availability.
const now = new Date()
const opens = new Date(now.getFullYear(), now.getMonth(), now.getDate())
const initial = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2)

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
	const [date, setDate] = useState(initial)
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
								<div className="flex min-w-0 flex-col gap-1">
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

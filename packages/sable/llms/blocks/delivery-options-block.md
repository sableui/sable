# DeliveryOptionsBlock

A checkout step for choosing delivery: a RadioGroup of RadioCards, each with its arrival and price, over a total that rolls to the new amount and a Continue button.

**Intent:** Reach for this when one of a few options must be picked and each needs a line of explanation and a price — delivery, a plan, a seat class, a payment schedule. More than five or six options is a Select; options with no description are a plain RadioGroup.

**Block:** Commerce · card · designed for 18rem–20rem wide (fills its container up to the max)

## Notes

- Each option is a RadioCard: the whole card is the target, with the price in `trailing` on the title's line so the prices scan as a column.
- A free option says "Free" rather than $0.00.
- The first option is selected on arrival, so Continue always has an answer and the total is never blank. List the options cheapest first, so that default is the cheapest.
- The total is a NumberTicker: choosing Express rolls it up by the fee instead of swapping the number.

## Accessibility

- The cards are one radio group with a name: arrow keys move the choice, and Tab leaves the group in one step.
- Each card's description and price are part of its accessible name's context, read with the option.

## Source

```tsx
"use client"

import { useState, useMemo } from "react"
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, cn, NumberTicker, RadioCard, RadioGroup, useToday } from "@sableui/react"

const order = { summary: "Linen throw blanket · 1 item", subtotal: 64 }

// Arrival days count from today, so the sample never promises a date that has passed.
const day = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" })
const inDays = (today: Date, n: number) => day.format(new Date(today.getFullYear(), today.getMonth(), today.getDate() + n))

// Listed cheapest first: the first option is the one selected on arrival.
const optionsFrom = (today: Date) => [
	{ id: "standard", title: "Standard", detail: `Arrives ${inDays(today, 5)}–${inDays(today, 7)}`, price: 0 },
	{ id: "express", title: "Express", detail: `Arrives ${inDays(today, 2)}`, price: 12 },
	{ id: "pickup", title: "Store pickup", detail: "Ready today from 4 pm", price: 0 },
]

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })

export interface DeliveryOptionsBlockProps {
	className?: string
	/** false drops the card's surface and border — for a Sheet or muted section that already frames it. */
	framed?: boolean
	/** Called with the chosen option's id when the person continues. */
	onContinue?: (optionId: string) => void
}

export function DeliveryOptionsBlock({ className, framed = true, onContinue }: DeliveryOptionsBlockProps) {
	// useToday, not new Date(): the server and the reader may be on different days.
	const today = useToday()
	const options = useMemo(() => optionsFrom(today), [today])
	const [chosen, setChosen] = useState("standard")
	const option = options.find((item) => item.id === chosen) ?? options[0]
	return (
		<Card variant={framed ? "default" : "flat"} className={cn("w-full max-w-xs", className)}>
			<CardHeader>
				<CardTitle render={<h2 />}>Delivery</CardTitle>
				<CardDescription>{order.summary}</CardDescription>
			</CardHeader>
			<CardContent>
				<RadioGroup aria-label="Delivery method" value={chosen} onValueChange={(value: unknown) => setChosen(String(value))}>
					{options.map((item) => (
						<RadioCard
							key={item.id}
							value={item.id}
							title={item.title}
							description={item.detail}
							trailing={<span className="text-mono-md">{item.price ? money.format(item.price) : "Free"}</span>}
						/>
					))}
				</RadioGroup>
			</CardContent>
			<CardFooter className="flex-col items-stretch gap-4">
				<div className="flex items-baseline justify-between">
					<span className="text-body-sm text-muted-foreground">Total</span>
					{/* The total rolls to its new value, so the cost of a choice is seen changing. */}
					<NumberTicker
						className="text-mono-lg"
						value={order.subtotal + option.price}
						format={{ style: "currency", currency: "USD" }}
					/>
				</div>
				<Button onClick={() => onContinue?.(chosen)}>Continue to payment</Button>
			</CardFooter>
		</Card>
	)
}
```

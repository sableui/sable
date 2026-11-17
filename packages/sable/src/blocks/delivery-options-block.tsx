"use client"

import { useMemo, useState } from "react"
import { Button } from "../components/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/card"
import { NumberTicker } from "../components/number-ticker"
import { RadioGroup } from "../components/radio"
import { RadioCard } from "../components/radio-card"
import { cn } from "../lib/cn"
import { useToday } from "../lib/use-today"

// ---block-code---
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

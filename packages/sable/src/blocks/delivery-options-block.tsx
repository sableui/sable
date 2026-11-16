"use client"

import { useState } from "react"
import { Button } from "../components/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/card"
import { NumberTicker } from "../components/number-ticker"
import { RadioGroup } from "../components/radio"
import { RadioCard } from "../components/radio-card"
import { cn } from "../lib/cn"

// ---block-code---
const order = { summary: "Linen throw blanket · 1 item", subtotal: 64 }

// Arrival days count from today, so the sample never promises a date that has passed.
const day = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" })
const inDays = (n: number) => day.format(new Date(Date.now() + n * 86_400_000))

// Listed cheapest first: the first option is the one selected on arrival.
const options = [
	{ id: "standard", title: "Standard", detail: `Arrives ${inDays(5)}–${inDays(7)}`, price: 0 },
	{ id: "express", title: "Express", detail: `Arrives ${inDays(2)}`, price: 12 },
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
	const [chosen, setChosen] = useState(options[0].id)
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
							trailing={item.price ? money.format(item.price) : "Free"}
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

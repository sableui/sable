"use client"

import { useRef, useState } from "react"
import { Button } from "../components/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardList, CardTitle } from "../components/card"
import { EmptyState } from "../components/empty-state"
import { Entity } from "../components/entity"
import { MediaImage } from "../components/media-image"
import { NumberField } from "../components/number-field"
import { NumberTicker } from "../components/number-ticker"
import { Icon } from "../icon"
import { cn } from "../lib/cn"

// ---block-code---
// `image` is the product photo URL; left empty, it paints art seeded by the title.
const lines = [
	{ id: "throw", title: "Linen throw blanket", detail: "Oat · 130 × 170 cm", price: 64, quantity: 1, image: "" },
	{ id: "mug", title: "Stoneware mug", detail: "Speckled white", price: 18, quantity: 2, image: "" },
	{ id: "candle", title: "Cedar candle", detail: "220 g", price: 24, quantity: 1, image: "" },
]

// Shipping is free from `free` up; below it costs `cost`.
const shipping = { free: 150, cost: 8 }
const maxQuantity = 10

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })

type Line = (typeof lines)[number]

export interface CartBlockProps {
	className?: string
	/** false drops the card's surface and border — for a Sheet or checkout column that already frames it. */
	framed?: boolean
	/** Called with the line's id and its new quantity. */
	onQuantityChange?: (id: string, quantity: number) => void
	/** Called with the line's id when it is removed. */
	onRemove?: (id: string) => void
	/** Called with what is in the cart when the person checks out. */
	onCheckout?: (cart: { lines: { id: string; quantity: number }[]; total: number }) => void
}

export function CartBlock({ className, framed = true, onQuantityChange, onRemove, onCheckout }: CartBlockProps) {
	const [cart, setCart] = useState<Line[]>(lines)
	// What the last removal was, for the live region below.
	const [removed, setRemoved] = useState("")

	const count = cart.reduce((sum, line) => sum + line.quantity, 0)
	const subtotal = cart.reduce((sum, line) => sum + line.price * line.quantity, 0)
	const delivery = subtotal >= shipping.free || subtotal === 0 ? 0 : shipping.cost
	const total = subtotal + delivery

	const setQuantity = (id: string, quantity: number) => {
		setCart((current) => current.map((line) => (line.id === id ? { ...line, quantity } : line)))
		onQuantityChange?.(id, quantity)
	}
	// The removed row takes its button with it, so focus goes to the cart's
	// title rather than falling back to the top of the page.
	const title = useRef<HTMLHeadingElement>(null)
	const remove = (line: Line) => {
		title.current?.focus()
		setCart((current) => current.filter((item) => item.id !== line.id))
		setRemoved(`Removed ${line.title}`)
		onRemove?.(line.id)
	}

	return (
		<Card variant={framed ? "default" : "flat"} className={cn("w-full max-w-sm", className)}>
			<CardHeader>
				<CardTitle render={<h2 ref={title} tabIndex={-1} className="outline-none" />}>Your cart</CardTitle>
				<CardDescription>{count === 1 ? "1 item" : `${count} items`}</CardDescription>
			</CardHeader>
			{cart.length ? (
				<CardList divided={false}>
					{cart.map((line) => (
						<Entity
							key={line.id}
							leading={<MediaImage src={line.image} seed={line.title} className="size-14 shrink-0 rounded-md" />}
							title={line.title}
							subtitle={`${line.detail} · ${money.format(line.price)}`}
							subtitleWrap
							action={
								<div className="flex items-center gap-1">
									<NumberField
										size="sm"
										min={1}
										max={maxQuantity}
										value={line.quantity}
										onValueChange={(next: number | null) => setQuantity(line.id, next ?? 1)}
										aria-label={`Quantity of ${line.title}`}
										className="w-24"
									/>
									<Button variant="ghost" size="icon-sm" bleed="end" aria-label={`Remove ${line.title}`} onClick={() => remove(line)}>
										<Icon name="trash" />
									</Button>
								</div>
							}
						/>
					))}
				</CardList>
			) : (
				<CardContent>
					<EmptyState icon={<Icon name="inbox" />} title="Your cart is empty" description="Items you add show up here." />
				</CardContent>
			)}
			{/* Mounted from the start, so a removal is announced: the row it was on is gone. */}
			<p role="status" className="sr-only">
				{removed}
			</p>
			{cart.length ? (
				<CardFooter className="flex-col items-stretch gap-4">
					<dl className="flex flex-col gap-2 text-body-sm">
						<div className="flex items-baseline justify-between gap-3">
							<dt className="text-muted-foreground">Subtotal</dt>
							<dd className="text-mono-md">{money.format(subtotal)}</dd>
						</div>
						<div className="flex items-baseline justify-between gap-3">
							<dt className="text-muted-foreground">Shipping</dt>
							<dd className="text-mono-md">{delivery ? money.format(delivery) : "Free"}</dd>
						</div>
						<div className="flex items-baseline justify-between gap-3 pt-1">
							<dt className="text-label-lg">Total</dt>
							{/* The total rolls as quantities change, so the cost of a change is seen. */}
							<dd>
								<NumberTicker className="text-mono-lg" value={total} format={{ style: "currency", currency: "USD" }} />
							</dd>
						</div>
					</dl>
					{/* The nudge is a note on the action, not a fourth line of the sum:
					    above the button it read as part of the total it sat under. */}
					<div className="flex flex-col gap-2">
						<Button onClick={() => onCheckout?.({ lines: cart.map(({ id, quantity }) => ({ id, quantity })), total })}>Check out</Button>
						{delivery ? (
							<p className="text-center text-caption text-muted-foreground">{`Add ${money.format(shipping.free - subtotal)} more for free shipping.`}</p>
						) : null}
					</div>
				</CardFooter>
			) : null}
		</Card>
	)
}

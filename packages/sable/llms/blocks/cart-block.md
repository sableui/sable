# CartBlock

A cart and its order summary: a CardList of lines, each a thumbnail, a NumberField for the quantity and a remove button, over a subtotal, shipping and a total that rolls, and Check out.

**Intent:** Reach for this as a cart drawer, the cart page's summary column, or the review step before payment. One product to buy is ProductCardBlock; choosing how it arrives is DeliveryOptionsBlock, the step after this one.

**Block:** Commerce · card · designed for 20rem–24rem wide (fills its container up to the max)

## Notes

- Lines are Entity rows in a CardList, so they inset to the card's padding at any density and the thumbnails line up with the title above.
- Quantity is a NumberField with steppers, floored at 1: taking a line out is the remove button, a separate decision with its own name, not a quantity of zero.
- The summary is a description list (Subtotal, Shipping, Total), and the total is a NumberTicker, so the cost of a change is seen changing.
- Shipping says how far the cart is from free, in one templated sentence, until it is free.
- An empty cart is an EmptyState in place of the lines, and the summary and Check out leave with them.
- `onCheckout` receives the lines (id and quantity) and the total; price them again on the server.

## Accessibility

- Each quantity field and remove button is named for its product ("Quantity of Stoneware mug", "Remove Stoneware mug").
- Removing a line moves focus to the cart's heading, since the row and its button are gone, and a status region mounted from the start says what was removed.
- The product thumbnails are decorative beside their titles.

## Source

```tsx
"use client"

import { useState, useRef } from "react"
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardList, CardTitle, cn, EmptyState, Entity, Icon, MediaImage, NumberField, NumberTicker } from "@sableui/react"

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
				<CardList>
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
							<dd className="text-mono-sm">{money.format(subtotal)}</dd>
						</div>
						<div className="flex items-baseline justify-between gap-3">
							<dt className="text-muted-foreground">Shipping</dt>
							<dd className="text-mono-sm">{delivery ? money.format(delivery) : "Free"}</dd>
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
```

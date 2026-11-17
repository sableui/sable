# SubscriptionBlock

The current plan in billing settings: its name and state as a Badge, the price, a Meter of seats used, the payment method as an Entity with Update, and Change plan beside a two-press Cancel plan that can be taken back.

**Intent:** Reach for this at the top of billing settings, above InvoiceHistoryBlock. Choosing a plan for the first time is PricingTableBlock or PricingCardBlock; deleting the whole account is DangerZoneBlock.

**Block:** Commerce · card · designed for 20rem–24rem wide (fills its container up to the max)

## Notes

- The renewal date is in the description, and after a cancel it becomes the end date: a cancelled plan stays active until then, and the Badge says "Cancelling", not "Cancelled".
- Cancel plan is a ConfirmButton (two presses) rather than a dialog, because nothing ends at once and Keep my plan undoes it until the period runs out. Use DestructiveActionModal when cancelling ends access immediately.
- Seats are a level against a limit, so they are a Meter, not a Progress bar.
- The payment method is an Entity whose leading mark is an IconTile, the same row shape as a session or an integration.
- Change plan is the outline action and the cancel is ghost: neither is the page's primary, and cancelling must not look like the suggested path.

## Accessibility

- The plan's state is text in a Badge; the dot only reinforces it.
- A status region mounted from the start announces the cancellation and the date the plan ends.
- The Update button is named "Update payment method", so it makes sense out of its row.

## Source

```tsx
"use client"

import { useState } from "react"
import { Badge, Button, Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, cn, ConfirmButton, Entity, IconTile, Meter, MeterLabel, MeterTrack, MeterValue } from "@sableui/react"

const plan = { name: "Studio", price: "$192", period: "year", seats: { used: 8, total: 10 } }
const card = { brand: "Visa", last4: "4242", expires: "08/28" }

// The renewal is 23 days after the page loaded — replace with the subscription's own date.
const renews = new Date(Date.now() + 23 * 86_400_000)
const longDate = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" })

export interface SubscriptionBlockProps {
	className?: string
	/** false drops the card's surface and border — for a settings section that already frames it. */
	framed?: boolean
	/** Called when the person asks to change plan. */
	onChangePlan?: () => void
	/** Called when the person asks to update the payment method. */
	onUpdatePayment?: () => void
	/** Called when the person cancels; the plan runs to the end of the period. */
	onCancel?: () => void
	/** Called when the person takes the cancellation back. */
	onResume?: () => void
}

export function SubscriptionBlock({ className, framed = true, onChangePlan, onUpdatePayment, onCancel, onResume }: SubscriptionBlockProps) {
	const [cancelled, setCancelled] = useState(false)
	const ends = longDate.format(renews)

	return (
		<Card variant={framed ? "default" : "flat"} className={cn("w-full max-w-sm", className)}>
			<CardHeader>
				<CardTitle render={<h2 />}>{plan.name} plan</CardTitle>
				<CardDescription>{cancelled ? `Ends on ${ends}` : `Renews on ${ends}`}</CardDescription>
				<CardAction>
					{/* The state in words: a cancelled plan is still active until it ends. */}
					<Badge appearance="plain" tone={cancelled ? "warning" : "success"} dot>
						{cancelled ? "Cancelling" : "Active"}
					</Badge>
				</CardAction>
			</CardHeader>
			<CardContent className="flex flex-col gap-5">
				<div className="flex items-baseline gap-1.5">
					<span className="text-mono-xl">{plan.price}</span>
					<span className="text-body-sm text-muted-foreground">per {plan.period}</span>
				</div>
				{/* A level against a limit: Meter, not Progress. */}
				<Meter value={plan.seats.used} max={plan.seats.total} getAriaValueText={(_, value) => `${value ?? 0} of ${plan.seats.total} seats used`}>
					<div className="mb-2 flex items-center justify-between gap-3">
						<MeterLabel>Seats</MeterLabel>
						<MeterValue>{(_, value) => `${value ?? 0} of ${plan.seats.total}`}</MeterValue>
					</div>
					<MeterTrack />
				</Meter>
				<Entity
					className="p-0"
					leading={<IconTile icon="wallet" size="sm" appearance="muted" />}
					title={`${card.brand} ending ${card.last4}`}
					subtitle={`Expires ${card.expires}`}
					action={
						<Button variant="ghost" size="sm" bleed="end" aria-label="Update payment method" onClick={onUpdatePayment}>
							Update
						</Button>
					}
				/>
			</CardContent>
			{/* Mounted from the start, so the change of state is announced. */}
			<p role="status" className="sr-only">
				{cancelled ? `Subscription cancelled. ${plan.name} stays active until ${ends}.` : ""}
			</p>
			<CardFooter actions className="justify-end">
				{cancelled ? (
					<Button
						onClick={() => {
							setCancelled(false)
							onResume?.()
						}}
					>
						Keep my plan
					</Button>
				) : (
					<>
						{/* Two presses, not a dialog: the plan runs to the end of the period,
						    and Keep my plan undoes it until then. */}
						<ConfirmButton
							variant="ghost"
							confirmLabel="Cancel at period end?"
							onConfirm={() => {
								setCancelled(true)
								onCancel?.()
							}}
						>
							Cancel plan
						</ConfirmButton>
						<Button variant="outline" onClick={onChangePlan}>
							Change plan
						</Button>
					</>
				)}
			</CardFooter>
		</Card>
	)
}
```

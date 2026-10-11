# OrderTrackingBlock

An order status card: order number, item and a status Badge in the header over a vertical dot Stepper of delivery milestones.

**Intent:** Reach for this for anything that moves through known stages — a delivery, an application, a review, a deployment. For an open-ended activity log, use a list of Entity rows with timestamps instead.

**Block:** Commerce · card · designed for 18rem–20rem wide (fills its container up to the max)

## Notes

- The Stepper's `current` is the step under way; finished steps show their timestamp and future steps show none.
- The status Badge restates the current stage in one word so the card scans without reading the steps.

## Accessibility

- The Stepper is labelled "Delivery status" and marks the current step for assistive tech.
- The Badge's tone is backed by its text; colour alone never carries the status.

## Source

```tsx
import { Badge, Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle, cn, Stepper, StepperItem } from "@sableui/react"

// design-lint-disable-next-line inline-color -- an order number, not a colour
const order = { number: "Order #2048", item: "Giclée print, 18 × 24 in", status: "In transit", current: 2 }

const steps = [
	{ title: "Order placed", detail: "Oct 9, 10:14 AM" },
	{ title: "Printed and packed", detail: "Oct 10, 4:02 PM" },
	{ title: "Out for delivery", detail: "Arriving today by 6 PM" },
	{ title: "Delivered", detail: undefined },
]

export interface OrderTrackingBlockProps {
	className?: string
	/** false drops the card's surface and border — for a Sheet or muted section that already frames it. */
	framed?: boolean
}

export function OrderTrackingBlock({ className, framed = true }: OrderTrackingBlockProps) {
	return (
		<Card variant={framed ? "default" : "flat"} className={cn("w-full max-w-xs", className)}>
			<CardHeader>
				<CardTitle>{order.number}</CardTitle>
				<CardDescription>{order.item}</CardDescription>
				<CardAction>
					<Badge tone="warning" size="sm">
						{order.status}
					</Badge>
				</CardAction>
			</CardHeader>
			<CardContent>
				<Stepper orientation="vertical" indicator="dot" current={order.current} aria-label="Delivery status">
					{steps.map((step) => (
						<StepperItem key={step.title} title={step.title} description={step.detail} />
					))}
				</Stepper>
			</CardContent>
		</Card>
	)
}
```

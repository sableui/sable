import { Badge } from "../components/badge"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "../components/card"
import { Stepper, StepperItem } from "../components/stepper"
import { cn } from "../lib/cn"

// ---block-code---
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

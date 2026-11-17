# RecentOrdersBlock

A data-table card for a dashboard: a flush DataTable of recent orders with sortable columns, status Badges and clickable rows, a status Select in the header, and a count with View all orders below.

**Intent:** Reach for this as the table tile on a dashboard: the latest few records, filtered and sorted in place, each opening its detail. A full history with paging and export is DataTable on its own page; a fixed billing history with downloads is InvoiceHistoryBlock.

**Block:** Dashboard · card · designed for 20rem–48rem wide (fills its container up to the max)

## Notes

- The table runs edge to edge (CardContent flush) and its outer columns still line up with the header; on a narrow screen it scrolls sideways inside the card.
- The filter is a Select in CardAction: one choice that changes the rows, where a row of Pills would crowd the header.
- Sorting is DataTable's own (Customer, Placed, Total), newest first on arrival.
- Placed is a RelativeTime, and the sample orders are timed from the page load.
- A filter with no matches shows DataTable's empty row, not an empty card.

## Accessibility

- Status is text in a Badge; the dot only reinforces it.
- Rows open from the keyboard as well as by click (DataTable's row click), and sortable headers announce their direction.
- The filter Select is named "Filter by status".

## Source

```tsx
"use client"

import { useState } from "react"
import { Badge, Button, Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, cn, DataTable, RelativeTime, Select, SelectContent, SelectItem, SelectTrigger } from "@sableui/react"

// Placed relative to the page load — replace with your own rows.
const HOUR = 3_600_000
const orders = [
	{ id: "1048", customer: "Mara Okafor", placedAt: Date.now() - 2 * HOUR, status: "paid", total: 128 },
	{ id: "1047", customer: "Sam Rivera", placedAt: Date.now() - 5 * HOUR, status: "pending", total: 64 },
	{ id: "1046", customer: "Jun Park", placedAt: Date.now() - 26 * HOUR, status: "paid", total: 212.5 },
	{ id: "1045", customer: "Lena Fischer", placedAt: Date.now() - 30 * HOUR, status: "refunded", total: 48 },
	{ id: "1044", customer: "Tala Begay", placedAt: Date.now() - 52 * HOUR, status: "paid", total: 96 },
	{ id: "1043", customer: "Kofi Mensah", placedAt: Date.now() - 75 * HOUR, status: "pending", total: 18 },
]

const statuses = [
	{ value: "all", label: "All statuses" },
	{ value: "paid", label: "Paid" },
	{ value: "pending", label: "Pending" },
	{ value: "refunded", label: "Refunded" },
]
const tone = { paid: "success", pending: "warning", refunded: "neutral" } as const
const label = { paid: "Paid", pending: "Pending", refunded: "Refunded" } as const

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })

type Status = keyof typeof tone

export interface RecentOrdersBlockProps {
	className?: string
	/** false drops the card's surface and border — for a dashboard section that already frames it. */
	framed?: boolean
	/** Called with the order's id when its row is opened. */
	onOpen?: (orderId: string) => void
	/** Called when the person asks for every order. */
	onViewAll?: () => void
}

export function RecentOrdersBlock({ className, framed = true, onOpen, onViewAll }: RecentOrdersBlockProps) {
	const [status, setStatus] = useState("all")
	const shown = orders.filter((order) => status === "all" || order.status === status)

	return (
		<Card variant={framed ? "default" : "flat"} className={cn("@container/orders w-full max-w-3xl", className)}>
			<CardHeader>
				<CardTitle render={<h2 />}>Recent orders</CardTitle>
				<CardDescription>The last three days.</CardDescription>
				<CardAction>
					<Select items={statuses} value={status} onValueChange={(next: unknown) => setStatus(String(next))}>
						<SelectTrigger size="sm" aria-label="Filter by status" />
						<SelectContent align="end">
							{statuses.map((item) => (
								<SelectItem key={item.value} value={item.value}>
									{item.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</CardAction>
			</CardHeader>
			{/* Edge to edge: the table's outer columns line up with the header's padding.
			    A narrow card (a phone, a dashboard's side column) drops the order
			    number and then the date by its own width, so the customer, the
			    status and the total are never the columns scrolled out of sight. */}
			<CardContent flush className="overflow-x-auto scrollbar-quiet">
				<DataTable
					data={shown}
					rowKey={(order) => order.id}
					onRowClick={(order) => onOpen?.(order.id)}
					defaultSort={{ key: "placed", direction: "desc" }}
					empty="No orders with this status."
					columns={[
						// First, and never hidden: the table insets its first column to the card's padding.
						{ key: "customer", header: "Customer", sortable: true },
						{ key: "id", header: "Order", className: "hidden @md/orders:table-cell", cell: (order) => <span className="text-mono-md">#{order.id}</span> },
						{
							key: "placed",
							header: "Placed",
							sortable: true,
							className: "hidden @lg/orders:table-cell",
							sortValue: (order) => order.placedAt,
							cell: (order) => (
								<span className="whitespace-nowrap text-muted-foreground">
									<RelativeTime date={order.placedAt} />
								</span>
							),
						},
						{
							key: "status",
							header: "Status",
							cell: (order) => (
								<Badge appearance="plain" tone={tone[order.status as Status]} dot>
									{label[order.status as Status]}
								</Badge>
							),
						},
						{ key: "total", header: "Total", align: "end", sortable: true, sortValue: (order) => order.total, cell: (order) => <span className="text-mono-md">{money.format(order.total)}</span> },
					]}
				/>
			</CardContent>
			<CardFooter className="justify-between gap-3">
				<span className="text-body-sm text-muted-foreground">
					{shown.length === 1 ? "1 order" : `${shown.length} orders`}
				</span>
				<Button variant="ghost" size="sm" bleed="end" onClick={onViewAll}>
					View all orders
				</Button>
			</CardFooter>
		</Card>
	)
}
```

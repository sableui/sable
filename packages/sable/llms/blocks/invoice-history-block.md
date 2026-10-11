# InvoiceHistoryBlock

A billing history card: a flush Table of date, plan, amount and status per invoice, with a download button on each row.

**Intent:** Reach for this in billing settings, under the current plan. For a long, filterable history (hundreds of rows, date ranges, export), use DataTable on its own page.

**Block:** Commerce · card · designed for 20rem–42rem wide (fills its container up to the max)

## Notes

- The table runs edge to edge (CardContent flush); its first and last columns still line up with the card header's padding.
- Amounts are a numeric column — right-aligned with tabular figures — so they compare by eye.
- On a narrow screen the table scrolls sideways inside the card (with a quiet scrollbar) rather than squeezing its columns.

## Accessibility

- The download column has a screen-reader-only header, and each button names its invoice ("Download INV-0042").
- Status is text in a Badge; the dot's colour only reinforces it.

## Source

```tsx
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, cn, Icon, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@sableui/react"

const invoices = [
	{ id: "INV-0042", date: "Oct 1, 2026", plan: "Studio · yearly", amount: "$192.00", status: "Paid" },
	{ id: "INV-0031", date: "Sep 1, 2026", plan: "Studio · monthly", amount: "$20.00", status: "Paid" },
	{ id: "INV-0027", date: "Aug 1, 2026", plan: "Studio · monthly", amount: "$20.00", status: "Refunded" },
	{ id: "INV-0019", date: "Jul 1, 2026", plan: "Starter", amount: "$0.00", status: "Paid" },
]

export interface InvoiceHistoryBlockProps {
	className?: string
	/** false drops the card's surface and border — for a muted section that already frames it. */
	framed?: boolean
	/** Called with the invoice id to download. */
	onDownload?: (id: string) => void
}

export function InvoiceHistoryBlock({ className, framed = true, onDownload }: InvoiceHistoryBlockProps) {
	return (
		<Card variant={framed ? "default" : "flat"} className={cn("w-full max-w-2xl", className)}>
			<CardHeader>
				<CardTitle render={<h2 />}>Invoices</CardTitle>
				<CardDescription>Sent to billing@studio.com on the 1st of each month.</CardDescription>
			</CardHeader>
			<CardContent flush className="overflow-x-auto scrollbar-quiet">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Date</TableHead>
							<TableHead>Plan</TableHead>
							<TableHead numeric>Amount</TableHead>
							<TableHead>Status</TableHead>
							<TableHead className="w-0">
								<span className="sr-only">Download</span>
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{invoices.map((invoice) => (
							<TableRow key={invoice.id}>
								<TableCell className="whitespace-nowrap">{invoice.date}</TableCell>
								<TableCell className="text-muted-foreground">{invoice.plan}</TableCell>
								<TableCell numeric>{invoice.amount}</TableCell>
								<TableCell>
									<Badge appearance="plain" tone={invoice.status === "Paid" ? "success" : "neutral"} dot>
										{invoice.status}
									</Badge>
								</TableCell>
								<TableCell>
									<Button variant="ghost" size="icon-sm" aria-label={`Download ${invoice.id}`} onClick={() => onDownload?.(invoice.id)}>
										<Icon name="download" />
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	)
}
```

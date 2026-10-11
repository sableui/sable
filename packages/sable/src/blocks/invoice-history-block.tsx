import { Badge } from "../components/badge"
import { Button } from "../components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/table"
import { Icon } from "../icon"
import { cn } from "../lib/cn"

// ---block-code---
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

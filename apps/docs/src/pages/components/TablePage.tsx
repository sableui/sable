import {
	Card,
	CardContent,
	RelativeTime,
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	tableMeta,
	TableRow,
	type TableSortDirection,
} from "@sableui/react"
import { useState } from "react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

const HOUR = 60 * 60 * 1000

const INVOICES = [
	{ id: "INV-1009", customer: "Orbit Labs", amount: 1200 },
	{ id: "INV-1010", customer: "meridian", amount: 36 },
	{ id: "INV-1002", customer: "Nova Studio", amount: 480 },
	{ id: "INV-1011", customer: "Atlas Co", amount: 92 },
]
type Sort = { key: "customer" | "amount"; direction: TableSortDirection } | null
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })

/** A hand-built table that sorts: TableHead `sortable` is the control; the rows are yours to order. */
function SortableInvoices() {
	const [sort, setSort] = useState<Sort>({ key: "amount", direction: "desc" })
	const next = (key: "customer" | "amount") =>
		setSort((s) => (s?.key !== key ? { key, direction: "asc" } : s.direction === "asc" ? { key, direction: "desc" } : null))
	const dir = (key: "customer" | "amount") => (sort?.key === key ? sort.direction : null)
	const rows = [...INVOICES]
	if (sort) {
		const collator = new Intl.Collator(undefined, { sensitivity: "base" })
		rows.sort((a, b) => {
			const c = sort.key === "amount" ? a.amount - b.amount : collator.compare(a.customer, b.customer)
			return sort.direction === "asc" ? c : -c
		})
	}
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Invoice</TableHead>
					<TableHead sortable sortDirection={dir("customer")} onSort={() => next("customer")}>
						Customer
					</TableHead>
					<TableHead numeric sortable sortDirection={dir("amount")} onSort={() => next("amount")}>
						Amount
					</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{rows.map((row) => (
					<TableRow key={row.id}>
						<TableCell className="text-mono-caption text-muted-foreground">{row.id}</TableCell>
						<TableCell className="text-foreground">{row.customer}</TableCell>
						<TableCell numeric>{money.format(row.amount)}</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	)
}

export function TablePage() {
	const now = Date.now()
	return (
		<>
			<PageHeader eyebrow="Components" title="Table" lede={ledeFor(tableMeta)} />

			<Section
				title="Orders"
				description="A header, rows with one selected, and a caption. Flush in a card, the first and last columns line up with the card's padding. Wide tables scroll sideways."
			>
				<Example>
					<Card className="w-full overflow-hidden">
						<CardContent flush>
							<Table>
								<TableCaption>Recent orders this week.</TableCaption>
								<TableHeader>
									<TableRow>
										<TableHead>Customer</TableHead>
										<TableHead>Order</TableHead>
										<TableHead>Paid</TableHead>
										<TableHead>Placed</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									<TableRow>
										<TableCell className="text-foreground">@nova</TableCell>
										<TableCell>1042</TableCell>
										<TableCell>$48.00</TableCell>
										<TableCell className="text-muted-foreground">
											<RelativeTime date={now - 2 * HOUR} />
										</TableCell>
									</TableRow>
									<TableRow data-selected>
										<TableCell className="text-foreground">@orbit</TableCell>
										<TableCell>1041</TableCell>
										<TableCell>$120.00</TableCell>
										<TableCell className="text-muted-foreground">
											<RelativeTime date={now - 5 * HOUR} />
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className="text-foreground">@meridian</TableCell>
										<TableCell>1040</TableCell>
										<TableCell>$36.00</TableCell>
										<TableCell className="text-muted-foreground">
											<RelativeTime date={now - 24 * HOUR} />
										</TableCell>
									</TableRow>
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</Example>
			</Section>

			<Section
				title="Sortable headers"
				description="TableHead sortable turns a header into the sort control DataTable uses: one chevron that turns for the direction, aria-sort on the cell, and the label kept on the column's edge (the chevron leads in a numeric column). The table does not sort; order the rows in onSort."
			>
				<Example>
					<Card className="w-full overflow-hidden">
						<CardContent flush>
							<SortableInvoices />
						</CardContent>
					</Card>
				</Example>
			</Section>

			<MetaFooter meta={tableMeta} />
		</>
	)
}

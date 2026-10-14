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
} from "@sableui/react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

const HOUR = 60 * 60 * 1000

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

			<MetaFooter meta={tableMeta} />
		</>
	)
}

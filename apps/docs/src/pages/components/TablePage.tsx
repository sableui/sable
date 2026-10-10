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
				title="Collectors"
				description="A header, rows with one selected, and a caption. Flush in a card, the first and last columns line up with the card's padding. Wide tables scroll sideways."
			>
				<Example>
					<Card className="w-full overflow-hidden">
						<CardContent flush>
							<Table>
								<TableCaption>Recent collectors of this edition.</TableCaption>
								<TableHeader>
									<TableRow>
										<TableHead>Collector</TableHead>
										<TableHead>Edition</TableHead>
										<TableHead>Paid</TableHead>
										<TableHead>Collected</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									<TableRow>
										<TableCell className="text-foreground">@nova</TableCell>
										{/* design-lint-disable-next-line inline-color -- "#012" is an edition number in sample table data, not a colour */}
										<TableCell>#012</TableCell>
										<TableCell>0.5 SOL</TableCell>
										<TableCell className="text-muted-foreground">
											<RelativeTime date={now - 2 * HOUR} />
										</TableCell>
									</TableRow>
									<TableRow data-selected>
										<TableCell className="text-foreground">@orbit</TableCell>
										{/* design-lint-disable-next-line inline-color -- "#011" is an edition number in sample table data, not a colour */}
										<TableCell>#011</TableCell>
										<TableCell>0.5 SOL</TableCell>
										<TableCell className="text-muted-foreground">
											<RelativeTime date={now - 5 * HOUR} />
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell className="text-foreground">@meridian</TableCell>
										{/* design-lint-disable-next-line inline-color -- "#010" is an edition number in sample table data, not a colour */}
										<TableCell>#010</TableCell>
										<TableCell>0.5 SOL</TableCell>
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

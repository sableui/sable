import {
	Badge,
	Card,
	CardContent,
	CardFooter,
	DataTable,
	dataTableMeta,
	EmptyState,
	Icon,
} from "@sableui/react"
import { useState } from "react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

/** Deployment status → Badge tone. Sable has no status vocabulary of its own;
 *  an app maps ITS states onto tones once, here, and every badge follows. */
const STATUS_TONE = { ready: "success", building: "warning", queued: "neutral", failed: "destructive" } as const
const statusTone = (status: keyof typeof STATUS_TONE) => STATUS_TONE[status]
/** The words a person reads: sentence case, never the raw lowercase key. */
const STATUS_LABEL = { ready: "Ready", building: "Building", queued: "Queued", failed: "Failed" } as const

const deployments = [
	{
		id: "dp_01",
		project: "storefront",
		status: "ready" as const,
		deployedAt: new Date("2026-07-04T20:14:00Z"),
		duration: "42s",
	},
	{
		id: "dp_02",
		project: "api",
		status: "building" as const,
		deployedAt: new Date("2026-07-04T21:02:00Z"),
		duration: "—",
	},
	{
		id: "dp_03",
		project: "docs",
		status: "queued" as const,
		deployedAt: new Date("2026-07-04T21:05:00Z"),
		duration: "—",
	},
	{
		id: "dp_04",
		project: "worker",
		status: "failed" as const,
		deployedAt: new Date("2026-07-03T09:30:00Z"),
		duration: "18s",
	},
]

function formatDeployed(date: Date): string {
	return date.toLocaleString(undefined, {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	})
}

export function DataTablePage() {
	const [selectedId, setSelectedId] = useState<string>("dp_01")

	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="Data Table"
				lede={ledeFor(dataTableMeta)}
			/>

			<Section
				title="Sortable columns"
				description="Click a sortable header to cycle through ascending, descending and off. In a card, flush content runs the table edge to edge and its outer columns line up with the card's padding."
			>
				<Example className="block">
					<Card>
						<CardContent flush>
							<DataTable
								data={deployments}
								rowKey={(row) => row.id}
								defaultSort={{ key: "deployedAt", direction: "desc" }}
								caption="Deployments across all projects."
								columns={[
									{ key: "project", header: "Project", sortable: true },
									{
										key: "status",
										header: "Status",
										cell: (row) => (
											<Badge appearance="plain" tone={statusTone(row.status)} dot>
												{STATUS_LABEL[row.status]}
											</Badge>
										),
									},
									{
										key: "deployedAt",
										header: "Deployed",
										sortable: true,
										sortValue: (row) => row.deployedAt.getTime(),
										cell: (row) => formatDeployed(row.deployedAt),
									},
									{ key: "duration", header: "Duration", align: "end" },
								]}
							/>
						</CardContent>
					</Card>
				</Example>
			</Section>

			<Section
				title="Row selection"
				description="Click a row to select it."
			>
				<Example className="block">
					<Card>
						<CardContent flush>
							<DataTable
								data={deployments}
								rowKey={(row) => row.id}
								onRowClick={(row) => setSelectedId(row.id)}
								isRowSelected={(row) => row.id === selectedId}
								columns={[
									{ key: "project", header: "Project" },
									{
										key: "status",
										header: "Status",
										cell: (row) => (
											<Badge appearance="plain" tone={statusTone(row.status)} dot>
												{STATUS_LABEL[row.status]}
											</Badge>
										),
									},
									{ key: "duration", header: "Duration", align: "end" },
								]}
							/>
						</CardContent>
						<CardFooter className="text-body-sm text-muted-foreground">
							Selected: <span className="text-mono-caption">{selectedId}</span>
						</CardFooter>
					</Card>
				</Example>
			</Section>

			<Section
				title="Empty"
				description="With no rows, an empty state spans the full width."
			>
				<Example className="block">
					<Card>
						<CardContent flush>
							<DataTable
								data={[] as typeof deployments}
								rowKey={(row) => row.id}
								empty={
									<EmptyState
										icon={<Icon name="info" />}
										title="No deployments"
										description="Push a commit to trigger your first deployment."
									/>
								}
								columns={[
									{ key: "project", header: "Project" },
									{ key: "status", header: "Status" },
									{ key: "duration", header: "Duration", align: "end" },
								]}
							/>
						</CardContent>
					</Card>
				</Example>
			</Section>

			<MetaFooter meta={dataTableMeta} />
		</>
	)
}

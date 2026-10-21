import {
	Badge,
	Button,
	Card,
	CardContent,
	CardFooter,
	DataTable,
	dataTableMeta,
	EmptyState,
	Icon,
	StatusDot,
	Toolbar,
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

/* Sample issues for the grouped example (invented). */
const ISSUE_STATUSES = [
	{ key: "in-progress", label: "In progress", tone: "warning" },
	{ key: "in-review", label: "In review", tone: "purple" },
	{ key: "todo", label: "Todo", tone: "neutral" },
	{ key: "done", label: "Done", tone: "success" },
] as const
type IssueStatus = (typeof ISSUE_STATUSES)[number]["key"]
type Issue = { id: string; title: string; status: IssueStatus; label: string; due: Date }
const seedIssues: Issue[] = [
	{ id: "WEB-104", title: "Refine product detail page", status: "in-progress", label: "Design", due: new Date("2026-10-23") },
	{ id: "WEB-118", title: "Implement responsive navigation", status: "in-progress", label: "Development", due: new Date("2026-10-23") },
	{ id: "WEB-106", title: "Review mobile navigation", status: "in-review", label: "Design", due: new Date("2026-10-22") },
	{ id: "WEB-121", title: "Approve ingredient taxonomy", status: "in-review", label: "Content", due: new Date("2026-10-22") },
	{ id: "WEB-107", title: "Define checkout transitions", status: "todo", label: "Motion", due: new Date("2026-10-27") },
	{ id: "WEB-108", title: "Prepare development handoff", status: "todo", label: "Delivery", due: new Date("2026-10-28") },
	{ id: "WEB-123", title: "Document component states", status: "todo", label: "Design", due: new Date("2026-10-27") },
	{ id: "WEB-101", title: "Finalize art direction", status: "done", label: "Design", due: new Date("2026-10-16") },
]
const formatDue = (date: Date) => date.toLocaleDateString(undefined, { month: "short", day: "numeric" })

function GroupedIssues() {
	const [issues, setIssues] = useState(seedIssues)
	const [selectedId, setSelectedId] = useState<string>("WEB-104")
	function add(status: IssueStatus) {
		const n = 124 + issues.length
		setIssues((all) => [...all, { id: `WEB-${n}`, title: "Untitled issue", status, label: "Design", due: new Date("2026-10-30") }])
		setSelectedId(`WEB-${n}`)
	}
	return (
		<DataTable
			data={issues}
			rowKey={(t) => t.id}
			groupBy={(t) => t.status}
			groups={ISSUE_STATUSES.map((s) => ({
				key: s.key,
				label: s.label,
				icon: <StatusDot tone={s.tone} />,
				defaultExpanded: s.key !== "done",
				action: (
					<Button variant="ghost" size="icon-xs" aria-label={`Add issue to ${s.label}`} onClick={() => add(s.key)}>
						<Icon name="plus" />
					</Button>
				),
			}))}
			onRowClick={(t) => setSelectedId(t.id)}
			isRowSelected={(t) => t.id === selectedId}
			columns={[
				{ key: "id", header: "ID", className: "w-24", cell: (t) => <span className="text-mono-caption text-muted-foreground">{t.id}</span> },
				{ key: "title", header: "Issue", sortable: true },
				{ key: "label", header: "Label", cell: (t) => <Badge appearance="outline" size="sm">{t.label}</Badge> },
				{ key: "due", header: "Due", sortable: true, sortValue: (t) => t.due.getTime(), cell: (t) => formatDue(t.due) },
			]}
		/>
	)
}

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
	const [checked, setChecked] = useState<Set<string | number>>(new Set())

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
				description="Click a row to select it, for example to open it in a detail pane."
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
				title="Checkbox selection"
				description="For bulk actions: a checkbox column, and a select-all box that acts on the rows shown and goes mixed when some are checked. Selection is yours to hold, by row key, so clear it when the rows shown change."
			>
				<Example className="block">
					<Card>
						{/* Mounted from the start, so a screen reader hears each change. */}
						<span role="status" className="sr-only">
							{checked.size ? `${checked.size} of ${deployments.length} selected` : ""}
						</span>
						{checked.size ? (
							<Toolbar aria-label="Bulk actions" className="px-(--card-p) pt-4">
								<span className="text-label-md">
									{checked.size} of {deployments.length} selected
								</span>
								<Button size="sm" variant="secondary" onClick={() => setChecked(new Set())}>
									Redeploy
								</Button>
							</Toolbar>
						) : null}
						<CardContent flush>
							<DataTable
								data={deployments}
								rowKey={(row) => row.id}
								selectedKeys={checked}
								onSelectedKeysChange={setChecked}
								rowSelectionLabel={(row) => `Select ${row.project}`}
								selectAllLabel={(count) => `Select all ${count} deployments shown`}
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
					</Card>
				</Example>
			</Section>

			<Section
				title="Grouped rows"
				description="groupBy and groups put the rows under header rows, by status here: one header for the whole table, so every group shares the columns. Each header row toggles its group and carries a count and an add action; sorting applies within each group, and Done starts closed."
			>
				<Example className="block">
					<Card>
						<CardContent flush>
							<GroupedIssues />
						</CardContent>
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

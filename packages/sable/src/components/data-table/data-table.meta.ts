import type { ComponentMeta } from "../../lib/meta"

export const dataTableMeta: ComponentMeta = {
	name: "DataTable",
	summary:
		"A data-driven table over the Table primitives — a columns def + data array with built-in client-side sorting (click a sortable header to cycle asc → desc → none), optional row click / selection, and an empty state. For server data or paging, sort/page the data and pair with Pagination.",
	keywords: [
		"data table",
		"table",
		"sortable",
		"columns",
		"rows",
		"empty state",
		"pagination",
		"list",
	],
	usage: {
		description:
			"Use DataTable when a data array and column definition should render a sortable, semantic table with optional row actions and an empty state. Use the lower-level Table parts for hand-authored markup or highly custom row layouts.",
		bestPractices: [
			{
				guidance: "do",
				description:
					"Put a table that fills a card in <CardContent flush>. The table runs edge to edge and its first and last columns inset to the card padding on their own; do not hand-set pl-6 / pr-6 on columns.",
			},
			{
				guidance: "do",
				description:
					"Provide stable rowKey values for dynamic data so selection and sorting do not jump.",
			},
			{
				guidance: "do",
				description:
					"Use sortable only on columns where ordering is obvious and useful.",
			},
			{
				guidance: "do",
				description:
					"Pair server-side datasets with Pagination and pass already-sorted/paged rows.",
			},
			{
				guidance: "dont",
				description:
					"Make every row clickable and also fill it with competing buttons. Choose a clear row interaction model.",
			},
			{
				guidance: "dont",
				description:
					"Use DataTable for heterogeneous cards or timeline content. A list or card layout will scan better.",
			},
		],
		anatomy: [
			{
				name: "Columns",
				required: true,
				description:
					"Definitions for headers, cell renderers, sorting, alignment, and classes.",
			},
			{
				name: "Rows",
				required: true,
				description:
					"The data array rendered through the column definitions.",
			},
			{
				name: "Empty state",
				required: false,
				description:
					"Content spanning all columns when the row array is empty.",
			},
			{
				name: "Caption",
				required: false,
				description:
					"Accessible table caption rendered by the underlying Table.",
			},
		],
	},
	related: {
		components: ["Table", "Pagination", "EmptyState", "Badge"],
		patterns: ["DashboardPage", "ListDetailPage"],
	},
	status: "stable",
	props: [
		{
			name: "columns",
			type: "DataTableColumn<Row>[]",
			description:
				"Column defs: { key, header, cell?, sortValue?, sortable?, align?, className? }. cell defaults to row[key]; sortValue defaults to row[key]. When cell renders a formatted string (e.g. a date), pass sortValue returning the underlying value (e.g. date.getTime()) so the column sorts by the real value, not the rendered text.",
		},
		{
			name: "data",
			type: "Row[]",
			description: "The rows to render.",
		},
		{
			name: "rowKey",
			type: "(row, index) => string | number",
			default: "index",
			description: "Stable React key per row.",
		},
		{
			name: "onRowClick",
			type: "(row) => void",
			description: "Row click handler — makes rows pointer-interactive.",
		},
		{
			name: "isRowSelected",
			type: "(row) => boolean",
			description:
				"Mark a row visually selected (data-selected). Derive it from a stable id (row.id === selectedId), not the row index, so selection survives re-sorts.",
		},
		{
			name: "defaultSort",
			type: '{ key: string; direction: "asc" | "desc" }',
			description: "Initial sort column + direction.",
		},
		{
			name: "empty",
			type: "ReactNode",
			default: '"No results."',
			description:
				"Rendered spanning all columns when data is empty. Pass an EmptyState for the full treatment (icon, title, next step).",
		},
		{
			name: "caption",
			type: "ReactNode",
			description: "Bottom table caption.",
		},
	],
	tokensUsed: ["muted-foreground", "foreground", "ring"],
	a11y: [
		"Sorted columns set aria-sort=ascending/descending on the header cell.",
		"Sortable headers are real <button>s with a focus-visible ring, keyboard-operable.",
		"Inherits the Table's scrollable frame and semantic <table>/<th>/<td> structure.",
	],
	examples: [
		{
			label: "Sortable columns",
			code: '<DataTable data={users} columns={[{ key: "name", header: "Name", sortable: true }, { key: "role", header: "Role" }, { key: "joined", header: "Joined", sortable: true, sortValue: (u) => u.joinedAt, cell: (u) => formatDate(u.joinedAt) }]} />',
		},
		{
			label: "Clickable rows",
			code: '<DataTable data={posts} columns={cols} onRowClick={(p) => navigate(`/post/${p.id}`)} rowKey={(p) => p.id} />',
		},
		{
			label: "Rich status column",
			code: '<DataTable data={deployments} rowKey={(row) => row.id} columns={[{ key: "name", header: "Name", sortable: true }, { key: "status", header: "Status", cell: (row) => <Badge appearance="plain" tone={row.status === "failed" ? "destructive" : row.status === "building" ? "warning" : "success"} dot>{row.statusLabel}</Badge> }, { key: "owner", header: "Owner", cell: (row) => <Entity className="[--entity-px:0] [--entity-py:0]" leading={<Avatar src={row.owner.avatar} alt={row.owner.name} fallback={row.owner.initials} size="sm" />} title={row.owner.name} /> }]} />',
		},
		{
			label: "In a card, edge to edge",
			code: '<Card><CardHeader><CardTitle>Deployments</CardTitle></CardHeader><CardContent flush><DataTable data={deployments} rowKey={(row) => row.id} columns={[{ key: "project", header: "Project", sortable: true }, { key: "duration", header: "Duration", align: "end" }]} /></CardContent></Card>',
		},
		{
			label: "Empty state",
			code: '<DataTable data={[]} columns={[{ key: "name", header: "Name" }, { key: "status", header: "Status" }]} empty={<EmptyState icon={<Icon name="search" />} title="No deployments" description="Try a different filter or create a deployment." action={<Button>Create deployment</Button>} />} />',
		},
	],
}

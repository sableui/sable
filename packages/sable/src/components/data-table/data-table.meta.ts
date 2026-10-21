import type { ComponentMeta } from "../../lib/meta"

export const dataTableMeta: ComponentMeta = {
	name: "DataTable",
	summary:
		"A data-driven table over the Table primitives — a columns def + data array with built-in client-side sorting (click a sortable header to cycle asc → desc → none), optional row click / selection, rows grouped under collapsible header rows (groupBy), and an empty state. For server data or paging, sort/page the data and pair with Pagination.",
	keywords: [
		"data table",
		"table",
		"sortable",
		"columns",
		"rows",
		"empty state",
		"pagination",
		"list",
		"grouped",
		"group by",
		"sections",
		"issue list",
		"issue tracker",
		"status groups",
		"collapsible groups",
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
				guidance: "do",
				description:
					"Group rows by status for an issue tracker (or by owner, by day) with groupBy + groups on ONE DataTable: every group shares the header and the column widths, each header row carries the group's count and an add action, and sorting applies within each group. Do not stack one DataTable per group inside Collapsibles; the header repeats and the columns stop lining up.",
			},
			{
				guidance: "do",
				description:
					"Move to TanStack Table, rendered with Sable's Table parts, once the table needs server-side sorting or filtering, column visibility or resizing, nested or aggregated grouping, or virtualised rows. DataTable stays dependency-free and does not grow into a data grid; `sable docs tables-with-tanstack` maps one onto the other.",
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
				name: "Group header row",
				required: false,
				description:
					"With groupBy: one row per group heading its own tbody (a th with scope=rowgroup across every column) holding the disclosure toggle, the group's icon, label and count, and an optional trailing action.",
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
				"Mark a row visually selected (data-selected), e.g. the one open in a detail pane. Derive it from a stable id (row.id === selectedId), not the row index, so selection survives re-sorts. For checking several rows, use selectedKeys.",
		},
		{
			name: "selectedKeys",
			type: "ReadonlySet<string | number>",
			description:
				"The checked rows, by rowKey, for bulk actions. With onSelectedKeysChange it adds a checkbox column (each box named by rowSelectionLabel) and a select-all box in the header that acts on the rows shown and goes mixed when some are checked. Checked rows get the selected fill. Controlled: when the rows shown change (a filter, another view), set the keys to keep, usually none. Needs rowKey.",
		},
		{
			name: "onSelectedKeysChange",
			type: "(keys: Set<string | number>) => void",
			description: "Called with the new set of checked keys. Its presence turns selection on. A click on a box never fires onRowClick.",
		},
		{
			name: "rowSelectionLabel",
			type: "(row) => string",
			default: '() => "Select row"',
			description: "A row checkbox's accessible name. Name the row, e.g. (t) => `Select ${t.subject}`, so a screen reader can tell the boxes apart.",
		},
		{
			name: "selectAllLabel",
			type: "(count: number) => string",
			default: '(count) => `Select all ${count} shown`',
			description: "The select-all checkbox's accessible name; say what it acts on (\"Select all 7 tickets shown\").",
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
		{
			name: "groupBy",
			type: "(row) => string",
			description:
				"Group the rows under header rows by the key this returns (a status, an owner, a day). One header serves every group, so the columns line up across them; sorting applies within each group.",
		},
		{
			name: "groups",
			type: "{ key: string; label?: ReactNode; icon?: ReactNode; action?: ReactNode; defaultExpanded?: boolean }[]",
			description:
				"Order and presentation of the groups, by key: the header row's label (defaults to the key), a leading icon such as a status mark, a trailing action such as an icon Button that adds a row to the group, and whether it starts open (default true). Groups groupBy returns that are not listed follow, in the order their first row appears in data. A listed group with no rows is not shown.",
		},
		{
			name: "collapsible",
			type: "boolean",
			default: "true",
			description:
				"Whether each group's header row is a toggle that opens and closes the group. A closed group keeps its header row and count; its rows are hidden and select-all skips them.",
		},
		{
			name: "expandedGroups",
			type: "ReadonlySet<string>",
			description:
				"The open groups, by key (controlled). Without it each group starts at its defaultExpanded and the table holds the state.",
		},
		{
			name: "onExpandedGroupsChange",
			type: "(keys: Set<string>) => void",
			description: "Called with the new set of open group keys when a group header is toggled.",
		},
	],
	tokensUsed: ["muted-foreground", "foreground", "ring"],
	motion: [
		{
			slot: "arrival",
			recipe: "none",
			part: "Root",
			why: "Rows render with the page or the query that produced them. Staggering rows in delays reading a table someone opened to scan.",
		},
		{
			slot: "response",
			recipe: "motion-interactive",
			part: "Row",
			why: "Body rows ease to a muted wash under the pointer (TableRow's recipe), which keeps the eye on the right line across a wide row of numbers. Sortable headers are ghost Buttons and answer on Button's recipe.",
		},
		{
			slot: "transition",
			recipe: "motion-interactive",
			part: "Sort chevron",
			why: "One chevron turns to show direction instead of two glyphs swapping, so ascending to descending reads as the same column reversing. Its opacity rises from the resting 60% as the column becomes the sort.",
		},
		{
			slot: "transition",
			recipe: "motion-interactive",
			part: "Row",
			why: "A checked row's fill eases in across its cells, so selecting by checkbox reads as the row being picked rather than a band stamped over it.",
		},
		{
			slot: "transition",
			recipe: "motion-interactive",
			part: "Group chevron",
			why: "A group's chevron turns from pointing along the reading direction (closed) to down (open), so the group reads as folding rather than a glyph being swapped.",
		},
		{
			slot: "arrival",
			recipe: "none",
			part: "Group rows",
			why: "Opening a group shows its rows at once: table rows cannot animate their height without leaving the table layout, and the rows are the content the reader asked for.",
		},
		{
			slot: "activity",
			recipe: "none",
			part: "Root",
			why: "DataTable has no loading state. While data is fetched, render Skeleton rows (motion-shimmer) in its place — only the caller knows a fetch is in flight.",
		},
	],
	a11y: [
		"Sorted columns set aria-sort=ascending/descending on the header cell.",
		"Sortable headers are real <button>s with a focus-visible ring, keyboard-operable.",
		"Inherits the Table's scrollable frame and semantic <table>/<th>/<td> structure.",
		"Grouped, each group is its own <tbody> (a rowgroup) headed by a <th scope=\"rowgroup\"> spanning the columns, so group headers are never read as data rows; the toggle is a real button with aria-expanded and aria-controls naming that tbody.",
	],
	examples: [
		{
			label: "Checkbox selection with a bulk-action bar",
			code: "const [selected, setSelected] = useState<Set<string | number>>(new Set())\n\n<Stack gap={2}>\n\t{/* Mounted from the start, so a screen reader hears each change. */}\n\t<span role=\"status\" className=\"sr-only\">{selected.size ? `${selected.size} of ${tickets.length} selected` : \"\"}</span>\n\t{selected.size ? (\n\t\t<Toolbar aria-label=\"Bulk actions\">\n\t\t\t<span className=\"text-label-md\">{selected.size} of {tickets.length} selected</span>\n\t\t\t<Button size=\"sm\" variant=\"secondary\" onClick={() => resolve(selected)}>Resolve</Button>\n\t\t</Toolbar>\n\t) : null}\n\t<DataTable\n\t\tdata={tickets}\n\t\trowKey={(t) => t.id}\n\t\tcolumns={columns}\n\t\tselectedKeys={selected}\n\t\tonSelectedKeysChange={setSelected}\n\t\trowSelectionLabel={(t) => `Select ${t.subject}`}\n\t\tselectAllLabel={(n) => `Select all ${n} tickets shown`}\n\t/>\n</Stack>",
		},
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
			label: "Issues grouped by status",
			code: 'const STATUSES = [\n\t{ key: "in-progress", label: "In progress", icon: <StatusDot tone="warning" /> },\n\t{ key: "in-review", label: "In review", icon: <StatusDot tone="purple" /> },\n\t{ key: "todo", label: "Todo", icon: <StatusDot /> },\n\t{ key: "done", label: "Done", icon: <StatusDot tone="success" />, defaultExpanded: false },\n]\n\n<DataTable\n\tdata={issues}\n\trowKey={(t) => t.id}\n\tgroupBy={(t) => t.status}\n\tgroups={STATUSES.map((s) => ({ ...s, action: <Button variant="ghost" size="icon-xs" aria-label={`Add issue to ${s.label}`} onClick={() => create(s.key)}><Icon name="plus" /></Button> }))}\n\tonRowClick={(t) => setSelectedId(t.id)}\n\tisRowSelected={(t) => t.id === selectedId}\n\tcolumns={[\n\t\t{ key: "id", header: "ID", className: "w-20", cell: (t) => <span className="text-mono-caption text-muted-foreground">{t.id}</span> },\n\t\t{ key: "title", header: "Issue", sortable: true },\n\t\t{ key: "due", header: "Due", sortable: true, sortValue: (t) => t.due.getTime(), cell: (t) => formatDate(t.due) },\n\t]}\n/>',
		},
		{
			label: "Empty state",
			code: '<DataTable data={[]} columns={[{ key: "name", header: "Name" }, { key: "status", header: "Status" }]} empty={<EmptyState icon={<Icon name="search" />} title="No deployments" description="Try a different filter or create a deployment." action={<Button>Create deployment</Button>} />} />',
		},
	],
}

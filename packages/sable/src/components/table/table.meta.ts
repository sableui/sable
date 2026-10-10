import type { ComponentMeta } from "../../lib/meta"

export const tableMeta: ComponentMeta = {
	name: "Table",
	summary:
		"Styled native table subcomponents (Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption). Horizontally scrollable frame, hairline row borders, hover-lift, and selectable rows via data-selected.",
	keywords: [
		"table",
		"data table",
		"rows",
		"columns",
		"grid",
		"caption",
		"header",
		"cell",
		"tabular",
	],
	usage: {
		description:
			"Use Table for structured data with consistent columns and rows. Use DataTable when the table should be data-driven with sorting or empty state behavior, and use lists or cards when each item has a different shape.",
		bestPractices: [
			{
				guidance: "do",
				description:
					"Use TableCaption and TableHead so the table has a clear purpose and column semantics.",
			},
			{
				guidance: "do",
				description:
					"Keep cells concise and scannable; compose Badge, StatusDot, Avatar, or Button only when they clarify the row.",
			},
			{
				guidance: "do",
				description:
					"Use the built-in horizontal frame for overflow instead of squeezing columns until content becomes unreadable.",
			},
			{
				guidance: "do",
				description:
					"Put a table in a card with `<CardContent flush>`. The first and last columns then take the card's own padding (`--table-edge-px`), so they line up with the CardHeader at any density. Never hand-set `pl-6`/`pr-6` on edge cells.",
			},
			{
				guidance: "dont",
				description:
					"Use Table for heterogeneous items with no stable columns. Use Card, Entity, or a list composition instead.",
			},
			{
				guidance: "dont",
				description:
					"Put every possible action in every row. Use one primary row action, a DotsMenu, or row detail navigation.",
			},
		],
		anatomy: [
			{
				name: "Caption",
				required: false,
				description:
					"Accessible summary of what the table contains.",
			},
			{
				name: "Header",
				required: true,
				description:
					"Column labels rendered with TableHead cells.",
			},
			{
				name: "Body",
				required: true,
				description:
					"Rows and cells containing the tabular data.",
			},
			{
				name: "Footer",
				required: false,
				description:
					"Optional totals or summary row group.",
			},
		],
	},
	related: {
		components: ["DataTable", "Pagination", "Badge", "StatusDot", "Avatar"],
		patterns: ["DashboardPage", "ListDetailPage"],
	},
	status: "stable",
	props: [
		{
			name: "className",
			type: "string",
			description:
				"The root renders a horizontally scrollable frame around a native <table>; forwards all native table attributes plus className. Each subcomponent likewise forwards its element's native attributes + className.",
		},
	],
	subcomponents: [
		{
			name: "TableHeader",
			type: 'ComponentPropsWithRef<"thead">',
			description: "The header row group (thead).",
		},
		{
			name: "TableBody",
			type: 'ComponentPropsWithRef<"tbody">',
			description: "The data row group (tbody).",
		},
		{
			name: "TableFooter",
			type: 'ComponentPropsWithRef<"tfoot">',
			description: "Summary row group (tfoot) with a muted fill.",
		},
		{
			name: "TableRow",
			type: 'ComponentPropsWithRef<"tr">',
			description:
				"A row (tr) — hairline bottom border, hover lift, and a selected state via the data-selected attribute.",
		},
		{
			name: "TableHead",
			type: 'ComponentPropsWithRef<"th">',
			description: "A column header cell (th) in muted label styling.",
		},
		{
			name: "TableCell",
			type: 'ComponentPropsWithRef<"td">',
			description: "A data cell (td).",
		},
		{
			name: "TableCaption",
			type: 'ComponentPropsWithRef<"caption">',
			description: "Accessible description of the table (caption), muted.",
		},
	],
	tokensUsed: ["border", "muted", "muted-foreground"],
	a11y: [
		"Renders semantic native table elements (thead/tbody/tfoot/th/td/caption) preserving built-in table semantics.",
		"Use TableHead (th) for column headers and TableCaption for an accessible description.",
		"Mark the active row with the data-selected attribute for a visible selected state.",
	],
	examples: [
		{
			label: "Collectors",
			code: '<Table>\n\t<TableCaption>Recent collectors</TableCaption>\n\t<TableHeader>\n\t\t<TableRow>\n\t\t\t<TableHead>Collector</TableHead>\n\t\t\t<TableHead>Edition</TableHead>\n\t\t\t<TableHead>Paid</TableHead>\n\t\t</TableRow>\n\t</TableHeader>\n\t<TableBody>\n\t\t<TableRow>\n\t\t\t<TableCell>@nova</TableCell>\n\t\t\t<TableCell>#012</TableCell>\n\t\t\t<TableCell>0.5 SOL</TableCell>\n\t\t</TableRow>\n\t</TableBody>\n</Table>',
		},
		{
			label: "Rich status cells",
			code: '<Table><TableCaption>Deployments</TableCaption><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Status</TableHead><TableHead>Owner</TableHead><TableHead className="text-end">Actions</TableHead></TableRow></TableHeader><TableBody><TableRow data-selected><TableCell>Catalog API</TableCell><TableCell><Badge appearance="plain" tone="warning" dot pulse>Building</Badge></TableCell><TableCell><Row gap={1}><Avatar fallback="NR" alt="Nova Reed" size="sm" /><span>Nova</span></Row></TableCell><TableCell className="text-end"><Button size="sm" variant="ghost">View</Button></TableCell></TableRow></TableBody></Table>',
		},
		{
			label: "Flush in a card",
			code: '<Card><CardHeader><CardTitle>Collectors</CardTitle></CardHeader><CardContent flush><Table><TableHeader><TableRow><TableHead>Collector</TableHead><TableHead>Paid</TableHead></TableRow></TableHeader><TableBody><TableRow><TableCell>@nova</TableCell><TableCell>0.5 SOL</TableCell></TableRow></TableBody></Table></CardContent></Card>',
		},
		{
			label: "Summary footer",
			code: '<Table><TableHeader><TableRow><TableHead>Item</TableHead><TableHead className="text-end">Amount</TableHead></TableRow></TableHeader><TableBody><TableRow><TableCell>Primary sale</TableCell><TableCell className="text-end">42 SOL</TableCell></TableRow></TableBody><TableFooter><TableRow><TableCell>Total</TableCell><TableCell className="text-end">42 SOL</TableCell></TableRow></TableFooter></Table>',
		},
	],
}

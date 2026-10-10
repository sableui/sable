import type { ComponentMeta } from "../../lib/meta"

export const paginationMeta: ComponentMeta = {
	name: "Pagination",
	summary:
		"Page navigation built from our own Button + Icon (no Base UI). A <nav aria-label='Pagination'> with prev/next icon buttons that disable at the bounds and numbered page buttons; the current page is a secondary button marked aria-current. Collapses to first/last/current plus a sibling window, bridging skipped runs with an ellipsis.",
	keywords: [
		"pagination",
		"pager",
		"pages",
		"table",
		"results",
		"navigation",
		"next",
		"previous",
	],
	usage: {
		description:
			"Use Pagination when a result set is split into discrete pages and the user needs predictable movement through them. Pair it with DataTable, list results, or server-paged views; use a load-more Button or infinite scroll when page numbers are not meaningful.",
		bestPractices: [
			{
				guidance: "do",
				description:
					"Keep page state controlled by the parent route or data layer so URL, filters, and result fetches stay in sync.",
			},
			{
				guidance: "do",
				description:
					"Use a specific label when multiple pagers appear on a page, such as \"Collector pages\".",
			},
			{
				guidance: "do",
				description:
					"Reset to page 1 when filters or search terms materially change the result set.",
			},
			{
				guidance: "dont",
				description:
					"Use Pagination for tiny lists where all items fit comfortably on one page.",
			},
			{
				guidance: "dont",
				description:
					"Hide disabled previous/next buttons at the bounds; disabled controls make the current position clearer.",
			},
		],
		anatomy: [
			{
				name: "Nav",
				required: true,
				description:
					"The labelled pagination landmark.",
			},
			{
				name: "Previous/next",
				required: true,
				description:
					"Icon buttons for adjacent page movement, disabled at the bounds.",
			},
			{
				name: "Page buttons",
				required: true,
				description:
					"Numbered buttons with aria-current on the active page.",
			},
			{
				name: "Ellipsis",
				required: false,
				description:
					"Non-interactive marker for skipped page ranges.",
			},
		],
	},
	related: {
		components: ["DataTable", "Table", "Button"],
		patterns: ["ListDetailPage", "DashboardPage"],
	},
	status: "stable",
	props: [
		{
			name: "page",
			type: "number",
			default: "—",
			description: "The active page (1-based). Clamped into the valid range.",
		},
		{
			name: "total",
			type: "number",
			default: "—",
			description: "Total number of pages.",
		},
		{
			name: "onPageChange",
			type: "(page: number) => void",
			default: "—",
			description:
				"Called with the next page when a control is activated. No-op for out-of-range or unchanged values.",
		},
		{
			name: "siblingCount",
			type: "number",
			default: "1",
			description:
				"Page buttons shown on each side of the current page before the list collapses into ellipses. First and last pages are always shown.",
		},
		{
			name: "label",
			type: "string",
			default: "Pagination",
			description: "Accessible label applied to the surrounding nav element.",
		},
		{
			name: "className",
			type: "string",
			default: "—",
			description: "Extra classes merged onto the nav.",
		},
	],
	tokensUsed: [
		"secondary",
		"secondary-foreground",
		"accent",
		"accent-foreground",
		"foreground",
		"muted-foreground",
		"ring",
	],
	a11y: [
		"Renders a landmark <nav> with aria-label so assistive tech can jump to the pager.",
		"The current page button carries aria-current='page'.",
		"Prev/next buttons are real <button>s with aria-label and become disabled at the bounds.",
		"Ellipsis slots are aria-hidden — they convey no navigable target.",
	],
	examples: [
		{
			label: "Controlled",
			code: "const [page, setPage] = useState(1)\n<Pagination page={page} total={10} onPageChange={setPage} />",
		},
		{
			label: "Many pages (ellipsis)",
			code: "const [page, setPage] = useState(8)\n<Pagination page={page} total={20} onPageChange={setPage} />",
		},
		{
			label: "Table results footer",
			code: '<Stack gap={2}><DataTable data={rows} columns={columns} rowKey={(row) => row.id} /><Pagination label="Collector pages" page={page} total={12} onPageChange={setPage} /></Stack>',
		},
		{
			label: "Server query state",
			code: 'const [page, setPage] = useState(searchParams.page ?? 1)\n<Pagination page={page} total={pageCount} onPageChange={(next) => { setPage(next); loadPage(next) }} />',
		},
	],
}

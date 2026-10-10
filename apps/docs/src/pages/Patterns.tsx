import patterns from "../generated/catalog-patterns.json"
import { PageHeader } from "../components/docs-ui"
import { PreviewCard } from "../components/PreviewCard"

interface PatternItem {
	name: string
	path: string
	summary: string
}

const items = patterns as PatternItem[]

/** patterns/dashboard-page.tsx → dashboard-page */
function slugOf(item: PatternItem): string {
	return item.path.replace(/^patterns\//, "").replace(/\.tsx$/, "")
}

/** DashboardPage → "Dashboard", ListDetailPage → "List detail", ChatPanel → "Chat panel" */
function titleOf(item: PatternItem): string {
	const words = item.name
		.replace(/Page$/, "")
		.split(/(?=[A-Z])/)
		.map((w) => w.toLowerCase())
	const title = words.join(" ")
	return title.charAt(0).toUpperCase() + title.slice(1)
}

/** The summary's opening clause: "Centered auth card: a form-width…" → "Centered auth card" */
function captionOf(item: PatternItem): string {
	const clause = item.summary.split(/: | — /)[0].replace(/\.$/, "")
	return clause.charAt(0).toUpperCase() + clause.slice(1)
}

export function PatternsPage() {
	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="Page shells"
				lede="Ready-made layouts for common pages. Open one to see it full size."
			/>

			<div className="grid gap-x-6 gap-y-10 sm:grid-cols-2">
				{items.map((item) => (
					<PreviewCard
						key={item.name}
						href={`/preview/${slugOf(item)}`}
						title={titleOf(item)}
						caption={captionOf(item)}
					/>
				))}
			</div>
		</>
	)
}

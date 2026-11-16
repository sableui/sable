import { type ComponentType, Suspense } from "react"
import patterns from "../generated/catalog-patterns.json"
import { PreviewSkeleton } from "../components/RouteSkeleton"
import { lazyRoute } from "../lib/lazy-route"
import { holdSampleLinks } from "./previews/inert-links"

interface PatternItem {
	name: string
	path: string
}

/** One chunk for every pattern: the module is shared, so it loads once. */
const loadPatterns = () => import("@sableui/react/patterns") as unknown as Promise<Record<string, ComponentType>>

/**
 * Bare full-page pattern renderer — no DocsShell. Served at `/preview/<slug>`
 * and embedded by the Patterns page in an iframe so shell patterns (AppShell,
 * skip links, #main-content) never nest inside the docs' own shell.
 *
 * The map is built from the catalog the Patterns page lists, so a new pattern
 * opens here the moment it is exported and the registry is regenerated. A
 * hand-kept list let a card open "Unknown pattern" until someone remembered it.
 */
const previews: Record<string, ComponentType> = {
	...Object.fromEntries(
		(patterns as PatternItem[]).map((item) => [
			// patterns/dashboard-page.tsx → dashboard-page, the slug Patterns.tsx links to
			item.path.replace(/^patterns\//, "").replace(/\.tsx$/, ""),
			lazyRoute(() => loadPatterns().then((m) => ({ default: m[item.name] }))),
		]),
	),
	// Not a pattern: AppShell's inset frame at full size, for the App Shell page.
	"app-shell-inset": lazyRoute(() =>
		import("./previews/InsetFramePreview").then((m) => ({ default: m.InsetFramePreview })),
	),
}

export function PatternPreview({ slug }: { slug: string }) {
	const Preview = previews[slug]
	if (!Preview) {
		return (
			<div className="flex min-h-dvh items-center justify-center text-body-md text-muted-foreground">
				Unknown pattern: {slug}
			</div>
		)
	}
	return (
		<Suspense fallback={<PreviewSkeleton />}>
			{/* A shell's sample links (/pricing, /settings) are routes in the app
			    that copies it; here they would open the docs' 404. */}
			<div className="contents" onClickCapture={holdSampleLinks}>
				<Preview />
			</div>
		</Suspense>
	)
}

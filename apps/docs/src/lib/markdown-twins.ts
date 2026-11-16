import twins from "../markdown-twins.json"
import { CATALOG_BY_SLUG } from "./catalog"

const PAGES: Record<string, string> = twins

/**
 * The agent-readable twin of a docs route: the file scripts/prerender-routes.mjs
 * publishes at /<route>.md, by the same table. Null when the route has none of
 * its own — its twin is the /llms.txt index, or it has none at all.
 */
export function markdownTwinFor(route: string): string | null {
	const twin = PAGES[route] ?? (CATALOG_BY_SLUG[route] ? `/llms/components/${route}.md` : null)
	return twin && twin !== "/llms.txt" ? twin : null
}

/** Twin file → the route that renders it, the inverse of the table above. */
const ROUTE_BY_TWIN: Record<string, string> = Object.fromEntries(
	Object.entries(PAGES)
		.filter(([route, twin]) => !route.startsWith("$") && twin !== "/llms.txt")
		.map(([route, twin]) => [twin, route]),
)

/**
 * The docs route that shows a published markdown file, so a guide's link to
 * `./nextjs.md` or `../components/button.md` opens the page rather than the raw
 * file. Null when no page renders it; the file itself is then the target.
 */
export function routeForDoc(path: string): string | null {
	if (ROUTE_BY_TWIN[path]) return ROUTE_BY_TWIN[path]
	const component = /^\/llms\/components\/([a-z0-9-]+)\.md$/.exec(path)?.[1]
	return component && CATALOG_BY_SLUG[component] ? component : null
}

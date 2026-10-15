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

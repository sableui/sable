import { type ComponentType, lazy } from "react"

/*
 * Routes are code-split, and every deploy renames their chunks and removes
 * the old ones. A tab opened before a deploy still asks for the old names, so
 * its next lazy page fails to load ("Failed to fetch dynamically imported
 * module") — and without a catch, React unmounts the whole app: a blank page
 * that a refresh fixes.
 *
 * So a failed route load does the refresh itself: the URL already names the
 * page being opened, so a reload lands there on the new deploy. Once per ten
 * seconds per tab, so a chunk that is really broken (or a network that is
 * really down) falls through to RouteErrorBoundary instead of looping.
 */

const KEY = "sable-docs-route-reload"
const WINDOW_MS = 10_000

function reloadOnce(error: unknown): Promise<never> {
	try {
		const last = Number(sessionStorage.getItem(KEY))
		if (!(Date.now() - last < WINDOW_MS)) {
			sessionStorage.setItem(KEY, String(Date.now()))
			window.location.reload()
			// Stay suspended (the route's fallback shows) until the reload lands.
			return new Promise<never>(() => {})
		}
	} catch {
		/* storage disabled: no loop guard, so let the error boundary offer the reload */
	}
	throw error
}

/** React.lazy for a route, reloading onto the current deploy when its chunk is gone. */
export function lazyRoute<T extends ComponentType<any>>(loader: () => Promise<{ default: T }>) {
	return lazy(() => loader().catch(reloadOnce))
}

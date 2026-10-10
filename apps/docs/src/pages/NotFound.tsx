import { Button } from "@sableui/react"
import { PageHeader } from "../components/docs-ui"
import { hrefFor } from "../lib/router"

/**
 * Unknown URLs. In production the host answers them with HTTP 404 and
 * `404.html` (written by scripts/prerender-routes.mjs); the app boots on that
 * document and renders this instead of quietly sending the reader home.
 */
export function NotFoundPage() {
	return (
		<>
			<PageHeader
				title="Page not found"
				lede="There's no page at this address. It may have moved, or the link may be mistyped."
			/>
			<div className="flex flex-wrap gap-3">
				<Button render={<a href={hrefFor("introduction")} />}>Go to the home page</Button>
				<Button variant="secondary" render={<a href={hrefFor("getting-started")} />}>Get started</Button>
			</div>
		</>
	)
}

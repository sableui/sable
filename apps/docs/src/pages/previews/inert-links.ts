import type { MouseEvent } from "react"

/**
 * Blocks and page shells ship with sample links (`/docs/getting-started`,
 * `/pricing`, `/settings`): routes in the app that copies them, written as
 * paths so the copied source reads like real code. On sableui.com those paths
 * are not pages, and following one landed on the docs' own 404.
 *
 * Wrapped around a preview as `onClickCapture`, this keeps a sample link from
 * navigating: an app-relative path (`/…`), or a URL on the reserved `.example`
 * domain the samples use for outside sites (`https://help.atlas.example/…`),
 * does nothing when clicked. In-page anchors (`#platform`) still scroll, and
 * real absolute URLs still open. The source a reader copies is unchanged.
 */
const SAMPLE_SITE = /^https?:\/\/([^/]+\.)?example(?:[/:?#]|$)/i
export function holdSampleLinks(event: MouseEvent<HTMLElement>) {
	const link = (event.target as Element | null)?.closest?.("a[href]")
	if (!link || !event.currentTarget.contains(link)) return
	const href = link.getAttribute("href") ?? ""
	if ((href.startsWith("/") && !href.startsWith("//")) || SAMPLE_SITE.test(href)) event.preventDefault()
}

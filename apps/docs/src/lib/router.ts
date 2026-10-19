import { createContext, useEffect, useState } from "react"

/**
 * Path router — `/typography`, `/button`, `/guide/conventions`.
 *
 * The site used `#/slug` for a long time. Hash routes are invisible to a
 * crawler or an agent fetching a page — every URL was the same document — so
 * a docs site built for agents could not be read by one. Real paths fix that,
 * and old `#/` links are rewritten on load so nothing already shared breaks.
 *
 * A query string belongs to the page it is on (a share link's look is read
 * once and saved, see CustomizerProvider), so navigation does not carry it.
 * A redirect keeps it: a retired URL may still be a share link.
 */

const EVENT = "sable-docs-navigate"

/**
 * The route the docs shell is rendering, for a page's own parts (its header's
 * Copy Markdown action) to read. Provided by DocsShell rather than read with
 * `useRoute`, which also installs the document's link-click handler.
 */
export const CurrentRouteContext = createContext<string | null>(null)

/**
 * Where the current page sits in the nav: its area and the group listing it.
 * A reader arriving on a direct link has no rail open to tell them, so the page
 * header shows this as a breadcrumb. Null for an area's own home page.
 */
export interface PageTrail {
	area: { label: string; href: string }
	group: string
}
export const PageTrailContext = createContext<PageTrail | null>(null)

function slugFromLocation(): string {
	if (typeof window === "undefined") return "introduction"
	const path = window.location.pathname.replace(/^\/+|\/+$/g, "")
	return path || "introduction"
}

/** Rewrite a legacy `#/slug` URL to `/slug` before the first render. */
function upgradeLegacyHash() {
	if (typeof window === "undefined") return
	const { hash, search } = window.location
	if (!hash.startsWith("#/")) return
	const slug = hash.slice(2)
	window.history.replaceState(window.history.state, "", `/${slug}${search}`)
}

export function useRoute(): string {
	const [slug, setSlug] = useState(() => {
		upgradeLegacyHash()
		return slugFromLocation()
	})
	useEffect(() => {
		const onChange = () => setSlug(slugFromLocation())
		window.addEventListener("popstate", onChange)
		window.addEventListener(EVENT, onChange)
		return () => {
			window.removeEventListener("popstate", onChange)
			window.removeEventListener(EVENT, onChange)
		}
	}, [])

	// Same-origin <a href="/slug"> links route without a reload. Modified
	// clicks, new-tab targets, downloads and other origins behave natively.
	useEffect(() => {
		function onClick(event: MouseEvent) {
			if (event.defaultPrevented || event.button !== 0) return
			if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
			const anchor = (event.target as Element | null)?.closest?.("a")
			if (!anchor || anchor.target || anchor.hasAttribute("download")) return
			const href = anchor.getAttribute("href")
			if (!href || !href.startsWith("/") || href.startsWith("//")) return
			if (/\.(md|txt|json|png|svg|jpe?g|webp|mp4)$/i.test(href.split("?")[0])) return
			event.preventDefault()
			navigate(href.slice(1))
		}
		document.addEventListener("click", onClick)
		return () => document.removeEventListener("click", onClick)
	}, [])
	return slug
}

/** @deprecated Kept as an alias while call sites migrate; use `useRoute`. */
export const useHashRoute = useRoute

/** The href for a slug — use for `<a href>` so links work with or without JS. */
export function hrefFor(slug: string): string {
	return `/${slug}`
}

/** Like navigate, but replaces the history entry — for retired URLs. */
export function redirect(slug: string): void {
	window.history.replaceState(null, "", `/${slug.replace(/^\/+/, "")}${window.location.search}`)
	window.dispatchEvent(new Event(EVENT))
}

export function navigate(slug: string): void {
	const target = `/${slug.replace(/^\/+/, "")}`
	if (target !== window.location.pathname) {
		window.history.pushState(null, "", target)
		window.dispatchEvent(new Event(EVENT))
	}
	const main = document.getElementById("docs-main")
	main?.scrollTo({ top: 0 })
	window.scrollTo({ top: 0 })
}

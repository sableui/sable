"use client";

import { useEffect, useState } from "react"

/**
 * useMatchHighlight — paint every occurrence of a query inside a region, without
 * touching the region's DOM.
 *
 *   const results = useMatchHighlight<HTMLUListElement>(query)
 *   <SearchInput value={query} onValueChange={setQuery} />
 *   <ul ref={results}>{rows}</ul>
 *
 * The obvious way to mark a match is to split the label around it and wrap the
 * hit in a `<mark>`. That means every row renders its label as three nodes, the
 * component owning the row has to know the query, and the text a screen reader
 * walks is cut into fragments. The CSS Custom Highlight API marks a Range
 * instead: the text nodes stay exactly as React rendered them, and the paint is
 * `::highlight(sable-match)` in styles.css, on the `highlight` token pair —
 * whose stated intent is search hits.
 *
 * Returns a callback ref rather than taking a ref object, because the regions
 * this is for (a popup list, a results panel) usually mount after the component
 * holding the query does, and an effect keyed on the query never sees a ref
 * object fill in.
 *
 * Matching is case-insensitive and literal, within one text node: a match split
 * across elements (`<b>Re</b>port`) is not painted. That is the same text the
 * built-in filters compare, so whatever survives a substring filter is lit.
 * `selector` narrows the search to parts of the region — a row's label and not
 * its shortcut hint.
 *
 * Purely visual, and that is fine here: the query is already in the field, and
 * the row's accessible name is unchanged. Where the API is missing it does
 * nothing at all.
 */
export function useMatchHighlight<T extends Element = HTMLElement>(
	query: string,
	options: UseMatchHighlightOptions = {},
): (element: T | null) => void {
	const { selector, enabled = true } = options
	const [element, setElement] = useState<T | null>(null)

	useEffect(() => {
		const highlight = enabled && element ? sharedHighlight() : null
		if (!highlight || !element) return

		let ranges: Range[] = []
		const paint = () => {
			for (const range of ranges) highlight.delete(range)
			ranges = matchRanges(element, query, selector)
			for (const range of ranges) highlight.add(range)
		}
		paint()

		// Filtering re-renders the rows under the same query (results arriving, a
		// virtual list scrolling), and a Range on a removed text node paints
		// nothing. Batched to a frame: one keystroke is many mutations.
		let frame = 0
		const observer = new MutationObserver(() => {
			if (frame) return
			frame = requestAnimationFrame(() => {
				frame = 0
				paint()
			})
		})
		observer.observe(element, { subtree: true, childList: true, characterData: true })

		return () => {
			observer.disconnect()
			cancelAnimationFrame(frame)
			for (const range of ranges) highlight.delete(range)
		}
	}, [element, query, selector, enabled])

	return setElement
}

export interface UseMatchHighlightOptions {
	/** Only search inside elements matching this, within the region. */
	selector?: string
	/** Turn the paint off without unmounting anything. @default true */
	enabled?: boolean
}

/** The name `::highlight()` styles. One for every instance on the page. */
export const MATCH_HIGHLIGHT = "sable-match"

let shared: Highlight | null = null

/**
 * One Highlight for the whole document, which every instance adds its own
 * ranges to and removes them from. Registered lazily, and re-registered if
 * something cleared the registry under it.
 */
function sharedHighlight(): Highlight | null {
	if (typeof CSS === "undefined" || !("highlights" in CSS) || typeof Highlight === "undefined") {
		return null
	}
	shared ??= new Highlight()
	if (CSS.highlights.get(MATCH_HIGHLIGHT) !== shared) CSS.highlights.set(MATCH_HIGHLIGHT, shared)
	return shared
}

/** Every literal, case-insensitive occurrence of `query` in `root`'s text. */
export function matchRanges(root: Element, query: string, selector?: string): Range[] {
	const needle = query.trim().toLocaleLowerCase()
	if (!needle) return []
	const scopes = selector ? Array.from(root.querySelectorAll(selector)) : [root]
	const ranges: Range[] = []
	for (const scope of scopes) {
		const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT)
		for (let node = walker.nextNode() as Text | null; node; node = walker.nextNode() as Text | null) {
			const haystack = node.data.toLocaleLowerCase()
			// A few characters change length when lowercased (İ → i̇), which would
			// shift every offset after them. Rare enough to skip the node rather
			// than paint the wrong letters.
			if (haystack.length !== node.data.length) continue
			for (let at = haystack.indexOf(needle); at !== -1; at = haystack.indexOf(needle, at + needle.length)) {
				const range = document.createRange()
				range.setStart(node, at)
				range.setEnd(node, at + needle.length)
				ranges.push(range)
			}
		}
	}
	return ranges
}

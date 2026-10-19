import type { CommandItem } from "@sableui/react"

/**
 * Ranked search for the docs palette.
 *
 * The built-in filter is a substring match on the visible label, which is the
 * right default and the wrong one here: a component catalog is a thing you
 * search by what you want, not by what it is called. "dropdown" should find
 * Select, "modal" should find Dialog, "loading" should find Spinner and
 * Skeleton. Those words all exist — in each component's `keywords` — and
 * a label match cannot see any of them.
 *
 * So we match over a wider haystack (label, summary, group, keywords, related)
 * and rank the result, because widening a match without ranking it is worse
 * than not widening it: every component whose summary happens to say "button"
 * would outrank Button itself in registry order.
 */

/** Lower score sorts first. `null` means the item does not match at all. */
function score(label: string, haystack: string, query: string): number | null {
	const name = label.toLowerCase()
	if (name === query) return 0
	if (name.startsWith(query)) return 1
	if (name.includes(query)) return 2
	// Whole-word hit somewhere in the metadata — a real keyword, not a fragment
	// of a longer word ("tab" matching "table" is what this separates out).
	if (new RegExp(`\\b${escapeRegExp(query)}`).test(haystack)) return 3
	if (haystack.includes(query)) return 4
	return null
}

function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/**
 * Builds the palette's `filter`, closing over each item's searchable text keyed
 * by `CommandItem.id`. Items with no entry fall back to their label, so a
 * caller that adds a row without registering text still gets label matching
 * rather than silently disappearing from every query.
 *
 * `untilQuery` names rows that appear only once something is typed: a page's
 * section anchors, which would double the unfiltered list into noise.
 */
export function makeDocsFilter(haystacks: Record<string, string>, untilQuery: ReadonlySet<string> = new Set()) {
	return function docsFilter(items: CommandItem[], query: string): CommandItem[] {
		const q = query.trim().toLowerCase()
		if (!q) return untilQuery.size ? items.filter((item) => !item.id || !untilQuery.has(item.id)) : items

		const ranked: { item: CommandItem; score: number; order: number }[] = []
		items.forEach((item, order) => {
			const haystack =
				(item.id ? haystacks[item.id] : undefined) ?? item.label.toLowerCase()
			const result = score(item.label, haystack, q)
			if (result !== null) ranked.push({ item, score: result, order })
		})

		// Ties keep registry order, so equally-good matches stay in the order the
		// rest of the docs present them rather than shuffling per keystroke.
		ranked.sort((a, b) => a.score - b.score || a.order - b.order)
		return ranked.map((entry) => entry.item)
	}
}

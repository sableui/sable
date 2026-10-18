import { act, render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { MATCH_HIGHLIGHT, matchRanges, useMatchHighlight } from "./use-match-highlight"

/**
 * jsdom has Range and TreeWalker but no Custom Highlight API, so the registry
 * is stood in for with the two shapes the hook touches: a Set-like Highlight
 * and a Map-like `CSS.highlights`.
 */
class FakeHighlight extends Set<Range> {}

function texts(ranges: Iterable<Range>) {
	return Array.from(ranges, (range) => range.toString())
}

describe("matchRanges", () => {
	it("finds every literal, case-insensitive occurrence", () => {
		const root = document.createElement("div")
		root.innerHTML = "<span>Report</span><span>re-run reports</span>"
		expect(texts(matchRanges(root, "re"))).toEqual(["Re", "re", "re"])
	})

	it("trims the query and treats an empty one as no match", () => {
		const root = document.createElement("div")
		root.textContent = "Settings"
		expect(texts(matchRanges(root, "  set "))).toEqual(["Set"])
		expect(matchRanges(root, "   ")).toEqual([])
	})

	it("treats regex characters as text", () => {
		const root = document.createElement("div")
		root.textContent = "Price (USD) and price"
		expect(texts(matchRanges(root, "(usd)"))).toEqual(["(USD)"])
	})

	it("keeps to the selector when one is given", () => {
		const root = document.createElement("div")
		root.innerHTML = '<span data-sable-match="">Open file</span><span>Open with ⌘O</span>'
		expect(texts(matchRanges(root, "open", "[data-sable-match]"))).toEqual(["Open"])
	})
})

describe("useMatchHighlight", () => {
	const original = (globalThis as { CSS?: unknown }).CSS
	let registry: Map<string, FakeHighlight>

	beforeEach(() => {
		registry = new Map()
		;(globalThis as { CSS?: unknown }).CSS = { highlights: registry }
		;(globalThis as { Highlight?: unknown }).Highlight = FakeHighlight
	})

	afterEach(() => {
		;(globalThis as { CSS?: unknown }).CSS = original
		delete (globalThis as { Highlight?: unknown }).Highlight
	})

	function Results({ query, enabled }: { query: string; enabled?: boolean }) {
		const ref = useMatchHighlight<HTMLUListElement>(query, { enabled })
		return (
			<ul ref={ref}>
				<li>Apple</li>
				<li>Pineapple</li>
				<li>Banana</li>
			</ul>
		)
	}

	it("registers the query's ranges under one shared name", () => {
		render(<Results query="apple" />)
		expect(texts(registry.get(MATCH_HIGHLIGHT) ?? [])).toEqual(["Apple", "apple"])
	})

	it("swaps its ranges when the query changes and drops them on unmount", () => {
		const { rerender, unmount } = render(<Results query="apple" />)
		rerender(<Results query="ban" />)
		expect(texts(registry.get(MATCH_HIGHLIGHT) ?? [])).toEqual(["Ban"])
		unmount()
		expect(registry.get(MATCH_HIGHLIGHT)?.size).toBe(0)
	})

	it("paints nothing while disabled", () => {
		render(<Results query="apple" enabled={false} />)
		expect(registry.get(MATCH_HIGHLIGHT)?.size ?? 0).toBe(0)
	})

	it("is a no-op where the API is missing", () => {
		;(globalThis as { CSS?: unknown }).CSS = {}
		expect(() => act(() => void render(<Results query="apple" />))).not.toThrow()
	})
})

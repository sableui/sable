import { act, renderHook } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { belowBreakpointQuery, useBelowBreakpoint, useMediaQuery } from "./use-media-query"

/** A matchMedia that answers `(width < Nrem)` against a settable viewport width. */
function mockViewport(widthPx: number) {
	const original = window.matchMedia
	let width = widthPx
	const lists = new Set<{ query: string; listeners: Set<() => void> }>()
	const evaluate = (query: string) => {
		const m = /\(width < ([\d.]+)rem\)/.exec(query)
		return m ? width < Number(m[1]) * 16 : false
	}
	window.matchMedia = vi.fn((query: string) => {
		const entry = { query, listeners: new Set<() => void>() }
		lists.add(entry)
		return {
			get matches() {
				return evaluate(query)
			},
			media: query,
			onchange: null,
			addEventListener: (_: string, cb: () => void) => entry.listeners.add(cb),
			removeEventListener: (_: string, cb: () => void) => entry.listeners.delete(cb),
			addListener: () => {},
			removeListener: () => {},
			dispatchEvent: () => false,
		} as unknown as MediaQueryList
	}) as typeof window.matchMedia
	return {
		resize(next: number) {
			width = next
			for (const entry of lists) for (const cb of entry.listeners) cb()
		},
		restore() {
			window.matchMedia = original
		},
	}
}

let viewport: ReturnType<typeof mockViewport> | null = null
afterEach(() => {
	viewport?.restore()
	viewport = null
})

describe("useMediaQuery", () => {
	it("tracks the query as the viewport changes", () => {
		viewport = mockViewport(1200)
		const { result } = renderHook(() => useMediaQuery("(width < 64rem)"))
		expect(result.current).toBe(false)
		act(() => viewport!.resize(800))
		expect(result.current).toBe(true)
		act(() => viewport!.resize(1100))
		expect(result.current).toBe(false)
	})

	it("reports serverValue when matchMedia is unavailable", () => {
		const original = window.matchMedia
		// @ts-expect-error — simulate a non-browser environment
		window.matchMedia = undefined
		try {
			const { result } = renderHook(() => useMediaQuery("(width < 64rem)", { serverValue: true }))
			expect(result.current).toBe(true)
		} finally {
			window.matchMedia = original
		}
	})
})

describe("useBelowBreakpoint", () => {
	it("flips at the breakpoint's min-width, where an lg: class starts to apply", () => {
		expect(belowBreakpointQuery("lg")).toBe("(width < 64rem)")
		viewport = mockViewport(1023)
		const { result } = renderHook(() => useBelowBreakpoint("lg"))
		expect(result.current).toBe(true)
		act(() => viewport!.resize(1024))
		expect(result.current).toBe(false)
	})

	it("defaults to lg", () => {
		viewport = mockViewport(900)
		const { result } = renderHook(() => useBelowBreakpoint())
		expect(result.current).toBe(true)
	})
})

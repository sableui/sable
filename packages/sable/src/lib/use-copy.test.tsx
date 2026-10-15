import { act, renderHook } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { useCopy } from "./use-copy"

function mockClipboard(writeText: (text: string) => Promise<void>) {
	Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true, writable: true })
}

afterEach(() => {
	vi.useRealTimers()
	vi.restoreAllMocks()
})

describe("useCopy", () => {
	it("writes the text, flags copied, then resets after the timeout", async () => {
		vi.useFakeTimers()
		const writeText = vi.fn().mockResolvedValue(undefined)
		mockClipboard(writeText)
		const { result } = renderHook(() => useCopy("hello world", { timeout: 1000 }))
		let ok = false
		await act(async () => { ok = await result.current.copy() })
		expect(ok).toBe(true)
		expect(writeText).toHaveBeenCalledExactlyOnceWith("hello world")
		expect(result.current.copied).toBe(true)
		act(() => vi.advanceTimersByTime(1000))
		expect(result.current.copied).toBe(false)
	})

	it("fails quietly when the write is refused", async () => {
		mockClipboard(vi.fn().mockRejectedValue(new Error("denied")))
		const { result } = renderHook(() => useCopy("x"))
		let ok = true
		await act(async () => { ok = await result.current.copy() })
		expect(ok).toBe(false)
		expect(result.current.copied).toBe(false)
	})

	it("calls a text function only on copy", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined)
		mockClipboard(writeText)
		const source = vi.fn(() => "late text")
		const { result } = renderHook(() => useCopy(source))
		expect(source).not.toHaveBeenCalled()
		await act(async () => { await result.current.copy() })
		expect(writeText).toHaveBeenCalledExactlyOnceWith("late text")
	})

	it("hands a pending promise to the clipboard as a ClipboardItem", async () => {
		const write = vi.fn(async (items: ClipboardItem[]) => {
			await items[0].getType("text/plain")
		})
		Object.defineProperty(navigator, "clipboard", { value: { writeText: vi.fn(), write }, configurable: true, writable: true })
		class FakeClipboardItem {
			constructor(private readonly items: Record<string, Promise<Blob>>) {}
			getType(type: string) { return this.items[type] }
		}
		vi.stubGlobal("ClipboardItem", FakeClipboardItem)
		const { result } = renderHook(() => useCopy(() => Promise.resolve("fetched")))
		let ok = false
		await act(async () => { ok = await result.current.copy() })
		expect(ok).toBe(true)
		expect(write).toHaveBeenCalledOnce()
		expect(result.current.copied).toBe(true)
		vi.unstubAllGlobals()
	})

	it("fails quietly when the text rejects", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined)
		mockClipboard(writeText)
		const { result } = renderHook(() => useCopy(() => Promise.reject(new Error("404"))))
		let ok = true
		await act(async () => { ok = await result.current.copy() })
		expect(ok).toBe(false)
		expect(result.current.copied).toBe(false)
	})

	it("resolves false without a clipboard API", async () => {
		Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true, writable: true })
		const { result } = renderHook(() => useCopy("x"))
		let ok = true
		await act(async () => { ok = await result.current.copy() })
		expect(ok).toBe(false)
	})
})

import { act, render } from "@testing-library/react"
import { renderToString } from "react-dom/server"
import { afterEach, describe, expect, it, vi } from "vitest"
import { useToday } from "./use-today"

function Day({ fallback }: { fallback?: string }) {
	const today = useToday(fallback)
	return <span>{`${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`}</span>
}

describe("useToday", () => {
	afterEach(() => vi.useRealTimers())

	it("renders the fallback day on the server, and ignores a malformed one", () => {
		expect(renderToString(<Day fallback="2026-03-09" />)).toContain("2026-3-9")
		expect(renderToString(<Day fallback="2026-3-9" />)).toContain("2026-1-5")
	})

	it("gives the reader's day on the client, and the next one after midnight", () => {
		vi.useFakeTimers()
		vi.setSystemTime(new Date(2026, 10, 16, 23, 59, 30))
		const { container } = render(<Day />)
		expect(container.textContent).toBe("2026-11-16")
		act(() => {
			vi.advanceTimersByTime(60_000)
		})
		expect(container.textContent).toBe("2026-11-17")
	})
})

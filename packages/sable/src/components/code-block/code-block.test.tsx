import { afterEach, describe, expect, it, vi } from "vitest"
import { act, fireEvent, renderWithProviders, screen } from "../../test/render"
import { CodeBlock } from "./code-block"

function mockClipboard(writeText: (text: string) => Promise<void>) {
	Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true, writable: true })
}

afterEach(() => {
	vi.useRealTimers()
	vi.restoreAllMocks()
})

describe("CodeBlock copy", () => {
	it("cross-fades the copy glyph to a check and announces the copy", async () => {
		vi.useFakeTimers()
		const writeText = vi.fn().mockResolvedValue(undefined)
		mockClipboard(writeText)
		const { container } = renderWithProviders(<CodeBlock filename="a.ts" code="const a = 1" />)
		const copy = screen.getByRole("button", { name: "Copy code" })
		const glyph = (name: string) => container.querySelector(`[data-icon="${name}"]`)?.parentElement
		// Both marks are mounted in one icon-swap cell; only the current is active.
		expect(glyph("copy")?.parentElement).toHaveClass("motion-icon-swap")
		expect(glyph("copy")).toHaveAttribute("data-active", "true")
		expect(glyph("check")).toHaveAttribute("data-active", "false")
		expect(screen.getByRole("status")).toBeEmptyDOMElement()

		await act(async () => {
			fireEvent.click(copy)
		})
		expect(writeText).toHaveBeenCalledWith("const a = 1")
		expect(glyph("copy")).toHaveAttribute("data-active", "false")
		expect(glyph("check")).toHaveAttribute("data-active", "true")
		expect(screen.getByRole("status")).toHaveTextContent("Copied")
		// The button keeps the name that says what it does.
		expect(copy).toHaveAccessibleName("Copy code")

		act(() => vi.advanceTimersByTime(1500))
		expect(glyph("copy")).toHaveAttribute("data-active", "true")
		expect(screen.getByRole("status")).toBeEmptyDOMElement()
	})

	it("announces the command form's copy too", async () => {
		mockClipboard(vi.fn().mockResolvedValue(undefined))
		renderWithProviders(<CodeBlock prompt="$" code="pnpm dev" />)
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy command" }))
		})
		expect(screen.getByRole("status")).toHaveTextContent("Copied")
	})

	it("renders no live region without a copy button", () => {
		renderWithProviders(<CodeBlock showCopy={false} code="x" />)
		expect(screen.queryByRole("status")).toBeNull()
	})
})

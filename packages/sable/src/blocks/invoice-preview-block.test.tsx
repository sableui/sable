import { afterEach, describe, expect, it, vi } from "vitest"
import { act, fireEvent, renderWithProviders, screen } from "../test/render"
import { InvoicePreviewBlock } from "./invoice-preview-block"

afterEach(() => {
	vi.clearAllTimers()
	vi.useRealTimers()
})

describe("InvoicePreviewBlock", () => {
	it("keeps feedback and focus in its one action", () => {
		vi.useFakeTimers()
		const onSend = vi.fn()
		renderWithProviders(<InvoicePreviewBlock onSend={onSend} />)
		const button = screen.getByRole("button", { name: "Send invoice" })
		button.focus()
		fireEvent.click(button)
		expect(onSend).toHaveBeenCalledWith(600)
		expect(button).toHaveAccessibleName("Sending…")
		expect(button).toHaveAttribute("aria-busy", "true")
		expect(screen.getByRole("status").closest("button")).toBe(button)
		fireEvent.click(button)
		expect(onSend).toHaveBeenCalledOnce()
		act(() => vi.advanceTimersByTime(1000))
		expect(button).toHaveAccessibleName("Sent")
		expect(screen.queryByText("Draft")).not.toBeInTheDocument()
		expect(button).not.toHaveAttribute("disabled")
		expect(button).toHaveFocus()
		fireEvent.click(button)
		expect(button).toHaveAccessibleName("Sending…")
	})

	it("locks the discount only while sending, and returns a sent invoice to draft", () => {
		vi.useFakeTimers()
		renderWithProviders(<InvoicePreviewBlock />)
		fireEvent.click(screen.getByRole("button", { name: "Send invoice" }))
		const discount = screen.getByRole("switch", { name: "10% discount" })
		expect(discount).toHaveAttribute("aria-disabled", "true")
		fireEvent.click(discount)
		expect(discount).not.toBeChecked()
		act(() => vi.advanceTimersByTime(1000))
		expect(discount).not.toHaveAttribute("aria-disabled", "true")
		fireEvent.click(discount)
		expect(discount).toBeChecked()
		expect(screen.getByText("−$60.00")).toBeInTheDocument()
		expect(screen.getByRole("button", { name: "Send invoice" })).toBeEnabled()
		expect(screen.getByText("Draft")).toBeInTheDocument()
		fireEvent.click(discount)
		expect(discount).not.toBeChecked()
		expect(screen.queryByText("−$60.00")).not.toBeInTheDocument()
	})
})

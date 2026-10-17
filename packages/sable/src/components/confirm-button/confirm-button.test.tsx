import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { act, fireEvent, renderWithProviders, screen } from "../../test/render"
import { StackedActionsContext } from "../../lib/presentation"
import { ConfirmButton } from "./confirm-button"

beforeEach(() => {
	vi.useFakeTimers()
})
afterEach(() => {
	vi.useRealTimers()
})

/** Past the double-press guard, so a second press reads as a decision. */
const pause = () => act(() => vi.advanceTimersByTime(400))

describe("ConfirmButton", () => {
	it("arms on the first press without confirming", () => {
		const onConfirm = vi.fn()
		renderWithProviders(<ConfirmButton onConfirm={onConfirm}>Delete</ConfirmButton>)
		const button = screen.getByRole("button", { name: "Delete" })
		fireEvent.click(button)
		expect(onConfirm).not.toHaveBeenCalled()
		expect(button).toHaveAttribute("data-state", "armed")
		expect(button).toHaveAccessibleName("Confirm delete?")
		expect(button).toHaveAttribute("data-variant", "destructive")
		expect(screen.getByRole("status")).toHaveTextContent("Confirm delete? Press again to confirm.")
	})

	it("confirms on the second press and returns to idle", () => {
		const onConfirm = vi.fn()
		renderWithProviders(<ConfirmButton onConfirm={onConfirm}>Delete</ConfirmButton>)
		const button = screen.getByRole("button")
		fireEvent.click(button)
		pause()
		fireEvent.click(button)
		expect(onConfirm).toHaveBeenCalledOnce()
		expect(button).toHaveAttribute("data-state", "idle")
		expect(button).toHaveAccessibleName("Delete")
		expect(button).toHaveAttribute("data-variant", "secondary")
	})

	it("ignores a double-click: a second press inside the guard does not confirm", () => {
		const onConfirm = vi.fn()
		renderWithProviders(<ConfirmButton onConfirm={onConfirm}>Delete</ConfirmButton>)
		const button = screen.getByRole("button")
		fireEvent.click(button)
		fireEvent.click(button)
		expect(onConfirm).not.toHaveBeenCalled()
		expect(button).toHaveAttribute("data-state", "armed")
	})

	it("disarms after the timeout", () => {
		const onConfirm = vi.fn()
		renderWithProviders(
			<ConfirmButton timeout={2000} onConfirm={onConfirm}>
				Delete
			</ConfirmButton>,
		)
		const button = screen.getByRole("button")
		fireEvent.click(button)
		act(() => vi.advanceTimersByTime(1999))
		expect(button).toHaveAttribute("data-state", "armed")
		act(() => vi.advanceTimersByTime(1))
		expect(button).toHaveAttribute("data-state", "idle")
		fireEvent.click(button)
		expect(onConfirm).not.toHaveBeenCalled()
	})

	it("disarms on Escape without letting the key reach the page", () => {
		const onDocumentKey = vi.fn()
		document.addEventListener("keydown", onDocumentKey)
		renderWithProviders(<ConfirmButton onConfirm={() => {}}>Delete</ConfirmButton>)
		const button = screen.getByRole("button")
		fireEvent.click(button)
		fireEvent.keyDown(button, { key: "Escape" })
		expect(button).toHaveAttribute("data-state", "idle")
		expect(onDocumentKey).not.toHaveBeenCalled()
		document.removeEventListener("keydown", onDocumentKey)
	})

	it("disarms when focus leaves or a press lands elsewhere", () => {
		renderWithProviders(
			<>
				<ConfirmButton onConfirm={() => {}}>Delete</ConfirmButton>
				<span data-testid="elsewhere" />
			</>,
		)
		const button = screen.getByRole("button")
		fireEvent.click(button)
		fireEvent.blur(button)
		expect(button).toHaveAttribute("data-state", "idle")
		fireEvent.click(button)
		fireEvent.pointerDown(screen.getByTestId("elsewhere"))
		expect(button).toHaveAttribute("data-state", "idle")
	})

	it("works from the keyboard twice, keeping focus", () => {
		const onConfirm = vi.fn()
		renderWithProviders(<ConfirmButton onConfirm={onConfirm}>Remove</ConfirmButton>)
		const button = screen.getByRole("button")
		button.focus()
		// A native button turns Enter into a click; jsdom does not, so the click is the key's effect.
		fireEvent.keyDown(button, { key: "Enter" })
		fireEvent.click(button)
		pause()
		fireEvent.keyDown(button, { key: "Enter" })
		fireEvent.click(button)
		expect(onConfirm).toHaveBeenCalledOnce()
		expect(document.activeElement).toBe(button)
	})

	it("holds armed and busy while an async confirm settles", async () => {
		let resolve: () => void = () => {}
		const onConfirm = vi.fn(() => new Promise<void>((r) => (resolve = r)))
		renderWithProviders(<ConfirmButton onConfirm={onConfirm}>Discard</ConfirmButton>)
		const button = screen.getByRole("button")
		fireEvent.click(button)
		pause()
		fireEvent.click(button)
		expect(button).toHaveAttribute("aria-busy", "true")
		expect(button).toHaveAttribute("data-state", "armed")
		// The timeout does not cut a confirmation in flight short.
		act(() => vi.advanceTimersByTime(5000))
		expect(button).toHaveAttribute("data-state", "armed")
		await act(async () => resolve())
		expect(button).toHaveAttribute("data-state", "idle")
		expect(button).not.toHaveAttribute("aria-busy")
	})

	it("keeps both labels mounted, hiding the inactive one from assistive tech", () => {
		renderWithProviders(<ConfirmButton confirmLabel="Really?" onConfirm={() => {}}>Delete</ConfirmButton>)
		const button = screen.getByRole("button")
		const idle = screen.getByText("Delete").parentElement
		const prompt = screen.getByText("Really?").parentElement
		expect(idle).not.toHaveAttribute("aria-hidden")
		expect(prompt).toHaveAttribute("aria-hidden", "true")
		expect(prompt).toHaveClass("w-0")
		expect(button).toHaveClass("motion-size")
		fireEvent.click(button)
		expect(idle).toHaveAttribute("aria-hidden", "true")
		expect(prompt).toHaveClass("w-max")
		expect(button.querySelector("[data-slot=confirm-countdown]")).not.toBeNull()
	})

	it("turns its own motion down through data-motion", () => {
		const { rerender } = renderWithProviders(<ConfirmButton onConfirm={() => {}}>Delete</ConfirmButton>)
		expect(screen.getByRole("button")).not.toHaveAttribute("data-motion")
		rerender(
			<ConfirmButton motion="subtle" onConfirm={() => {}}>
				Delete
			</ConfirmButton>,
		)
		expect(screen.getByRole("button")).toHaveAttribute("data-motion", "subtle")
	})

	it("disarms when disabled while armed", () => {
		const { rerender } = renderWithProviders(<ConfirmButton onConfirm={() => {}}>Delete</ConfirmButton>)
		fireEvent.click(screen.getByRole("button"))
		rerender(
			<ConfirmButton disabled onConfirm={() => {}}>
				Delete
			</ConfirmButton>,
		)
		expect(screen.getByRole("button")).toHaveAttribute("data-state", "idle")
	})
})

describe("ConfirmButton width ownership", () => {
	// jsdom lays nothing out, so give the label a width to measure.
	beforeEach(() => {
		vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(60)
	})
	afterEach(() => {
		vi.restoreAllMocks()
	})

	it("measures its own width by default, so the label change can ease", () => {
		renderWithProviders(<ConfirmButton onConfirm={() => undefined}>Delete</ConfirmButton>)
		expect(screen.getByRole("button", { name: /delete/i }).style.width).toMatch(/px$/)
	})

	it("leaves the width alone when the caller sizes it", () => {
		renderWithProviders(
			<ConfirmButton className="w-full" onConfirm={() => undefined}>
				Delete
			</ConfirmButton>,
		)
		expect(screen.getByRole("button", { name: /delete/i }).style.width).toBe("")
	})

	it("leaves the width alone inside a stacked action bar, where Button stretches", () => {
		renderWithProviders(
			<StackedActionsContext.Provider value={true}>
				<ConfirmButton onConfirm={() => undefined}>Delete</ConfirmButton>
			</StackedActionsContext.Provider>,
		)
		expect(screen.getByRole("button", { name: /delete/i }).style.width).toBe("")
	})
})

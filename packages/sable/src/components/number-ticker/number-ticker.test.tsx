import { describe, expect, it } from "vitest"
import { renderWithProviders, screen } from "../../test/render"
import { NumberTicker } from "./number-ticker"

const root = (container: HTMLElement) => container.querySelector("[data-slot=number-ticker]") as HTMLElement
const columns = (container: HTMLElement) => root(container).querySelector("[aria-hidden=true]") as HTMLElement

describe("NumberTicker", () => {
	it("carries the whole written number as real text, and hides the rolling columns", () => {
		const { container } = renderWithProviders(<NumberTicker value={1234} locales="en-US" />)
		expect(screen.getByText("1,234")).toHaveClass("sr-only")
		expect(columns(container)).toHaveAttribute("aria-hidden", "true")
		// The glyphs are generated content, so the stacks add nothing to the text a
		// reader copies or a test reads.
		expect(root(container).textContent).toBe("1,234")
	})

	it("writes a column per digit and holds separators still", () => {
		const { container } = renderWithProviders(<NumberTicker value={1234.5} locales="en-US" format={{ minimumFractionDigits: 2 }} />)
		const cells = [...columns(container).children]
		// 1 , 2 3 4 . 5 0
		expect(cells).toHaveLength(8)
		const stacks = columns(container).querySelectorAll(".overflow-clip")
		expect(stacks).toHaveLength(6)
	})

	it("formats currency, percent and compact through Intl", () => {
		renderWithProviders(
			<>
				<NumberTicker value={4280.5} locales="en-US" format={{ style: "currency", currency: "USD" }} />
				<NumberTicker value={0.428} locales="en-US" format={{ style: "percent", maximumFractionDigits: 1 }} />
				<NumberTicker value={10_200} locales="en-US" format={{ notation: "compact", maximumFractionDigits: 1 }} />
			</>,
		)
		expect(screen.getByText("$4,280.50")).toBeInTheDocument()
		expect(screen.getByText("42.8%")).toBeInTheDocument()
		expect(screen.getByText("10.2K")).toBeInTheDocument()
	})

	it("includes a string prefix and suffix in the text, and renders an element one as given", () => {
		renderWithProviders(
			<>
				<NumberTicker value={99} suffix="+" />
				<NumberTicker value={7} prefix={<span data-testid="icon" />} />
			</>,
		)
		expect(screen.getByText("99+")).toHaveClass("sr-only")
		expect(screen.getByTestId("icon")).toBeInTheDocument()
	})

	it("survives negatives, decimals and a sign change", () => {
		const { container, rerender } = renderWithProviders(<NumberTicker value={-12.75} locales="en-US" />)
		expect(screen.getByText("-12.75")).toBeInTheDocument()
		rerender(<NumberTicker value={3.1} locales="en-US" />)
		expect(container.querySelector(".sr-only")?.textContent).toBe("3.1")
		rerender(<NumberTicker value={Number.NaN} locales="en-US" />)
		expect(container.querySelector(".sr-only")?.textContent).toBe("NaN")
	})

	it("rolls the same column when a digit changes, and keeps place values on their own columns", () => {
		const { container, rerender } = renderWithProviders(<NumberTicker value={999} locales="en-US" />)
		const ones = columns(container).lastElementChild
		rerender(<NumberTicker value={1000} locales="en-US" />)
		// The ones column is the same element — it rolled, it was not replaced.
		expect(columns(container).lastElementChild).toBe(ones)
		expect(container.querySelector(".sr-only")?.textContent).toBe("1,000")
	})

	it("is not a live region unless asked", () => {
		const { container, rerender } = renderWithProviders(<NumberTicker value={1} />)
		expect(root(container)).not.toHaveAttribute("aria-live")
		rerender(<NumberTicker value={2} aria-live="polite" />)
		expect(root(container)).toHaveAttribute("aria-live", "polite")
	})

	it("sets data-motion from the motion prop, and nothing for full", () => {
		const { container, rerender } = renderWithProviders(<NumberTicker value={1} motion="subtle" />)
		expect(root(container)).toHaveAttribute("data-motion", "subtle")
		rerender(<NumberTicker value={1} motion="off" />)
		expect(root(container)).toHaveAttribute("data-motion", "off")
		rerender(<NumberTicker value={1} motion="full" />)
		expect(root(container)).not.toHaveAttribute("data-motion")
	})
})

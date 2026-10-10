import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { StreamingText } from "./streaming-text"

describe("StreamingText", () => {
	it("renders the text as real text in the accessibility tree", () => {
		// Asserted on concatenated textContent rather than getByText, because the
		// units ARE separate spans — that is the design, and no single element
		// holds the sentence. What matters is that they are ordinary spans rather
		// than aria-hidden fragments, so a screen reader joins them; whitespace is
		// preserved as its own unit precisely so the joined string is the original.
		const { container } = render(<StreamingText text="up 23% this month" />)
		expect(container.textContent).toBe("up 23% this month")
		expect(container.querySelector("[aria-hidden]")).toBeNull()
	})

	it("marks the container busy only while streaming", () => {
		const { container, rerender } = render(
			<StreamingText text="partial" streaming />,
		)
		expect(container.firstChild).toHaveAttribute("aria-busy", "true")
		rerender(<StreamingText text="partial answer" />)
		expect(container.firstChild).not.toHaveAttribute("aria-busy")
	})

	it("keeps already-rendered units across a grow, so they do not re-animate", () => {
		// The whole append-only design rests on this: React must reuse the
		// existing spans and mount only the new ones. If keys changed on growth,
		// every word would re-run its blur on every token — the exact effect the
		// component exists to avoid.
		const { container, rerender } = render(<StreamingText text="one two" />)
		const first = container.querySelectorAll("span")[0]
		rerender(<StreamingText text="one two three" />)
		expect(container.querySelectorAll("span")[0]).toBe(first)
	})

	it("shows the caret only while streaming, and holds it steady", () => {
		const { container, rerender } = render(<StreamingText text="x" streaming />)
		const caret = container.querySelector("[data-streaming]")
		// data-streaming="true" is what suppresses motion-caret's blink. A caret
		// that blinks while tokens arrive is the thing this deliberately inverts.
		expect(caret).toHaveAttribute("data-streaming", "true")
		expect(caret).toHaveClass("motion-caret")
		rerender(<StreamingText text="x" />)
		expect(container.querySelector("[data-streaming]")).toBeNull()
	})

	it("suppresses the caret when the wait is reported elsewhere", () => {
		const { container } = render(
			<StreamingText text="x" streaming caret={false} />,
		)
		expect(container.querySelector("[data-streaming]")).toBeNull()
	})

	it("softens only the newest unit, and only mid-stream", () => {
		const { container, rerender } = render(
			<StreamingText text="one two three" streaming />,
		)
		const tails = container.querySelectorAll(".stream-tail")
		expect(tails).toHaveLength(1)
		expect(tails[0]).toHaveTextContent("three")

		// Once the source closes nothing stays soft — an answer permanently out of
		// focus at its own last word is worse than a hard edge.
		rerender(<StreamingText text="one two three" />)
		expect(container.querySelectorAll(".stream-tail")).toHaveLength(0)
	})

	it("splits by character when asked", () => {
		const { container } = render(<StreamingText text="abc" split="char" />)
		expect(container.querySelectorAll("span")).toHaveLength(3)
	})
})

import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { GlidingHighlight } from "./gliding-highlight"

function Rows({ active }: { active: number | null }) {
	return (
		<GlidingHighlight active={active}>
			<button type="button">One</button>
			<button type="button">Two</button>
			<button type="button">Three</button>
		</GlidingHighlight>
	)
}

const highlightOf = (c: HTMLElement) => c.querySelector<HTMLElement>("[data-highlight-glide]")

describe("GlidingHighlight", () => {
	it("stays invisible when nothing is active", () => {
		// The point is that a menu must not look like it opened with the first
		// item pre-selected.
		const { container } = render(<Rows active={null} />)
		expect(highlightOf(container)).toHaveStyle({ opacity: "0" })
		expect(container.querySelector("[data-highlighted]")).toBeNull()
	})

	it("is decoration, never semantics", () => {
		// Selection lives on the items (aria-selected / aria-current). If this ever
		// became focusable or announced, it would double-report the active row.
		const { container } = render(<Rows active={1} />)
		const el = highlightOf(container)
		expect(el).toHaveAttribute("aria-hidden", "true")
		expect(el).toHaveClass("pointer-events-none")
	})

	it("runs on the shared glide engine, not a copy", () => {
		// Menu, Select and Combobox mount the same engine; the container is marked
		// data-glide so the items' own highlight fill steps aside.
		const { container } = render(<Rows active={0} />)
		expect(container.querySelector("[data-glide]")).not.toBeNull()
	})

	it("marks exactly the active item, and does not count itself as one", () => {
		// The highlight is a child of the same container. Counting it would land
		// every active index one row late.
		const { container, rerender } = render(<Rows active={0} />)
		const marked = () => Array.from(container.querySelectorAll("[data-highlighted]")).map((el) => el.textContent)
		expect(marked()).toEqual(["One"])
		rerender(<Rows active={2} />)
		expect(marked()).toEqual(["Three"])
		rerender(<Rows active={null} />)
		expect(marked()).toEqual([])
	})

	it("takes the frame's concentric inner radius by default, and lets highlightClassName replace it", () => {
		const { container, rerender } = render(<Rows active={0} />)
		expect(highlightOf(container)?.className).toContain("rounded-[var(--sable-frame-inner-radius,var(--radius-sm))]")
		rerender(
			<GlidingHighlight active={0} highlightClassName="rounded-concentric-md/1">
				<button type="button">One</button>
			</GlidingHighlight>,
		)
		expect(highlightOf(container)?.className).toContain("rounded-concentric-md/1")
		expect(highlightOf(container)?.className).not.toContain("--sable-frame-inner-radius")
	})
})

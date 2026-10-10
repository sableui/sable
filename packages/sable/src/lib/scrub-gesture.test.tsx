import { describe, expect, it, vi } from "vitest"
import { PropertyRow } from "../components/panel-section/panel-section"
import { fireEvent, renderWithProviders, screen } from "../test/render"

/**
 * The gesture is shared by ScrubField's glyph and PropertyRow's label, and the
 * label is the demanding case: it is a real `<label htmlFor>`, so the click it
 * must not swallow is the one that focuses the field. These pin that boundary
 * from both sides — under the threshold nothing happens and the click lands,
 * over it the drag arms and the click is eaten.
 */

function drag(el: Element, dxs: number[]) {
	fireEvent.pointerDown(el, { clientX: 0 })
	for (const dx of dxs) fireEvent(window, new MouseEvent("pointermove", { clientX: dx } as never))
	fireEvent(window, new MouseEvent("pointerup", {} as never))
}

describe("PropertyRow scrub", () => {
	it("does not arm below the jitter threshold, so a click stays a click", () => {
		const onValueChange = vi.fn()
		const onGestureStart = vi.fn()
		renderWithProviders(
			<PropertyRow label="Levels" htmlFor="levels" scrub={{ value: 4, onValueChange, onGestureStart }}>
				<input id="levels" />
			</PropertyRow>,
		)
		drag(screen.getByText("Levels"), [1, -1, 1])
		expect(onGestureStart).not.toHaveBeenCalled()
		expect(onValueChange).not.toHaveBeenCalled()
	})

	it("arms past the threshold and brackets the drag once, not per move", () => {
		const onValueChange = vi.fn()
		const onGestureStart = vi.fn()
		const onGestureEnd = vi.fn()
		renderWithProviders(
			<PropertyRow
				label="Levels"
				scrub={{ value: 4, onValueChange, onGestureStart, onGestureEnd }}
			>
				<input />
			</PropertyRow>,
		)
		drag(screen.getByText("Levels"), [10, 20, 30])
		// One open and one close for the whole drag — an undo entry per pixel is
		// the failure this shape exists to avoid.
		expect(onGestureStart).toHaveBeenCalledTimes(1)
		expect(onGestureEnd).toHaveBeenCalledTimes(1)
		expect(onValueChange).toHaveBeenLastCalledWith(34)
	})

	it("keeps the label a label — a plain click still focuses the field", () => {
		renderWithProviders(
			<PropertyRow label="Seed" htmlFor="seed" scrub={{ value: 0, onValueChange: vi.fn() }}>
				<input id="seed" />
			</PropertyRow>,
		)
		const label = screen.getByText("Seed")
		expect(label.tagName).toBe("LABEL")
		expect(label).toHaveAttribute("for", "seed")
		// pointerdown must not be defaulted-prevented, or the browser never
		// delivers the activation that focuses the input.
		const down = fireEvent.pointerDown(label, { clientX: 0 })
		expect(down).toBe(true)
		fireEvent(window, new MouseEvent("pointerup", {} as never))
	})

	it("applies min/max, so a drag cannot leave the valid range", () => {
		const onValueChange = vi.fn()
		renderWithProviders(
			<PropertyRow label="Count" scrub={{ value: 8, min: 1, max: 10, onValueChange }}>
				<input />
			</PropertyRow>,
		)
		drag(screen.getByText("Count"), [50])
		expect(onValueChange).toHaveBeenLastCalledWith(10)
	})

	it("advertises the affordance before the drag, and drops it when disabled", () => {
		const { rerender } = renderWithProviders(
			<PropertyRow label="Levels" scrub={{ value: 1, onValueChange: vi.fn() }}>
				<input />
			</PropertyRow>,
		)
		expect(screen.getByText("Levels").className).toContain("cursor-ew-resize")

		rerender(
			<PropertyRow label="Levels" scrub={{ value: 1, disabled: true, onValueChange: vi.fn() }}>
				<input />
			</PropertyRow>,
		)
		expect(screen.getByText("Levels").className).not.toContain("cursor-ew-resize")
	})

	it("is inert without the prop — an unscrubbed row is unchanged", () => {
		renderWithProviders(
			<PropertyRow label="Blend mode">
				<input />
			</PropertyRow>,
		)
		const label = screen.getByText("Blend mode")
		expect(label.className).not.toContain("cursor-ew-resize")
		expect(label.className).not.toContain("select-none")
	})
})

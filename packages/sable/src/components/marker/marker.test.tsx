import { describe, expect, it } from "vitest"
import { renderWithProviders, screen } from "../../test/render"
import { Marker } from "./index"

describe("Marker", () => {
	function root(container: HTMLElement) {
		return container.firstElementChild as HTMLElement
	}

	it("announces a status change, because silence reads as a dead answer", () => {
		renderWithProviders(<Marker>Thinking…</Marker>)
		const el = screen.getByRole("status")
		expect(el).toHaveAttribute("aria-live", "polite")
		expect(el).toHaveTextContent("Thinking…")
	})

	it("stays silent for the variants that would only add noise", () => {
		const { container: note } = renderWithProviders(
			<Marker variant="note">Carla joined</Marker>,
		)
		expect(root(note)).not.toHaveAttribute("aria-live")

		const { container: sep } = renderWithProviders(
			<Marker variant="separator">Yesterday</Marker>,
		)
		expect(root(sep)).not.toHaveAttribute("aria-live")
	})

	it("lets a caller opt a quiet variant in, or a status out", () => {
		const { container: loud } = renderWithProviders(
			<Marker variant="note" live>
				Escalated to on-call
			</Marker>,
		)
		expect(root(loud)).toHaveAttribute("aria-live", "polite")

		const { container: quiet } = renderWithProviders(
			<Marker live={false}>Thinking…</Marker>,
		)
		expect(root(quiet)).not.toHaveAttribute("aria-live")
	})

	it("hides the separator's rules, leaving only the label in the tree", () => {
		const { container } = renderWithProviders(
			<Marker variant="separator">Yesterday</Marker>,
		)
		const rules = container.querySelectorAll('[aria-hidden="true"]')
		expect(rules).toHaveLength(2)
		expect(root(container)).toHaveTextContent("Yesterday")
	})

	it("shimmers the label only when asked, via the scale-aware recipe", () => {
		const { container: on } = renderWithProviders(
			<Marker shimmer>Writing the answer</Marker>,
		)
		expect(on.querySelector(".motion-text-shimmer")).not.toBeNull()

		const { container: off } = renderWithProviders(<Marker>Thinking…</Marker>)
		expect(off.querySelector(".motion-text-shimmer")).toBeNull()
	})

	it("passes spin through to the icon rather than animating the row", () => {
		const { container } = renderWithProviders(
			<Marker icon="spinner" spin>
				Working
			</Marker>,
		)
		expect(container.querySelector('[data-icon="spinner"]')).not.toBeNull()
		expect(root(container).className).not.toContain("motion-spin")
	})

	it("renders every variant below the message tier", () => {
		for (const variant of ["status", "note", "bordered", "separator"] as const) {
			const { container } = renderWithProviders(
				<Marker variant={variant}>label</Marker>,
			)
			expect(root(container).className).toContain("text-body-xs")
			expect(root(container).className).toContain("text-muted-foreground")
		}
	})
})

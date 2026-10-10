import { describe, expect, it } from "vitest"
import { renderWithProviders, screen } from "../../test/render"
import { Message } from "./index"

/**
 * Message is layout, so these are layout claims — but the two that matter are
 * not cosmetic. `align="end"` must mirror the row *visually* without touching
 * DOM order, or a screen reader gets the conversation out of sequence; and
 * `grouped` must keep the avatar's column while dropping the avatar, or a run
 * of messages steps left under its own first line.
 */
describe("Message", () => {
	function row(container: HTMLElement) {
		return container.firstElementChild as HTMLElement
	}

	it("publishes messageId as data-message-id — the scroller's handle", () => {
		const { container } = renderWithProviders(
			<Message messageId="m-42">hello</Message>,
		)
		expect(row(container).dataset.messageId).toBe("m-42")
	})

	it("mirrors the row for align='end' without reordering the DOM", () => {
		const { container } = renderWithProviders(
			<Message align="end" header={<span>Carla</span>} footer={<span>Sent</span>}>
				<p>body</p>
			</Message>,
		)
		const el = row(container)
		expect(el.className).toContain("flex-row-reverse")
		// Reading order stays chronological: header, then content, then footer.
		const text = el.textContent
		expect(text?.indexOf("Carla")).toBeLessThan(text?.indexOf("body") ?? -1)
		expect(text?.indexOf("body")).toBeLessThan(text?.indexOf("Sent") ?? -1)
	})

	it("reserves the avatar column when grouped, and empties it", () => {
		const { container } = renderWithProviders(
			<Message grouped avatar={<img alt="Carla" src="/a.png" />}>
				continuation
			</Message>,
		)
		const gutter = row(container).firstElementChild as HTMLElement
		expect(gutter.className).toContain("w-8")
		expect(gutter.childElementCount).toBe(0)
		expect(screen.queryByAltText("Carla")).toBeNull()
	})

	it("renders no gutter at all when there is no avatar and no run to align to", () => {
		const { container } = renderWithProviders(<Message>solo</Message>)
		const first = row(container).firstElementChild as HTMLElement
		expect(first.className).toContain("flex-col")
	})

	it("sizes the gutter from avatarSize, matching Avatar's own scale", () => {
		const { container } = renderWithProviders(
			<Message avatarSize="lg" avatar={<span>CD</span>}>
				body
			</Message>,
		)
		const gutter = row(container).firstElementChild as HTMLElement
		expect(gutter.className).toContain("w-12")
	})

	it("collapses the scroller's gap when grouped", () => {
		const { container } = renderWithProviders(<Message grouped>run</Message>)
		expect(row(container).className).toContain("--message-gap")
		// On the spacing scale, never a fixed rem, so density moves gap and pull together.
		expect(row(container).className).not.toMatch(/\drem/)
		expect(row(container).dataset.grouped).toBe("")
	})

	it("omits header and footer wrappers when there is nothing to put in them", () => {
		const { container } = renderWithProviders(<Message>just body</Message>)
		const body = row(container).firstElementChild as HTMLElement
		expect(body.childElementCount).toBe(0)
		expect(body.textContent).toBe("just body")
	})
})

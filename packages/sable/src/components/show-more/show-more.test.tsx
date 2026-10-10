import { render } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { ShowMore } from "./show-more"

/** jsdom has no layout: give the content box a height and its text a line height. */
function stubLayout(contentHeight: number, lineHeight: string) {
	vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(contentHeight)
	const real = window.getComputedStyle
	vi.spyOn(window, "getComputedStyle").mockImplementation((el) => {
		const style = real(el)
		return new Proxy(style, {
			get: (target, key) =>
				key === "lineHeight" ? lineHeight : Reflect.get(target, key),
		})
	})
}

afterEach(() => vi.restoreAllMocks())

describe("ShowMore", () => {
	it("clips to a line count measured from the content's line height", () => {
		stubLayout(400, "24px")
		const { container, getByRole } = render(
			<ShowMore collapsedLines={3}>
				<p>Long text</p>
			</ShowMore>,
		)
		const clip = container.querySelector<HTMLElement>(".overflow-hidden")
		expect(clip?.style.maxHeight).toBe("72px")
		expect(getByRole("button", { name: /Show more/ })).toHaveAttribute("aria-expanded", "false")
	})

	it("shows no toggle when the content fits the collapsed lines", () => {
		stubLayout(48, "24px")
		const { queryByRole } = render(
			<ShowMore collapsedLines={3}>
				<p>Short</p>
			</ShowMore>,
		)
		expect(queryByRole("button")).toBeNull()
	})

	it("keeps collapsedHeight as the px fallback", () => {
		stubLayout(400, "24px")
		const { container } = render(
			<ShowMore collapsedHeight={120}>
				<p>Long text</p>
			</ShowMore>,
		)
		expect(container.querySelector<HTMLElement>(".overflow-hidden")?.style.maxHeight).toBe("120px")
	})
})

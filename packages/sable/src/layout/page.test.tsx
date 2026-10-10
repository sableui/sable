import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Page } from "./Page"

describe("Page", () => {
	it("composes a capped Region wrapping a vertically-rhythmic Stack", () => {
		const { container } = render(
			<Page max="feed" gap={3}>
				x
			</Page>,
		)
		const region = container.firstChild as HTMLElement
		expect(region.style.maxWidth).toBe("var(--region-feed)")
		expect(region.style.marginInline).toBe("auto")

		const stack = region.firstChild as HTMLElement
		expect(stack.style.display).toBe("flex")
		expect(stack.style.flexDirection).toBe("column")
		expect(stack.style.gap).toBe("calc(var(--rhythm-unit) * 3)")
	})

	it("defaults the section gap to 4 rhythm units", () => {
		const { container } = render(<Page>x</Page>)
		const stack = (container.firstChild as HTMLElement).firstChild as HTMLElement
		expect(stack.style.gap).toBe("calc(var(--rhythm-unit) * 4)")
	})

	it("renders a semantic element via `as`", () => {
		const { container } = render(<Page as="main">x</Page>)
		expect((container.firstChild as HTMLElement).tagName).toBe("MAIN")
	})
})

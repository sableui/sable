import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Browser } from "./browser"

describe("Browser elevation", () => {
	it("rests raised, and lifts to the top shadow step as a hero", () => {
		const { container, rerender } = render(<Browser url="atlas.example">Page</Browser>)
		const frame = () => container.firstElementChild as HTMLElement
		expect(frame().className).toContain("shadow-sm")
		rerender(
			<Browser url="atlas.example" elevation="hero">
				Page
			</Browser>,
		)
		expect(frame().className).toContain("shadow-xl")
		expect(frame().className).not.toContain("shadow-sm")
	})
})

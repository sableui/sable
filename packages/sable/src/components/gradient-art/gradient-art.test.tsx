import { describe, expect, it } from "vitest"
import { renderWithProviders, screen } from "../../test/render"
import { GradientArt } from "./index"

describe("GradientArt", () => {
	function root(container: HTMLElement) {
		return container.firstElementChild as HTMLElement
	}

	it("paints the CSS fallback from the theme's art tokens, so it shows without WebGL", () => {
		// jsdom has no WebGL2: this is exactly what prerendered HTML and an old browser get.
		const { container } = renderWithProviders(<GradientArt seed="gold rush" />)
		const background = root(container).style.background
		// The preset's own art direction, not a fixed palette: each preset sets --art-*.
		expect(background).toContain("var(--art-1)")
		expect(background).toContain("var(--art-ground)")
		expect(container.querySelector("canvas")).not.toHaveAttribute("data-painted")
	})

	it("keeps an item's composition for its seed, and gives another seed its own", () => {
		const paint = (seed: string) => root(renderWithProviders(<GradientArt seed={seed} />).container).style.background
		expect(paint("Mara Okafor")).toBe(paint("Mara Okafor"))
		expect(paint("Mara Okafor")).not.toBe(paint("Sam Rivera"))
	})

	it("paints only the tones it is given", () => {
		const { container } = renderWithProviders(<GradientArt tones={["edition"]} />)
		const background = root(container).style.background
		expect(background).toContain("var(--tone-edition)")
		expect(background).not.toContain("var(--tone-info)")
	})

	it("hides the art from assistive tech and renders children above it", () => {
		renderWithProviders(
			<GradientArt seed="Mara Okafor" aria-label="Mara Okafor" role="img">
				MO
			</GradientArt>,
		)
		expect(screen.getByRole("img", { name: "Mara Okafor" })).toHaveTextContent("MO")
		expect(document.querySelector("canvas")).toHaveAttribute("aria-hidden", "true")
	})
})

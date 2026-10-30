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

	it("turns each seed's palette within the preset's family, so one-hue palettes still tell items apart", () => {
		const turn = (seed: string) => /calc\(h \+ (-?[\d.]+)\)/.exec(root(renderWithProviders(<GradientArt seed={seed} />).container).style.background)?.[1]
		const turns = ["Mara Okafor", "Juno Avery", "Low tide", "Sable Sound"].map(turn)
		// Every seed gets a bounded turn, and different seeds mostly differ.
		for (const t of turns) expect(Math.abs(Number(t))).toBeLessThanOrEqual(20)
		expect(new Set(turns).size).toBeGreaterThan(2)
		// Deterministic: the same seed is the same art on every render.
		expect(turn("Mara Okafor")).toBe(turns[0])
	})

	it("keeps an item's composition for its seed, and gives another seed its own", () => {
		const paint = (seed: string) => root(renderWithProviders(<GradientArt seed={seed} />).container).style.background
		expect(paint("Mara Okafor")).toBe(paint("Mara Okafor"))
		expect(paint("Mara Okafor")).not.toBe(paint("Sam Rivera"))
	})

	it("paints only the tones it is given", () => {
		const { container } = renderWithProviders(<GradientArt tones={["1"]} />)
		const background = root(container).style.background
		expect(background).toContain("var(--tone-1)")
		expect(background).not.toContain("var(--tone-info)")
	})

	it("leaves vivid art exactly as it was: the default intensity changes nothing", () => {
		const paint = (intensity?: "vivid") => root(renderWithProviders(<GradientArt seed="gold rush" intensity={intensity} />).container)
		const vivid = paint("vivid")
		expect(vivid.style.background).toBe(paint().style.background)
		expect(vivid).toHaveAttribute("data-intensity", "vivid")
		expect(vivid.style.background).not.toContain("calc(c * 0.5)")
		expect(vivid.style.background).not.toContain("clamp(0.84")
	})

	it("washes every colour and the ground to a pastel of itself when soft", () => {
		const vivid = root(renderWithProviders(<GradientArt seed="gold rush" />).container).style.background
		const element = root(renderWithProviders(<GradientArt seed="gold rush" intensity="soft" />).container)
		const soft = element.style.background
		expect(element).toHaveAttribute("data-intensity", "soft")
		expect(soft).not.toBe(vivid)
		// Still the preset's own art tokens underneath, so it follows every theme and mode.
		expect(soft).toContain("var(--art-1)")
		expect(soft).toContain("var(--art-ground)")
		// One pastel per palette slot (six) and one for the ground: nothing is left vivid.
		// High lightness, half the chroma (capped so it stays in gamut), the same hue.
		const pastel = /clamp\(0\.84, calc\(0\.8 \+ l \* 0\.15\), 0\.95\) min\(calc\(c \* 0\.5\), 0\.09\) h\)/g
		expect(soft.match(pastel)).toHaveLength(7)
	})

	it("washes `tones` overrides as well", () => {
		const { container } = renderWithProviders(<GradientArt tones={["1", "info"]} intensity="soft" />)
		const background = root(container).style.background
		expect(background).toContain("var(--tone-1)")
		expect(background.match(/calc\(c \* 0\.5\)/g)).toHaveLength(3)
	})

	it("paints linear art as two neighbouring colours, with no shader", () => {
		const { container } = renderWithProviders(<GradientArt variant="linear" seed="MO" />)
		const background = root(container).style.background
		expect(background).toMatch(/^linear-gradient\(135deg in oklab, /)
		expect(background.match(/min\(calc\(l \+ 0\.06\), 0\.97\) c calc\(h \+ 45\)/g)).toHaveLength(1)
		expect(container.querySelector("canvas")).toBeNull()
		expect(root(container)).toHaveAttribute("data-variant", "linear")
	})

	it("leads linear art with a slot every preset sets, never an optional one", () => {
		const lead = (seed: string) => root(renderWithProviders(<GradientArt variant="linear" seed={seed} />).container).style.background
		const seeds = Array.from({ length: 40 }, (_, i) => `person ${i}`)
		for (const seed of seeds) expect(lead(seed)).toMatch(/var\(--art-[1-4]\)/)
		expect(new Set(seeds.map((seed) => /var\(--art-\d\)/.exec(lead(seed))?.[0])).size).toBe(4)
	})

	it("paints vivid linear art bright and saturated, and leaves soft a pastel", () => {
		const paint = (intensity: "vivid" | "soft") => root(renderWithProviders(<GradientArt variant="linear" seed="MO" intensity={intensity} />).container).style.background
		const lead = /0\.\d{3} min\(calc\(c \* 1\.6\), 0\.24\) h\)/
		expect(paint("vivid")).toMatch(lead)
		expect(paint("soft")).not.toMatch(lead)
		expect(paint("soft")).toContain("calc(c * 0.5)")
	})

	it("sets a linear lead's lightness by seed, inside the bright band", () => {
		const light = (seed: string) => Number(/(0\.\d{3}) min\(calc\(c \* 1\.6\), 0\.24\) h\)/.exec(root(renderWithProviders(<GradientArt variant="linear" seed={seed} />).container).style.background)?.[1])
		const lights = Array.from({ length: 40 }, (_, i) => light(`person ${i}`))
		for (const l of lights) {
			expect(l).toBeGreaterThanOrEqual(0.58)
			expect(l).toBeLessThanOrEqual(0.66)
		}
		expect(new Set(lights).size).toBeGreaterThan(10)
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

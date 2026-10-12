import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ThemeSelector } from "./theme-selector"

describe("ThemeSelector", () => {
	it("renders built-in themes as a radiogroup", () => {
		render(<ThemeSelector value="sable" onValueChange={() => {}} />)

		expect(screen.getByRole("radiogroup", { name: "Design theme" })).toBeInTheDocument()
		expect(screen.getByRole("radio", { name: /Sable/ })).toHaveAttribute(
			"aria-checked",
			"true",
		)
		expect(screen.getByRole("radio", { name: /Meridian/ })).toHaveAttribute(
			"aria-checked",
			"false",
		)
	})

	it("reports the selected theme id", () => {
		const onValueChange = vi.fn()
		render(<ThemeSelector value="sable" onValueChange={onValueChange} />)

		fireEvent.click(screen.getByRole("radio", { name: /Verdant/ }))

		expect(onValueChange).toHaveBeenCalledWith("verdant")
	})

	it("shows a type specimen in each tile, in that theme's own face", () => {
		// Type must distinguish the neutral and technical presets.
		render(<ThemeSelector value="sable" onValueChange={() => {}} />)
		const card = screen.getByRole("radio", { name: /Sable/ })
		const specimen = [...card.querySelectorAll("span")].find((s) => s.textContent === "Aa" && s.style.fontFamily)
		expect(specimen, "no type specimen in the tile").toBeDefined()
		expect(specimen?.style.fontFamily).toContain("Figtree")

		const prism = screen.getByRole("radio", { name: /Prism/ })
		const other = [...prism.querySelectorAll("span")].find((s) => s.textContent === "Aa" && s.style.fontFamily)
		expect(other?.style.fontFamily).not.toBe(specimen?.style.fontFamily)
	})

	it("draws the theme's own shape: button and card corners from its radii, inside its scope", () => {
		// Shape is what a colour strip never showed (Meridian square, Poppy soft,
		// Sable a capsule). The miniature reads the scoped theme's real radii.
		const { container } = render(<ThemeSelector value="sable" onValueChange={() => {}} />)
		const preview = container.querySelector('[data-sable-theme="meridian"]')!
		expect(preview.querySelector('[class*="rounded-[calc(var(--button-radius"]')).not.toBeNull()
		expect(preview.querySelector('[class*="rounded-[calc(var(--radius-lg)"]')).not.toBeNull()
		expect(preview.querySelector(".bg-primary")).not.toBeNull()
	})

	it("pins a light preview with .light, so a dark page cannot paint it dark", () => {
		// Theme CSS matches `.dark [data-sable-theme]:not(.light)`.
		const { container } = render(<ThemeSelector value="sable" mode="light" onValueChange={() => {}} />)
		for (const preview of container.querySelectorAll("[data-sable-theme]")) {
			expect(preview).toHaveClass("light")
			expect(preview).not.toHaveClass("dark")
		}
	})

	it("sizes its grid off its own width, never a viewport breakpoint", () => {
		// The bug: `sm:grid-cols-3` keys off the VIEWPORT, so in a 256px popover on
		// a wide screen it forced three columns into 256px. A component cannot
		// learn its container's width from a media query.
		const { container } = render(<ThemeSelector value="sable" onValueChange={() => {}} />)
		const group = container.querySelector('[role="radiogroup"]')!
		expect(group.className).toMatch(/repeat\(auto-fi(ll|t),minmax/)
		expect(group.className).not.toMatch(/sm:grid-cols-/)
	})

	it("truncates both label lines so a narrow card cannot grow instead", () => {
		render(<ThemeSelector value="sable" onValueChange={() => {}} />)
		// The default theme, because it is the one that still carries a caption.
		const card = screen.getByRole("radio", { name: /Sable/ })
		const lines = [...card.querySelectorAll("span")].filter((s) =>
			s.className.includes("truncate"),
		)
		// Name AND caption. Only the name had it, which is why the caption wrapped
		// per word and drove the card from 144px to ~280px tall.
		expect(lines.length).toBeGreaterThanOrEqual(2)
	})

	it("captions a card only when the caption distinguishes it", () => {
		// It used to read "light / dark modes" under every non-default theme —
		// identical text on four of five cards, in the one slot a picker has to
		// tell options apart. A caption that is everywhere is texture, not a
		// caption. Now: the default says so, single-mode themes say so, and
		// supporting both modes (the norm) says nothing.
		render(<ThemeSelector value="sable" onValueChange={() => {}} />)
		expect(screen.getByRole("radio", { name: /Sable/ })).toHaveTextContent("Default")
		expect(screen.queryByText(/modes$/)).toBeNull()
		for (const name of ["Meridian", "Prism", "Verdant", "Ember", "Poppy"]) {
			expect(screen.getByRole("radio", { name: new RegExp(name) })).not.toHaveTextContent(
				/light|dark/i,
			)
		}
	})

	it("still names a constraint a single-mode theme genuinely has", () => {
		const darkOnly = [
			{
				id: "midnight",
				label: "Midnight",
				modes: ["dark"] as const,
				defaultMode: "dark" as const,
				fonts: { sans: "Figtree", mono: "DM Mono" },
			},
		]
		render(
			// biome-ignore lint/suspicious/noExplicitAny: a fixture manifest, not a real ThemeId
			<ThemeSelector value={"midnight" as any} onValueChange={() => {}} themes={darkOnly as any} />,
		)
		expect(screen.getByRole("radio", { name: /Midnight/ })).toHaveTextContent("Dark only")
	})

	describe("layout='list'", () => {
		it("is still a radiogroup with the same semantics", () => {
			render(<ThemeSelector layout="list" value="sable" onValueChange={() => {}} />)
			expect(screen.getByRole("radiogroup", { name: "Design theme" })).toBeInTheDocument()
			expect(screen.getByRole("radio", { name: /Sable/ })).toHaveAttribute(
				"aria-checked",
				"true",
			)
		})

		it("reports the selected theme id", () => {
			const onValueChange = vi.fn()
			render(<ThemeSelector layout="list" value="sable" onValueChange={onValueChange} />)
			fireEvent.click(screen.getByRole("radio", { name: /Verdant/ }))
			expect(onValueChange).toHaveBeenCalledWith("verdant")
		})

		it("puts rows on the control ladder rather than page-register card metrics", () => {
			// The point of the variant: chrome cannot host five 144px cards.
			const { container } = render(
				<ThemeSelector layout="list" value="sable" onValueChange={() => {}} />,
			)
			const row = container.querySelector('[role="radio"]')!
			expect(row.className).toContain("h-(--control-sm)")
			expect(row.className).not.toContain("min-h-36")
			expect(row.className).not.toContain("p-4")
		})

		it("sets each row's label in that theme's own typeface", () => {
			// No room for a specimen row at --control-sm, so the label carries it.
			render(<ThemeSelector layout="list" value="sable" onValueChange={() => {}} />)
			const base = screen.getByRole("radio", { name: /Sable/ })
			const prism = screen.getByRole("radio", { name: /Prism/ })
			const faceOf = (row: HTMLElement) =>
				[...row.querySelectorAll("span")].map((s) => s.style.fontFamily).find(Boolean)
			expect(faceOf(base)).toContain("Figtree")
			expect(faceOf(prism)).not.toBe(faceOf(base))
		})

		it("keeps each row's swatch strip previewing in the requested mode", () => {
			const { container } = render(
				<ThemeSelector layout="list" value="sable" onValueChange={() => {}} mode="dark" />,
			)
			const strips = container.querySelectorAll("[data-sable-theme]")
			expect(strips.length).toBeGreaterThan(0)
			for (const strip of strips) expect(strip.className).toContain("dark")
		})
	})
})

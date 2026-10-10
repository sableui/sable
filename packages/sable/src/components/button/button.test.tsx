import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { renderWithProviders, screen } from "../../test/render"
import { themeIds } from "../../themes"
import {
	CONTRAST_FLOOR,
	type LinearRgb,
	type ParsedColor,
	compositeOver,
	contrastRatio,
	parseColorWithAlpha,
} from "../../themes/contrast"
import { Button } from "./button"

describe("Button", () => {
	it("is enabled and not busy by default", () => {
		renderWithProviders(<Button>Save</Button>)
		const btn = screen.getByRole("button", { name: "Save" })
		expect(btn).toBeEnabled()
		expect(btn).not.toHaveAttribute("aria-busy")
	})

	it("disables, sets aria-busy, and shows a spinner while loading", () => {
		renderWithProviders(<Button loading>Save</Button>)
		const btn = screen.getByRole("button")
		expect(btn).toBeDisabled()
		expect(btn).toHaveAttribute("aria-busy", "true")
		// The Spinner renders its own role=status live region.
		expect(screen.getByRole("status")).toBeInTheDocument()
	})

	it("swaps in loadingLabel while loading", () => {
		renderWithProviders(
			<Button loading loadingLabel="Saving…">
				Save
			</Button>,
		)
		const btn = screen.getByRole("button")
		expect(btn).toHaveTextContent("Saving…")
		expect(btn).not.toHaveTextContent("Save")
	})

	it("does not fire onClick while loading", async () => {
		const user = userEvent.setup()
		const onClick = vi.fn()
		renderWithProviders(
			<Button loading onClick={onClick}>
				Save
			</Button>,
		)
		await user.click(screen.getByRole("button"))
		expect(onClick).not.toHaveBeenCalled()
	})

	it("uses aria-disabled (not the disabled attr) on a polymorphic render element", () => {
		renderWithProviders(
			<Button render={<a href="/x" />} loading>
				Go
			</Button>,
		)
		const link = screen.getByRole("link")
		expect(link).toHaveAttribute("aria-disabled", "true")
		expect(link).toHaveAttribute("aria-busy", "true")
		expect(link).not.toHaveAttribute("disabled")
	})

	it("places iconStart and iconEnd around the label with optical padding", () => {
		renderWithProviders(
			<Button iconStart={<svg data-testid="start" />} iconEnd={<svg data-testid="end" />}>
				Continue
			</Button>,
		)
		const btn = screen.getByRole("button", { name: "Continue" })
		const kids = Array.from(btn.children)
		expect(kids[0]).toBe(screen.getByTestId("start"))
		expect(kids[kids.length - 1]).toBe(screen.getByTestId("end"))
		// md is px-4; each icon side comes in one 2px step.
		expect(btn).toHaveClass("ps-3.5", "pe-3.5")
	})

	it("leaves an icon-only button square (no optical padding without a label)", () => {
		renderWithProviders(<Button size="icon" aria-label="Add" iconStart={<svg />} />)
		expect(screen.getByRole("button", { name: "Add" })).not.toHaveClass("ps-3.5")
	})

	it("replaces iconStart with the spinner while loading", () => {
		renderWithProviders(
			<Button loading iconStart={<svg data-testid="start" />}>
				Save
			</Button>,
		)
		expect(screen.queryByTestId("start")).toBeNull()
		expect(screen.getByRole("status")).toBeInTheDocument()
	})

	it("stays at full opacity while loading — busy, not disabled-looking", () => {
		renderWithProviders(<Button loading>Save</Button>)
		expect(screen.getByRole("button")).toHaveClass("disabled:opacity-100")
	})

	it("shows only the spinner in a loading icon-only button", () => {
		renderWithProviders(
			<Button size="icon" loading aria-label="Next">
				<svg data-testid="glyph" />
			</Button>,
		)
		expect(screen.queryByTestId("glyph")).toBeNull()
		expect(screen.getByRole("status")).toBeInTheDocument()
		expect(screen.getByRole("button", { name: "Next" })).toHaveAttribute("aria-busy", "true")
	})
})

describe("Button on a coloured fill", () => {
	it("on-color tiers paint from the inherited ink, not a page token", () => {
		renderWithProviders(
			<div className="bg-tone-info text-tone-info-foreground">
				<Button variant="on-color">Join</Button>
				<Button variant="on-color-outline">Details</Button>
				<Button variant="on-color-ghost">Later</Button>
			</div>,
		)
		const solid = screen.getByRole("button", { name: "Join" })
		expect(solid).toHaveClass("bg-current")
		// The label colour sits on the children, so `bg-current` keeps reading the
		// INHERITED ink rather than the button's own label colour.
		expect(solid.className).toMatch(/\*:text-\[color:var\(--on-color-fill/)
		expect(solid.className).not.toMatch(/(^|\s)text-(primary|foreground|secondary)/)
		// Text is a direct child (trimLabel's span), so the `*:` label colour reaches it.
		expect(solid.firstElementChild).toHaveTextContent("Join")
		const outline = screen.getByRole("button", { name: "Details" })
		expect(outline).toHaveClass("border-current/50", "bg-transparent")
		// Hover washes AWAY from the ink, never toward it (see the contrast block below).
		expect(screen.getByRole("button", { name: "Later" }).className).toMatch(/hover:bg-\[color:oklch\(from_currentColor/)
	})

	it("swaps the page focus ring for an ink ring on every on-color tier", () => {
		renderWithProviders(<Button variant="on-color-outline">Go</Button>)
		const btn = screen.getByRole("button")
		expect(btn).toHaveClass("focus-visible:ring-current", "focus-visible:ring-offset-transparent")
		expect(btn).not.toHaveClass("focus-visible:ring-ring")
	})

	it("keeps the spinner a direct child, so it takes the fill-coloured label too", () => {
		renderWithProviders(<Button variant="on-color" loading>Save</Button>)
		const status = screen.getByRole("status")
		expect(status.parentElement).toBe(screen.getByRole("button"))
	})
})

/*
 * Contrast, measured on the shipped themes. The solid on-color tier's label is
 * the FILL and its background the INK, so with `--on-color-fill` named its
 * contrast is the theme's own ink-on-fill pair, inverted; unnamed, the label is
 * black or white chosen by the ink's OKLCH lightness. Both are checked here, in
 * every theme and both modes, at rest and on hover.
 */
describe("Button on-color contrast across themes", () => {
	const FILLS = [
		["primary", "primary-foreground"],
		["destructive", "destructive-foreground"],
		["success", "success-foreground"],
		["tone-standard", "tone-standard-foreground"],
		["tone-collectible", "tone-collectible-foreground"],
		["tone-edition", "tone-edition-foreground"],
		["tone-info", "tone-info-foreground"],
		["tone-warning", "tone-warning-foreground"],
		["highlight", "highlight-foreground"],
		// The inverse band: a foreground-coloured section with background ink.
		["foreground", "background"],
	] as const

	function varsFor(themeId: string, appearance: "light" | "dark") {
		const css = readFileSync(
			resolve(__dirname, "../../themes", themeId, `${themeId}.css`),
			"utf8",
		).replace(/\/\*[\s\S]*?\*\//g, "")
		const vars = new Map<string, string>()
		for (const block of css.match(/[^{}]+\{[^{}]*\}/g) ?? []) {
			const selector = block.slice(0, block.indexOf("{"))
			if (appearance === "light" && /\.dark/.test(selector)) continue
			for (const d of block.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) vars.set(d[1], d[2].trim())
		}
		return vars
	}

	function colour(name: string, vars: Map<string, string>, depth = 0): ParsedColor | null {
		const raw = vars.get(name)
		if (!raw || depth > 10) return null
		const identity = raw.match(/^oklch\(\s*from\s+var\(\s*(--[\w-]+)\s*\)\s+l\s+c\s+h\s*(?:\/\s*([\d.]+)(%?))?\s*\)$/i)
		if (identity) {
			const base = colour(identity[1], vars, depth + 1)
			if (!base) return null
			const a = identity[2] === undefined ? 1 : Number(identity[2]) / (identity[3] === "%" ? 100 : 1)
			return { rgb: base.rgb, alpha: base.alpha * a }
		}
		const ref = raw.match(/^var\(\s*(--[\w-]+)/)
		if (ref) return colour(ref[1], vars, depth + 1)
		return parseColorWithAlpha(raw)
	}

	/** OKLab lightness from linear sRGB â€” what `oklch(from currentColor â€¦ l â€¦)` reads. */
	function oklabL([r, g, b]: LinearRgb) {
		const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
		const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
		const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
		return 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
	}
	const BLACK: LinearRgb = [0, 0, 0]
	const WHITE: LinearRgb = [1, 1, 1]
	/** Mirrors the variant's fallback: `calc((0.565 - l) * 1000)` clamps to 0 or 1. */
	const fallbackLabel = (ink: LinearRgb) => (oklabL(ink) > 0.565 ? BLACK : WHITE)

	const cases = themeIds.flatMap((id) =>
		(["light", "dark"] as const).flatMap((mode) =>
			FILLS.map(([fill, ink]) => ({ id, mode, fill, ink })),
		),
	)

	it.each(cases)("$id $mode: on-color on $fill clears 4.5:1", ({ id, mode, fill, ink }) => {
		const vars = varsFor(id, mode)
		const f = colour(`--${fill}`, vars)
		const i = colour(`--${ink}`, vars)
		// A translucent or unresolvable fill is not a band a button sits on.
		if (!f || !i || f.alpha < 1 || i.alpha < 1) return
		// Hover mixes the ink 25% toward the extreme on its own side (white for a
		// light ink, black for a dark one) — away from the fill. Approximated in
		// sRGB; the oklab mix the browser does moves luminance the same direction.
		const extreme = oklabL(i.rgb) > 0.565 ? WHITE : BLACK
		const hover = compositeOver({ rgb: extreme, alpha: 0.25 }, i.rgb)
		const measured = {
			named: contrastRatio(f.rgb, i.rgb),
			namedHover: contrastRatio(f.rgb, hover),
			fallback: contrastRatio(fallbackLabel(i.rgb), i.rgb),
			fallbackHover: contrastRatio(fallbackLabel(i.rgb), hover),
			// Outline / ghost: ink label on the fill; on hover the fill takes a 12%
			// wash of the ink's OPPOSITE (shade under a light ink, tint under a dark).
			ghostHover: contrastRatio(i.rgb, compositeOver({ rgb: fallbackLabel(i.rgb), alpha: 0.12 }, f.rgb)),
		}
		for (const [k, v] of Object.entries(measured)) {
			expect(v, `${id} ${mode} ${fill}/${ink} ${k}`).toBeGreaterThanOrEqual(CONTRAST_FLOOR)
		}
	})
})

describe("Button badge", () => {
	it("anchors the badge on the glyph's corner, outside the accessible name", () => {
		renderWithProviders(
			<Button size="icon" variant="ghost" aria-label="Notifications" badge={<span data-testid="dot" />}>
				<svg data-testid="glyph" />
			</Button>,
		)
		const button = screen.getByRole("button", { name: "Notifications" })
		const anchor = button.querySelector("[data-slot=button-badge-anchor]")
		expect(anchor).not.toBeNull()
		expect(anchor?.className).toContain("relative")
		const dot = screen.getByTestId("dot")
		expect(dot.parentElement?.className).toContain("absolute")
		expect(anchor?.contains(screen.getByTestId("glyph"))).toBe(true)
	})

	it("renders no anchor without a badge", () => {
		renderWithProviders(<Button>Save</Button>)
		expect(screen.getByRole("button").querySelector("[data-slot=button-badge-anchor]")).toBeNull()
	})
})

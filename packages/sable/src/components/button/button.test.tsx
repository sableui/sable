import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { act, fireEvent, renderWithProviders, screen } from "../../test/render"
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

	it("refuses presses, sets aria-busy, and shows a spinner while loading", () => {
		renderWithProviders(<Button loading>Save</Button>)
		const btn = screen.getByRole("button")
		// aria-disabled, not `disabled`: disabling the focused button drops focus.
		expect(btn).not.toHaveAttribute("disabled")
		expect(btn).toHaveAttribute("aria-disabled", "true")
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

	it("keeps focus when it starts loading", () => {
		const { rerender } = renderWithProviders(<Button>Add to cart</Button>)
		const btn = screen.getByRole("button")
		btn.focus()
		rerender(<Button loading>Add to cart</Button>)
		expect(document.activeElement).toBe(btn)
	})

	it("refuses keyboard activation while loading", async () => {
		const user = userEvent.setup()
		const onClick = vi.fn()
		renderWithProviders(
			<Button loading onClick={onClick}>
				Save
			</Button>,
		)
		screen.getByRole("button").focus()
		await user.keyboard("{Enter} ")
		expect(onClick).not.toHaveBeenCalled()
	})

	it("refuses Enter and Space in its own onKeyDown while loading, and lets Tab through", () => {
		const onKeyDown = vi.fn()
		renderWithProviders(
			<Button loading onKeyDown={onKeyDown}>
				Open
			</Button>,
		)
		const btn = screen.getByRole("button")
		fireEvent.keyDown(btn, { key: "Enter" })
		fireEvent.keyDown(btn, { key: " " })
		expect(onKeyDown).not.toHaveBeenCalled()
		fireEvent.keyDown(btn, { key: "Tab" })
		expect(onKeyDown).toHaveBeenCalledTimes(1)
	})

	it("does not submit its form while loading", () => {
		const onSubmit = vi.fn((event: Event) => event.preventDefault())
		renderWithProviders(
			<form onSubmit={(event) => onSubmit(event.nativeEvent)}>
				<Button type="submit" loading>
					Pay
				</Button>
			</form>,
		)
		screen.getByRole("button").click()
		expect(onSubmit).not.toHaveBeenCalled()
	})

	it("holds loading until an async onClick settles, and runs it once", async () => {
		let settle: () => void = () => {}
		const onClick = vi.fn(() => new Promise<void>((resolve) => { settle = resolve }))
		renderWithProviders(<Button onClick={onClick}>Add to cart</Button>)
		const btn = screen.getByRole("button")
		// Three presses in one tick: the state has not re-rendered between them.
		act(() => {
			btn.click()
			btn.click()
			btn.click()
		})
		expect(onClick).toHaveBeenCalledTimes(1)
		expect(btn).toHaveAttribute("aria-busy", "true")
		await act(async () => settle())
		expect(btn).not.toHaveAttribute("aria-busy")
		act(() => btn.click())
		expect(onClick).toHaveBeenCalledTimes(2)
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
		// Each icon side comes in one 2px step under the size's --button-px, and
		// names that side's padding so a bleed there moves by the same amount.
		expect(btn).toHaveClass(
			"[--button-ps:calc(var(--button-px)-(--spacing(0.5)))]",
			"ps-(--button-ps)",
			"[--button-pe:calc(var(--button-px)-(--spacing(0.5)))]",
			"pe-(--button-pe)",
		)
	})

	it("leaves an icon-only button square (no optical padding without a label)", () => {
		renderWithProviders(<Button size="icon" aria-label="Add" iconStart={<svg />} />)
		expect(screen.getByRole("button", { name: "Add" })).not.toHaveClass("ps-(--button-ps)")
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
		["tone-3", "tone-3-foreground"],
		["tone-2", "tone-2-foreground"],
		["tone-1", "tone-1-foreground"],
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

describe("Button field variant", () => {
	it("wears the xs field rung's shell, not the button pill", () => {
		renderWithProviders(
			<Button variant="field" size="xs">
				Figtree
			</Button>,
		)
		const cls = screen.getByRole("button").className
		expect(cls).toContain("bg-panel-field")
		expect(cls).toContain("hover:bg-panel-field-hover")
		// The field's corner replaces the pill; cn() must drop the base radius.
		expect(cls).toContain("rounded-[var(--panel-field-radius,var(--radius-xs))]")
		expect(cls).not.toContain("rounded-[var(--button-radius,9999px)]")
	})

	describe("bleed", () => {
		// The padding READS --button-px, so a bleed of --button-px is always
		// exactly the padding — at every size, in any density scope.
		it.each([
			["xs", "[--button-px:--spacing(2)]"],
			["sm", "[--button-px:--spacing(3)]"],
			["md", "[--button-px:--spacing(4)]"],
			["cta", "[--button-px:--spacing(5)]"],
		] as const)("names the %s padding as --button-px and pads with it", (size, px) => {
			renderWithProviders(<Button size={size}>Go</Button>)
			expect(screen.getByRole("button")).toHaveClass(px, "px-(--button-px)")
		})

		it.each([
			["icon", "[--button-px:calc((var(--control-md)-var(--button-icon))/2)]"],
			["icon-sm", "[--button-px:calc((var(--control-sm)-var(--button-icon))/2)]"],
			["icon-xs", "[--button-px:calc((var(--control-xs)-var(--button-icon))/2)]"],
		] as const)("gives the square %s size its inset to the glyph", (size, px) => {
			renderWithProviders(<Button size={size} variant="ghost" aria-label="More" bleed="end" />)
			const btn = screen.getByRole("button")
			expect(btn).toHaveClass(px, "-me-(--button-pe,var(--button-px))")
			expect(btn).not.toHaveClass("px-(--button-px)")
		})

		it.each([
			["start", ["-ms-(--button-ps,var(--button-px))"], ["-me-(--button-pe,var(--button-px))"]],
			["end", ["-me-(--button-pe,var(--button-px))"], ["-ms-(--button-ps,var(--button-px))"]],
			["both", ["-ms-(--button-ps,var(--button-px))", "-me-(--button-pe,var(--button-px))"], []],
		] as const)("bleeds a ghost button at %s by its own padding", (bleed, has, hasNot) => {
			renderWithProviders(
				<Button variant="ghost" size="sm" bleed={bleed}>
					View all
				</Button>,
			)
			const btn = screen.getByRole("button")
			expect(btn).toHaveAttribute("data-bleed", bleed)
			expect(btn).toHaveClass(...has)
			for (const c of hasNot) expect(btn).not.toHaveClass(c)
		})

		it("bleeds link and on-color-ghost too — every variant without a visible edge", () => {
			renderWithProviders(
				<>
					<Button variant="link" bleed="end">Docs</Button>
					<Button variant="on-color-ghost" bleed="end">Later</Button>
				</>,
			)
			for (const name of ["Docs", "Later"])
				expect(screen.getByRole("button", { name })).toHaveClass("-me-(--button-pe,var(--button-px))")
		})

		it.each(["primary", "secondary", "outline", "destructive", "floating", "field", "on-color", "on-color-outline"] as const)(
			"leaves a %s button's edge on the line (no-op)",
			(variant) => {
				renderWithProviders(
					<Button variant={variant} bleed="both">
						Save
					</Button>,
				)
				const btn = screen.getByRole("button")
				expect(btn).not.toHaveAttribute("data-bleed")
				expect(btn.className).not.toMatch(/-m[se]-\(/)
			},
		)

		it("marks an unset borderless button auto, for a container to align, with no margin of its own", () => {
			renderWithProviders(<Button variant="ghost">Skip</Button>)
			const btn = screen.getByRole("button")
			expect(btn).toHaveAttribute("data-bleed", "auto")
			expect(btn.className).not.toMatch(/-m[se]-\(/)
		})

		it("opts out of a container's alignment with none", () => {
			renderWithProviders(
				<Button variant="ghost" bleed="none">
					Skip
				</Button>,
			)
			const btn = screen.getByRole("button")
			expect(btn).toHaveAttribute("data-bleed", "none")
			expect(btn.className).not.toMatch(/-m[se]-\(/)
		})

		it("moves by the icon side's optical padding, which the bleed var tracks", () => {
			renderWithProviders(
				<Button variant="ghost" size="sm" bleed="start" iconStart={<svg />}>
					Add task
				</Button>,
			)
			// --button-ps is set on this side, and the margin reads it first.
			expect(screen.getByRole("button")).toHaveClass(
				"[--button-ps:calc(var(--button-px)-(--spacing(0.5)))]",
				"-ms-(--button-ps,var(--button-px))",
			)
		})
	})
})

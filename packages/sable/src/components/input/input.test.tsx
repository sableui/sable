import { describe, expect, it } from "vitest"
import { Density } from "../../lib/density"
import { renderWithProviders, screen } from "../../test/render"
import { Input } from "./index"

/**
 * The iOS 16px focus-zoom floor.
 *
 * Mobile Safari zooms the page whenever a focused field's computed font-size is
 * under 16px, and the page body tier is 15px (0.9375rem at a 16px root). The
 * field carries a second paired tier under `max-sm:` for that; these assertions
 * exist so nobody "simplifies" it back to a single tier. jsdom applies no
 * stylesheet, so the check is on the class contract, not on computed pixels.
 */
describe("Input — mobile type floor", () => {
	it("renders a >=16px paired tier below sm and the designed tier at sm and up", () => {
		renderWithProviders(<Input placeholder="Email" />)
		const input = screen.getByPlaceholderText("Email")
		expect(input.className).toContain("max-sm:text-body-lg")
		expect(input.className).toContain("text-body-md")
	})

	it("never hand-sets a font-size next to the paired tier", () => {
		renderWithProviders(<Input placeholder="Email" />)
		expect(screen.getByPlaceholderText("Email").className).not.toMatch(
			/\btext-(?:xs|sm|base|lg|xl|\[)/,
		)
	})

	it("leaves the compact register alone — the page tiers are clamped there anyway", () => {
		renderWithProviders(
			<Density value="compact">
				<Input placeholder="Email" />
			</Density>,
		)
		const input = screen.getByPlaceholderText("Email")
		expect(input.className).toContain("text-ui-md")
		expect(input.className).not.toContain("max-sm:")
	})
})

describe("Input — the field ladder", () => {
	it("stands on each rung of the shared field ladder", () => {
		renderWithProviders(
			<>
				<Input placeholder="md" />
				<Input placeholder="sm" size="sm" />
				<Input placeholder="xs" size="xs" />
			</>,
		)
		expect(screen.getByPlaceholderText("md").className).toContain("h-(--control-md)")
		const sm = screen.getByPlaceholderText("sm").className
		expect(sm).toContain("h-(--control-sm)")
		// sm is md one rung down — the same raised field, not the inset panel fill.
		expect(sm).toContain("border-field-border")
		expect(sm).not.toContain("bg-panel-field")
		expect(screen.getByPlaceholderText("xs").className).toContain("h-(--control-xs)")
	})
})

import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { PanelSection, PropertyGroup, PropertyRow } from "./panel-section"

describe("PropertyGroup", () => {
	it("names its value while closed, and opens to its rows", () => {
		render(
			<PanelSection title="Color">
				<PropertyGroup label="Neutrals" summary="Cool">
					<PropertyRow label="Tint">
						<span>controls</span>
					</PropertyRow>
				</PropertyGroup>
			</PanelSection>,
		)
		const row = screen.getByRole("button", { name: /Neutrals/ })
		expect(row).toHaveAccessibleName(/Cool/)
		expect(row).toHaveAttribute("aria-expanded", "false")
		fireEvent.click(row)
		expect(row).toHaveAttribute("aria-expanded", "true")
		expect(screen.getByText("controls")).toBeVisible()
	})

	it("opens each group on its own, so two can be compared", () => {
		render(
			<PanelSection title="Color">
				<PropertyGroup label="Tones" defaultOpen>
					<span>tones</span>
				</PropertyGroup>
				<PropertyGroup label="Neutrals" defaultOpen>
					<span>neutrals</span>
				</PropertyGroup>
			</PanelSection>,
		)
		expect(screen.getByRole("button", { name: "Tones" })).toHaveAttribute("aria-expanded", "true")
		expect(screen.getByRole("button", { name: "Neutrals" })).toHaveAttribute("aria-expanded", "true")
	})
})

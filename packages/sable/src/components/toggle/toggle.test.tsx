import userEvent from "@testing-library/user-event"
import { axe } from "jest-axe"
import { describe, expect, it } from "vitest"
import { renderWithProviders, screen } from "../../test/render"
import { Toggle, ToggleGroup } from "./toggle"

describe("ToggleGroup", () => {
	it("retains vertical orientation when explicitly used as a toolbar", async () => {
		const { container } = renderWithProviders(
			<ToggleGroup role="toolbar" aria-label="Formatting" orientation="vertical">
				<Toggle value="bold">Bold</Toggle>
			</ToggleGroup>,
		)
		expect(screen.getByRole("toolbar")).toHaveAttribute("aria-orientation", "vertical")
		expect((await axe(container)).violations).toEqual([])
	})
	it.each(["horizontal", "vertical"] as const)("keeps %s navigation without invalid group ARIA", async (orientation) => {
		const user = userEvent.setup()
		const { container } = renderWithProviders(
			<ToggleGroup aria-label="Category" orientation={orientation}>
				<Toggle value="lamp">Lamp</Toggle>
				<Toggle value="chair">Chair</Toggle>
			</ToggleGroup>,
		)
		expect((await axe(container)).violations).toEqual([])
		await user.tab()
		await user.keyboard(orientation === "vertical" ? "{ArrowDown}" : "{ArrowRight}")
		expect(screen.getByRole("button", { name: "Chair" })).toHaveFocus()
		await user.keyboard(" ")
		expect(screen.getByRole("button", { name: "Chair" })).toHaveAttribute("aria-pressed", "true")
	})
})

describe("Toggle", () => {
	it("spaces an icon from its label like Button", () => {
		renderWithProviders(<Toggle aria-label="Bold"><svg /> Bold</Toggle>)
		expect(screen.getByRole("button", { name: "Bold" })).toHaveClass("gap-(--control-gap)")
	})
})

describe("ToggleGroup appearance", () => {
	it("draws the shared segmented track and fills the pressed option", () => {
		renderWithProviders(
			<ToggleGroup appearance="segmented" aria-label="View" defaultValue={["list"]}>
				<Toggle value="list">List</Toggle>
				<Toggle value="grid">Grid</Toggle>
			</ToggleGroup>,
		)
		const group = screen.getByRole("group", { name: "View" })
		expect(group).toHaveAttribute("data-appearance", "segmented")
		// Corners follow the theme's control shape (a capsule only by default).
		expect(group.className).toContain("rounded-[var(--button-radius,9999px)]")
		const list = screen.getByRole("button", { name: "List" })
		expect(list).toHaveAttribute("aria-pressed", "true")
		expect(list.className).toContain("rounded-[max(0px,calc(var(--button-radius,9999px)-3px))]")
		expect(list.className).toContain("data-[pressed]:bg-accent")
	})

	it("keeps an unpressed toggle's hover off the pressed fill", () => {
		renderWithProviders(<Toggle aria-label="Pin">Pin</Toggle>)
		const button = screen.getByRole("button", { name: "Pin" })
		expect(button.className).not.toContain("hover:bg-accent")
		expect(button.className).toContain("sable-surface-interactive")
	})
})

describe("ToggleGroup segmented glide", () => {
	const gliders = (el: HTMLElement) => el.querySelectorAll("[data-highlight-glide]")

	it("draws ONE fill that follows the pressed option in single-select", () => {
		renderWithProviders(
			<ToggleGroup appearance="segmented" aria-label="Range" defaultValue={["week"]}>
				<Toggle value="day">Day</Toggle>
				<Toggle value="week">Week</Toggle>
				<Toggle value="month">Month</Toggle>
			</ToggleGroup>,
		)
		const group = screen.getByRole("group", { name: "Range" })
		expect(gliders(group)).toHaveLength(1)
		const glider = gliders(group)[0]
		expect(glider).toHaveClass("motion-glide", "bg-accent")
		expect(glider).toHaveAttribute("aria-hidden", "true")
		// Mounted, it marks the track so the options' own fill steps aside.
		expect(group).toHaveAttribute("data-glide")
		expect(group.className).toContain("[&[data-glide]>[data-pressed]]:bg-transparent")
		expect(glider).toHaveStyle({ opacity: "1" })
	})

	it("hides the fill when nothing is pressed", async () => {
		const user = userEvent.setup()
		renderWithProviders(
			<ToggleGroup appearance="segmented" aria-label="Range" defaultValue={["day"]}>
				<Toggle value="day">Day</Toggle>
				<Toggle value="week">Week</Toggle>
			</ToggleGroup>,
		)
		const group = screen.getByRole("group", { name: "Range" })
		await user.click(screen.getByRole("button", { name: "Day" }))
		expect(screen.getByRole("button", { name: "Day" })).toHaveAttribute("aria-pressed", "false")
		expect(gliders(group)[0]).toHaveStyle({ opacity: "0" })
	})

	it("keeps a fill per option in multi-select, where there is no one place to glide to", () => {
		renderWithProviders(
			<ToggleGroup appearance="segmented" multiple aria-label="Format" defaultValue={["bold"]}>
				<Toggle value="bold">Bold</Toggle>
				<Toggle value="italic">Italic</Toggle>
			</ToggleGroup>,
		)
		const group = screen.getByRole("group", { name: "Format" })
		expect(gliders(group)).toHaveLength(0)
		expect(group).not.toHaveAttribute("data-glide")
		expect(screen.getByRole("button", { name: "Bold" }).className).toContain("data-[pressed]:bg-accent")
	})

	it("does not glide the default appearance", () => {
		renderWithProviders(
			<ToggleGroup aria-label="View" defaultValue={["list"]}>
				<Toggle value="list">List</Toggle>
			</ToggleGroup>,
		)
		expect(gliders(screen.getByRole("group", { name: "View" }))).toHaveLength(0)
	})

	it("turns motion down on its own root with the motion prop", () => {
		const { rerender } = renderWithProviders(
			<ToggleGroup appearance="segmented" aria-label="Range" defaultValue={["day"]}>
				<Toggle value="day">Day</Toggle>
			</ToggleGroup>,
		)
		const group = () => screen.getByRole("group", { name: "Range" })
		expect(group()).not.toHaveAttribute("data-motion")
		rerender(
			<ToggleGroup appearance="segmented" motion="subtle" aria-label="Range" defaultValue={["day"]}>
				<Toggle value="day">Day</Toggle>
			</ToggleGroup>,
		)
		expect(group()).toHaveAttribute("data-motion", "subtle")
	})
})

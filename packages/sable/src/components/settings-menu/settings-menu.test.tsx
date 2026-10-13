import { describe, expect, it, vi } from "vitest"
import { MenuRadioGroup, MenuRadioItem } from "../menu"
import { fireEvent, renderWithProviders, screen, waitFor } from "../../test/render"
import { SettingsMenu, SettingsRow } from "./index"

function Fixture({
	onModelChange = () => {},
	model = "sol",
}: {
	onModelChange?: (value: string) => void
	model?: string
}) {
	return (
		<SettingsMenu summary="5.6 Sol High">
			<SettingsRow label="Model" value="5.6 Sol">
				<MenuRadioGroup value={model} onValueChange={onModelChange}>
					<MenuRadioItem value="sol">5.6 Sol</MenuRadioItem>
					<MenuRadioItem value="lite">5.6 Lite</MenuRadioItem>
				</MenuRadioGroup>
			</SettingsRow>
			<SettingsRow label="Effort" value="High" />
		</SettingsMenu>
	)
}

describe("SettingsMenu", () => {
	const trigger = () => screen.getByRole("button", { name: "Change settings" })

	it("states the current settings on the trigger, and still has a name of its own", () => {
		// The visible text is DATA. Without an explicit label a screen reader
		// announces "5.6 Sol High" with no hint that it is a control.
		renderWithProviders(<Fixture />)
		expect(trigger()).toHaveTextContent("5.6 Sol High")
		expect(trigger()).toHaveAccessibleName("Change settings")
	})

	it("opens to rows that each carry their own value", async () => {
		renderWithProviders(<Fixture />)
		fireEvent.click(trigger())
		await waitFor(() => {
			expect(screen.getByText("Model")).toBeInTheDocument()
		})
		// One glance answers every setting — no row makes you open it to find out.
		expect(screen.getByText("5.6 Sol")).toBeInTheDocument()
		expect(screen.getByText("Effort")).toBeInTheDocument()
		expect(screen.getByText("High")).toBeInTheDocument()
	})

	it("gives a row with children a submenu, and one without a flat row", async () => {
		renderWithProviders(<Fixture />)
		fireEvent.click(trigger())
		await waitFor(() => {
			expect(
				screen.getByRole("menuitem", { name: /Model/ }),
			).toHaveAttribute("aria-haspopup", "menu")
		})
		// "Effort" has no options to choose from, so it is a statement, not a control.
		expect(screen.queryByRole("menuitem", { name: /Effort/ })).toBeNull()
	})

	it("opens straight to the options when it holds one setting: one click, not two", async () => {
		const onValueChange = vi.fn()
		renderWithProviders(
			<SettingsMenu summary="Then: Pending">
				<SettingsRow label="After sending" value="Pending">
					<MenuRadioGroup value="pending" onValueChange={onValueChange}>
						<MenuRadioItem value="pending">Pending</MenuRadioItem>
						<MenuRadioItem value="resolved">Resolved</MenuRadioItem>
					</MenuRadioGroup>
				</SettingsRow>
			</SettingsMenu>,
		)
		fireEvent.click(trigger())
		const resolved = await screen.findByRole("menuitemradio", { name: "Resolved" })
		expect(screen.getByText("After sending")).toBeInTheDocument()
		expect(screen.queryByRole("menuitem", { name: /After sending/ })).toBeNull()
		fireEvent.click(resolved)
		expect(onValueChange).toHaveBeenCalledWith("resolved", expect.anything())
	})

	it("reports the chosen option as checked, not just ticked", async () => {
		renderWithProviders(<Fixture model="lite" />)
		fireEvent.click(trigger())
		const row = await screen.findByRole("menuitem", { name: /Model/ })
		fireEvent.click(row)

		const options = await screen.findAllByRole("menuitemradio")
		const [sol, lite] = options
		expect(sol).toHaveAttribute("aria-checked", "false")
		expect(lite).toHaveAttribute("aria-checked", "true")
	})

	it("reports a change out", async () => {
		const onModelChange = vi.fn()
		renderWithProviders(<Fixture onModelChange={onModelChange} />)
		fireEvent.click(trigger())
		fireEvent.click(await screen.findByRole("menuitem", { name: /Model/ }))
		fireEvent.click(await screen.findByRole("menuitemradio", { name: "5.6 Lite" }))
		expect(onModelChange).toHaveBeenCalledWith("lite", expect.anything())
	})

	it("reads its height off the density ladder rather than hardcoding one", () => {
		renderWithProviders(<Fixture />)
		expect(trigger().className).toContain("h-(--control-sm)")
	})

	it("takes a resting fill for surfaces where a ghost trigger would float", () => {
		renderWithProviders(
			<SettingsMenu summary="x" variant="subtle" size="xs">
				<SettingsRow label="A" value="1" />
			</SettingsMenu>,
		)
		const el = screen.getByRole("button", { name: "Change settings" })
		// `subtle` renders through Button `secondary`.
		expect(el.className).toContain("bg-secondary")
		expect(el.className).toContain("h-(--control-xs)")
	})

	it("can be disabled", () => {
		renderWithProviders(
			<SettingsMenu summary="x" disabled>
				<SettingsRow label="A" value="1" />
			</SettingsMenu>,
		)
		expect(screen.getByRole("button", { name: "Change settings" })).toBeDisabled()
	})

	it("draws a flat row on the menu item recipe, with the chevron column reserved", async () => {
		renderWithProviders(<Fixture />)
		fireEvent.click(trigger())
		const effort = await screen.findByText("Effort")
		const row = effort.parentElement as HTMLElement
		// Same inset, gap and concentric radius as MenuItem / MenuSubmenuTrigger.
		expect(row.className).toContain("rounded-popup-item")
		expect(row.className).toContain("px-(--item-px)")
		expect(row.className).toContain("gap-(--item-gap)")
		// A trailing (invisible) chevron keeps its value on the submenu rows' edge.
		expect(row.lastElementChild?.getAttribute("class") ?? "").toContain("invisible")
	})
})

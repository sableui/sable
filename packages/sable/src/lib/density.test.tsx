import { render, screen } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { Dialog, DialogContent, DialogTrigger } from "../components/dialog"
import { Menu, MenuContent, MenuItem, MenuTrigger } from "../components/menu"
import { Select, SelectContent, SelectItem, SelectTrigger } from "../components/select"
import { Workspace } from "../components/workspace"
import { Density } from "./density"

/**
 * The bug this file exists for: `data-density` scopes the control ladder by CSS,
 * and a portaled popup is not a DOM descendant of the workspace, so CSS reaches
 * it never. Measured in a compact Workspace before the fix — `--control-md`
 * resolved to the comfortable 40px inside a menu while the workspace around it
 * was 32px, and `--button-radius` reverted so pills returned inside a tool.
 */
describe("density crosses portals", () => {
	it("re-applies the workspace's density on a portaled menu popup", async () => {
		render(
			<Workspace>
				<Menu>
					<MenuTrigger render={<button type="button">Open</button>} />
					<MenuContent>
						<MenuItem>One</MenuItem>
					</MenuContent>
				</Menu>
			</Workspace>,
		)
		await userEvent.click(screen.getByRole("button", { name: "Open" }))
		const popup = await screen.findByRole("menu")

		// The popup must carry the scope itself, because it cannot inherit it.
		expect(popup.closest("[data-density]")?.getAttribute("data-density")).toBe("compact")
	})

	it("re-applies it on a portaled select popup", async () => {
		render(
			<Workspace>
				<Select defaultValue="a">
					<SelectTrigger />
					<SelectContent>
						<SelectItem value="a">A</SelectItem>
					</SelectContent>
				</Select>
			</Workspace>,
		)
		await userEvent.click(screen.getByRole("combobox"))
		const popup = await screen.findByRole("listbox")
		expect(popup.closest("[data-density]")?.getAttribute("data-density")).toBe("compact")
	})

	it("honours an explicit comfortable workspace", async () => {
		render(
			<Workspace density="comfortable">
				<Menu>
					<MenuTrigger render={<button type="button">Open</button>} />
					<MenuContent>
						<MenuItem>One</MenuItem>
					</MenuContent>
				</Menu>
			</Workspace>,
		)
		await userEvent.click(screen.getByRole("button", { name: "Open" }))
		const popup = await screen.findByRole("menu")
		expect(popup.closest("[data-density]")?.getAttribute("data-density")).toBe("comfortable")
	})

	it("does NOT carry density into a modal", async () => {
		// Deliberate, and long-documented: a Dialog is a page-register surface even
		// when a tool opened it. Anchored popups inherit their trigger's register;
		// modals are their own surface. If this ever starts passing "compact",
		// someone has spread the anchored props onto a modal.
		render(
			<Workspace>
				<Dialog>
					<DialogTrigger render={<button type="button">Open</button>} />
					<DialogContent title="Settings">body</DialogContent>
				</Dialog>
			</Workspace>,
		)
		await userEvent.click(screen.getByRole("button", { name: "Open" }))
		const dialog = await screen.findByRole("dialog")
		expect(dialog.closest("[data-density]")).toBeNull()
	})

	it("switches the TYPE tier too, not just the control ladder", async () => {
		// The ladder is CSS variables, so data-density retunes it for free.
		// Typography is not: `text-body-md` and `text-ui-md` are separate paired
		// utilities, so a hardcoded one ignores density entirely. That is why menus
		// rendered 13px body type inside a tool whose every other control was on
		// the 12px chrome tier — and why consumers patched it at each call site.
		const { unmount } = render(
			<Workspace>
				<Menu>
					<MenuTrigger render={<button type="button">Open</button>} />
					<MenuContent>
						<MenuItem>One</MenuItem>
					</MenuContent>
				</Menu>
			</Workspace>,
		)
		await userEvent.click(screen.getByRole("button", { name: "Open" }))
		expect((await screen.findByRole("menuitem")).className).toContain("text-ui-md")
		unmount()

		render(
			<Menu>
				<MenuTrigger render={<button type="button">Open</button>} />
				<MenuContent>
					<MenuItem>One</MenuItem>
				</MenuContent>
			</Menu>,
		)
		await userEvent.click(screen.getByRole("button", { name: "Open" }))
		// On a page, body type is correct and must stay — the fix is not
		// "make MenuItem smaller".
		expect((await screen.findByRole("menuitem")).className).toContain("text-body-md")
	})

	it("lets <Density> opt a subtree out, on BOTH halves", async () => {
		// The mixed-register case, which had no documented answer: a tool with a
		// scrolling config form, or a long-form text field inside chrome. The trap
		// was that DensityProvider looks like the way to do this and only does the
		// React half — it renders no DOM, so the CSS ladder never changes.
		render(
			<Workspace>
				<Density value="comfortable" data-testid="island">
					<Menu>
						<MenuTrigger render={<button type="button">Open</button>} />
						<MenuContent>
							<MenuItem>One</MenuItem>
						</MenuContent>
					</Menu>
				</Density>
			</Workspace>,
		)
		// CSS half: a real element carries the scope.
		expect(screen.getByTestId("island")).toHaveAttribute("data-density", "comfortable")
		// React half: the portaled popup follows it, not the workspace around it.
		await userEvent.click(screen.getByRole("button", { name: "Open" }))
		const popup = await screen.findByRole("menu")
		expect(popup.closest("[data-density]")?.getAttribute("data-density")).toBe("comfortable")
	})

	it("defaults to comfortable with no workspace above it", async () => {
		render(
			<Menu>
				<MenuTrigger render={<button type="button">Open</button>} />
				<MenuContent>
					<MenuItem>One</MenuItem>
				</MenuContent>
			</Menu>,
		)
		await userEvent.click(screen.getByRole("button", { name: "Open" }))
		const popup = await screen.findByRole("menu")
		expect(popup.closest("[data-density]")?.getAttribute("data-density")).toBe("comfortable")
	})
})

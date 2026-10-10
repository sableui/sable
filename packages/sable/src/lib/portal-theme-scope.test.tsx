import { afterEach, describe, expect, it } from "vitest"
import { Dialog, DialogContent, DialogTitle } from "../components/dialog"
import { Menu, MenuContent, MenuItem, MenuTrigger } from "../components/menu"
import { Popover, PopoverContent, PopoverTrigger } from "../components/popover"
import { Select, SelectContent, SelectItem, SelectTrigger } from "../components/select"
import { renderWithProviders, screen, waitFor } from "../test/render"
import { applyPortalThemeScope, resolvePortalThemeScope } from "./portal-theme-scope"

function tree(html: string) {
	const host = document.createElement("div")
	host.innerHTML = html
	document.body.appendChild(host)
	return host
}

afterEach(() => {
	document.documentElement.removeAttribute("data-sable-theme")
	document.documentElement.classList.remove("dark", "light")
})

describe("resolvePortalThemeScope", () => {
	it("finds the nearest themed subtree and its mode", () => {
		const host = tree(
			`<div data-sable-theme="ember" class="dark"><span id="from"></span></div>`,
		)
		const scope = resolvePortalThemeScope(host.querySelector("#from")!)
		expect(scope.theme).toBe("ember")
		expect(scope.mode).toBe("dark")
		host.remove()
	})

	it("treats an explicit light class as light, even inside a dark scope", () => {
		const host = tree(
			`<div class="dark"><div data-sable-theme="ember" class="light"><i id="from"></i></div></div>`,
		)
		expect(resolvePortalThemeScope(host.querySelector("#from")!).mode).toBe("light")
		host.remove()
	})

	it("ignores scopes on <html> — the portal already inherits those", () => {
		document.documentElement.setAttribute("data-sable-theme", "ember")
		document.documentElement.classList.add("dark")
		const host = tree(`<span id="from"></span>`)
		expect(resolvePortalThemeScope(host.querySelector("#from")!)).toEqual({})
		host.remove()
	})

	it("mirrors mode without a theme for a bare .dark island", () => {
		const host = tree(`<div class="dark"><i id="from"></i></div>`)
		const scope = resolvePortalThemeScope(host.querySelector("#from")!)
		expect(scope).toEqual({ mode: "dark" })
		const target = document.createElement("div")
		applyPortalThemeScope(target, scope)
		expect(target.className).toBe("dark")
		expect(target.hasAttribute("data-sable-theme")).toBe(false)
		host.remove()
	})

	it("swaps dark for light when mirroring a light scope", () => {
		const target = document.createElement("div")
		target.className = "dark"
		applyPortalThemeScope(target, { theme: "ember", mode: "light" })
		expect(target.classList.contains("light")).toBe(true)
		expect(target.classList.contains("dark")).toBe(false)
		expect(target.getAttribute("data-sable-theme")).toBe("ember")
	})
})

function portalRootOf(el: HTMLElement) {
	return el.closest("[data-base-ui-portal]") as HTMLElement | null
}

describe("portaled popups inherit the scope they were opened from", () => {
	it("Select", () => {
		renderWithProviders(
			<div data-sable-theme="ember" className="dark">
				<Select defaultValue="a" defaultOpen>
					<SelectTrigger placeholder="Pick" />
					<SelectContent>
						<SelectItem value="a">Alpha</SelectItem>
					</SelectContent>
				</Select>
			</div>,
		)
		const root = portalRootOf(screen.getByRole("listbox"))
		expect(root).not.toBeNull()
		expect(root).toHaveAttribute("data-sable-theme", "ember")
		expect(root).toHaveClass("dark")
		// The probe is gone after the commit that read it.
		expect(document.querySelector("[data-sable-portal-probe]")).toBeNull()
	})

	it("Menu, in a light island", () => {
		renderWithProviders(
			<div data-sable-theme="ember" className="light">
				<Menu defaultOpen>
					<MenuTrigger>Open</MenuTrigger>
					<MenuContent>
						<MenuItem>One</MenuItem>
					</MenuContent>
				</Menu>
			</div>,
		)
		const root = portalRootOf(screen.getByRole("menu"))
		expect(root).toHaveAttribute("data-sable-theme", "ember")
		expect(root).toHaveClass("light")
		expect(root).not.toHaveClass("dark")
	})

	it("Popover and Dialog", () => {
		renderWithProviders(
			<div data-sable-theme="ember" className="dark">
				<Popover defaultOpen>
					<PopoverTrigger>Open</PopoverTrigger>
					<PopoverContent>Popover body</PopoverContent>
				</Popover>
				<Dialog defaultOpen>
					<DialogContent>
						<DialogTitle>Dialog title</DialogTitle>
					</DialogContent>
				</Dialog>
			</div>,
		)
		for (const el of [screen.getByText("Popover body"), screen.getByText("Dialog title")]) {
			const root = portalRootOf(el)
			expect(root).toHaveAttribute("data-sable-theme", "ember")
			expect(root).toHaveClass("dark")
		}
	})

	it("re-probes when the popup closes and reopens", async () => {
		const ui = (open: boolean) => (
			<div data-sable-theme="ember" className="dark">
				<Popover open={open}>
					<PopoverTrigger>Open</PopoverTrigger>
					<PopoverContent>Popover body</PopoverContent>
				</Popover>
			</div>
		)
		const { rerender } = renderWithProviders(ui(true))
		const first = portalRootOf(screen.getByText("Popover body"))
		rerender(ui(false))
		await waitFor(() => expect(screen.queryByText("Popover body")).toBeNull())
		rerender(ui(true))
		const second = portalRootOf(await screen.findByText("Popover body"))
		expect(second).not.toBe(first)
		expect(second).toHaveAttribute("data-sable-theme", "ember")
		expect(second).toHaveClass("dark")
	})

	it("leaves the portal untouched when there is no scoped subtree", () => {
		document.documentElement.classList.add("dark")
		renderWithProviders(
			<Select defaultValue="a" defaultOpen>
				<SelectTrigger placeholder="Pick" />
				<SelectContent>
					<SelectItem value="a">Alpha</SelectItem>
				</SelectContent>
			</Select>,
		)
		const root = portalRootOf(screen.getByRole("listbox"))
		expect(root).not.toBeNull()
		expect(root!.hasAttribute("data-sable-theme")).toBe(false)
		expect(root!.className).toBe("")
		expect(root!.style.fontFamily).toBe("")
	})
})

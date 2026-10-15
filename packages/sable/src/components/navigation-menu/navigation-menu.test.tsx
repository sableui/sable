import userEvent from "@testing-library/user-event"
import type { ComponentProps } from "react"
import { describe, expect, it } from "vitest"
import { renderWithProviders, screen } from "../../test/render"
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "./navigation-menu"

/** A stand-in for a router's link: renders an <a> and marks itself. */
function RouterLink({ to, ...props }: ComponentProps<"a"> & { to: string }) {
	return <a href={to} data-router-link="" {...props} />
}

function SiteNav({ current }: { current?: string }) {
	return (
		<NavigationMenu aria-label="Main">
			<NavigationMenuList>
				<NavigationMenuItem>
					<NavigationMenuTrigger>Product</NavigationMenuTrigger>
					<NavigationMenuContent>
						<NavigationMenuLink href="/editor" description="Write and review together.">
							Editor
						</NavigationMenuLink>
					</NavigationMenuContent>
				</NavigationMenuItem>
				<NavigationMenuItem>
					<NavigationMenuLink active={current === "/pricing"} render={<RouterLink to="/pricing" />}>
						Pricing
					</NavigationMenuLink>
				</NavigationMenuItem>
			</NavigationMenuList>
		</NavigationMenu>
	)
}

describe("NavigationMenu", () => {
	it("is a named nav around a list of entries", () => {
		renderWithProviders(<SiteNav />)
		const nav = screen.getByRole("navigation", { name: "Main" })
		expect(nav.querySelector("ul > li")).not.toBeNull()
		expect(screen.getByRole("button", { name: "Product" })).toHaveAttribute("aria-expanded", "false")
	})

	it("opens a trigger's content into the shared panel, as rows with descriptions", async () => {
		renderWithProviders(<SiteNav />)
		await userEvent.click(screen.getByRole("button", { name: "Product" }))
		expect(screen.getByRole("button", { name: "Product" })).toHaveAttribute("aria-expanded", "true")
		const row = await screen.findByRole("link", { name: /Editor/ })
		expect(row).toHaveTextContent("EditorWrite and review together.")
		// A panel row, not a bar entry: the bar's pill shape stays in the bar.
		expect(row.className).toContain("rounded-popup-item")
		expect(row.className).not.toContain("--button-radius")
	})

	it("renders a bar link through the router's link and marks the current page", () => {
		renderWithProviders(<SiteNav current="/pricing" />)
		const link = screen.getByRole("link", { name: "Pricing" })
		expect(link).toHaveAttribute("data-router-link")
		expect(link).toHaveAttribute("href", "/pricing")
		expect(link).toHaveAttribute("aria-current", "page")
		expect(link.className).toContain("rounded-[var(--button-radius,9999px)]")
	})

	it("leaves a link that is not the current page unmarked", () => {
		renderWithProviders(<SiteNav current="/docs" />)
		expect(screen.getByRole("link", { name: "Pricing" })).not.toHaveAttribute("aria-current")
	})
})

import { render, screen } from "@testing-library/react"
import { forwardRef, type ComponentPropsWithoutRef } from "react"
import { describe, expect, it } from "vitest"
import { BreadcrumbItem, BreadcrumbLink, Breadcrumbs } from "./breadcrumbs"

/** Stands in for a router's Link: renders an <a> and marks itself. */
const RouterLink = forwardRef<HTMLAnchorElement, ComponentPropsWithoutRef<"a"> & { to: string }>(
	({ to, ...props }, ref) => <a ref={ref} href={to} data-router-link="" {...props} />,
)

describe("BreadcrumbLink", () => {
	it("renders a styled <a> by default", () => {
		render(<Breadcrumbs><BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem></Breadcrumbs>)
		const link = screen.getByRole("link", { name: "Home" })
		expect(link).toHaveAttribute("href", "/")
		expect(link.className).toContain("text-muted-foreground")
	})

	it("renders a router link through render, keeping the crumb's styling", () => {
		render(
			<Breadcrumbs>
				<BreadcrumbItem>
					<BreadcrumbLink render={<RouterLink to="/library" />}>Library</BreadcrumbLink>
				</BreadcrumbItem>
			</Breadcrumbs>,
		)
		const link = screen.getByRole("link", { name: "Library" })
		expect(link).toHaveAttribute("data-router-link")
		expect(link).toHaveAttribute("href", "/library")
		expect(link.className).toContain("text-muted-foreground")
	})
})

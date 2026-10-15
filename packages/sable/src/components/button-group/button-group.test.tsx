import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Button } from "../button"
import { ButtonGroup } from "./button-group"

/**
 * jsdom computes no Tailwind, so these pin the mechanism rather than the
 * pixels: the group squares inner corners through the per-side radius vars
 * Button reads, and tells a bordered seam from a filled one by the variant
 * each Button announces. The look itself is checked on the docs page.
 */
describe("ButtonGroup", () => {
	it("is a named group around ordinary buttons", () => {
		render(
			<ButtonGroup aria-label="Page actions">
				<Button variant="outline">Copy page</Button>
				<Button variant="outline" size="icon" aria-label="More page actions" />
			</ButtonGroup>,
		)
		const group = screen.getByRole("group", { name: "Page actions" })
		expect(screen.getAllByRole("button")).toHaveLength(2)
		expect(group).toHaveAttribute("data-slot", "button-group")
	})

	it("squares inner corners through Button's per-side radius vars", () => {
		render(<ButtonGroup aria-label="g" />)
		const cls = screen.getByRole("group").className
		expect(cls).toContain("button-group-join")
		// And Button reads them, per side, before the theme's shape.
		render(<Button>Go</Button>)
		const button = screen.getByRole("button", { name: "Go" }).className
		expect(button).toContain("rounded-s-[var(--button-radius-s,var(--button-radius,9999px))]")
		expect(button).toContain("rounded-e-[var(--button-radius-e,var(--button-radius,9999px))]")
	})

	it("collapses a bordered seam and draws one between filled buttons", () => {
		render(
			<ButtonGroup aria-label="g">
				<Button variant="outline">A</Button>
				<Button>B</Button>
			</ButtonGroup>,
		)
		expect(screen.getByRole("button", { name: "A" })).toHaveAttribute("data-variant", "outline")
		// An unset variant is primary, and says so.
		expect(screen.getByRole("button", { name: "B" })).toHaveAttribute("data-variant", "primary")
		// The seam rules in styles.css (button-group-join) select on data-variant.
		expect(screen.getByRole("group").className).toContain("button-group-join")
	})

	/* The joins themselves, read from the stylesheet that ships them. */
	const join = (() => {
		const css = readFileSync(resolve(__dirname, "../../styles.css"), "utf8")
		const start = css.indexOf("@utility button-group-join")
		return css.slice(start, css.indexOf("\n}\n", start))
	})()

	it("keys the joins to sibling Buttons, so an open menu's focus guards change nothing", () => {
		// Base UI inserts guard spans beside an open Menu's trigger. A rule on
		// child position read the chevron as "not last" and squared its corner.
		expect(join).not.toMatch(/:(first|last)-child|:(first|last)-of-type/)
		expect(join).toContain("& > [data-variant] ~ [data-variant] {\n\t\t--button-radius-s: 0px;")
		expect(join).toContain("& > [data-variant]:has(~ [data-variant]) {\n\t\t--button-radius-e: 0px;")
	})

	it("leaves a focused child its ring, and raises it over its neighbour", () => {
		expect(join).toContain(':not([data-variant="outline"], :focus-visible)')
		expect(join).toMatch(/& > :focus-visible \{\s*z-index: 1;/)
	})
})

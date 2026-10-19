import { render } from "@testing-library/react"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import { BREAKPOINTS } from "./_responsive"
import { Col, Columns } from "./Columns"

function el(node: ReturnType<typeof render>) {
	return node.container.firstChild as HTMLElement
}

describe("Col (responsive span / start)", () => {
	it("emits a single base var for a plain number span", () => {
		const e = el(render(<Col span={8} />))
		expect(e).toHaveAttribute("data-sable-col")
		expect(e.style.getPropertyValue("--col-span-base")).toBe("8")
		expect(e.style.getPropertyValue("--col-span-md")).toBe("")
	})

	it("emits one var per key for a responsive map", () => {
		const e = el(render(<Col span={{ base: 12, md: 8, lg: 7 }} />))
		expect(e.style.getPropertyValue("--col-span-base")).toBe("12")
		expect(e.style.getPropertyValue("--col-span-md")).toBe("8")
		expect(e.style.getPropertyValue("--col-span-lg")).toBe("7")
		// Breakpoints not in the map stay unset (the cascade falls back).
		expect(e.style.getPropertyValue("--col-span-sm")).toBe("")
	})

	it("emits start vars independently of span", () => {
		const e = el(render(<Col span={6} start={{ md: 4 }} />))
		expect(e.style.getPropertyValue("--col-span-base")).toBe("6")
		expect(e.style.getPropertyValue("--col-start-md")).toBe("4")
	})

	it("defaults span to 1", () => {
		expect(el(render(<Col />)).style.getPropertyValue("--col-span-base")).toBe(
			"1",
		)
	})
})

describe("Columns (responsive count)", () => {
	it("emits a base count var + the grid-cols attribute for a number", () => {
		const e = el(render(<Columns count={4} />))
		expect(e).toHaveAttribute("data-sable-grid-cols")
		expect(e.style.getPropertyValue("--cols-base")).toBe("4")
	})

	it("emits one count var per key for a responsive map", () => {
		const e = el(render(<Columns count={{ base: 2, md: 6, lg: 12 }} />))
		expect(e.style.getPropertyValue("--cols-base")).toBe("2")
		expect(e.style.getPropertyValue("--cols-md")).toBe("6")
		expect(e.style.getPropertyValue("--cols-lg")).toBe("12")
		expect(e.style.getPropertyValue("--cols-sm")).toBe("")
	})

	it("caps the column gap against the resolved count so gaps cannot overflow", () => {
		const e = el(render(<Columns gap={10} />))
		// Row gap is the gap as given; only the column gap is capped.
		expect(e.style.getPropertyValue("--sable-columns-row-gap")).toBe(
			"calc(var(--rhythm-unit) * 10)",
		)
		const columnGap = e.style.getPropertyValue("--sable-columns-column-gap")
		expect(columnGap).toMatch(/^min\(calc\(var\(--rhythm-unit\) \* 10\),/)
		// The cap reads the per-breakpoint --cols cascade, so responsive counts work.
		expect(columnGap).toContain("75%")
		expect(columnGap).toContain("var(--cols, var(--grid-columns))")
	})

	it("caps the default and raw-string gaps too", () => {
		expect(
			el(render(<Columns />)).style.getPropertyValue("--sable-columns-column-gap"),
		).toMatch(/^min\(var\(--grid-gutter\),/)
		expect(
			el(
				render(<Columns count={{ base: 1, lg: 12 }} gap="5rem" />),
			).style.getPropertyValue("--sable-columns-column-gap"),
		).toMatch(/^min\(5rem,/)
	})

	it("lets an explicit style gap override the capped default", () => {
		const e = el(render(<Columns gap={10} style={{ columnGap: "4px" }} />))
		expect(e.style.getPropertyValue("column-gap")).toBe("4px")
	})

	it("sets no count var when omitted (CSS falls back to --grid-columns)", () => {
		const e = el(render(<Columns />))
		expect(e).toHaveAttribute("data-sable-grid-cols")
		expect(e.style.getPropertyValue("--cols-base")).toBe("")
	})
})

describe("nested Grid and Col", () => {
	// jsdom has no cascade, so this pins the CSS that stops a nested Grid or Col
	// reading an ancestor's breakpoint value (a cols={2} Grid inside a 12-column
	// lg Columns drew 12 tracks). Every breakpoint must be reset on the element.
	const css = readFileSync(resolve(__dirname, "../styles.css"), "utf8")
	const rule = (selector: string) =>
		css.split(`[${selector}] {`).slice(1).map((block) => block.slice(0, block.indexOf("}"))).find((body) => body.includes(": initial")) ?? ""

	it.each([
		["data-sable-grid-cols", ["--cols"]],
		["data-sable-col", ["--col-span", "--col-start"]],
	])("%s resets every breakpoint it reads to initial", (selector, prefixes) => {
		const body = rule(selector)
		for (const prefix of prefixes) for (const bp of BREAKPOINTS) expect(body).toContain(`${prefix}-${bp}: initial`)
	})
})

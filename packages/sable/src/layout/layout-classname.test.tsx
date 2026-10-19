import { render } from "@testing-library/react"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import type { ReactElement } from "react"
import { describe, expect, it } from "vitest"
import { AspectBox } from "./AspectBox"
import { Bleed } from "./Bleed"
import { Center } from "./Center"
import { Col, Columns } from "./Columns"
import { Grid } from "./Grid"
import { GridOverlay } from "./GridOverlay"
import { Page } from "./Page"
import { Region } from "./Region"
import { Row } from "./Row"
import { SafeArea } from "./SafeArea"
import { Spacer } from "./Spacer"
import { SplitPane } from "./SplitPane"
import { Stack } from "./Stack"

// A consumer wrote `<Row className="max-lg:hidden">` for a header that should
// collapse on mobile. Row set `display: flex` inline, an inline declaration
// beats every utility, so the class did nothing and they rewrote the header in
// hand-built flex divs. Every primitive's layout now lives in classes that a
// caller's className overrides through cn(), and none sets an inline display.

function el(ui: ReactElement) {
	return render(ui).container.firstChild as HTMLElement
}

const primitives: [string, (className: string) => ReactElement][] = [
	["Row", (c) => <Row className={c} />],
	["Stack", (c) => <Stack className={c} />],
	["Grid (cols)", (c) => <Grid cols={3} className={c} />],
	["Grid (minItemWidth)", (c) => <Grid minItemWidth="12rem" className={c} />],
	["Columns", (c) => <Columns count={4} className={c} />],
	["Col", (c) => <Col span={2} className={c} />],
	["Center", (c) => <Center max="prose" className={c} />],
	["Region", (c) => <Region max="wide" className={c} />],
	["Page", (c) => <Page max="feed" className={c} />],
	["AspectBox", (c) => <AspectBox className={c} />],
	["Bleed", (c) => <Bleed className={c} />],
	["SplitPane", (c) => <SplitPane primary="a" secondary="b" className={c} />],
	["SafeArea", (c) => <SafeArea edges={["bottom"]} className={c} />],
	["Spacer", (c) => <Spacer className={c} />],
	["GridOverlay", (c) => <GridOverlay className={c} />],
]

describe("layout primitives take className utilities over their own layout", () => {
	it.each(primitives)("%s: `hidden` reaches the element and no inline display is set", (_, make) => {
		const e = el(make("hidden"))
		expect(e).toHaveClass("hidden")
		expect(e.style.display).toBe("")
		// tailwind-merge drops the primitive's own display class, so `hidden`
		// is not left fighting `flex`/`grid` on stylesheet order.
		expect(e).not.toHaveClass("flex")
		expect(e).not.toHaveClass("grid")
	})

	it.each(primitives)("%s: sets no inline layout property a utility would want to override", (_, make) => {
		const e = el(make(""))
		for (const prop of [
			"display",
			"flex-direction",
			"align-items",
			"justify-content",
			"flex-wrap",
			"gap",
			"row-gap",
			"column-gap",
			"grid-template-columns",
			"max-width",
			"margin-inline",
			"padding-inline",
			"width",
			"height",
			"aspect-ratio",
		]) {
			expect(e.style.getPropertyValue(prop), prop).toBe("")
		}
	})

	it("keeps a responsive pair: `hidden md:flex` hides a Row until md", () => {
		const e = el(<Row className="hidden md:flex" />)
		expect(e).toHaveClass("hidden", "md:flex")
		expect(e).not.toHaveClass("flex")
	})

	it("lets className re-flow a Row: `max-md:flex-col` survives alongside flex-row", () => {
		const e = el(<Row className="max-md:flex-col" />)
		expect(e).toHaveClass("flex-row", "max-md:flex-col")
	})

	it("lets a className gap or alignment replace the prop's", () => {
		const row = el(<Row gap={3} align="center" className="gap-1 items-start" />)
		expect(row).toHaveClass("gap-1", "items-start")
		expect(row).not.toHaveClass("gap-(--sable-row-gap)")
		expect(row).not.toHaveClass("items-center")

		const stack = el(<Stack gap={2} className="md:gap-8" />)
		expect(stack).toHaveClass("gap-(--sable-stack-gap)", "md:gap-8")
	})

	it("keeps gaps working from props, as CSS variables the classes read", () => {
		expect(el(<Row gap={1.5} />).style.getPropertyValue("--sable-row-gap")).toBe(
			"calc(var(--rhythm-unit) * 1.5)",
		)
		expect(el(<Stack gap="2rem" />).style.getPropertyValue("--sable-stack-gap")).toBe("2rem")
		expect(el(<Grid gap={2} />).style.getPropertyValue("--sable-grid-gap")).toBe(
			"calc(var(--rhythm-unit) * 2)",
		)
	})

	it("maps align / justify / wrap props to classes", () => {
		expect(el(<Row align="baseline" justify="between" wrap />)).toHaveClass(
			"items-baseline",
			"justify-between",
			"flex-wrap",
		)
		expect(el(<Stack align="center" justify="end" />)).toHaveClass("items-center", "justify-end")
	})

	it("lets a className inset or cap override Region's", () => {
		const e = el(<Region max="wide" className="max-sm:px-0" />)
		expect(e).toHaveClass("px-(--page-inset)", "max-sm:px-0")
		expect(el(<Region bleed />).className).not.toContain("px-")
	})

	it("lets className reshape an AspectBox and resize a Spacer", () => {
		const box = el(<AspectBox ratio={1} className="md:aspect-video" />)
		expect(box).toHaveClass("aspect-(--sable-aspect)", "md:aspect-video")
		expect(box.style.getPropertyValue("--sable-aspect")).toBe("1")

		const spacer = el(<Spacer size={3} axis="horizontal" className="md:w-16" />)
		expect(spacer).toHaveClass("w-(--sable-spacer)", "md:w-16")
		expect(el(<Spacer grow />)).toHaveClass("flex-1")
	})
})

describe("styles.css layout rules", () => {
	const css = readFileSync(resolve(__dirname, "../styles.css"), "utf8")

	// Unlayered, `[data-sable-grid-cols] { display: grid }` beat `hidden` (which
	// lives in @layer utilities) whatever its specificity. The display is now
	// the element's `grid` class, and the remaining rules are layered.
	it.each(["data-sable-grid-cols", "data-sable-split", "data-sable-col"])(
		"[%s] never sets display and only appears inside @layer components",
		(selector) => {
			const blocks = css.split(`[${selector}]`).slice(1)
			expect(blocks.length).toBeGreaterThan(0)
			for (const block of blocks) {
				const body = block.slice(0, block.indexOf("}"))
				expect(body).not.toMatch(/\bdisplay\s*:/)
			}
			// Each rule's enclosing top-level block is the components layer.
			const lines = css.split("\n")
			lines.forEach((line, i) => {
				if (!new RegExp(`^\\s*\\[${selector}\\]`).test(line)) return
				let j = i
				while (j > 0 && !/^\S.*\{\s*$/.test(lines[j])) j--
				expect(lines[j], `line ${i + 1}`).toMatch(/^@layer components \{/)
			})
		},
	)
})

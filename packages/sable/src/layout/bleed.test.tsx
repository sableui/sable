import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Bleed } from "./Bleed"

describe("Bleed", () => {
	it("spans its container width and self-centers (container-query units)", () => {
		const e = render(<Bleed>x</Bleed>).container.firstChild as HTMLElement
		expect(e).toHaveClass("w-[100cqw]", "mx-[calc(50%_-_50cqw)]")
		expect(e.style.width).toBe("")
	})

	it("lets a breakpoint turn the bleed off through className", () => {
		const e = render(<Bleed className="lg:mx-0 lg:w-auto">x</Bleed>).container
			.firstChild as HTMLElement
		expect(e).toHaveClass("lg:mx-0", "lg:w-auto")
		expect(e.style.marginInline).toBe("")
	})

	it("lets a consumer style override merge last", () => {
		const e = render(<Bleed style={{ marginInline: "0" }}>x</Bleed>).container
			.firstChild as HTMLElement
		expect(e.style.marginInline).toBe("0px")
	})
})

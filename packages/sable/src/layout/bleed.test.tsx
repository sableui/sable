import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Bleed } from "./Bleed"

describe("Bleed", () => {
	it("spans its container width and self-centers (container-query units)", () => {
		const e = render(<Bleed>x</Bleed>).container.firstChild as HTMLElement
		expect(e.style.width).toBe("100cqw")
		expect(e.style.marginInline).toBe("calc(50% - 50cqw)")
	})

	it("lets a consumer style override merge last", () => {
		const e = render(<Bleed style={{ marginInline: "0" }}>x</Bleed>).container
			.firstChild as HTMLElement
		expect(e.style.marginInline).toBe("0px")
	})
})

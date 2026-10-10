import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { TooltipProvider } from "../tooltip"
import { RelativeTime } from "./relative-time"

describe("RelativeTime", () => {
	it("is a keyboard-focusable <time> that inherits its type size", () => {
		const { container } = render(
			<TooltipProvider>
				<RelativeTime date="2025-04-29T16:05:12Z" />
			</TooltipProvider>,
		)
		const time = container.querySelector("time") as HTMLElement
		expect(time).toHaveAttribute("datetime", "2025-04-29T16:05:12.000Z")
		// The tooltip opens on focus, so the absolute time needs a focus stop.
		expect(time).toHaveAttribute("tabindex", "0")
		expect(time.className).not.toMatch(/\btext-body-/)
	})
})

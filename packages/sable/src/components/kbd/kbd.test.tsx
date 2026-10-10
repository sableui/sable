import { render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { Kbd } from "./kbd"

describe("Kbd", () => {
	afterEach(() => vi.restoreAllMocks())

	it("renders a key cap on the spacing scale", () => {
		render(<Kbd>K</Kbd>)
		const cap = screen.getByText("K")
		expect(cap.tagName).toBe("KBD")
		expect(cap.className).toContain("min-w-5")
		expect(cap.className).not.toMatch(/min-w-\[/)
	})

	it("mod renders Ctrl off Apple platforms", () => {
		vi.spyOn(navigator, "platform", "get").mockReturnValue("Win32")
		vi.spyOn(navigator, "userAgent", "get").mockReturnValue("Windows")
		render(<Kbd mod />)
		expect(screen.getByText("Ctrl").tagName).toBe("KBD")
	})

	it("mod renders ⌘ on Apple platforms", () => {
		vi.spyOn(navigator, "platform", "get").mockReturnValue("MacIntel")
		render(<Kbd mod />)
		expect(screen.getByText("⌘").tagName).toBe("KBD")
	})
})

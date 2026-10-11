import { render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { Kbd, KbdGroup } from "./kbd"

describe("Kbd", () => {
	afterEach(() => vi.restoreAllMocks())

	it("sizes the cap from the text it sits in", () => {
		// em, not a fixed px rung: the same cap sits in body copy, a 12px menu
		// row and a tooltip.
		render(<Kbd>K</Kbd>)
		const cap = screen.getByText("K")
		expect(cap.tagName).toBe("KBD")
		expect(cap.className).toContain("h-[1.6em]")
		expect(cap.className).toContain("min-w-[1.6em]")
	})

	it("ghost drops the cap", () => {
		render(<Kbd variant="ghost">K</Kbd>)
		const cap = screen.getByText("K")
		expect(cap.className).not.toContain("border")
		expect(cap.className).toContain("text-current")
	})

	it("KbdGroup nests one cap per key in a <kbd>", () => {
		const { container } = render(
			<KbdGroup>
				<Kbd>⇧</Kbd>
				<Kbd>P</Kbd>
			</KbdGroup>,
		)
		const group = container.firstElementChild as HTMLElement
		expect(group.tagName).toBe("KBD")
		expect(group.querySelectorAll("kbd")).toHaveLength(2)
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

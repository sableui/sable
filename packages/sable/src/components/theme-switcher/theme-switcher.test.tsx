import userEvent from "@testing-library/user-event"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ThemeSwitcher } from "./theme-switcher"

describe("ThemeSwitcher", () => {
	it("renders the three preferences as a radiogroup", () => {
		render(<ThemeSwitcher value="system" onValueChange={() => {}} />)
		expect(screen.getByRole("radiogroup", { name: "Theme" })).toBeInTheDocument()
		expect(screen.getByRole("radio", { name: "System" })).toHaveAttribute("aria-checked", "true")
		expect(screen.getByRole("radio", { name: "Light" })).toHaveAttribute("aria-checked", "false")
	})

	it("reports the chosen preference", () => {
		const onValueChange = vi.fn()
		render(<ThemeSwitcher value="system" onValueChange={onValueChange} />)
		fireEvent.click(screen.getByRole("radio", { name: "Dark" }))
		expect(onValueChange).toHaveBeenCalledWith("dark")
	})

	it("moves selection with the arrow keys (Base UI's radiogroup, not hand-rolled)", async () => {
		const user = userEvent.setup()
		const onValueChange = vi.fn()
		render(<ThemeSwitcher value="light" onValueChange={onValueChange} />)
		screen.getByRole("radio", { name: "Light" }).focus()
		await user.keyboard("{ArrowRight}")
		expect(onValueChange).toHaveBeenLastCalledWith("dark")
	})

	it("cannot be stretched by a flex-column parent", () => {
		// `display: inline-flex` does NOT protect a flex ITEM: in a `flex flex-col`
		// — the most ordinary way to stack a label above a control — align-items:
		// stretch overrides the intrinsic width, and since the three buttons stay a
		// fixed size-7 the result is a full-width capsule with the icons stranded at
		// the left. That shipped, so w-fit is asserted rather than assumed.
		const { container } = render(<ThemeSwitcher value="light" onValueChange={() => {}} />)
		const group = container.querySelector('[role="radiogroup"]')!
		expect(group.className).toContain("w-fit")
	})

	it("still lets a caller opt into full width", () => {
		const { container } = render(
			<ThemeSwitcher value="light" onValueChange={() => {}} className="w-full" />,
		)
		const group = container.querySelector('[role="radiogroup"]')!
		// tailwind-merge must resolve the conflict in the caller's favour.
		expect(group.className).toContain("w-full")
		expect(group.className).not.toContain("w-fit")
	})
})

describe("ThemeSwitcher glide", () => {
	it("steps the active pill on the spacing scale, not a fixed rem", () => {
		const { container } = render(
			<ThemeSwitcher value="dark" onValueChange={() => {}} />,
		)
		const pill = container.querySelector<HTMLElement>("span[aria-hidden]")
		expect(pill?.style.getPropertyValue("--segment-index")).toBe("1")
		expect(pill?.style.getPropertyValue("--segment-step")).toBe("calc(var(--spacing) * 7.5)")
		expect(pill?.getAttribute("style") ?? "").not.toContain("rem")
	})
})

describe("ThemeSwitcher motion", () => {
	it("glides on the motion-glide recipe, so subtle can land it in place", () => {
		// A hand-written `duration-(--motion-duration-base)` here ignored the
		// expressive level: motion="subtle" still slid the pill.
		const { container } = render(<ThemeSwitcher value="dark" onValueChange={() => {}} />)
		const pill = container.querySelector<HTMLElement>("span[aria-hidden]")
		expect(pill).toHaveClass("motion-glide")
		expect(pill?.className).not.toContain("duration-")
	})

	it("only sets data-motion when turned down", () => {
		const { container, rerender } = render(<ThemeSwitcher value="dark" onValueChange={() => {}} />)
		const group = () => container.querySelector('[role="radiogroup"]')!
		expect(group()).not.toHaveAttribute("data-motion")
		rerender(<ThemeSwitcher value="dark" onValueChange={() => {}} motion="subtle" />)
		expect(group()).toHaveAttribute("data-motion", "subtle")
	})
})

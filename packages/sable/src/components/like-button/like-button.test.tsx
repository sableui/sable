import { act } from "@testing-library/react"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"
import { MotionProvider } from "../../motion/MotionProvider"
import { fireEvent, renderWithProviders, screen } from "../../test/render"
import { LikeButton } from "./like-button"

const burst = (root: HTMLElement) => root.querySelector(".sable-burst")
const glyph = () => document.querySelector("[data-icon]") as HTMLElement

describe("LikeButton", () => {
	it("is a toggle named by its label and count", () => {
		renderWithProviders(<LikeButton count={1300} />)
		const button = screen.getByRole("button", { name: "Like 1,300" })
		expect(button).toHaveAttribute("aria-pressed", "false")
	})

	it("fills the glyph and adds the viewer's like at once when pressed", () => {
		const onPressedChange = vi.fn()
		renderWithProviders(<LikeButton count={1300} onPressedChange={onPressedChange} />)
		const button = screen.getByRole("button")
		fireEvent.click(button)
		expect(button).toHaveAttribute("aria-pressed", "true")
		expect(button).toHaveAccessibleName("Like 1,301")
		expect(onPressedChange).toHaveBeenCalledWith(true, expect.anything())
		fireEvent.click(button)
		expect(button).toHaveAccessibleName("Like 1,300")
	})

	it("shows `count` exactly again once the server's total arrives", () => {
		const view = renderWithProviders(<LikeButton count={10} />)
		const button = screen.getByRole("button")
		fireEvent.click(button)
		expect(button).toHaveAccessibleName("Like 11")
		// The save landed: the total now includes the viewer's like.
		view.rerender(<LikeButton count={11} />)
		expect(button).toHaveAccessibleName("Like 11")
		expect(button).toHaveAttribute("aria-pressed", "true")
	})

	it("starts from a like already given without counting it twice", () => {
		renderWithProviders(<LikeButton count={5} defaultPressed={true} />)
		const button = screen.getByRole("button")
		expect(button).toHaveAccessibleName("Like 5")
		fireEvent.click(button)
		expect(button).toHaveAccessibleName("Like 4")
	})

	it("never moves the number for a controlled press the parent refused", () => {
		renderWithProviders(<LikeButton count={7} pressed={false} />)
		const button = screen.getByRole("button")
		fireEvent.click(button)
		expect(button).toHaveAttribute("aria-pressed", "false")
		expect(button).toHaveAccessibleName("Like 7")
	})

	it("follows a controlled parent that saves the count with the press", () => {
		function Post() {
			const [liked, setLiked] = useState(false)
			const [likes, setLikes] = useState(20)
			return (
				<LikeButton
					count={likes}
					pressed={liked}
					onPressedChange={(on) => {
						setLiked(on)
						setLikes((n) => n + (on ? 1 : -1))
					}}
				/>
			)
		}
		renderWithProviders(<Post />)
		const button = screen.getByRole("button")
		fireEvent.click(button)
		expect(button).toHaveAccessibleName("Like 21")
		fireEvent.click(button)
		expect(button).toHaveAccessibleName("Like 20")
	})

	it("is a square icon button named by its label without a count", () => {
		renderWithProviders(<LikeButton label="Save recipe" />)
		const button = screen.getByRole("button", { name: "Save recipe" })
		expect(button).toHaveClass("w-(--control-sm)")
	})

	it("blooms and bursts on a press on, never on mount or on a press off", () => {
		const view = renderWithProviders(
			<MotionProvider policy="full">
				<LikeButton count={3} defaultPressed={true} />
			</MotionProvider>,
		)
		const button = screen.getByRole("button")
		// Loaded already liked: still.
		expect(burst(view.container)).toBeNull()
		expect(glyph().parentElement).not.toHaveClass("motion-bloom")
		fireEvent.click(button) // off
		expect(burst(view.container)).toBeNull()
		fireEvent.click(button) // on
		expect(burst(view.container)).not.toBeNull()
		expect(glyph().parentElement).toHaveClass("motion-bloom")
		expect(glyph()).toHaveAttribute("data-icon", "heart")
	})

	it("does not celebrate a like a controlled parent refuses", () => {
		const view = renderWithProviders(
			<MotionProvider policy="full">
				<LikeButton count={3} pressed={false} onPressedChange={() => {}} />
			</MotionProvider>,
		)
		fireEvent.click(screen.getByRole("button"))
		expect(burst(view.container)).toBeNull()
		expect(glyph().parentElement).not.toHaveClass("motion-bloom")
	})

	it("survives a NaN count", () => {
		renderWithProviders(<LikeButton count={Number.NaN} />)
		expect(screen.getByRole("button")).toBeInTheDocument()
	})

	it("clears the burst once every piece has landed", () => {
		const view = renderWithProviders(
			<MotionProvider policy="full">
				<LikeButton count={3} />
			</MotionProvider>,
		)
		fireEvent.click(screen.getByRole("button"))
		const dots = view.container.querySelectorAll(".sable-burst-dot")
		expect(dots.length).toBeGreaterThan(0)
		// jsdom has no AnimationEvent, so React listens for the WebKit-prefixed
		// name (see tree.test.tsx); one end per piece, as a browser sends.
		act(() => {
			for (const dot of dots) dot.dispatchEvent(new Event("webkitAnimationEnd", { bubbles: true }))
		})
		expect(burst(view.container)).toBeNull()
	})

	it("drops the burst under subtle motion but still fills", () => {
		const view = renderWithProviders(<LikeButton motion="subtle" count={3} />)
		const button = screen.getByRole("button")
		fireEvent.click(button)
		expect(button).toHaveAttribute("aria-pressed", "true")
		expect(burst(view.container)).toBeNull()
		expect(button).toHaveAttribute("data-motion", "subtle")
	})
})

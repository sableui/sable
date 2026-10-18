import { describe, expect, it, vi } from "vitest"
import { fireEvent, renderWithProviders, screen } from "../../test/render"
import { BubbleReaction, BubbleReactions } from "../bubble"
import { ReactionPicker } from "./index"

const burst = (root: HTMLElement) => root.querySelector(".sable-burst")

describe("ReactionPicker", () => {
	it("is a labelled toolbar of named toggles that report the reader's own reactions", () => {
		renderWithProviders(<ReactionPicker selected={["❤️"]} />)
		expect(screen.getByRole("toolbar", { name: "Reactions" })).toBeInTheDocument()
		expect(screen.getByRole("button", { name: "Heart" })).toHaveAttribute("aria-pressed", "true")
		expect(screen.getByRole("button", { name: "Thumbs up" })).toHaveAttribute("aria-pressed", "false")
	})

	it("hands the chosen emoji to onSelect", () => {
		const onSelect = vi.fn()
		renderWithProviders(<ReactionPicker reactions={[{ emoji: "🚀", label: "Shipped" }]} onSelect={onSelect} />)
		fireEvent.click(screen.getByRole("button", { name: "Shipped" }))
		expect(onSelect).toHaveBeenCalledWith("🚀")
	})
})

describe("BubbleReaction motion", () => {
	it("bursts when it turns on, never on mount or when it turns off", () => {
		const view = renderWithProviders(
			<BubbleReactions>
				<BubbleReaction emoji="🎉" label="Party" count={3} active />
			</BubbleReactions>,
		)
		expect(burst(view.container)).toBeNull()
		view.rerender(
			<BubbleReactions>
				<BubbleReaction emoji="🎉" label="Party" count={2} />
			</BubbleReactions>,
		)
		expect(burst(view.container)).toBeNull()
		view.rerender(
			<BubbleReactions>
				<BubbleReaction emoji="🎉" label="Party" count={3} active />
			</BubbleReactions>,
		)
		expect(burst(view.container)).not.toBeNull()
		// The spray is copies of the emoji, not palette dots.
		expect(view.container.querySelector(".sable-burst-dot[data-particle]")?.textContent).toBe("🎉")
	})

	it("celebrates a pill added to a row that has already rendered", () => {
		const view = renderWithProviders(<BubbleReactions>{[]}</BubbleReactions>)
		// An empty row stays mounted but hidden, so the first reaction is still new.
		expect(view.container.firstElementChild).toHaveAttribute("hidden")
		view.rerender(
			<BubbleReactions>
				<BubbleReaction emoji="👍" label="Thumbs up" count={1} active />
			</BubbleReactions>,
		)
		expect(view.container.firstElementChild).not.toHaveAttribute("hidden")
		expect(burst(view.container)).not.toBeNull()
	})

	it("is named by its label and count", () => {
		renderWithProviders(<BubbleReaction emoji="🎉" label="Party" count={3} />)
		expect(screen.getByRole("button", { name: "Party, 3" })).toBeInTheDocument()
	})
})

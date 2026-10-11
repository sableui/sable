import { describe, expect, it, vi } from "vitest"
import { fireEvent, renderWithProviders, screen } from "../../test/render"
import { Bubble, BubbleReaction, BubbleReactions } from "./index"

describe("Bubble", () => {
	function surface(container: HTMLElement) {
		return container.firstElementChild as HTMLElement
	}

	it("squares the speaker-side corner and hangs the tail off it", () => {
		const { container: start } = renderWithProviders(<Bubble>hi</Bubble>)
		expect(surface(start).className).toContain("rounded-ss-none")
		expect(surface(start).querySelector("svg")?.getAttribute("class")).toContain("end-[calc(100%-1px)]")

		const { container: end } = renderWithProviders(<Bubble align="end">hi</Bubble>)
		expect(surface(end).className).toContain("rounded-se-none")
		expect(surface(end).querySelector("svg")?.getAttribute("class")).toContain("start-[calc(100%-1px)]")
	})

	it("reserves the tail's space with or without it, so a grouped run lines up", () => {
		const { container: tailed } = renderWithProviders(<Bubble align="end">hi</Bubble>)
		const { container: grouped } = renderWithProviders(<Bubble align="end" tail={false}>hi</Bubble>)
		expect(surface(tailed).className).toContain("me-(--bubble-ear)")
		expect(surface(grouped).className).toContain("me-(--bubble-ear)")
	})

	it("drops the tail on request, for continuations in a run", () => {
		const { container } = renderWithProviders(<Bubble tail={false}>hi</Bubble>)
		expect(surface(container).className).not.toContain("rounded-ss-none")
		expect(surface(container).querySelector("svg")).toBeNull()
	})

	it("pairs the primary fill with its own foreground token, never a raw white", () => {
		const { container } = renderWithProviders(
			<Bubble variant="primary">mine</Bubble>,
		)
		const el = surface(container)
		expect(el.className).toContain("bg-primary")
		expect(el.className).toContain("text-primary-foreground")
	})

	it("plain drops the surface, the padding, and the measure cap together", () => {
		const { container } = renderWithProviders(
			<Bubble variant="plain">long-form</Bubble>,
		)
		const el = surface(container)
		expect(el.className).toContain("bg-transparent")
		expect(el.className).toContain("max-w-none")
		// A surfaceless bubble has no surface to hang a tail from.
		expect(el.className).not.toContain("rounded-ss-none")
		expect(el.className).not.toContain("ms-(--bubble-ear)")
		expect(el.querySelector("svg")).toBeNull()
	})

	it("caps at a reading measure by default", () => {
		const { container } = renderWithProviders(<Bubble>hi</Bubble>)
		expect(surface(container).className).toContain("max-w-[42rem]")
	})

	it("keeps pasted text inside the surface", () => {
		const { container } = renderWithProviders(<Bubble>hi</Bubble>)
		const el = surface(container)
		expect(el.className).toContain("whitespace-pre-wrap")
		expect(el.className).toContain("break-words")
	})
})

describe("BubbleReaction", () => {
	it("is a toggle, and says so", () => {
		renderWithProviders(
			<BubbleReactions>
				<BubbleReaction emoji="🎉" count={3} active />
				<BubbleReaction emoji="👀" count={1} />
			</BubbleReactions>,
		)
		const [mine, theirs] = screen.getAllByRole("button")
		expect(mine).toHaveAttribute("aria-pressed", "true")
		expect(theirs).toHaveAttribute("aria-pressed", "false")
	})

	it("hides a count of one — the pill already says one", () => {
		renderWithProviders(<BubbleReaction emoji="👀" count={1} />)
		expect(screen.getByRole("button").textContent).not.toContain("1")

		renderWithProviders(<BubbleReaction emoji="🎉" count={3} />)
		expect(screen.getAllByRole("button")[1].textContent).toContain("3")
	})

	it("hides the glyph from assistive tech but leaves the count readable", () => {
		const { container } = renderWithProviders(
			<BubbleReaction emoji="🎉" count={4} />,
		)
		const glyph = container.querySelector('[aria-hidden="true"]')
		expect(glyph?.textContent).toBe("🎉")
	})

	it("toggles on click", () => {
		const onClick = vi.fn()
		renderWithProviders(<BubbleReaction emoji="🎉" onClick={onClick} />)
		fireEvent.click(screen.getByRole("button"))
		expect(onClick).toHaveBeenCalledTimes(1)
	})

	it("defaults to type=button, so a reaction never submits a composer", () => {
		renderWithProviders(<BubbleReaction emoji="🎉" />)
		expect(screen.getByRole("button")).toHaveAttribute("type", "button")
	})
})

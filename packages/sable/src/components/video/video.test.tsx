import { render, screen } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { Video } from "./video"

describe("Video placeholder", () => {
	it("keeps the play mark decorative without onRequestPlay", () => {
		render(<Video poster="/cover.jpg" />)
		expect(screen.queryByRole("button")).toBeNull()
	})

	it("makes the play mark a real button with onRequestPlay", async () => {
		const onRequestPlay = vi.fn()
		render(<Video poster="/cover.jpg" onRequestPlay={onRequestPlay} />)
		await userEvent.click(screen.getByRole("button", { name: "Play video" }))
		expect(onRequestPlay).toHaveBeenCalledOnce()
	})

	it("draws the play mark with the on-media overlay tokens", () => {
		const { container } = render(<Video />)
		const mark = container.querySelector("[aria-hidden]")
		expect(mark?.className).toContain("bg-overlay/85")
		expect(mark?.className).toContain("text-overlay-foreground")
	})
})

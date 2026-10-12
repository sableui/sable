import { act, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { MediaImage } from "./media-image"

/**
 * jsdom never loads images, so Base UI's preloader would sit at "loading"
 * forever. Stand in a fake Image that settles on demand, per src.
 */
const pending = new Map<string, { onload?: () => void; onerror?: () => void }>()
class FakeImage {
	onload?: () => void
	onerror?: () => void
	referrerPolicy = ""
	crossOrigin: string | null = null
	set src(value: string) {
		pending.set(value, this)
	}
}

beforeEach(() => {
	pending.clear()
	vi.stubGlobal("Image", FakeImage)
})
afterEach(() => {
	vi.unstubAllGlobals()
})

const fallbackOf = (container: HTMLElement) => container.querySelector('[data-slot="media-image-fallback"]')

describe("MediaImage", () => {
	it("paints the art fallback, aria-hidden, when there is no src", () => {
		const { container } = render(<MediaImage seed="Low tide" />)
		const fallback = fallbackOf(container)
		expect(fallback).not.toBeNull()
		expect(fallback?.getAttribute("aria-hidden")).toBe("true")
		expect(container.querySelector("img")).toBeNull()
	})

	it("rests on the muted surface while loading — no art flash — then shows the image", () => {
		const { container } = render(<MediaImage src="/cover.jpg" seed="Low tide" />)
		expect(fallbackOf(container)).toBeNull()
		expect(container.querySelector("img")).toBeNull()
		act(() => pending.get("/cover.jpg")?.onload?.())
		const img = container.querySelector("img")
		expect(img?.getAttribute("src")).toBe("/cover.jpg")
		// Decorative by default: a visible title names the item.
		expect(img?.getAttribute("alt")).toBe("")
		expect(container.querySelector('[data-slot="media-image"]')?.getAttribute("data-status")).toBe("loaded")
	})

	it("swaps to the art when the image fails", () => {
		const { container } = render(<MediaImage src="/missing.jpg" seed="Low tide" />)
		act(() => pending.get("/missing.jpg")?.onerror?.())
		expect(fallbackOf(container)).not.toBeNull()
		expect(container.querySelector("img")).toBeNull()
	})

	it("keeps a set alt as the frame's name when no image is on screen", () => {
		render(<MediaImage src="/missing.jpg" alt="Juno Avery on stage" />)
		act(() => pending.get("/missing.jpg")?.onerror?.())
		expect(screen.getByRole("img", { name: "Juno Avery on stage" })).toBeTruthy()
	})

	it("takes a custom fallback in place of the art", () => {
		render(<MediaImage fallback={<span>LT</span>} />)
		expect(screen.getByText("LT")).toBeTruthy()
	})

	it("starts over when the src changes", () => {
		const { container, rerender } = render(<MediaImage src="/a.jpg" />)
		act(() => pending.get("/a.jpg")?.onerror?.())
		expect(fallbackOf(container)).not.toBeNull()
		rerender(<MediaImage src="/b.jpg" />)
		// The new URL is loading, not inheriting the old one's failure.
		expect(fallbackOf(container)).toBeNull()
	})
})

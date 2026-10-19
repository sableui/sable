import { act, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { ComponentPropsWithRef } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { renderWithProviders as render } from "../../test/render"
import { MediaTile } from "./media-tile"

/** A stand-in router link: renders an <a>, like every router's Link does. */
function Link({ to, ...props }: { to: string } & ComponentPropsWithRef<"a">) {
	return <a href={to} data-router="" {...props} />
}

const play = <button type="button" aria-label="Play Low tide">Play</button>

describe("MediaTile", () => {
	it("makes the title the tile's link, stretched over the tile — not a wrapper", () => {
		const { container } = render(<MediaTile title="Low tide" subtitle="Juno Avery" href="/albums/1" />)
		const link = screen.getByRole("link", { name: "Low tide" })
		expect(link.getAttribute("href")).toBe("/albums/1")
		expect(link.className).toContain("stretched-link")
		// The root is not interactive itself, and nothing interactive nests.
		const root = container.querySelector('[data-slot="media-tile"]')
		expect(root?.tagName).toBe("DIV")
		expect(link.querySelector("a, button")).toBeNull()
	})

	it("is router-agnostic through render props, for the title and the subtitle", () => {
		render(
			<MediaTile
				title="Low tide"
				subtitle="Juno Avery"
				render={<Link to="/albums/1" />}
				subtitleRender={<Link to="/artists/2" />}
			/>,
		)
		const title = screen.getByRole("link", { name: "Low tide" })
		const subtitle = screen.getByRole("link", { name: "Juno Avery" })
		expect(title.getAttribute("href")).toBe("/albums/1")
		expect(title.hasAttribute("data-router")).toBe(true)
		expect(subtitle.getAttribute("href")).toBe("/artists/2")
		// Raised above the stretched overlay, or the tile's link would swallow it.
		expect(subtitle.className).toMatch(/\bz-10\b/)
	})

	it("tabs title → subtitle → action, though the cover is drawn first", async () => {
		const user = userEvent.setup()
		render(<MediaTile title="Low tide" subtitle="Juno Avery" href="/a" subtitleHref="/b" action={play} />)
		await user.tab()
		expect(document.activeElement).toBe(screen.getByRole("link", { name: "Low tide" }))
		await user.tab()
		expect(document.activeElement).toBe(screen.getByRole("link", { name: "Juno Avery" }))
		await user.tab()
		expect(document.activeElement).toBe(screen.getByRole("button", { name: "Play Low tide" }))
	})

	it("reveals the action with the utility, keeping it in the tree and the tab order", () => {
		const { container } = render(<MediaTile title="Low tide" action={play} />)
		const slot = container.querySelector('[data-slot="media-tile-action"]')
		expect(slot?.className).toContain("reveal-on-hover")
		expect(slot?.getAttribute("aria-hidden")).toBeNull()
		expect(slot?.className).not.toMatch(/\b(hidden|invisible)\b/)
		// The root is the reveal host.
		expect(container.querySelector('[data-slot="media-tile"]')?.className).toMatch(/\bgroup\b/)
	})

	it("renders static text and no link when it has nowhere to go", () => {
		render(<MediaTile title="Dusk, no. 4" subtitle="Field recordings" />)
		expect(screen.queryByRole("link")).toBeNull()
		expect(screen.getByText("Dusk, no. 4").tagName).toBe("P")
	})

	it("paints art seeded by the title when there is no cover", () => {
		const { container } = render(<MediaTile title="Low tide" />)
		expect(container.querySelector('[data-slot="media-image-fallback"]')).not.toBeNull()
	})

	it("sets the cover's shape from aspect", () => {
		const { container, rerender } = render(<MediaTile title="Low tide" />)
		// jsdom may normalise "1" to "1 / 1"; compare the ratio, not the string.
		const ratio = () => {
			const value = container.querySelector<HTMLElement>('[data-slot="media-tile-cover"]')?.style.getPropertyValue("--sable-aspect") ?? ""
			const [w, h = "1"] = value.split("/")
			return Number(w) / Number(h)
		}
		expect(ratio()).toBe(1)
		rerender(<MediaTile title="Low tide" aspect="video" />)
		expect(ratio()).toBeCloseTo(16 / 9)
		rerender(<MediaTile title="Low tide" aspect={4 / 5} />)
		expect(ratio()).toBeCloseTo(0.8)
	})

	it("can make the title a heading, and keeps a truncated title's full text", () => {
		render(<MediaTile title="Low tide, high noon" titleAs="h3" href="/a" />)
		const heading = screen.getByRole("heading", { level: 3, name: "Low tide, high noon" })
		expect(heading.getAttribute("title")).toBe("Low tide, high noon")
	})
})

describe("MediaTile — product slots", () => {
	it("renders meta under the subtitle", () => {
		const { container } = render(
			<MediaTile
				title="Oak lounge chair"
				subtitle="Solid oak"
				src="/chair-800.jpg"
				srcSet="/chair-400.jpg 400w, /chair-800.jpg 800w"
				sizes="25vw"
				meta={<><span>$1,240</span><span>3 finishes</span></>}
			/>,
		)
		const meta = container.querySelector('[data-slot="media-tile-meta"]')
		expect(meta).toHaveTextContent("$1,2403 finishes")
		expect(screen.getByText("Solid oak").nextElementSibling).toBe(meta)
	})
})

describe("MediaTile — cover framing", () => {
	afterEach(() => {
		vi.unstubAllGlobals()
	})

	it("forwards `position` to the cover image as its object-position", () => {
		// jsdom never loads images: settle Base UI's preloader by hand.
		let preload: { onload?: () => void } | undefined
		vi.stubGlobal(
			"Image",
			class {
				onload?: () => void
				onerror?: () => void
				referrerPolicy = ""
				crossOrigin: string | null = null
				set src(_: string) {
					preload = this
				}
			},
		)
		const { container } = render(<MediaTile title="Harbour at dawn" src="/harbour.jpg" position="35% 50%" />)
		act(() => preload?.onload?.())
		const img = container.querySelector('[data-slot="media-tile-cover"] img') as HTMLImageElement | null
		expect(img?.classList.contains("object-cover")).toBe(true)
		expect(img?.style.objectPosition).toBe("35% 50%")
	})
})

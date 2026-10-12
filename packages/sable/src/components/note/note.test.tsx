import { render as renderBare } from "@testing-library/react"
import type { ReactElement, ReactNode } from "react"
import { describe, expect, it, vi } from "vitest"
import { IconProvider } from "../../icon"
import { reiconIconSet } from "../../icon-sets/reicon"
import { Note } from "./note"

// These assertions count real glyphs, so render with the set an app mounts.
const WithIcons = ({ children }: { children: ReactNode }) => <IconProvider set={reiconIconSet}>{children}</IconProvider>
const render = (ui: ReactElement) => renderBare(ui, { wrapper: WithIcons })

describe("Note action", () => {
	it("renders an onClick remedy as a button with no glyph", () => {
		// A right chevron means navigate or disclose. An in-place remedy does
		// neither, so the glyph promised a destination that did not exist — it
		// used to render for both shapes.
		const { getByRole, container } = render(
			<Note tone="warning" action={{ label: "Unload chat model", onClick: () => {} }}>
				gemma-4 is holding VRAM.
			</Note>,
		)
		const button = getByRole("button", { name: "Unload chat model" })
		expect(button.tagName).toBe("BUTTON")
		expect(container.querySelectorAll("svg")).toHaveLength(1) // the leading variant icon only
	})

	it("renders an href remedy as a link with the chevron", () => {
		const { getByRole, container } = render(
			<Note action={{ label: "Read the docs", href: "/docs" }}>Editions mint on mainnet.</Note>,
		)
		const link = getByRole("link", { name: /Read the docs/ })
		expect(link).toHaveAttribute("href", "/docs")
		expect(container.querySelectorAll("svg")).toHaveLength(2) // variant icon + chevron
	})

	it("underlines the action at rest, not only on hover", () => {
		// With the glyph gone, a neutral Note's action carries text-foreground —
		// the same ink as the body — so tone alone distinguished nothing and the
		// control leaned entirely on color. The rest state has to carry it.
		const { getByRole } = render(
			<Note tone="neutral" action={{ label: "Do the thing", onClick: () => {} }}>
				Drafts are saved locally.
			</Note>,
		)
		const cls = getByRole("button").className
		expect(cls).toContain("underline")
		expect(cls).not.toContain("hover:underline")
	})

	it("fires onClick", () => {
		const onClick = vi.fn()
		const { getByRole } = render(
			<Note action={{ label: "Retry", onClick }}>Upload failed.</Note>,
		)
		getByRole("button").click()
		expect(onClick).toHaveBeenCalledOnce()
	})

	it("renders no action affordance when action is omitted", () => {
		const { queryByRole } = render(<Note>Just context.</Note>)
		expect(queryByRole("button")).toBeNull()
		expect(queryByRole("link")).toBeNull()
	})
})

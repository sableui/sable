import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import { renderWithProviders, screen } from "../../test/render"
import { Switch } from "./switch"

describe("Switch", () => {
	it("keeps a white knob when on, not the primary's label ink", () => {
		// A mid-light brand colour needs dark LABEL ink, and the knob took that ink,
		// so the switch turned on into a dark knob. The knob reads its own token.
		renderWithProviders(<Switch aria-label="Notify" defaultChecked />)
		const thumb = screen.getByRole("switch", { name: "Notify" }).querySelector("span") as HTMLElement
		expect(thumb).toHaveClass("data-[checked]:bg-(--switch-thumb-on)")
		expect(thumb.className).not.toContain("primary-foreground")
	})

	it("turns the knob dark only on a track lighter than L 0.9", () => {
		const css = readFileSync(resolve(__dirname, "../../styles.css"), "utf8")
		expect(css).toContain("--switch-thumb-on: var(--theme-switch-thumb-on, oklch(from var(--primary) clamp(0.25, calc((0.9 - l) * 1000), 0.99) 0.002 90));")
	})
})

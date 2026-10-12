import { fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import {
	SABLE_COLOR_STORAGE_KEY,
	SABLE_THEME_ATTRIBUTE,
	SABLE_THEME_STORAGE_KEY,
	SableThemeProvider,
	applySableColorMode,
	applySableTheme,
	useSableTheme,
} from "./index"

const SUPPRESSOR_SELECTOR = "style[data-sable-theme-transition]"

function suppressorSheets() {
	return document.head.querySelectorAll(SUPPRESSOR_SELECTOR)
}

function resetRootTheme() {
	document.documentElement.className = ""
	document.documentElement.removeAttribute(SABLE_THEME_ATTRIBUTE)
	window.localStorage.clear()
	for (const sheet of suppressorSheets()) sheet.remove()
	vi.unstubAllGlobals()
}

/**
 * Replaces rAF with a queue we can drain by hand, so a test can inspect the DOM
 * between the mutation and the double-rAF cleanup.
 */
function stubAnimationFrames() {
	let queue: FrameRequestCallback[] = []
	vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
		queue.push(cb)
		return queue.length
	})
	return {
		/** Runs exactly one frame's worth of callbacks. */
		flushFrame() {
			const pending = queue
			queue = []
			for (const cb of pending) cb(0)
		},
		get pending() {
			return queue.length
		},
	}
}

function Probe() {
	const { mode, preference, themeId, setPreference, setThemeId, toggle } =
		useSableTheme()

	return (
		<div>
			<p data-testid="state">{`${themeId}:${preference}:${mode}`}</p>
			<button type="button" onClick={() => setPreference("dark")}>
				Dark
			</button>
			<button type="button" onClick={() => setPreference("light")}>
				Light
			</button>
			<button type="button" onClick={() => setThemeId("meridian")}>
				Cove
			</button>
			<button type="button" onClick={() => setThemeId("sable")}>
				Sable
			</button>
			<button type="button" onClick={toggle}>
				Toggle
			</button>
		</div>
	)
}

afterEach(resetRootTheme)

describe("SableThemeProvider", () => {
	it.each(["retired-theme", "atelier", "base"])("migrates stored %s to Sable and features six presets", (legacyId) => {
		window.localStorage.setItem(SABLE_THEME_STORAGE_KEY, legacyId)
		function PresetProbe() {
			const { themeId, themes } = useSableTheme()
			return <p data-testid="presets">{`${themeId}:${themes.map(theme => theme.id).join(",")}`}</p>
		}
		render(<SableThemeProvider><PresetProbe /></SableThemeProvider>)
		expect(screen.getByTestId("presets")).toHaveTextContent("sable:sable,meridian,prism,verdant,ember,poppy")
		expect(document.documentElement).not.toHaveAttribute(SABLE_THEME_ATTRIBUTE)
	})
	it.each([
		[false, "light"],
		[true, "dark"],
	])("follows the OS on a first visit (prefers dark: %s → %s)", (prefersDark, mode) => {
		vi.stubGlobal("matchMedia", (query: string) => ({
			matches: prefersDark && query === "(prefers-color-scheme: dark)",
			media: query,
			addEventListener: () => {},
			removeEventListener: () => {},
		}))
		render(
			<SableThemeProvider>
				<Probe />
			</SableThemeProvider>,
		)
		expect(screen.getByTestId("state")).toHaveTextContent(`sable:system:${mode}`)
		expect(document.documentElement.classList.contains("dark")).toBe(prefersDark)
	})

	it("hydrates stored choices and applies updates to the root element", () => {
		window.localStorage.setItem(SABLE_COLOR_STORAGE_KEY, "light")
		window.localStorage.setItem(SABLE_THEME_STORAGE_KEY, "meridian")

		render(
			<SableThemeProvider>
				<Probe />
			</SableThemeProvider>,
		)

		expect(screen.getByTestId("state")).toHaveTextContent("meridian:light:light")
		expect(document.documentElement).not.toHaveClass("dark")
		expect(document.documentElement).toHaveAttribute(SABLE_THEME_ATTRIBUTE, "meridian")

		fireEvent.click(screen.getByRole("button", { name: "Dark" }))
		expect(screen.getByTestId("state")).toHaveTextContent("meridian:dark:dark")
		expect(document.documentElement).toHaveClass("dark")
		expect(window.localStorage.getItem(SABLE_COLOR_STORAGE_KEY)).toBe("dark")

		fireEvent.click(screen.getByRole("button", { name: "Sable" }))
		expect(screen.getByTestId("state")).toHaveTextContent(
			"sable:dark:dark",
		)
		expect(document.documentElement).not.toHaveAttribute(SABLE_THEME_ATTRIBUTE)
		expect(window.localStorage.getItem(SABLE_THEME_STORAGE_KEY)).toBe("sable")
	})

	it("exposes standalone apply helpers for manual app-level control", () => {
		const element = document.createElement("div")

		applySableColorMode("dark", element)
		expect(element).toHaveClass("dark")

		applySableColorMode("light", element)
		expect(element).not.toHaveClass("dark")

		applySableTheme("meridian", element)
		expect(element).toHaveAttribute(SABLE_THEME_ATTRIBUTE, "meridian")

		applySableTheme("sable", element)
		expect(element).not.toHaveAttribute(SABLE_THEME_ATTRIBUTE)
	})
})

describe("theme-switch transition suppression", () => {
	it("suppresses transitions across the color-mode swap and lifts it after the committing paint", () => {
		const frames = stubAnimationFrames()
		const element = document.createElement("div")

		applySableColorMode("dark", element)

		// Mutation applied, suppressor still in place.
		expect(element).toHaveClass("dark")
		expect(suppressorSheets()).toHaveLength(1)
		expect(suppressorSheets()[0]?.textContent).toBe(
			"*,*::before,*::after{transition:none !important}",
		)

		// A single frame is deliberately too early — the paint that commits the
		// new colors has not happened yet.
		frames.flushFrame()
		expect(suppressorSheets()).toHaveLength(1)

		frames.flushFrame()
		expect(suppressorSheets()).toHaveLength(0)
	})

	it("suppresses transitions across the design-theme swap too", () => {
		const frames = stubAnimationFrames()
		const element = document.createElement("div")

		applySableTheme("meridian", element)
		expect(element).toHaveAttribute(SABLE_THEME_ATTRIBUTE, "meridian")
		expect(suppressorSheets()).toHaveLength(1)

		frames.flushFrame()
		frames.flushFrame()
		expect(suppressorSheets()).toHaveLength(0)

		// Removing the attribute (back to the default theme) is a color change too.
		applySableTheme("sable", element)
		expect(element).not.toHaveAttribute(SABLE_THEME_ATTRIBUTE)
		expect(suppressorSheets()).toHaveLength(1)

		frames.flushFrame()
		frames.flushFrame()
		expect(suppressorSheets()).toHaveLength(0)
	})

	it("applies the mutation directly when requestAnimationFrame is unavailable", () => {
		vi.stubGlobal("requestAnimationFrame", undefined)
		const element = document.createElement("div")

		applySableTheme("meridian", element)

		expect(element).toHaveAttribute(SABLE_THEME_ATTRIBUTE, "meridian")
		// No frames to wait for, so the sheet is gone by the time we return.
		expect(suppressorSheets()).toHaveLength(0)
	})

	it("no-ops without a target and never leaves a sheet behind", () => {
		const frames = stubAnimationFrames()

		applySableColorMode("dark", null)
		applySableTheme("meridian", null)

		expect(suppressorSheets()).toHaveLength(0)
		expect(frames.pending).toBe(0)
	})

	it("leaves no suppressor sheets behind after a provider-driven switch", () => {
		render(
			<SableThemeProvider>
				<Probe />
			</SableThemeProvider>,
		)

		fireEvent.click(screen.getByRole("button", { name: "Light" }))
		expect(document.documentElement).not.toHaveClass("dark")

		fireEvent.click(screen.getByRole("button", { name: "Cove" }))
		expect(document.documentElement).toHaveAttribute(
			SABLE_THEME_ATTRIBUTE,
			"meridian",
		)

		return new Promise<void>((resolve) => {
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					expect(suppressorSheets()).toHaveLength(0)
					resolve()
				})
			})
		})
	})
})

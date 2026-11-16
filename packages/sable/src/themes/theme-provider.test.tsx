import { act, fireEvent, render, screen } from "@testing-library/react"
import type { ComponentProps } from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { afterEach, describe, expect, it, vi } from "vitest"
import {
	SABLE_COLOR_STORAGE_KEY,
	SABLE_THEME_ATTRIBUTE,
	SABLE_THEME_STORAGE_KEY,
	SableThemeProvider,
	SableThemeScript,
	applySableColorMode,
	applySableTheme,
	sableThemeScript,
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
	it.each(["retired-theme", "base"])("migrates stored %s to Sable and features six presets", (legacyId) => {
		window.localStorage.setItem(SABLE_THEME_STORAGE_KEY, legacyId)
		function PresetProbe() {
			const { themeId, themes } = useSableTheme()
			return <p data-testid="presets">{`${themeId}:${themes.map(theme => theme.id).join(",")}`}</p>
		}
		render(<SableThemeProvider><PresetProbe /></SableThemeProvider>)
		expect(screen.getByTestId("presets")).toHaveTextContent("sable:sable,meridian,prism,verdant,ember,poppy")
		expect(document.documentElement).not.toHaveAttribute(SABLE_THEME_ATTRIBUTE)
	})
	it("moves a stored deprecated theme to its replacement", () => {
		window.localStorage.setItem(SABLE_THEME_STORAGE_KEY, "old-brand")
		const customThemes = [
			{ id: "old-brand", label: "Old brand", deprecated: { replacement: "ember" }, modes: ["light"], defaultMode: "light" },
		] as ComponentProps<typeof SableThemeProvider>["customThemes"]
		function ThemeProbe() {
			return <p data-testid="theme">{useSableTheme().themeId}</p>
		}
		render(<SableThemeProvider customThemes={customThemes}><ThemeProbe /></SableThemeProvider>)
		expect(screen.getByTestId("theme")).toHaveTextContent("ember")
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

	describe("two apps on one origin", () => {
		function renderApp(props: Partial<ComponentProps<typeof SableThemeProvider>> = {}) {
			return render(
				<SableThemeProvider defaultThemeId="ember" defaultPreference="dark" {...props}>
					<Probe />
				</SableThemeProvider>,
			)
		}

		it("ignores what another app saved when it names its own theme", () => {
			window.localStorage.setItem(SABLE_COLOR_STORAGE_KEY, "light")
			window.localStorage.setItem(SABLE_THEME_STORAGE_KEY, "meridian")
			renderApp()
			expect(screen.getByTestId("state")).toHaveTextContent("ember:dark:dark")
			expect(document.documentElement).toHaveAttribute(SABLE_THEME_ATTRIBUTE, "ember")
		})

		it("ignores another app's change in another tab", () => {
			renderApp()
			window.localStorage.setItem(SABLE_THEME_STORAGE_KEY, "meridian")
			act(() => {
				window.dispatchEvent(new StorageEvent("storage", { key: SABLE_THEME_STORAGE_KEY, newValue: "meridian" }))
			})
			expect(screen.getByTestId("state")).toHaveTextContent("ember:dark:dark")
		})

		it("keeps its own choices, and leaves the shared keys alone", () => {
			const app = renderApp()
			fireEvent.click(screen.getByRole("button", { name: "Cove" }))
			fireEvent.click(screen.getByRole("button", { name: "Light" }))
			app.unmount()

			renderApp()
			expect(screen.getByTestId("state")).toHaveTextContent("meridian:light:light")
			expect(window.localStorage.getItem(SABLE_THEME_STORAGE_KEY)).toBeNull()
			expect(window.localStorage.getItem(SABLE_COLOR_STORAGE_KEY)).toBeNull()
		})

		it("lets an explicit key share them again", () => {
			window.localStorage.setItem(SABLE_THEME_STORAGE_KEY, "meridian")
			renderApp({ themeStorageKey: SABLE_THEME_STORAGE_KEY })
			expect(screen.getByTestId("state")).toHaveTextContent("meridian:dark:dark")
		})

		it("stores nothing when persistence is off", () => {
			renderApp({ colorStorageKey: null, themeStorageKey: null })
			fireEvent.click(screen.getByRole("button", { name: "Cove" }))
			fireEvent.click(screen.getByRole("button", { name: "Light" }))
			expect(window.localStorage).toHaveLength(0)
		})
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

describe("server rendering and the pre-paint script", () => {
	function StateText() {
		const { themeId, preference, mode } = useSableTheme()
		return <p data-testid="ssr-state">{`${themeId}:${preference}:${mode}`}</p>
	}
	const app = (props: Partial<ComponentProps<typeof SableThemeProvider>> = {}) => (
		<SableThemeProvider {...props}>
			<StateText />
		</SableThemeProvider>
	)

	it("renders the defaults on the server without touching storage", () => {
		window.localStorage.setItem(SABLE_COLOR_STORAGE_KEY, "light")
		const getItem = vi.spyOn(Storage.prototype, "getItem")
		const html = renderToString(app({ defaultPreference: "dark" }))
		expect(html).toContain("sable:dark:dark")
		expect(getItem).not.toHaveBeenCalled()
		getItem.mockRestore()
	})

	it("hydrates without a mismatch, then takes the stored choice, never undoing the script", async () => {
		window.localStorage.setItem(SABLE_COLOR_STORAGE_KEY, "light")
		window.localStorage.setItem(SABLE_THEME_STORAGE_KEY, "meridian")
		const container = document.createElement("div")
		container.innerHTML = renderToString(app({ defaultPreference: "dark" }))
		document.body.appendChild(container)
		// What the inline script does before paint.
		new Function(sableThemeScript({ defaultPreference: "dark" }))()
		expect(document.documentElement).not.toHaveClass("dark")
		expect(document.documentElement).toHaveAttribute(SABLE_THEME_ATTRIBUTE, "meridian")

		const errors = vi.spyOn(console, "error").mockImplementation(() => {})
		const classWrites = vi.spyOn(document.documentElement.classList, "toggle")
		await act(async () => {
			hydrateRoot(container, app({ defaultPreference: "dark" }))
		})
		expect(errors).not.toHaveBeenCalled()
		expect(container.textContent).toBe("meridian:light:light")
		// The provider found <html> already right and wrote nothing.
		expect(classWrites).not.toHaveBeenCalled()
		expect(document.documentElement).not.toHaveClass("dark")
		expect(document.documentElement).toHaveAttribute(SABLE_THEME_ATTRIBUTE, "meridian")
		errors.mockRestore()
		classWrites.mockRestore()
		container.remove()
	})

	it.each([
		["nothing stored, dark default", {}, {}, true, null],
		["stored light + prism", { [SABLE_COLOR_STORAGE_KEY]: "light", [SABLE_THEME_STORAGE_KEY]: "prism" }, {}, false, "prism"],
		["garbage stored", { [SABLE_COLOR_STORAGE_KEY]: "purple", [SABLE_THEME_STORAGE_KEY]: "nope" }, {}, true, null],
		["app-owned keys ignore the shared ones", { [SABLE_THEME_STORAGE_KEY]: "prism" }, { defaultThemeId: "ember" }, true, "ember"],
		["app-owned keys", { [`${SABLE_THEME_STORAGE_KEY}:ember`]: "verdant", [`${SABLE_COLOR_STORAGE_KEY}:ember`]: "light" }, { defaultThemeId: "ember" }, false, "verdant"],
	] as const)("the script applies %s", (_label, stored, options, dark, theme) => {
		for (const [key, value] of Object.entries(stored)) window.localStorage.setItem(key, value)
		new Function(sableThemeScript({ defaultPreference: "dark", ...options }))()
		expect(document.documentElement.classList.contains("dark")).toBe(dark)
		expect(document.documentElement.getAttribute(SABLE_THEME_ATTRIBUTE)).toBe(theme)
	})

	it("resolves system through prefers-color-scheme, and survives storage that throws", () => {
		vi.stubGlobal("matchMedia", (query: string) => ({ matches: false, media: query }))
		const getItem = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
			throw new Error("denied")
		})
		new Function(sableThemeScript())()
		expect(document.documentElement).not.toHaveClass("dark")
		getItem.mockRestore()
	})

	it("moves a deprecated custom id to its replacement and escapes the inline payload", () => {
		window.localStorage.setItem(SABLE_THEME_STORAGE_KEY, "old</script>")
		const customThemes = [
			{ id: "old</script>", label: "Old", deprecated: { replacement: "ember" }, modes: ["light"], defaultMode: "light" },
		] as ComponentProps<typeof SableThemeProvider>["customThemes"]
		const script = sableThemeScript({ customThemes })
		expect(script).not.toContain("</script>")
		new Function(script)()
		expect(document.documentElement).toHaveAttribute(SABLE_THEME_ATTRIBUTE, "ember")
		const html = renderToString(<SableThemeScript nonce="abc" />)
		expect(html).toMatch(/^<script nonce="abc">\(function/)
	})

	it("reads <html> when there is no provider, instead of guessing dark", () => {
		document.documentElement.setAttribute(SABLE_THEME_ATTRIBUTE, "verdant")
		render(<StateText />)
		expect(screen.getByTestId("ssr-state")).toHaveTextContent("verdant:light:light")
		act(() => document.documentElement.classList.add("dark"))
		return Promise.resolve().then(() => {
			expect(screen.getByTestId("ssr-state")).toHaveTextContent("verdant:dark:dark")
		})
	})

	it("writes a getter target once per change, not on every parent render", () => {
		const el = document.createElement("div")
		const toggle = vi.spyOn(el.classList, "toggle")
		const view = render(app({ defaultPreference: "dark", target: () => el, colorStorageKey: null, themeStorageKey: null }))
		for (let i = 0; i < 3; i++) view.rerender(app({ defaultPreference: "dark", target: () => el, colorStorageKey: null, themeStorageKey: null }))
		expect(toggle).toHaveBeenCalledTimes(1)
		expect(el).toHaveClass("dark")
		expect(suppressorSheets().length).toBeLessThanOrEqual(1)
	})
})

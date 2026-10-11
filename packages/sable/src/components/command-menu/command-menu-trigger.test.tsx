import userEvent from "@testing-library/user-event"
import { axe } from "jest-axe"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"
import { fireEvent, renderWithProviders, screen } from "../../test/render"
import { CommandMenu } from "./command-menu"
import { CommandMenuTrigger, useCommandMenuShortcut } from "./command-menu-trigger"

// jsdom reports an empty navigator.platform, so these run as "not Apple": the
// modifier is Ctrl and the hint reads "Ctrl K".
const ctrlK = (target: Element | Window = window) =>
	fireEvent.keyDown(target, { key: "k", ctrlKey: true })

function Palette() {
	const [open, setOpen] = useState(false)
	return (
		<>
			<CommandMenuTrigger onOpen={() => setOpen(true)} />
			<CommandMenu
				open={open}
				onOpenChange={setOpen}
				items={[{ group: "Go", label: "Home", onSelect: () => {} }]}
			/>
		</>
	)
}

describe("CommandMenuTrigger", () => {
	it("is a button named by its label, with the shortcut hint and wiring", () => {
		renderWithProviders(<CommandMenuTrigger placeholder="Search docs" />)
		const button = screen.getByRole("button", { name: "Search docs" })
		expect(button).toHaveAttribute("type", "button")
		expect(button).toHaveAttribute("aria-haspopup", "dialog")
		expect(button).toHaveAttribute("aria-keyshortcuts", "Control+K")
		// One cap per key, inside a KbdGroup.
		const caps = [...button.querySelectorAll('[data-slot="kbd"]')].map((k) => k.textContent)
		expect(caps).toEqual(["Ctrl", "K"])
		// The field's shell, not a chip.
		expect(button.className).toContain("border-input")
		expect(button.className).toContain("bg-card")
	})

	it("defaults the label to Search and the size to the md rung", () => {
		renderWithProviders(<CommandMenuTrigger />)
		const button = screen.getByRole("button", { name: "Search" })
		expect(button.className).toContain("h-(--control-md)")
	})

	it("takes the sm rung", () => {
		renderWithProviders(<CommandMenuTrigger size="sm" />)
		expect(screen.getByRole("button").className).toContain("h-(--control-sm)")
	})

	it("calls onOpen on click", async () => {
		const onOpen = vi.fn()
		renderWithProviders(<CommandMenuTrigger onOpen={onOpen} />)
		await userEvent.click(screen.getByRole("button"))
		expect(onOpen).toHaveBeenCalledTimes(1)
	})

	it("calls onOpen on Ctrl+K and claims the keystroke", () => {
		const onOpen = vi.fn()
		renderWithProviders(<CommandMenuTrigger onOpen={onOpen} />)
		const event = new KeyboardEvent("keydown", { key: "k", ctrlKey: true, cancelable: true })
		window.dispatchEvent(event)
		expect(onOpen).toHaveBeenCalledTimes(1)
		expect(event.defaultPrevented).toBe(true)
	})

	it("opens a CommandMenu end to end", async () => {
		renderWithProviders(<Palette />)
		ctrlK()
		expect(await screen.findByRole("combobox")).toBeInTheDocument()
	})

	it("drops the hint and the listener when shortcut is false", () => {
		const onOpen = vi.fn()
		renderWithProviders(<CommandMenuTrigger onOpen={onOpen} shortcut={false} />)
		const button = screen.getByRole("button")
		expect(button).not.toHaveAttribute("aria-keyshortcuts")
		expect(button).not.toHaveTextContent("Ctrl")
		ctrlK()
		expect(onOpen).not.toHaveBeenCalled()
	})

	it("has no axe violations", async () => {
		const { container } = renderWithProviders(<CommandMenuTrigger />)
		const results = await axe(container, {
			rules: { "color-contrast": { enabled: false } },
		})
		expect(results.violations).toEqual([])
	})
})

function ShortcutHost({ onShortcut, shortcutKey }: { onShortcut: () => void; shortcutKey?: string | false }) {
	useCommandMenuShortcut(onShortcut, shortcutKey)
	return (
		<>
			<textarea aria-label="Notes" />
			<input aria-label="Name" />
			<input type="checkbox" aria-label="Agree" />
			<div contentEditable aria-label="Doc" role="textbox" tabIndex={0} />
			<input aria-label="Palette" data-command-menu-input="" />
		</>
	)
}

describe("useCommandMenuShortcut", () => {
	it("fires on Ctrl+K from the page", () => {
		const fn = vi.fn()
		renderWithProviders(<ShortcutHost onShortcut={fn} />)
		ctrlK(document.body)
		expect(fn).toHaveBeenCalledTimes(1)
	})

	it("is ignored in a textarea, a text input and contenteditable", () => {
		const fn = vi.fn()
		renderWithProviders(<ShortcutHost onShortcut={fn} />)
		ctrlK(screen.getByLabelText("Notes"))
		ctrlK(screen.getByLabelText("Name"))
		ctrlK(screen.getByLabelText("Doc"))
		expect(fn).not.toHaveBeenCalled()
	})

	it("still fires from a checkbox and from the palette's own input", () => {
		const fn = vi.fn()
		renderWithProviders(<ShortcutHost onShortcut={fn} />)
		ctrlK(screen.getByLabelText("Agree"))
		ctrlK(screen.getByLabelText("Palette"))
		expect(fn).toHaveBeenCalledTimes(2)
	})

	it("needs exactly the modifier and the key", () => {
		const fn = vi.fn()
		renderWithProviders(<ShortcutHost onShortcut={fn} />)
		fireEvent.keyDown(window, { key: "k" })
		fireEvent.keyDown(window, { key: "j", ctrlKey: true })
		fireEvent.keyDown(window, { key: "k", ctrlKey: true, shiftKey: true })
		fireEvent.keyDown(window, { key: "k", metaKey: true })
		expect(fn).not.toHaveBeenCalled()
		fireEvent.keyDown(window, { key: "K", ctrlKey: true })
		expect(fn).toHaveBeenCalledTimes(1)
	})

	it("takes another key, and false turns it off", () => {
		const fn = vi.fn()
		const { rerender } = renderWithProviders(<ShortcutHost onShortcut={fn} shortcutKey="/" />)
		ctrlK()
		fireEvent.keyDown(window, { key: "/", ctrlKey: true })
		expect(fn).toHaveBeenCalledTimes(1)
		rerender(<ShortcutHost onShortcut={fn} shortcutKey={false} />)
		fireEvent.keyDown(window, { key: "/", ctrlKey: true })
		expect(fn).toHaveBeenCalledTimes(1)
	})

	it("lets the first of two listeners claim the keystroke", () => {
		const first = vi.fn()
		const second = vi.fn()
		renderWithProviders(
			<>
				<ShortcutHost onShortcut={first} />
				<ShortcutHost onShortcut={second} />
			</>,
		)
		ctrlK()
		expect(first.mock.calls.length + second.mock.calls.length).toBe(1)
	})

	it("removes its listener on unmount", () => {
		const fn = vi.fn()
		const remove = vi.spyOn(window, "removeEventListener")
		const { unmount } = renderWithProviders(<ShortcutHost onShortcut={fn} />)
		unmount()
		expect(remove).toHaveBeenCalledWith("keydown", expect.any(Function))
		ctrlK()
		expect(fn).not.toHaveBeenCalled()
		remove.mockRestore()
	})
})

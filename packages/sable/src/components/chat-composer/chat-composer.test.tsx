import { afterEach, describe, expect, it, vi } from "vitest"
import { fireEvent, renderWithProviders, screen } from "../../test/render"
import { ChatComposer } from "./index"

/**
 * The composer's whole value is a handful of keyboard and state rules that are
 * individually one line and collectively the difference between a chat input
 * and a textarea. Each of these is one of those lines.
 */
describe("ChatComposer", () => {
	const field = () => screen.getByRole("textbox")
	const sendButton = () => screen.getByRole("button", { name: "Send message" })

	function type(text: string) {
		fireEvent.change(field(), { target: { value: text } })
	}

	it("sends on Enter and clears itself when uncontrolled", () => {
		const onSend = vi.fn()
		renderWithProviders(<ChatComposer onSend={onSend} />)
		type("ship it")
		fireEvent.keyDown(field(), { key: "Enter" })
		expect(onSend).toHaveBeenCalledWith("ship it")
		expect(field()).toHaveValue("")
	})

	it("breaks the line on Shift+Enter instead of sending", () => {
		const onSend = vi.fn()
		renderWithProviders(<ChatComposer onSend={onSend} />)
		type("first line")
		fireEvent.keyDown(field(), { key: "Enter", shiftKey: true })
		expect(onSend).not.toHaveBeenCalled()
		expect(field()).toHaveValue("first line")
	})

	it("with sendOn=\"mod-enter\", breaks the line on Enter and sends on Cmd/Ctrl+Enter", () => {
		const onSend = vi.fn()
		renderWithProviders(<ChatComposer onSend={onSend} sendOn="mod-enter" />)
		type("Hi Ada,")
		fireEvent.keyDown(field(), { key: "Enter" })
		expect(onSend).not.toHaveBeenCalled()
		fireEvent.keyDown(field(), { key: "Enter", ctrlKey: true })
		expect(onSend).toHaveBeenCalledWith("Hi Ada,")
		type("Thanks")
		fireEvent.keyDown(field(), { key: "Enter", metaKey: true })
		expect(onSend).toHaveBeenLastCalledWith("Thanks")
		expect(field()).toHaveAttribute("aria-keyshortcuts", "Meta+Enter Control+Enter")
	})

	it("does not send mid-IME-composition", () => {
		// A CJK reader pressing Enter to confirm a candidate word is choosing a
		// word, not sending a message. Without this guard they mail a fragment of
		// their first sentence — the most commonly missed line in a chat input.
		const onSend = vi.fn()
		renderWithProviders(<ChatComposer onSend={onSend} />)
		type("にほん")
		fireEvent.keyDown(field(), { key: "Enter", isComposing: true })
		expect(onSend).not.toHaveBeenCalled()

		fireEvent.keyDown(field(), { key: "Enter" })
		expect(onSend).toHaveBeenCalledWith("にほん")
	})

	it("never sends whitespace, and says so on the button", () => {
		const onSend = vi.fn()
		renderWithProviders(<ChatComposer onSend={onSend} />)
		expect(sendButton()).toBeDisabled()

		type("   \n  ")
		expect(sendButton()).toBeDisabled()
		fireEvent.keyDown(field(), { key: "Enter" })
		expect(onSend).not.toHaveBeenCalled()

		type(" real ")
		expect(sendButton()).toBeEnabled()
	})

	it("with allowEmpty, sends attachments without text", () => {
		const onSend = vi.fn()
		const { rerender } = renderWithProviders(<ChatComposer onSend={onSend} allowEmpty />)
		expect(sendButton()).toBeEnabled()
		fireEvent.click(sendButton())
		expect(onSend).toHaveBeenCalledWith("")

		// Whitespace still sends as nothing, never as spaces.
		type("  ")
		fireEvent.keyDown(field(), { key: "Enter" })
		expect(onSend).toHaveBeenLastCalledWith("")

		// It is permission, not an override: busy still blocks it.
		rerender(<ChatComposer onSend={onSend} allowEmpty busy />)
		expect(sendButton()).toBeDisabled()
	})

	describe("on a touch device", () => {
		const realMatchMedia = window.matchMedia
		afterEach(() => {
			window.matchMedia = realMatchMedia
		})
		function coarsePointer() {
			window.matchMedia = ((query: string) => ({
				matches: query === "(pointer: coarse)",
				media: query,
				onchange: null,
				addEventListener: () => {},
				removeEventListener: () => {},
				addListener: () => {},
				removeListener: () => {},
				dispatchEvent: () => false,
			})) as typeof window.matchMedia
		}

		it("breaks the line on Return, and the button sends", () => {
			// A soft keyboard has no Shift+Return. Enter-to-send there leaves no
			// way to write a second line.
			coarsePointer()
			const onSend = vi.fn()
			renderWithProviders(<ChatComposer onSend={onSend} />)
			type("first line")
			fireEvent.keyDown(field(), { key: "Enter" })
			expect(onSend).not.toHaveBeenCalled()
			fireEvent.click(sendButton())
			expect(onSend).toHaveBeenCalledWith("first line")
		})

		it("still sends on Cmd/Ctrl+Enter from a hardware keyboard, and says so", () => {
			coarsePointer()
			const onSend = vi.fn()
			renderWithProviders(<ChatComposer onSend={onSend} />)
			expect(field()).toHaveAttribute("aria-keyshortcuts", "Meta+Enter Control+Enter")
			type("from an iPad keyboard")
			fireEvent.keyDown(field(), { key: "Enter", ctrlKey: true })
			expect(onSend).toHaveBeenCalledWith("from an iPad keyboard")
		})

		it("drops a footer hint that is only true where Enter sends", () => {
			coarsePointer()
			const hint = ({ sendOn }: { sendOn: string }) => (sendOn === "enter" ? "Enter to send" : null)
			renderWithProviders(<ChatComposer footer={hint} />)
			expect(screen.queryByText("Enter to send")).toBeNull()
		})
	})

	it("shows a footer hint for the send key in effect", () => {
		renderWithProviders(<ChatComposer footer={({ sendOn }) => (sendOn === "enter" ? "Enter to send" : null)} />)
		expect(screen.getByText("Enter to send")).toBeInTheDocument()
	})

	it("trims what it sends", () => {
		const onSend = vi.fn()
		renderWithProviders(<ChatComposer onSend={onSend} />)
		type("  padded  ")
		fireEvent.click(sendButton())
		expect(onSend).toHaveBeenCalledWith("padded")
	})

	it("leaves a controlled composer for the caller to clear", () => {
		// Only the caller knows whether the send succeeded; clearing on their
		// behalf loses the message when it did not.
		const onSend = vi.fn()
		const onValueChange = vi.fn()
		renderWithProviders(
			<ChatComposer
				value="held"
				onValueChange={onValueChange}
				onSend={onSend}
			/>,
		)
		fireEvent.click(sendButton())
		expect(onSend).toHaveBeenCalledWith("held")
		expect(field()).toHaveValue("held")
	})

	it("reports keystrokes upward", () => {
		const onValueChange = vi.fn()
		renderWithProviders(<ChatComposer onValueChange={onValueChange} />)
		type("draft")
		expect(onValueChange).toHaveBeenCalledWith("draft")
	})

	it("swaps send for stop while busy, and only when it can stop", () => {
		const onStop = vi.fn()
		const { rerender } = renderWithProviders(
			<ChatComposer busy onStop={onStop} defaultValue="hi" />,
		)
		expect(screen.queryByRole("button", { name: "Send message" })).toBeNull()
		fireEvent.click(screen.getByRole("button", { name: "Stop generating" }))
		expect(onStop).toHaveBeenCalledTimes(1)

		// Busy with no way to stop keeps send visible, but refuses to fire.
		rerender(<ChatComposer busy defaultValue="hi" />)
		expect(screen.queryByRole("button", { name: "Stop generating" })).toBeNull()
		expect(sendButton()).toBeDisabled()
	})

	it("hands focus to the field on stop, before the button turns into a disabled send", () => {
		const { rerender } = renderWithProviders(<ChatComposer busy onStop={() => undefined} />)
		const stop = screen.getByRole("button", { name: "Stop generating" })
		stop.focus()
		fireEvent.click(stop)
		rerender(<ChatComposer onStop={() => undefined} />)
		expect(sendButton()).toBeDisabled()
		expect(field()).toHaveFocus()
	})

	it("refuses to send while busy or disabled", () => {
		const onSend = vi.fn()
		const { rerender } = renderWithProviders(
			<ChatComposer onSend={onSend} busy defaultValue="hi" />,
		)
		fireEvent.keyDown(field(), { key: "Enter" })
		expect(onSend).not.toHaveBeenCalled()

		rerender(<ChatComposer onSend={onSend} disabled defaultValue="hi" />)
		fireEvent.keyDown(field(), { key: "Enter" })
		expect(onSend).not.toHaveBeenCalled()
	})

	it("is a real form, so the send button submits it", () => {
		const onSend = vi.fn()
		const { container } = renderWithProviders(
			<ChatComposer onSend={onSend} defaultValue="via submit" />,
		)
		expect(container.firstElementChild?.tagName).toBe("FORM")
		expect(sendButton()).toHaveAttribute("type", "submit")
		fireEvent.submit(container.firstElementChild as HTMLFormElement)
		expect(onSend).toHaveBeenCalledWith("via submit")
	})

	it("renders the attach affordance only when it can attach", () => {
		const onAttach = vi.fn()
		const { rerender } = renderWithProviders(<ChatComposer />)
		expect(screen.queryByRole("button", { name: "Add attachment" })).toBeNull()

		rerender(<ChatComposer onAttach={onAttach} />)
		fireEvent.click(screen.getByRole("button", { name: "Add attachment" }))
		expect(onAttach).toHaveBeenCalledTimes(1)
	})

	it("labels the field and marks it invalid on request", () => {
		const { rerender } = renderWithProviders(<ChatComposer />)
		expect(screen.getByRole("textbox", { name: "Message" })).toBeInTheDocument()

		rerender(<ChatComposer invalid label="Reply" />)
		const el = screen.getByRole("textbox", { name: "Reply" })
		expect(el).toHaveAttribute("aria-invalid", "true")
	})

	it("caps its own growth so a pasted essay cannot eat the transcript", () => {
		renderWithProviders(<ChatComposer />)
		expect(field().className).toContain("max-h-40")
	})

	it("shows busy-without-stop through Button's own loading state", () => {
		renderWithProviders(<ChatComposer busy defaultValue="hi" />)
		expect(sendButton()).toHaveAttribute("aria-busy", "true")
	})

	it("keeps attachment chips concentric with the composer's corner", () => {
		renderWithProviders(<ChatComposer attachments={<span>file</span>} />)
		const row = document.querySelector("[data-slot=chat-composer-attachments]")
		expect(row?.className).toContain("[--attachment-radius:")
	})
})

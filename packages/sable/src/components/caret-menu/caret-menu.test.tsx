import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { type CaretTrigger, useCaretTrigger } from "../../lib/use-caret-trigger"
import { renderWithProviders, screen } from "../../test/render"
import { ChatComposer } from "../chat-composer"
import { Input } from "../input"
import { Textarea } from "../textarea"
import { CaretMenu, CaretMenuItem } from "./caret-menu"

const PEOPLE = ["Ada Lovelace", "Grace Hopper", "Alan Turing"]
const TRIGGERS: CaretTrigger[] = [{ char: "@", allowSpaces: true }, { char: "/", atStart: true }]

/**
 * jsdom has no layout, so the popup's place at the caret is checked in the
 * browser (docs page). What is pinned here is everything that does not need
 * pixels: when the list opens, the ARIA the field carries, the keys, and that
 * ChatComposer lets the list have Enter.
 */
function Mentions({
	field = "composer",
	onSend = () => undefined,
	onCommand = () => undefined,
}: {
	field?: "composer" | "textarea" | "input"
	onSend?: (text: string) => void
	onCommand?: (name: string) => void
}) {
	const trigger = useCaretTrigger({ triggers: TRIGGERS })
	const q = trigger.match?.query.toLowerCase() ?? ""
	const commands = trigger.match?.trigger.char === "/"
	const people = PEOPLE.filter((p) => p.toLowerCase().includes(q))
	return (
		<>
			{field === "composer" ? <ChatComposer fieldRef={trigger.fieldRef} onSend={onSend} /> : null}
			{field === "textarea" ? <Textarea ref={trigger.fieldRef} aria-label="Note" /> : null}
			{field === "input" ? <Input ref={trigger.fieldRef} aria-label="To" /> : null}
			<CaretMenu trigger={trigger} label={commands ? "Commands" : "People"} status={!commands && people.length === 0 ? "No one matches" : undefined}>
				{commands
					? ["summarize", "translate"]
							.filter((c) => c.startsWith(q))
							.map((c) => (
								<CaretMenuItem
									key={c}
									onSelect={() => {
										onCommand(c)
										trigger.replace("")
									}}
								>
									/{c}
								</CaretMenuItem>
							))
					: people.map((p) => (
							<CaretMenuItem key={p} onSelect={() => trigger.replace(`@${p} `)}>
								{p}
							</CaretMenuItem>
						))}
			</CaretMenu>
		</>
	)
}

const composerField = () => screen.getByRole("textbox", { name: "Message" }) as HTMLTextAreaElement

describe("CaretMenu — opening", () => {
	it("opens on the trigger with the matching suggestions, and stays shut otherwise", async () => {
		renderWithProviders(<Mentions />)
		await userEvent.type(composerField(), "hello ana@example")
		expect(screen.queryByRole("listbox")).toBeNull()
		await userEvent.type(composerField(), " @a")
		expect(screen.getByRole("listbox", { name: "People" })).toBeInTheDocument()
		expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["Ada Lovelace", "Grace Hopper", "Alan Turing"])
		await userEvent.type(composerField(), "l")
		expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["Alan Turing"])
	})

	it("shows the status row when nothing matches, and announces it", async () => {
		renderWithProviders(<Mentions />)
		await userEvent.type(composerField(), "@zz")
		expect(screen.queryAllByRole("option")).toHaveLength(0)
		expect(screen.getAllByText("No one matches").length).toBeGreaterThan(0)
		expect(screen.getAllByRole("status").some((s) => s.textContent === "No one matches")).toBe(true)
	})
})

describe("CaretMenu — the field speaks for the list", () => {
	it("a textarea keeps its textbox role and points at the list and its highlight", async () => {
		renderWithProviders(<Mentions field="textarea" />)
		const field = screen.getByRole("textbox", { name: "Note" })
		await userEvent.type(field, "@a")
		const list = screen.getByRole("listbox")
		expect(field).not.toHaveAttribute("role", "combobox")
		expect(field).toHaveAttribute("aria-autocomplete", "list")
		expect(field).toHaveAttribute("aria-controls", list.id)
		const first = screen.getAllByRole("option")[0]
		expect(field).toHaveAttribute("aria-activedescendant", first.id)
		expect(first).toHaveAttribute("aria-selected", "true")
		// Opening is announced, since a textbox may not carry aria-expanded.
		expect(screen.getAllByRole("status").some((s) => s.textContent === "3 suggestions")).toBe(true)
	})

	it("an input becomes a combobox with aria-expanded", async () => {
		renderWithProviders(<Mentions field="input" />)
		const field = screen.getByLabelText("To")
		await userEvent.type(field, "@a")
		expect(field).toHaveAttribute("role", "combobox")
		expect(field).toHaveAttribute("aria-expanded", "true")
		await userEvent.keyboard("{Escape}")
		expect(field).toHaveAttribute("aria-expanded", "false")
		expect(field).not.toHaveAttribute("aria-activedescendant")
	})

	it("hands the field back untouched when the menu unmounts, even while open", async () => {
		function Host({ menu }: { menu: boolean }) {
			const trigger = useCaretTrigger({ triggers: TRIGGERS })
			return (
				<>
					<Input ref={trigger.fieldRef} aria-label="To" />
					{menu ? (
						<CaretMenu trigger={trigger} label="People">
							{PEOPLE.map((p) => (
								<CaretMenuItem key={p} onSelect={() => undefined}>
									{p}
								</CaretMenuItem>
							))}
						</CaretMenu>
					) : null}
				</>
			)
		}
		const { rerender } = renderWithProviders(<Host menu />)
		const field = screen.getByLabelText("To")
		await userEvent.type(field, "@a")
		expect(field).toHaveAttribute("aria-activedescendant")
		rerender(<Host menu={false} />)
		for (const name of ["role", "aria-expanded", "aria-autocomplete", "aria-controls", "aria-activedescendant"]) {
			expect(field, name).not.toHaveAttribute(name)
		}
	})
})

describe("CaretMenu — keys", () => {
	it("moves the highlight with the arrows, wrapping, while focus stays in the field", async () => {
		renderWithProviders(<Mentions field="textarea" />)
		const field = screen.getByRole("textbox", { name: "Note" })
		await userEvent.type(field, "@a")
		const options = () => screen.getAllByRole("option")
		await userEvent.keyboard("{ArrowDown}")
		expect(field).toHaveAttribute("aria-activedescendant", options()[1].id)
		await userEvent.keyboard("{ArrowUp}{ArrowUp}")
		expect(field).toHaveAttribute("aria-activedescendant", options()[2].id)
		expect(field).toHaveFocus()
	})

	it("Enter in a ChatComposer picks the suggestion instead of sending", async () => {
		const onSend = vi.fn()
		renderWithProviders(<Mentions onSend={onSend} />)
		await userEvent.type(composerField(), "ping @gra")
		await userEvent.keyboard("{Enter}")
		expect(onSend).not.toHaveBeenCalled()
		expect(composerField().value).toBe("ping @Grace Hopper ")
		expect(screen.queryByRole("listbox")).toBeNull()
		// With the list closed, Enter sends again.
		await userEvent.keyboard("{Enter}")
		expect(onSend).toHaveBeenCalledWith("ping @Grace Hopper")
	})

	it("Tab picks too, and a slash command runs and clears its query", async () => {
		const onCommand = vi.fn()
		renderWithProviders(<Mentions onCommand={onCommand} />)
		await userEvent.type(composerField(), "/tr")
		await userEvent.keyboard("{Tab}")
		expect(onCommand).toHaveBeenCalledWith("translate")
		expect(composerField().value).toBe("")
	})

	it("Escape closes the list without sending, and Shift+Enter still breaks the line", async () => {
		const onSend = vi.fn()
		renderWithProviders(<Mentions onSend={onSend} />)
		await userEvent.type(composerField(), "@a")
		await userEvent.keyboard("{Escape}")
		expect(screen.queryByRole("listbox")).toBeNull()
		await userEvent.type(composerField(), "@b")
		await userEvent.keyboard("{Shift>}{Enter}{/Shift}")
		expect(onSend).not.toHaveBeenCalled()
		expect(composerField().value).toContain("\n")
	})

	it("a click picks a row without blurring the field", async () => {
		renderWithProviders(<Mentions field="textarea" />)
		const field = screen.getByRole("textbox", { name: "Note" })
		await userEvent.type(field, "@al")
		await userEvent.click(screen.getByRole("option", { name: "Alan Turing" }))
		expect((field as HTMLTextAreaElement).value).toBe("@Alan Turing ")
		expect(field).toHaveFocus()
	})
})

import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it } from "vitest"
import { type CaretTrigger, matchAt, type UseCaretTriggerResult, useCaretTrigger } from "./use-caret-trigger"

const AT: CaretTrigger = { char: "@", allowSpaces: true }
const SLASH: CaretTrigger = { char: "/", atStart: true }
const HASH: CaretTrigger = { char: "#" }

/** The match for `value` with the caret at its end. */
const at = (value: string, triggers = [AT, SLASH, HASH]) => matchAt(value, value.length, triggers)

/**
 * The trigger rules are pure (value + caret → match), so they are pinned here
 * directly. jsdom has no layout, so the caret geometry (`caretRect`) is left to
 * the browser; the docs page is where the popup's placement is checked.
 */
describe("matchAt — when a trigger opens", () => {
	it("opens at the start of the field and after whitespace", () => {
		expect(at("@sa")).toMatchObject({ query: "sa", start: 0, end: 3 })
		expect(at("hi @sa")).toMatchObject({ query: "sa", start: 3 })
		expect(at("(see @sa")).toMatchObject({ query: "sa" })
		expect(at("@")).toMatchObject({ query: "" })
	})

	it("stays shut inside a word, so an email or and/or is text", () => {
		expect(at("ana@example")).toBeNull()
		expect(at("and/or")).toBeNull()
	})

	it("keeps a slash command to the start of the field", () => {
		expect(at("/sum")).toMatchObject({ trigger: SLASH, query: "sum" })
		expect(at("  /sum")).toMatchObject({ trigger: SLASH })
		expect(at("please /sum")).toBeNull()
	})

	it("lets a query hold spaces only where the trigger allows them", () => {
		expect(at("@Sam Riv")).toMatchObject({ trigger: AT, query: "Sam Riv" })
		expect(at("#gen eral")).toBeNull()
		// A query never starts with a space: "@ " is someone typing an at sign.
		expect(at("@ sam")).toBeNull()
	})

	it("reads a trigger character that cannot open as part of an outer query", () => {
		// The "/" in "and/or" fails its own rules; it must not close the mention.
		expect(at("@Ana and/or")).toMatchObject({ trigger: AT, query: "Ana and/or", start: 0 })
		expect(at("hi @ana#2")).toMatchObject({ trigger: AT, query: "ana#2", start: 3 })
	})

	it("never spans a line, and gives up past maxQueryLength", () => {
		expect(at("@sam\nhello")).toBeNull()
		expect(matchAt("@abcdef", 7, [{ char: "@", maxQueryLength: 5 }])).toBeNull()
		expect(matchAt("@abcde", 6, [{ char: "@", maxQueryLength: 5 }])).toMatchObject({ query: "abcde" })
	})

	it("reads at the caret, not the end of the value", () => {
		// Caret just after "@sa" in "@sam rest": the query is what precedes it.
		expect(matchAt("@sam rest", 3, [HASH, { char: "@" }])).toMatchObject({ query: "sa", end: 3 })
		expect(matchAt("@sam rest", 9, [HASH, { char: "@" }])).toBeNull()
	})
})

function Field({ onTrigger, triggers = [AT, SLASH] }: { onTrigger: (t: UseCaretTriggerResult) => void; triggers?: CaretTrigger[] }) {
	// Controlled, so `replace()` is proven to go through React's change path.
	const [value, setValue] = useState("")
	const trigger = useCaretTrigger({ triggers })
	onTrigger(trigger)
	return (
		<>
			<textarea aria-label="Message" ref={trigger.fieldRef} value={value} onChange={(e) => setValue(e.target.value)} />
			<output data-testid="value">{value}</output>
		</>
	)
}

describe("useCaretTrigger — on a real field", () => {
	it("reports the query as it is typed, and closes when the trigger is deleted", async () => {
		let t!: UseCaretTriggerResult
		render(<Field onTrigger={(x) => (t = x)} />)
		const field = screen.getByLabelText("Message")
		await userEvent.type(field, "hi @sa")
		expect(t.match).toMatchObject({ query: "sa", start: 3, end: 6 })
		await userEvent.type(field, "{Backspace}{Backspace}{Backspace}")
		expect(t.match).toBeNull()
	})

	it("replace() swaps trigger and query, updates a controlled value, and leaves the caret after it", async () => {
		let t!: UseCaretTriggerResult
		render(<Field onTrigger={(x) => (t = x)} />)
		const field = screen.getByLabelText<HTMLTextAreaElement>("Message")
		await userEvent.type(field, "hi @sa")
		act(() => t.replace("@Sam Rivera "))
		expect(screen.getByTestId("value")).toHaveTextContent("hi @Sam Rivera")
		expect(field.value).toBe("hi @Sam Rivera ")
		expect(field.selectionStart).toBe("hi @Sam Rivera ".length)
		// The inserted mention starts with the same "@", and this trigger allows
		// spaces: without the close-on-choose rule, typing on would reopen the
		// list with the query "Sam Rivera x".
		await userEvent.type(field, "x")
		expect(t.match).toBeNull()
		await userEvent.type(field, " @gr")
		expect(t.match).toMatchObject({ query: "gr" })
	})

	it("replace('') clears a slash command", async () => {
		let t!: UseCaretTriggerResult
		render(<Field onTrigger={(x) => (t = x)} />)
		const field = screen.getByLabelText<HTMLTextAreaElement>("Message")
		await userEvent.type(field, "/sum")
		expect(t.match).toMatchObject({ trigger: SLASH, query: "sum" })
		act(() => t.replace(""))
		expect(field.value).toBe("")
		expect(t.match).toBeNull()
	})

	it("stays dismissed while the caret is in that trigger, and reopens for the next", async () => {
		let t!: UseCaretTriggerResult
		render(<Field onTrigger={(x) => (t = x)} triggers={[{ char: "@" }]} />)
		const field = screen.getByLabelText("Message")
		await userEvent.type(field, "@sa")
		act(() => t.dismiss())
		expect(t.match).toBeNull()
		await userEvent.type(field, "m")
		expect(t.match).toBeNull()
		await userEvent.type(field, " @jo")
		expect(t.match).toMatchObject({ query: "jo" })
	})

	it("closes on blur", async () => {
		let t!: UseCaretTriggerResult
		render(
			<>
				<Field onTrigger={(x) => (t = x)} />
				<button type="button">elsewhere</button>
			</>,
		)
		await userEvent.type(screen.getByLabelText("Message"), "@sa")
		expect(t.match).not.toBeNull()
		await userEvent.click(screen.getByRole("button", { name: "elsewhere" }))
		expect(t.match).toBeNull()
	})
})

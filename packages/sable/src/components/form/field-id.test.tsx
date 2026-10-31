import { render, screen } from "@testing-library/react"
import type { ReactElement } from "react"
import { describe, expect, it } from "vitest"
import { Checkbox } from "../checkbox"
import { Input } from "../input"
import { InputGroup } from "../input-group"
import { NumberField } from "../number-field"
import { SearchInput } from "../search-input"
import { Select, SelectContent, SelectItem, SelectTrigger } from "../select"
import { Switch } from "../switch"
import { Textarea } from "../textarea"
import { Field } from "./form"

const select = (
	<Select id="mine">
		<SelectTrigger placeholder="Pick" />
		<SelectContent>
			<SelectItem value="a">A</SelectItem>
		</SelectContent>
	</Select>
)

const select2 = (
	<Select>
		<SelectTrigger placeholder="Pick" />
		<SelectContent>
			<SelectItem value="a">A</SelectItem>
		</SelectContent>
	</Select>
)

describe("a caller's id on Field's control", () => {
	it.each<[string, ReactElement]>([
		["Input", <Input key="i" id="mine" />],
		["Textarea", <Textarea key="t" id="mine" />],
		["NumberField", <NumberField key="n" id="mine" />],
		["SearchInput", <SearchInput key="s" id="mine" />],
		["Checkbox", <Checkbox key="c" id="mine" />],
		["Switch", <Switch key="w" id="mine" />],
		["Select", select],
		[
			"InputGroup",
			<InputGroup key="g" leading="$">
				<Input id="mine" />
			</InputGroup>,
		],
		[
			"a Select's trigger",
			<Select key="t">
				<SelectTrigger id="mine" placeholder="Pick" />
				<SelectContent>
					<SelectItem value="a">A</SelectItem>
				</SelectContent>
			</Select>,
		],
	])("%s keeps it, and the label points at it", (_, control) => {
		const { container } = render(<Field label="Name">{control}</Field>)
		expect(container.querySelector("label")?.getAttribute("for")).toBe("mine")
		expect(container.querySelectorAll("#mine")).toHaveLength(1)
	})
})

describe("a Select in a Field with no id of its own", () => {
	it("has its label point at the trigger, so a click on the label reaches it", () => {
		const { container } = render(<Field label="Plan">{select2}</Field>)
		const target = container.querySelector("label")?.getAttribute("for")
		expect(target).toBeTruthy()
		expect(document.getElementById(target as string)).toBe(screen.getByRole("combobox"))
	})
})

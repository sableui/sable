import { act, renderHook } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { useFocusReturn } from "./focus-return"

/*
 * The decision alone. jsdom plays no exit animation, so a closing overlay
 * unmounts before another's focus can land, and an overlay handoff cannot be
 * staged through real components here.
 */
function setup(open: boolean) {
	const hook = renderHook(({ isOpen }) => useFocusReturn(isOpen, undefined), { initialProps: { isOpen: false } })
	if (open) hook.rerender({ isOpen: true })
	const popup = document.createElement("div")
	popup.innerHTML = "<button>inside</button>"
	document.body.append(popup)
	act(() => hook.result.current.focusReturn.popupRef(popup))
	return { hook, popup }
}

const button = (name: string) => {
	const el = document.createElement("button")
	el.textContent = name
	document.body.append(el)
	return el
}

afterEach(() => {
	document.body.innerHTML = ""
})

describe("finalFocus", () => {
	it("returns to the opener from inside the surface", () => {
		const opener = button("opener")
		opener.focus()
		const { hook, popup } = setup(true)
		popup.querySelector("button")?.focus()
		expect(hook.result.current.focusReturn.finalFocus("")).toBe(opener)
	})

	it("leaves focus alone when another overlay has already taken it", () => {
		const opener = button("opener")
		opener.focus()
		const { hook } = setup(true)
		button("in the next overlay").focus()
		expect(hook.result.current.focusReturn.finalFocus("")).toBe(false)
	})

	it("leaves focus alone when the opener has gone, as a menu item's does", () => {
		const opener = button("opener")
		opener.focus()
		const { hook } = setup(true)
		opener.remove()
		button("in the next overlay").focus()
		// `true` would make Base UI re-focus its own fallback, behind the new overlay.
		expect(hook.result.current.focusReturn.finalFocus("")).toBe(false)
	})

	it("leaves focus alone when nothing held it at open", () => {
		const { hook } = setup(true)
		button("in the next overlay").focus()
		expect(hook.result.current.focusReturn.finalFocus("")).toBe(false)
	})

	it("falls through to Base UI when there is no opener and focus is still inside", () => {
		const { hook, popup } = setup(true)
		popup.querySelector("button")?.focus()
		expect(hook.result.current.focusReturn.finalFocus("")).toBe(true)
	})
})

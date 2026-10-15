"use client"

import { useCallback, useEffect, useRef, useState } from "react"

/** A character that opens suggestions at the caret: `@` for people, `/` for commands. */
export interface CaretTrigger {
	/** The character typed to open suggestions, e.g. `"@"`, `"/"`, `"#"`, `":"`. */
	char: string
	/**
	 * Only at the start of the field (leading whitespace allowed), as a slash
	 * command is: `/sum` at the start opens, `and/or` mid-sentence does not.
	 * @default false
	 */
	atStart?: boolean
	/**
	 * Let the query hold spaces, for multi-word names (`@Sam Riv`). Off, a
	 * space ends the query and closes suggestions, which is what a command
	 * wants. A newline always ends it.
	 * @default false
	 */
	allowSpaces?: boolean
	/** Close once the query grows past this many characters. @default 32 */
	maxQueryLength?: number
}

/** The trigger the caret is inside, and what has been typed after it. */
export interface CaretTriggerMatch {
	/** The trigger that matched, as passed in. */
	trigger: CaretTrigger
	/** The text typed after the trigger character, up to the caret. */
	query: string
	/** Index of the trigger character in the field's value. */
	start: number
	/** Index just past the query (the caret). `replace()` swaps `start…end`. */
	end: number
}

export type CaretTriggerField = HTMLTextAreaElement | HTMLInputElement

export interface UseCaretTriggerOptions {
	/** The characters that open suggestions. */
	triggers: CaretTrigger[]
}

export interface UseCaretTriggerResult {
	/**
	 * Attach to the text field: `ref` on Textarea or Input, `fieldRef` on
	 * ChatComposer. To keep a ref of your own as well, merge the two.
	 */
	fieldRef: (node: CaretTriggerField | null) => void
	/** The attached field, once mounted. CaretMenu listens to its keys. */
	field: CaretTriggerField | null
	/** The open trigger and its query, or null when suggestions are closed. */
	match: CaretTriggerMatch | null
	/**
	 * The caret's box at the trigger character, in viewport coordinates, for
	 * anchoring a popup. Measured on demand (it moves when the field scrolls).
	 */
	getAnchorRect: () => DOMRect | null
	/**
	 * Swap the trigger and its query for `text`: `"@Sam Rivera "` for a
	 * mention, `""` to clear a slash command after running it. Goes through the
	 * field's own input path, so a controlled value updates and undo works.
	 */
	replace: (text: string) => void
	/** Close suggestions for this trigger until the caret leaves it. Escape does this. */
	dismiss: () => void
}

/**
 * Watch a plain text field for a trigger character at the caret — `@` for a
 * mention, `/` for a command — and report what has been typed after it.
 *
 * Headless, and the value stays a string: a mention becomes text in the
 * message (`@Sam Rivera`), not a token. That is what a textarea can hold, and
 * it covers slash commands entirely and mentions as most chat apps send them.
 * Chips inside the field need a rich-text editor, which Sable does not own
 * (`sable docs extending-a-component`). Pair it with CaretMenu for the list.
 *
 *   const trigger = useCaretTrigger({ triggers: [{ char: "@", allowSpaces: true }, { char: "/", atStart: true }] })
 *   <ChatComposer fieldRef={trigger.fieldRef} … />
 *   <CaretMenu trigger={trigger} label="Suggestions">…</CaretMenu>
 *
 * The rules a trigger follows, each one a bug in a naive version:
 *
 * - **Word boundary.** The character opens suggestions only at the start of
 *   the field or after whitespace or an opening bracket, so `ana@example.com`
 *   and `and/or` stay text.
 * - **Caret, not value.** The match is read at the caret, so moving the caret
 *   out of `@sam` (arrow keys, a click elsewhere) closes it and moving back
 *   reopens it. A selection (not a bare caret) never matches.
 * - **Composition.** While an IME is composing, the value is provisional; the
 *   match updates on `compositionend`, not on every candidate.
 * - **Dismissal sticks.** Escape closes this trigger until the caret leaves it
 *   or its character is deleted. Re-reading the value must not reopen it on
 *   the next keystroke.
 */
export function useCaretTrigger({ triggers }: UseCaretTriggerOptions): UseCaretTriggerResult {
	const [field, setField] = useState<CaretTriggerField | null>(null)
	const [match, setMatch] = useState<CaretTriggerMatch | null>(null)
	// Escape remembers the trigger's position; while the caret is still in that
	// trigger, it stays closed.
	const dismissedAt = useRef<number | null>(null)
	const composing = useRef(false)
	const triggersRef = useRef(triggers)
	triggersRef.current = triggers

	const evaluate = useCallback(() => {
		if (!field || composing.current) return
		const next =
			field.ownerDocument.activeElement === field ? findMatch(field, triggersRef.current) : null
		// Leaving the dismissed trigger (or deleting its character) lifts the dismissal.
		if (!next || next.start !== dismissedAt.current) dismissedAt.current = null
		const visible = next && dismissedAt.current === null ? next : null
		setMatch((prev) => (sameMatch(prev, visible) ? prev : visible))
	}, [field])

	useEffect(() => {
		if (!field) return
		const doc = field.ownerDocument
		const onSelection = () => {
			if (doc.activeElement === field) evaluate()
		}
		const onCompositionStart = () => {
			composing.current = true
		}
		const onCompositionEnd = () => {
			composing.current = false
			// A task later, not now: Safari fires compositionend before the final
			// `input`, and re-rendering here would write the pre-composition
			// value back (see the `input` listener below).
			setTimeout(evaluate, 0)
		}
		const onBlur = () => {
			dismissedAt.current = null
			setMatch(null)
		}
		// `input` is read on the document, AFTER React's root listener, never on
		// the field itself. A listener on the field runs first, and the browser
		// drains microtasks between listeners: our state update re-rendered the
		// field with its controlled value from before the keystroke, and React
		// wrote that back over the character just typed. Only the keystrokes
		// that changed the match vanished: the `@`, then each letter after it.
		// (jsdom dispatches without those checkpoints, so tests could not see it.)
		const onInput = (event: Event) => {
			if (event.target === field) evaluate()
		}
		doc.addEventListener("input", onInput)
		field.addEventListener("focus", evaluate)
		field.addEventListener("click", evaluate)
		field.addEventListener("keyup", evaluate)
		field.addEventListener("compositionstart", onCompositionStart)
		field.addEventListener("compositionend", onCompositionEnd)
		field.addEventListener("blur", onBlur)
		// Caret moves that fire no key or input event (a drag-select, a
		// programmatic setSelectionRange) still reach selectionchange.
		doc.addEventListener("selectionchange", onSelection)
		return () => {
			doc.removeEventListener("input", onInput)
			field.removeEventListener("focus", evaluate)
			field.removeEventListener("click", evaluate)
			field.removeEventListener("keyup", evaluate)
			field.removeEventListener("compositionstart", onCompositionStart)
			field.removeEventListener("compositionend", onCompositionEnd)
			field.removeEventListener("blur", onBlur)
			doc.removeEventListener("selectionchange", onSelection)
		}
	}, [field, evaluate])

	const dismiss = useCallback(() => {
		setMatch((current) => {
			if (current) dismissedAt.current = current.start
			return null
		})
	}, [])

	const replace = useCallback(
		(text: string) => {
			if (!field || !match) return
			insertText(field, match.start, match.end, text)
			// A chosen suggestion closes its trigger for good. `@Sam Rivera `
			// begins with the same `@`, and a trigger that allows spaces would
			// read everything typed after it as a new query and reopen the list.
			// If the inserted text dropped the character (a slash command's ""),
			// the next evaluate lifts this on its own.
			dismissedAt.current = match.start
			evaluate()
		},
		[field, match, evaluate],
	)

	const getAnchorRect = useCallback(() => {
		if (!field || !match) return null
		return caretRect(field, match.start)
	}, [field, match])

	return { fieldRef: setField, field, match, getAnchorRect, replace, dismiss }
}

/* ── Matching ─────────────────────────────────────────────────────────────── */

const BOUNDARY = /[\s([{"'“‘]/

/**
 * The trigger the caret sits in, if any. Exported for tests; the hook is the
 * public surface.
 */
export function findMatch(field: CaretTriggerField, triggers: CaretTrigger[]): CaretTriggerMatch | null {
	const { value, selectionStart, selectionEnd } = field
	if (selectionStart === null || selectionStart !== selectionEnd) return null
	return matchAt(value, selectionStart, triggers)
}

/** The pure core of `findMatch`: the trigger before `caret` in `value`. */
export function matchAt(value: string, caret: number, triggers: CaretTrigger[]): CaretTriggerMatch | null {
	// Walk back from the caret to the nearest character that could open a
	// trigger. Stop at a newline (a query never spans lines) and, for a trigger
	// that disallows spaces, at the first space.
	for (let i = caret - 1; i >= 0; i--) {
		const ch = value[i]
		if (ch === "\n") return null
		const trigger = triggers.find((t) => t.char === ch)
		// A trigger character that cannot open here is plain text: keep walking,
		// because it may sit inside an outer trigger's query ("@Ana and/or"
		// is one mention, not a slash that failed and closed it).
		if (trigger && opens(value, i, caret, trigger)) {
			return { trigger, query: value.slice(i + 1, caret), start: i, end: caret }
		}
		// A space can only sit inside the query of a trigger that allows them;
		// keep walking, and let the trigger found (if any) decide.
	}
	return null
}

/** Can the trigger at `i` open a query running to the caret? */
function opens(value: string, i: number, caret: number, trigger: CaretTrigger): boolean {
	const query = value.slice(i + 1, caret)
	if (!trigger.allowSpaces && /\s/.test(query)) return false
	if (query.length > (trigger.maxQueryLength ?? 32)) return false
	if (/^\s/.test(query)) return false
	const before = i === 0 ? "" : value[i - 1]
	if (before !== "" && !BOUNDARY.test(before)) return false
	if (trigger.atStart && value.slice(0, i).trim() !== "") return false
	return true
}

function sameMatch(a: CaretTriggerMatch | null, b: CaretTriggerMatch | null) {
	if (a === b) return true
	if (!a || !b) return false
	return a.trigger === b.trigger && a.query === b.query && a.start === b.start && a.end === b.end
}

/* ── Editing ──────────────────────────────────────────────────────────────── */

/**
 * Replace `start…end` with `text` and put the caret after it.
 *
 * `insertText` first: it goes through the browser's own editing path, so the
 * change lands in undo history and fires the `input` event React listens to.
 * Where that is unavailable (jsdom, a browser that refuses it), the value is
 * set through the native setter and an `input` event dispatched by hand. A
 * plain `field.value = …` would update the DOM and leave a controlled React
 * value behind, so the next render would put the old text back.
 */
function insertText(field: CaretTriggerField, start: number, end: number, text: string) {
	field.focus()
	field.setSelectionRange(start, end)
	const doc = field.ownerDocument
	const inserted =
		text === ""
			? typeof doc.execCommand === "function" && doc.execCommand("delete", false)
			: typeof doc.execCommand === "function" && doc.execCommand("insertText", false, text)
	if (!inserted || field.value.slice(start, start + text.length) !== text) {
		const next = field.value.slice(0, start) + text + field.value.slice(end)
		const proto = field instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
		Object.getOwnPropertyDescriptor(proto, "value")?.set?.call(field, next)
		field.dispatchEvent(new Event("input", { bubbles: true }))
	}
	const caret = start + text.length
	field.setSelectionRange(caret, caret)
}

/* ── Geometry ─────────────────────────────────────────────────────────────── */

/** The properties that decide where text wraps and lands, copied to the mirror. */
const MIRRORED = [
	"boxSizing",
	"width",
	"borderTopWidth",
	"borderRightWidth",
	"borderBottomWidth",
	"borderLeftWidth",
	"paddingTop",
	"paddingRight",
	"paddingBottom",
	"paddingLeft",
	"fontFamily",
	"fontSize",
	"fontStyle",
	"fontVariant",
	"fontWeight",
	"fontStretch",
	"fontFeatureSettings",
	"lineHeight",
	"letterSpacing",
	"wordSpacing",
	"textIndent",
	"textTransform",
	"tabSize",
	"direction",
] as const

/**
 * Where a character sits on screen, measured with a mirror.
 *
 * A textarea does not expose its caret's position, so an off-screen element
 * copies everything that decides layout (width, padding, border, font,
 * spacing, wrapping), holds the text up to the index, and a marker span after
 * it reports where the next character would land. Field scroll is subtracted,
 * so a long message scrolled inside a capped composer still anchors at the
 * visible caret. An input does not wrap, so its mirror keeps one line.
 *
 * jsdom has no layout: there every box is zero, which is why the tests pin
 * the trigger rules and leave geometry to the browser.
 */
export function caretRect(field: CaretTriggerField, index: number): DOMRect {
	const doc = field.ownerDocument
	const view = doc.defaultView ?? window
	const style = view.getComputedStyle(field)
	const mirror = doc.createElement("div")
	const s = mirror.style
	for (const prop of MIRRORED) s[prop] = style[prop]
	s.position = "absolute"
	s.visibility = "hidden"
	s.top = "0"
	s.left = "-9999px"
	s.overflow = "hidden"
	const multiline = field instanceof HTMLTextAreaElement
	s.whiteSpace = multiline ? "pre-wrap" : "pre"
	s.overflowWrap = multiline ? "break-word" : "normal"
	mirror.textContent = field.value.slice(0, index)
	const marker = doc.createElement("span")
	// The marker holds the rest of the text so wrapping matches; a lone
	// zero-width space would let the last word fit where the real one does not.
	marker.textContent = field.value.slice(index) || "​"
	mirror.appendChild(marker)
	doc.body.appendChild(mirror)
	const box = field.getBoundingClientRect()
	const lineHeight = Number.parseFloat(style.lineHeight) || marker.offsetHeight
	const rect = new DOMRect(
		box.left + marker.offsetLeft - field.scrollLeft,
		box.top + marker.offsetTop - field.scrollTop,
		1,
		lineHeight,
	)
	mirror.remove()
	return rect
}

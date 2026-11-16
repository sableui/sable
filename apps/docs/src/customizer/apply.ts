import { type DependencyList, useLayoutEffect, useRef, useState } from "react"
import type { LookDecls } from "./look"

/*
 * Applying the look to the page, and reading it back, at frame rate.
 *
 * A drag changes the look once per animation frame (useFrameDrag). Each change
 * restyles the whole page, because every token lives on :root. That restyle is
 * the unavoidable floor; everything here exists to add as little as possible
 * on top of it:
 *
 * - The look lives in two persistent CSSOM rules (`:root:root:root` and its
 *   `.dark`). A change sets only the declarations that differ, once per frame,
 *   instead of re-parsing a stylesheet.
 * - The panel's read-backs (palette swatches, measured ladders) share one probe
 *   pass after the write, so the page's style is resolved once, not once per
 *   reader. During a continuous change (a drag, a scrub, a held arrow key) they
 *   wait until the value settles: they are informational, and the controls
 *   themselves never wait.
 * - Anything that watches <head> for theme changes (GradientArt, the iPhone
 *   preview bridge) hears about a CSSOM write through a comment node, at most
 *   every SIGNAL_MS while a drag runs and once when it settles.
 */

export const LOOK_STYLE_ID = "sable-docs-look"
const SELECTORS = [":root:root:root", ":root:root:root.dark"] as const
/** Changes closer together than this are one continuous gesture. */
const SETTLE_MS = 120
/** How often a running gesture tells theme watchers (GradientArt) to repaint. */
const SIGNAL_MS = 200

type Block = Map<string, string>

let applied: [Block, Block] | null = null
let pending: LookDecls | null = null
let writeFrame = 0
let lastWrite = Number.NEGATIVE_INFINITY
let lastSignal = Number.NEGATIVE_INFINITY
let settleTimer = 0
let marker: Comment | null = null
let revision = 0

/*
 * A pointer held down is a gesture in progress, however slowly the frames
 * come: on a loaded page a drag's steps can land further apart than SETTLE_MS,
 * and each one was taken for a lone change that reads everything back. So
 * while any pointer is down, every write counts as continuous; letting go
 * settles it.
 */
let pointerHeld = false
if (typeof window !== "undefined") {
	window.addEventListener("pointerdown", () => { pointerHeld = true }, { capture: true, passive: true })
	const release = () => {
		if (!pointerHeld) return
		pointerHeld = false
		if (performance.now() - lastWrite < SETTLE_MS * 4) settle()
	}
	window.addEventListener("pointerup", release, { capture: true, passive: true })
	window.addEventListener("pointercancel", release, { capture: true, passive: true })
}

function parse(decls: readonly string[]): Block {
	const out: Block = new Map()
	for (const decl of decls) {
		const colon = decl.indexOf(":")
		if (colon < 0) continue
		out.set(decl.slice(0, colon).trim(), decl.slice(colon + 1).replace(/;\s*$/, "").trim())
	}
	return out
}

function rules(): [CSSStyleRule, CSSStyleRule] {
	let style = document.getElementById(LOOK_STYLE_ID) as HTMLStyleElement | null
	if (!style) {
		style = document.createElement("style")
		style.id = LOOK_STYLE_ID
		document.head.appendChild(style)
	}
	const sheet = style.sheet as CSSStyleSheet
	const list = sheet.cssRules
	const intact = list.length === 2 && SELECTORS.every((selector, i) => (list[i] as CSSStyleRule).selectorText === selector)
	if (!intact || !applied) {
		// First write in this module instance (a fresh load, or a hot reload):
		// start from empty rules so nothing stale survives.
		while (sheet.cssRules.length) sheet.deleteRule(0)
		SELECTORS.forEach((selector, i) => sheet.insertRule(`${selector} {}`, i))
		applied = [new Map(), new Map()]
	}
	return [sheet.cssRules[0] as CSSStyleRule, sheet.cssRules[1] as CSSStyleRule]
}

function flush() {
	writeFrame = 0
	const next = pending
	pending = null
	if (!next) return
	const targets = rules()
	const blocks = [parse(next.root), parse(next.dark)]
	let changed = false
	blocks.forEach((block, i) => {
		const rule = targets[i]
		const was = (applied as [Block, Block])[i]
		for (const name of was.keys()) {
			if (!block.has(name)) {
				rule.style.removeProperty(name)
				changed = true
			}
		}
		for (const [name, value] of block) {
			if (was.get(name) !== value) {
				rule.style.setProperty(name, value)
				changed = true
			}
		}
		;(applied as [Block, Block])[i] = block
	})
	if (changed) afterWrite()
}

/** Apply the look's declarations: coalesced to one CSSOM write per animation frame. */
export function writeLook(decls: LookDecls) {
	pending = decls
	if (!writeFrame) writeFrame = requestAnimationFrame(flush)
}

/** Apply a pending write now (before reading the page synchronously). */
export function flushLook() {
	if (!writeFrame) return
	cancelAnimationFrame(writeFrame)
	flush()
}

/** Tell <head> watchers that a token changed: a comment's text, which no style depends on. */
function signal() {
	lastSignal = performance.now()
	if (!marker || !marker.isConnected) {
		marker = document.createComment("")
		document.head.appendChild(marker)
	}
	marker.data = `sable-docs-look ${++revision}`
}

/** The gesture is over: tell theme watchers and read everything back, once. */
function settle() {
	window.clearTimeout(settleTimer)
	settleTimer = 0
	signal()
	for (const reader of readers) queued.add(reader)
	scheduleProbes()
}

function afterWrite() {
	const now = performance.now()
	const continuous = pointerHeld || now - lastWrite < SETTLE_MS
	lastWrite = now
	window.clearTimeout(settleTimer)
	if (!continuous) {
		// A single change (a click, a key press): read back right away, in the
		// same frame as the write, so the page's style resolves once.
		signal()
		runProbes([...readers])
		return
	}
	if (now - lastSignal >= SIGNAL_MS) signal()
	// Released (or a burst of keys ended): settle once things go quiet.
	if (!pointerHeld) settleTimer = window.setTimeout(settle, SETTLE_MS)
}

/* ── Probes ───────────────────────────────────────────────────────────────── */

type Reader = (probe: HTMLElement) => void
const readers = new Set<Reader>()
const queued = new Set<Reader>()
let probeFrame = 0

const PROBE_STYLE = "position:absolute;visibility:hidden;pointer-events:none;inset:0 auto auto 0;width:0;height:0;overflow:hidden"

/** One hidden element on <body> — outside the panel's isolation, so it sees the page's look — shared by every reader. */
function runProbes(list: Reader[]) {
	if (!list.length) return
	const probe = document.createElement("div")
	probe.setAttribute("aria-hidden", "true")
	document.body.appendChild(probe)
	try {
		for (const read of list) {
			probe.className = ""
			probe.style.cssText = PROBE_STYLE
			read(probe)
		}
	} finally {
		probe.remove()
	}
}

function scheduleProbes() {
	if (probeFrame) return
	probeFrame = requestAnimationFrame(() => {
		probeFrame = 0
		const list = [...queued]
		queued.clear()
		runProbes(list)
	})
}

function same(a: unknown, b: unknown) {
	return a === b || JSON.stringify(a) === JSON.stringify(b)
}

/**
 * A value read back from the page — a resolved token, a measured length —
 * refreshed after the look is applied (and when `deps` change). `read` gets the
 * shared probe element; set what you need on it and read its computed style.
 * Prefer properties that resolve without layout (`min-width`, `color`): a
 * resolved `width` forces a layout of the whole page.
 */
export function useLookProbe<T>(read: (probe: HTMLElement) => T, deps: DependencyList, enabled = true): T | undefined {
	const [value, setValue] = useState<T>()
	const latest = useRef(read)
	latest.current = read
	// `deps` are the caller's: what else changes the reading (the mode, the rows).
	useLayoutEffect(() => {
		if (!enabled) return
		const reader: Reader = (probe) => {
			const next = latest.current(probe)
			setValue((prev) => (same(prev, next) ? prev : next))
		}
		readers.add(reader)
		queued.add(reader)
		scheduleProbes()
		return () => {
			readers.delete(reader)
			queued.delete(reader)
		}
	}, [enabled, ...deps])
	return value
}

/**
 * `value`, held back while it changes continuously: a burst of changes closer
 * than SETTLE_MS apart arrives once, when it stops. A lone change passes
 * straight through. For work a drag should not pay for on every frame (the
 * panel's option previews), never for the controls themselves.
 */
export function useSettled<T>(value: T): T {
	const [settled, setSettled] = useState(value)
	const last = useRef(Number.NEGATIVE_INFINITY)
	useLayoutEffect(() => {
		const now = performance.now()
		const continuous = pointerHeld || now - last.current < SETTLE_MS
		last.current = now
		if (!continuous) {
			setSettled(value)
			return
		}
		// Wait for quiet, and for the pointer to come up.
		let timer = 0
		const land = () => {
			if (pointerHeld) timer = window.setTimeout(land, SETTLE_MS)
			else setSettled(value)
		}
		timer = window.setTimeout(land, SETTLE_MS)
		return () => window.clearTimeout(timer)
	}, [value])
	return settled
}

/**
 * The colours the page paints now, resolved on the shared probe: palette
 * families are relative colours computed from --primary, and would re-resolve
 * against the panel's own house theme if their values were painted in it.
 * `mode` is a dependency because toggling `.dark` changes them without a look write.
 */
export function useLiveColors(tokens: readonly string[], mode: string): Record<string, string> {
	return (
		useLookProbe(
			(probe) => {
				const out: Record<string, string> = {}
				for (const token of tokens) {
					probe.style.color = `var(--${token})`
					out[token] = getComputedStyle(probe).color
				}
				return out
			},
			[tokens, mode],
		) ?? EMPTY_COLORS
	)
}
const EMPTY_COLORS: Record<string, string> = {}

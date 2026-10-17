"use client"

import {
	type ComponentPropsWithRef,
	type CSSProperties,
	type ReactNode,
	type TransitionEvent,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react"
import { cn } from "../../lib/cn"
import { useIsomorphicLayoutEffect } from "../../lib/use-isomorphic-layout-effect"
import { type MotionLevel, motionAttribute, useMotionLevel } from "../../motion/MotionProvider"

export interface NumberTickerProps extends Omit<ComponentPropsWithRef<"span">, "children" | "prefix"> {
	/** The number to show. When it changes, the digits roll to it. */
	value: number
	/** How to write the number — currency, percent, fraction digits, compact. Passed to `Intl.NumberFormat`. */
	format?: Intl.NumberFormatOptions
	/** BCP 47 locale(s) for the formatting. @default the runtime locale */
	locales?: string | string[]
	/** Before the number. A string is part of the number's text (and rolls in or out with it); an element is rendered as given. */
	prefix?: ReactNode
	/** After the number ("+", " pts"). A string is part of the number's text; an element is rendered as given. */
	suffix?: ReactNode
	/**
	 * Which way the digits roll. `auto` rolls up when the value grows and down
	 * when it shrinks, like an odometer; `up` / `down` fix the direction (a
	 * countdown, a score that only climbs). @default "auto"
	 */
	trend?: "auto" | "up" | "down"
	/**
	 * How much motion this component uses: `full` (default) inherits the app's
	 * policy, `subtle` keeps feedback and drops the flourish, `off` stills it. It
	 * can only turn motion down — it never overrides a reader's reduce-motion
	 * setting.
	 */
	motion?: MotionLevel
}

type Direction = "up" | "down"

/** One character position in the written number. */
type Cell =
	| { key: string; rank: number; kind: "digit"; digit: number }
	| { key: string; rank: number; kind: "static"; char: string }

/**
 * Three copies of 0–9 in each column. The column rests on the middle copy, so
 * a roll can always continue in its direction — 9 → 0 going up runs on into
 * the copy below instead of spinning back down through 8…1 — and settles back
 * onto the middle copy, invisibly, when it lands.
 */
const COPIES = 3
const CELLS = COPIES * 10
const MIDDLE = 10

/**
 * The roll is EXPRESSIVE: a token duration multiplied by --motion-expressive,
 * so `subtle` (and off, through the token's own --motion-scale) lands the new
 * value at once. Emphasized easing: the digits leave quickly and settle, which
 * reads as a counter turning rather than a slide.
 */
const ROLL = "calc(var(--motion-duration-slower) * var(--motion-expressive, 1)) var(--motion-ease-emphasized)"
/** A column arriving or leaving: its width eases (no layout jump), its ink fades. */
const RESIZE = `width ${ROLL}, opacity var(--motion-duration-fast) var(--motion-ease-standard)`

/** Stagger from the right — the ones turn first, as in a mechanical counter. */
function rollDelay(placeFromRight: number): string {
	return `calc(${Math.min(placeFromRight, 8) * 30}ms * var(--motion-scale, 1) * var(--motion-expressive, 1))`
}

/**
 * Split a formatted number into cells, keyed by PLACE VALUE rather than by
 * position in the string. 999 → 1,000 then keeps the ones, tens and hundreds
 * columns (they roll 9 → 0) and only the thousands digit and its separator are
 * new; keyed by index, every column would have shifted one place and rolled at
 * once. `rank` orders a merged list of current and leaving cells.
 */
function cellsFor(parts: Intl.NumberFormatPart[], glyphs: string[], prefix: string, suffix: string): Cell[] {
	const digitOf = (ch: string) => glyphs.indexOf(ch)
	const integerDigits = parts
		.filter((p) => p.type === "integer")
		.reduce((n, p) => n + [...p.value].filter((ch) => digitOf(ch) >= 0).length, 0)
	const cells: Cell[] = []
	if (prefix) cells.push({ key: "prefix", rank: 0, kind: "static", char: prefix })
	let seenInteger = 0
	let fraction = 0
	let after = 0
	let afterNumber = false
	const before: Cell[] = []
	const typeCount = new Map<string, number>()
	for (const part of parts) {
		if (part.type === "integer") {
			afterNumber = true
			for (const ch of part.value) {
				const digit = digitOf(ch)
				const place = integerDigits - 1 - seenInteger
				if (digit < 0) {
					cells.push({ key: `i${place}x`, rank: 2e6 - place * 2, kind: "static", char: ch })
					continue
				}
				seenInteger++
				cells.push({ key: `i${place}`, rank: 2e6 - place * 2, kind: "digit", digit })
			}
		} else if (part.type === "group") {
			// The separator above a place: "1,234" and "12,345" share `g3`.
			const place = integerDigits - seenInteger
			cells.push({ key: `g${place}`, rank: 2e6 - place * 2 + 1, kind: "static", char: part.value })
		} else if (part.type === "decimal") {
			afterNumber = true
			cells.push({ key: "decimal", rank: 3e6, kind: "static", char: part.value })
		} else if (part.type === "fraction") {
			for (const ch of part.value) {
				const digit = digitOf(ch)
				const at = fraction++
				cells.push(
					digit < 0
						? { key: `f${at}x`, rank: 4e6 + at, kind: "static", char: ch }
						: { key: `f${at}`, rank: 4e6 + at, kind: "digit", digit },
				)
			}
		} else {
			// Signs, currency, percent, compact suffixes, literals: keyed by type and
			// by which side of the number they sit, so "$" stays "$" as digits change.
			const side = afterNumber ? "a" : "b"
			const n = typeCount.get(`${side}${part.type}`) ?? 0
			typeCount.set(`${side}${part.type}`, n + 1)
			const cell: Cell = { key: `${side}-${part.type}-${n}`, rank: 5e6 + after++, kind: "static", char: part.value }
			if (afterNumber) cells.push(cell)
			else before.push(cell)
		}
	}
	// Ranked by distance from the number, outward: "-$5" → "$5" keeps the
	// leaving minus left of the "$" while it collapses. Ranked from the start of
	// the string, the two would tie and could swap places for the transition.
	before.forEach((cell, i) => {
		cell.rank = 2e6 - 1e5 - (before.length - i)
	})
	if (suffix) cells.push({ key: "suffix", rank: 6e6, kind: "static", char: suffix })
	return [...before, ...cells].sort((a, b) => a.rank - b.rank)
}

/** The cell as text — a character's glyph is generated content, so it stays out of textContent and copy. */
const GLYPH = "before:content-[attr(data-char)]"
/** A cell is an inline box one line tall; its invisible copy of the glyph gives it width and baseline. */
const CELL = "relative inline-block whitespace-pre"

/**
 * A static character (separator, sign, currency). Clipped only sideways, so a
 * comma's tail is never cut, but a collapsing cell does not spill its glyph
 * over the next one.
 */
function StaticCell({ char }: { char: string }) {
	return (
		<>
			<span data-char={char} className={cn("invisible", GLYPH)} />
			<span data-char={char} className={cn("absolute inset-0 overflow-x-clip", GLYPH)} />
		</>
	)
}

interface DigitCellProps {
	digit: number
	glyphs: string[]
	direction: Direction
	delay: string
	animate: boolean
}

const translateFor = (pos: number) => `0 ${(-pos / CELLS) * 100}%`

/**
 * One digit column: 0–9 (three times) stacked, clipped to one line, and
 * translated to the digit. The position is written imperatively after the
 * first render — React owns only the resting position it rendered with, so a
 * re-render never fights a roll in flight.
 */
function DigitCell({ digit, glyphs, direction, delay, animate }: DigitCellProps) {
	const stack = useRef<HTMLSpanElement>(null)
	const [initial] = useState(() => MIDDLE + digit)
	const pos = useRef(initial)

	/** Move without a transition — settling onto the middle copy, or motion off. */
	const snap = (el: HTMLSpanElement, to: number) => {
		const transition = el.style.transition
		el.style.transition = "none"
		el.style.translate = translateFor(to)
		// Flush the jump before the transition comes back, or it would animate.
		void el.offsetHeight
		el.style.transition = transition
		pos.current = to
	}

	useIsomorphicLayoutEffect(() => {
		const el = stack.current
		if (!el || pos.current % 10 === digit) return
		if (!animate) {
			snap(el, MIDDLE + digit)
			return
		}
		const target = (from: number) => {
			let to = from - (from % 10) + digit
			if (direction === "up" && to < from) to += 10
			if (direction === "down" && to > from) to -= 10
			return to
		}
		let to = target(pos.current)
		// Off the end of the stack — only when a landing was missed (a roll that
		// never reported its end). Settle onto the middle copy, then roll from there.
		if (to < 0 || to >= CELLS) {
			snap(el, MIDDLE + (pos.current % 10))
			to = target(pos.current)
		}
		el.style.translate = translateFor(to)
		pos.current = to
	}, [digit, direction, animate])

	const settle = (event: TransitionEvent<HTMLSpanElement>) => {
		if (event.target !== event.currentTarget || event.propertyName !== "translate") return
		const at = pos.current
		if (at < MIDDLE || at >= MIDDLE + 10) snap(event.currentTarget, MIDDLE + (at % 10))
	}

	return (
		<>
			<span data-char={glyphs[digit]} className={cn("invisible", GLYPH)} />
			<span className="absolute inset-0 overflow-clip">
				<span
					ref={stack}
					onTransitionEnd={settle}
					className="absolute inset-x-0 top-0 flex flex-col"
					style={{ translate: translateFor(initial), transition: `translate ${ROLL} ${delay}` }}
				>
					{Array.from({ length: CELLS }, (_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: a column's positions are fixed
						<span key={i} data-char={glyphs[i % 10]} className={GLYPH} />
					))}
				</span>
			</span>
		</>
	)
}

interface Track {
	text: string
	value: number
	cells: Cell[]
	/** Cells the last change removed, kept while they collapse. */
	leaving: Cell[]
	direction: Direction
	/** False until the value first changes: the first paint is at rest. */
	changed: boolean
}

/**
 * A number that rolls to its new value digit by digit, like an odometer —
 * for a figure that changes in place while someone watches it: a dashboard
 * total, a live count, a price as options change. Each digit is a column that
 * turns to its new place; separators, signs and units hold still; a digit that
 * appears or goes away eases its width, so the text around it never jumps.
 *
 * The first render is at rest — a number on first paint is content, not news.
 * Under `subtle` (or reduced motion) the value simply updates. The visible
 * columns are aria-hidden; the whole written number is real text for assistive
 * tech and for copying. It is not a live region — pass `aria-live` when a
 * change should be announced.
 */
export function NumberTicker({
	value,
	format,
	locales,
	prefix,
	suffix,
	trend = "auto",
	motion,
	className,
	...props
}: NumberTickerProps) {
	const { expressive } = useMotionLevel(motion)
	const formatKey = JSON.stringify(format ?? {})
	const localeKey = Array.isArray(locales) ? locales.join(",") : (locales ?? "")
	// biome-ignore lint/correctness/useExhaustiveDependencies: keyed by value, so an inline `format={{…}}` does not rebuild the formatter every render
	const { formatter, glyphs } = useMemo(() => {
		const f = new Intl.NumberFormat(locales, format)
		// The digits in the locale's own numbering system (Arabic-Indic, Devanagari…), so the columns roll through the same glyphs the number is written in.
		const digits = new Intl.NumberFormat(locales, { numberingSystem: f.resolvedOptions().numberingSystem, useGrouping: false })
		return { formatter: f, glyphs: Array.from({ length: 10 }, (_, d) => digits.format(d)) }
	}, [formatKey, localeKey])

	const prefixText = typeof prefix === "string" || typeof prefix === "number" ? String(prefix) : ""
	const suffixText = typeof suffix === "string" || typeof suffix === "number" ? String(suffix) : ""
	const parts = formatter.formatToParts(value)
	const text = `${prefixText}${parts.map((p) => p.value).join("")}${suffixText}`

	const [track, setTrack] = useState<Track>(() => ({
		text,
		value,
		cells: cellsFor(parts, glyphs, prefixText, suffixText),
		leaving: [],
		direction: "up",
		changed: false,
	}))

	// A new value: derive the next track during render (React's "adjust state
	// when a prop changes" pattern), so leaving cells stay in the very commit
	// that removes them instead of blinking out for a frame.
	let current = track
	if (track.text !== text) {
		const cells = cellsFor(parts, glyphs, prefixText, suffixText)
		const keys = new Set(cells.map((c) => c.key))
		current = {
			text,
			value,
			cells,
			leaving: expressive ? [...track.leaving, ...track.cells].filter((c) => !keys.has(c.key)) : [],
			direction: trend === "auto" ? (value < track.value ? "down" : "up") : trend,
			changed: true,
		}
		setTrack(current)
	}

	// A fallback for leaving cells whose collapse never reports its end (no
	// `interpolate-size`, or a hidden tab). By then they are already invisible.
	useEffect(() => {
		if (!current.leaving.length) return
		const id = setTimeout(() => setTrack((t) => (t.leaving.length ? { ...t, leaving: [] } : t)), 1200)
		return () => clearTimeout(id)
	}, [current.leaving])

	const drop = (key: string) => (event: TransitionEvent<HTMLSpanElement>) => {
		if (event.target !== event.currentTarget || event.propertyName !== "width") return
		setTrack((t) => ({ ...t, leaving: t.leaving.filter((c) => c.key !== key) }))
	}

	const leavingKeys = new Set(current.leaving.map((c) => c.key))
	const shown = [...current.cells, ...current.leaving].sort((a, b) => a.rank - b.rank)
	const animate = expressive && current.changed
	// Each digit's place from the right, for the stagger.
	const placeFromRight = new Map<string, number>()
	let place = 0
	for (let i = shown.length - 1; i >= 0; i--) if (shown[i].kind === "digit") placeFromRight.set(shown[i].key, place++)

	return (
		<span
			data-slot="number-ticker"
			data-motion={motionAttribute(motion)}
			className={cn("inline-block whitespace-nowrap tabular-nums [interpolate-size:allow-keywords]", className)}
			{...props}
		>
			{prefixText ? null : prefix}
			<span className="sr-only">{text}</span>
			{/* Numbers read left to right in every script; without this, the cells — atomic
			    inlines to the bidi algorithm — would reverse inside right-to-left text. */}
			<span aria-hidden="true" dir="ltr">
				{shown.map((cell) => {
					const leaving = leavingKeys.has(cell.key)
					return (
						<span
							key={cell.key}
							onTransitionEnd={leaving ? drop(cell.key) : undefined}
							className={cn(
								CELL,
								// A cell that arrives after the first paint grows in from nothing.
								// @starting-style only applies to a newly inserted element, so the
								// cells already on screen ignore it.
								animate && !leaving && "starting:w-0 starting:opacity-0",
								leaving && "w-0 opacity-0",
							)}
							style={animate ? ({ transition: RESIZE } as CSSProperties) : undefined}
						>
							{cell.kind === "digit" ? (
								<DigitCell
									digit={cell.digit}
									glyphs={glyphs}
									direction={current.direction}
									delay={rollDelay(placeFromRight.get(cell.key) ?? 0)}
									animate={animate}
								/>
							) : (
								<StaticCell char={cell.char} />
							)}
						</span>
					)
				})}
			</span>
			{suffixText ? null : suffix}
		</span>
	)
}
NumberTicker.displayName = "NumberTicker"

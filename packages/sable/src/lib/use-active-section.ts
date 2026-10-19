"use client"

import { type RefObject, useEffect, useState } from "react"

export interface UseActiveSectionOptions {
	/**
	 * Where the reading line sits, as a fraction of the viewport's height from
	 * its top. A section becomes current once its top crosses the line, so the
	 * one being read wins over the one merely peeking in at the bottom.
	 * @default 0.35
	 */
	offset?: number
	/**
	 * The element that scrolls, when it is not the window — a `Scroller`, an
	 * inset `AppShell` main, a docs preview.
	 */
	root?: RefObject<HTMLElement | null>
}

/** A rounding allowance: a scroll that ends a fraction of a pixel short is at the end. */
const END_SLACK = 2

/**
 * useActiveSection — which of these sections the reader is in. The scroll spy
 * behind `SectionRail`, exported for a contents list a consumer draws itself
 * (an "On this page" column, a chapter select).
 *
 *   const active = useActiveSection(["intro", "usage", "api"])
 *
 * The current section is the last one, in the order given, whose top has
 * crossed the reading line (`offset`). Before any has, the first one is
 * current: the reader is at the start. Once the scroller reaches its end the
 * last section in view wins instead, because a short closing section can never
 * climb to the line and would otherwise never become current.
 *
 * Measures on scroll and resize, at most once a frame. Ids missing from the
 * document are skipped, so sections may mount late. Returns `null` only for an
 * empty list.
 */
export function useActiveSection(
	ids: readonly string[],
	{ offset = 0.35, root }: UseActiveSectionOptions = {},
): string | null {
	const [active, setActive] = useState<string | null>(ids[0] ?? null)
	// The effect depends on the ids' content, not the array's identity: callers
	// pass an inline `sections.map(…)` that is new every render.
	const key = ids.join("\n")

	useEffect(() => {
		const list = key ? key.split("\n") : []
		if (list.length === 0) {
			setActive(null)
			return
		}
		const scroller = root?.current ?? null
		let frame = 0

		const measure = () => {
			frame = 0
			const top = scroller ? scroller.getBoundingClientRect().top : 0
			const height = scroller ? scroller.clientHeight : window.innerHeight
			const line = top + height * offset
			const bottom = top + height
			const scrolled = scroller ? scroller.scrollTop : window.scrollY
			const range = scroller
				? scroller.scrollHeight - scroller.clientHeight
				: document.documentElement.scrollHeight - window.innerHeight
			const atEnd = range > END_SLACK && scrolled >= range - END_SLACK
			let current = list[0]
			for (const id of list) {
				const section = document.getElementById(id)
				if (!section) continue
				const sectionTop = section.getBoundingClientRect().top
				if (sectionTop <= line || (atEnd && sectionTop < bottom)) current = id
			}
			setActive(current)
		}
		const schedule = () => {
			if (!frame) frame = requestAnimationFrame(measure)
		}

		measure()
		const target: HTMLElement | Window = scroller ?? window
		target.addEventListener("scroll", schedule, { passive: true })
		window.addEventListener("resize", schedule)
		// Content above a section growing (an image loading, a disclosure
		// opening) moves it without a scroll.
		const resize = new ResizeObserver(schedule)
		resize.observe(scroller ?? document.documentElement)
		for (const id of list) {
			const section = document.getElementById(id)
			if (section) resize.observe(section)
		}
		return () => {
			cancelAnimationFrame(frame)
			target.removeEventListener("scroll", schedule)
			window.removeEventListener("resize", schedule)
			resize.disconnect()
		}
	}, [key, offset, root])

	return active
}

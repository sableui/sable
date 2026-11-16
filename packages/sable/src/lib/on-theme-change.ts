"use client";

const themeListeners = new Set<() => void>()
let observer: MutationObserver | null = null
let pending = 0

/**
 * Called after anything that can change a token: the mode class, the preset
 * attribute or inline variables on <html>, and any stylesheet added to or
 * rewritten in <head> (a live theme editor rewrites one per frame). One
 * observer for the page, coalesced to a frame.
 */
export function onThemeChange(listener: () => void): () => void {
	themeListeners.add(listener)
	if (!observer && typeof MutationObserver !== "undefined") {
		const notify = () => {
			if (pending) return
			pending = requestAnimationFrame(() => {
				pending = 0
				for (const fn of themeListeners) fn()
			})
		}
		observer = new MutationObserver(notify)
		observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style", "data-sable-theme"] })
		observer.observe(document.head, { childList: true, subtree: true, characterData: true })
	}
	return () => {
		themeListeners.delete(listener)
		if (!themeListeners.size && observer) {
			observer.disconnect()
			observer = null
			cancelAnimationFrame(pending)
			pending = 0
		}
	}
}

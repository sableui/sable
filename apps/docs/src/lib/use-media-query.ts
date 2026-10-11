import { useCallback, useSyncExternalStore } from "react"

/**
 * Whether a media query matches, kept live. False when prerendering, so
 * anything that differs by it should be something the first paint can do
 * without (an overlay, an alternate layout picked after load).
 */
export function useMediaQuery(query: string) {
	const subscribe = useCallback(
		(onChange: () => void) => {
			const list = window.matchMedia(query)
			list.addEventListener("change", onChange)
			return () => list.removeEventListener("change", onChange)
		},
		[query],
	)
	return useSyncExternalStore(
		subscribe,
		() => window.matchMedia(query).matches,
		() => false,
	)
}

/** Tailwind's `lg`: where the Customize panel floats beside the page. */
export const WIDE = "(min-width: 64rem)"

/**
 * A phone in the hand: a narrow screen driven by touch. Not just width — a
 * narrow desktop window is not a phone, and should keep the framed device.
 */
export const PHONE = "(max-width: 47.99rem) and (pointer: coarse)"

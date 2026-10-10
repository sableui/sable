"use client";

import { useCallback, useEffect, useRef, useState } from "react"

export interface UseCopyOptions {
	/** How long `copied` stays true after a successful copy, in ms. @default 1500 */
	timeout?: number
}

export interface UseCopyResult {
	/** Write the text to the clipboard. Resolves true on success. */
	copy: () => Promise<boolean>
	/** True for `timeout` ms after a successful copy — swap the icon on it. */
	copied: boolean
}

/**
 * Copy text to the clipboard and know, briefly, that it worked. Copying is a
 * BEHAVIOUR, not a kind of button: pair this with the ordinary icon Button so a
 * copy control looks and behaves exactly like every other icon button.
 *
 *   const { copy, copied } = useCopy(address)
 *   <Button variant="ghost" size="icon-sm" aria-label="Copy address" onClick={copy}>
 *     <Icon name={copied ? "check" : "copy"} />
 *   </Button>
 *
 * Clipboard access is guarded, so it is SSR-safe and fails quietly (resolving
 * false) where the API is missing or the write is refused.
 */
export function useCopy(text: string, { timeout = 1500 }: UseCopyOptions = {}): UseCopyResult {
	const [copied, setCopied] = useState(false)
	const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

	// Clear a pending reset if the owner unmounts mid-flash.
	useEffect(() => () => {
		if (timer.current) clearTimeout(timer.current)
	}, [])

	const copy = useCallback(async () => {
		if (typeof navigator === "undefined" || !navigator.clipboard) return false
		try {
			await navigator.clipboard.writeText(text)
		} catch {
			// Refused (permissions, unfocused document, insecure context): no flash.
			return false
		}
		setCopied(true)
		if (timer.current) clearTimeout(timer.current)
		timer.current = setTimeout(() => setCopied(false), timeout)
		return true
	}, [text, timeout])

	return { copy, copied }
}

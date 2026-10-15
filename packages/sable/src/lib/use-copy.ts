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

/** The text to copy, or a function that produces it at click time. */
export type CopySource = string | (() => string | Promise<string>)

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
 * Text that costs something to produce (a file to fetch, a document to
 * serialise) is passed as a function, called only on click:
 * `useCopy(() => fetch(url).then((r) => r.text()))`. A promise goes to the
 * clipboard as a pending ClipboardItem, because Safari honours a write only
 * when it starts inside the click, not after an await.
 *
 * Clipboard access is guarded, so it is SSR-safe and fails quietly (resolving
 * false) where the API is missing, the write is refused, or the text rejects.
 */
export function useCopy(text: CopySource, { timeout = 1500 }: UseCopyOptions = {}): UseCopyResult {
	const [copied, setCopied] = useState(false)
	const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

	// Clear a pending reset if the owner unmounts mid-flash.
	useEffect(() => () => {
		if (timer.current) clearTimeout(timer.current)
	}, [])

	const copy = useCallback(async () => {
		if (typeof navigator === "undefined" || !navigator.clipboard) return false
		try {
			const value = typeof text === "function" ? text() : text
			if (typeof value === "string") await navigator.clipboard.writeText(value)
			else if (typeof ClipboardItem !== "undefined" && navigator.clipboard.write) {
				const blob = value.then((t) => new Blob([t], { type: "text/plain" }))
				await navigator.clipboard.write([new ClipboardItem({ "text/plain": blob })])
			} else await navigator.clipboard.writeText(await value)
		} catch {
			// Refused (permissions, unfocused document, insecure context) or the
			// text itself failed: no flash.
			return false
		}
		setCopied(true)
		if (timer.current) clearTimeout(timer.current)
		timer.current = setTimeout(() => setCopied(false), timeout)
		return true
	}, [text, timeout])

	return { copy, copied }
}

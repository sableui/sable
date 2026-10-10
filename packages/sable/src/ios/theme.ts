import type { CSSProperties } from "react"

const NAMES = [
	"--background",
	"--card",
	"--foreground",
	"--muted-foreground",
	"--primary",
	"--primary-foreground",
	"--muted",
	"--font-sans",
	"--font-display",
	"--type-title-weight",
] as const

/** Resolved preset values or app-owned CSS variables, keyed by Sable's semantic names. */
export type IosBrandTokens = Partial<Record<(typeof NAMES)[number], string>>

/**
 * Set Sable's semantic tokens on the native root. `ios/styles.css` maps those
 * names onto the native chrome (canvas, ink, panels, tint, title font), so this
 * is only needed when the values do not already come from Sable's styles in the
 * same document — e.g. a preset sent from a host page. Geometry is never themed.
 */
export function iosThemeStyle(tokens: IosBrandTokens): CSSProperties {
	return Object.fromEntries(NAMES.flatMap((name) => (tokens[name] === undefined ? [] : [[name, tokens[name]]]))) as CSSProperties
}

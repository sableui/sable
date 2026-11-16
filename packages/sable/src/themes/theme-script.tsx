// No "use client": this renders in a server <head>. It shares the provider's
// keys through registry.ts, never by importing the (client) provider module.
import {
	SABLE_COLOR_STORAGE_KEY,
	SABLE_THEME_ATTRIBUTE,
	SABLE_THEME_STORAGE_KEY,
	buildThemeManifestById,
	defaultThemeId as sableDefaultThemeId,
} from "./registry"
import type { ThemeManifest } from "./_contract"
import type { AnyThemeId, SableThemePreference } from "./theme-provider"

export interface SableThemeScriptOptions {
	/** Same as the provider's `defaultPreference`. @default "system" */
	defaultPreference?: SableThemePreference
	/** Same as the provider's `defaultThemeId`. @default "sable" */
	defaultThemeId?: AnyThemeId
	/**
	 * Same as the provider's `colorStorageKey`; null reads nothing. Defaults to
	 * the key the provider uses for this `defaultThemeId`.
	 */
	colorStorageKey?: string | null
	/** Same as the provider's `themeStorageKey`; null reads nothing. */
	themeStorageKey?: string | null
	/** Same as the provider's `customThemes`, so a stored custom id is honoured. */
	customThemes?: readonly ThemeManifest[]
}

/** The provider's default key rule, repeated so script and provider agree. */
function defaultKey(key: string, defaultThemeId: AnyThemeId) {
	return defaultThemeId === sableDefaultThemeId ? key : `${key}:${defaultThemeId}`
}

/** JSON that is safe inside an inline <script>: no `</script>`, no U+2028/9. */
function inlineJson(value: unknown) {
	return JSON.stringify(value)
		.replace(/</g, "\\u003c")
		.split(String.fromCharCode(0x2028)).join(`\\u2028`)
		.split(String.fromCharCode(0x2029)).join(`\\u2029`)
}

/**
 * The pre-paint theme boot script, as a string to inline in `<head>` before any
 * stylesheet paints the page. It does what `SableThemeProvider` does after
 * hydration — reads the stored colour preference and theme id with the
 * provider's own keys and rules, resolves "system" through
 * `prefers-color-scheme`, and writes `.dark` and `data-sable-theme` on
 * `<html>` — but before first paint, so a server-rendered or static page opens
 * in the visitor's mode and theme instead of flashing the default.
 *
 * Pass the same options you pass the provider (they must agree, or the two
 * disagree about which key to read). Put `suppressHydrationWarning` on
 * `<html>`: the script changes its class and attribute before React hydrates.
 * Only the root target is supported; a provider scoped with `target` needs no
 * script. Storage errors fall back to the defaults.
 *
 * ```tsx
 * // Next.js app/layout.tsx
 * <html lang="en" suppressHydrationWarning>
 *   <head><SableThemeScript defaultPreference="dark" /></head>
 *   <body><SableThemeProvider defaultPreference="dark">…</SableThemeProvider></body>
 * </html>
 * ```
 *
 * Or, in a static index.html: `<script>${sableThemeScript()}</script>`.
 */
export function sableThemeScript({
	defaultPreference = "system",
	defaultThemeId = sableDefaultThemeId,
	colorStorageKey = defaultKey(SABLE_COLOR_STORAGE_KEY, defaultThemeId),
	themeStorageKey = defaultKey(SABLE_THEME_STORAGE_KEY, defaultThemeId),
	customThemes,
}: SableThemeScriptOptions = {}): string {
	const manifests = buildThemeManifestById(customThemes)
	// Known ids → the id to apply (a deprecated id moves to its replacement).
	const ids: Record<string, string> = {}
	for (const [id, manifest] of Object.entries(manifests)) ids[id] = manifest.deprecated?.replacement ?? id
	const config = {
		p: defaultPreference,
		t: defaultThemeId,
		d: sableDefaultThemeId,
		ck: colorStorageKey,
		tk: themeStorageKey,
		ids,
		a: SABLE_THEME_ATTRIBUTE,
	}
	return `(function(c){var r=document.documentElement;function g(k){if(!k)return null;try{return localStorage.getItem(k)}catch(e){return null}}var p=g(c.ck);if(p!=="light"&&p!=="dark"&&p!=="system")p=c.p;var m=p;if(p==="system"){try{m=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}catch(e){m="dark"}}r.classList.toggle("dark",m==="dark");var t=g(c.tk);t=t&&Object.prototype.hasOwnProperty.call(c.ids,t)?c.ids[t]:c.t;if(t===c.d)r.removeAttribute(c.a);else r.setAttribute(c.a,t)})(${inlineJson(config)})`
}

export interface SableThemeScriptProps extends SableThemeScriptOptions {
	/** A CSP nonce for the inline script. */
	nonce?: string
}

/**
 * `sableThemeScript` as an element, for a server-rendered `<head>` (Next.js
 * `app/layout.tsx`, Remix `root.tsx`). Render it once, before the body.
 */
export function SableThemeScript({ nonce, ...options }: SableThemeScriptProps) {
	return (
		<script
			nonce={nonce}
			dangerouslySetInnerHTML={{ __html: sableThemeScript(options) }}
		/>
	)
}

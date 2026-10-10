import type { ThemeManifest } from "./_contract"
import { atelierTheme } from "./atelier"
import { meridianTheme } from "./meridian"
import { prismTheme } from "./prism"
import { verdantTheme } from "./verdant"
import { emberTheme } from "./ember"
import { baseTheme } from "./base"
import { poppyTheme } from "./poppy"

export const SABLE_THEME_ATTRIBUTE = "data-sable-theme" as const
export const DEFAULT_THEME_ID = baseTheme.id
export const defaultThemeId = DEFAULT_THEME_ID

export const themeManifests = [
	baseTheme,
	meridianTheme,
	prismTheme,
	verdantTheme,
	emberTheme,
	poppyTheme,
	atelierTheme,
] as const satisfies readonly ThemeManifest[]

/** Six distinct starting points; legacy themes remain addressable separately. */
export const featuredThemeManifests = themeManifests.filter(theme => !theme.deprecated)

export type ThemeId = (typeof themeManifests)[number]["id"]

export const themeIds = themeManifests.map((theme) => theme.id) as ThemeId[]

export const themeManifestById = Object.fromEntries(
	themeManifests.map((theme) => [theme.id, theme]),
) as Record<ThemeId, ThemeManifest>

export function isThemeId(value: string): value is ThemeId {
	// Own-property check only: inherited Object.prototype members are not theme ids.
	return Object.hasOwn(themeManifestById, value)
}

export function getThemeManifest(themeId: ThemeId): ThemeManifest {
	return themeManifestById[themeId]
}

/**
 * Builds a combined `themeManifestById`-shaped lookup from the built-in
 * registry plus any consumer-supplied `customThemes`. Used by
 * `SableThemeProvider` so an externally-supplied theme id survives
 * storage-restore instead of being silently discarded back to the default.
 * Custom themes with an id colliding with a built-in one win (last write).
 */
export function buildThemeManifestById(
	customThemes: readonly ThemeManifest[] = [],
): Record<string, ThemeManifest> {
	const merged: Record<string, ThemeManifest> = { ...themeManifestById }
	for (const theme of customThemes) merged[theme.id] = theme
	return merged
}

/** Own-property check against an arbitrary `themeManifestById`-shaped map. */
export function isKnownThemeId(
	value: string,
	manifestById: Record<string, ThemeManifest>,
): boolean {
	return Object.hasOwn(manifestById, value)
}

export {
	baseTheme,
	poppyTheme,
	atelierTheme,
	emberTheme,
	meridianTheme,
	prismTheme,
	verdantTheme,
}

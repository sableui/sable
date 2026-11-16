import type { IconRenderProps, IconSet } from "../icon/registry"
import { REICON_OUTLINE, REICON_SOLID_CORE } from "./reicon.generated"

/**
 * Sable's Reicon set. Components use semantic names through <Icon>; this maps
 * them to Reicon's artwork. It is opt-in: an app imports `reiconIconSet` from
 * this subpath only (`@sableui/react/icons/reicon`) and mounts it once at its
 * root, `<IconProvider set={reiconIconSet}>`, so an app that brings its own
 * icons ships none of this artwork. Extend it with
 * composeIconSets(appExtras, reiconIconSet), or pass another set instead.
 *
 * The glyphs are vendored, not imported from reicon-react at runtime:
 * scripts/build-reicon-icons.mjs reads the pinned package and commits the
 * Outline weight for every contract name, rounded to 2 decimals. The Filled
 * weight ships here only for the glyphs Sable's own components draw solid
 * (LikeButton's pressed heart, the media transport, the overflow dots); the
 * rest of it is `reiconSolidIconSet` from `@sableui/react/icons/reicon-solid`.
 * Asked for a solid glyph it does not carry, this set draws the outline
 * rather than nothing.
 */

/**
 * One `{ __html }` object per glyph, reused across renders. React 19 rewrites
 * an element's innerHTML whenever that object changes, so a fresh one per
 * render replaced the glyph's paths every time its parent re-rendered — and
 * Base UI's Toast.Content, which re-measures on any DOM change inside it,
 * re-rendered in reply, forever.
 */
const HTML = new Map<string, { __html: string }>()
function htmlOf(markup: string) {
	let html = HTML.get(markup)
	if (!html) HTML.set(markup, (html = { __html: markup }))
	return html
}

/**
 * Draw one vendored glyph. Shared with the solid subpath, so both sets render
 * the same element. No inline `color`: a `text-*` utility on the icon governs
 * its ink, and `currentColor` inherits everywhere a tint was not intended.
 */
export function renderReiconGlyph(markup: string, { spin, className, title }: Omit<IconRenderProps, "name" | "variant">) {
	const a11y = title ? { role: "img" as const, "aria-label": title } : { "aria-hidden": true as const }
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			// Sized in em, so the surrounding text size sizes the glyph.
			width="1em"
			height="1em"
			fill="none"
			className={spin ? `motion-spin ${className ?? ""}` : className}
			// The markup is generated at build time from the pinned reicon-react
			// package and committed. It is never user input and never fetched.
			// biome-ignore lint/security/noDangerouslySetInnerHtml: build-time vendored SVG paths
			dangerouslySetInnerHTML={htmlOf(markup)}
			{...a11y}
		/>
	)
}

export const reiconIconSet: IconSet = ({ name, variant, ...props }: IconRenderProps) => {
	const markup = (variant === "solid" && REICON_SOLID_CORE[name]) || REICON_OUTLINE[name]
	// null, not an empty element: that's the signal `composeIconSets` falls
	// through on, and an empty fragment here would win and render nothing.
	if (!markup) return null
	return renderReiconGlyph(markup, props)
}

/** The semantic names this adapter maps — useful for a coverage assertion. */
export const reiconIconNames = Object.keys(REICON_OUTLINE)

/** The names this set draws in the solid weight without the solid subpath. */
export const reiconSolidCoreNames = Object.keys(REICON_SOLID_CORE)

/** @deprecated Use reiconIconSet. Retained as an alias for existing consumers. */
export const fallbackIconSet: IconSet = reiconIconSet

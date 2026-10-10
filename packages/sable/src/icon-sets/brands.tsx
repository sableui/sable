import type { IconRenderProps, IconSet } from "../icon/registry"
import { BRAND_GLYPHS, BRAND_GRID } from "./brands.generated"

/**
 * Brand marks as a Sable icon set — `<Icon name="github" />`.
 *
 * This is an ADDITIVE set: it answers only for the brands it carries and
 * returns `null` for everything else, which is exactly what `composeIconSets`
 * falls through on. So it layers under a UI set rather than replacing one:
 *
 *     <IconProvider set={composeIconSets(brandIconSet, reiconIconSet)} />
 *
 * Order matters only if a name collides. None do today — the brand names are
 * proper nouns (`github`, `figma`) and the contract's names are common ones
 * (`gear`, `chevron-down`) — but put the brand set first if you ever want a
 * brand to win.
 *
 * **Marks are monochrome by default and take the surrounding ink**, because
 * that is what a footer social row wants and it keeps rule #1 intact: nothing
 * here names a color, so `text-muted-foreground` on the icon governs. The
 * generator strips upstream `fill`/`stroke` colors for this reason. A brand
 * that must appear in its official color is a deliberate act at the call site —
 * a token, or an arbitrary color utility on that one instance — never a
 * default. A page where every logo asserts its own brand color is how a footer
 * turns into a fruit salad.
 *
 * The glyph data is vendored and committed, never fetched at render time; see
 * `scripts/fetch-brand-icons.mjs` for why. Trademark note: these designs belong
 * to their owners — follow each brand's usage guidelines.
 */
export const brandIconSet: IconSet = ({
	name,
	spin,
	className,
	title,
}: IconRenderProps) => {
	const glyph = BRAND_GLYPHS[name]
	// null, not an empty element: the signal `composeIconSets` falls through on.
	if (!glyph) return null

	// `title` overrides; otherwise a brand mark used as a link's only content
	// still needs a name, and the brand's own is the right one. Pass
	// `title=""` for a mark that is genuinely decorative beside a text label.
	const label = title ?? glyph.title
	const a11y = label
		? { role: "img" as const, "aria-label": label }
		: { "aria-hidden": true as const }

	return (
		<svg
			viewBox={`0 0 ${BRAND_GRID} ${BRAND_GRID}`}
			width="1em"
			height="1em"
			// Sized in em like the reicon set, so `text-2xl` scales a brand mark
			// and a UI glyph identically on the same row.
			fill="currentColor"
			className={spin ? `motion-spin ${className ?? ""}` : className}
			// The markup is generated at build time from a fixed, reviewed list in
			// scripts/fetch-brand-icons.mjs and committed — it is never user input
			// and never fetched at runtime, which is what makes this safe.
			// biome-ignore lint/security/noDangerouslySetInnerHtml: build-time vendored SVG paths
			dangerouslySetInnerHTML={{ __html: glyph.markup }}
			{...a11y}
		/>
	)
}

/** The brand names this set answers to — useful for a coverage assertion. */
export const brandIconNames = Object.keys(BRAND_GLYPHS)

export { BRAND_GLYPHS, BRAND_GRID } from "./brands.generated"
export type { BrandGlyph } from "./brands.generated"

import type { IconRenderProps, IconSet } from "../icon/registry"
import { renderReiconGlyph } from "./reicon"
import { REICON_SOLID_CORE } from "./reicon.generated"
import { REICON_SOLID_REST } from "./reicon-solid.generated"

const SOLID: Record<string, string> = { ...REICON_SOLID_CORE, ...REICON_SOLID_REST }

/**
 * Reicon's Filled weight for every contract name — `<Icon name="bell" variant="solid" />`.
 *
 * The default `reiconIconSet` carries the solid weight only for the glyphs
 * Sable's own components draw solid, and draws the outline for any other
 * solid request. An app that uses solid glyphs of its own layers this set in
 * front of it (this set from the `icons/reicon-solid` subpath, the default
 * from `icons/reicon`):
 *
 *     <IconProvider set={composeIconSets(reiconSolidIconSet, reiconIconSet)} />
 *
 * It answers only `variant="solid"` and returns null for everything else, so
 * the next set in the chain draws the outline weight.
 */
export const reiconSolidIconSet: IconSet = ({ name, variant, ...props }: IconRenderProps) => {
	if (variant !== "solid") return null
	const markup = SOLID[name]
	if (!markup) return null
	return renderReiconGlyph(markup, props)
}

/** The names this set draws — useful for a coverage assertion. */
export const reiconSolidIconNames = Object.keys(SOLID)

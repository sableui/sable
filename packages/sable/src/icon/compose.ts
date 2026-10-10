import type { IconSet } from "./registry"

/**
 * Composes icon sets into one, first match wins.
 *
 * This is what makes "a shipped default, overridable per app" work in practice.
 * An app rarely wants to *replace* the default set — it wants the default plus
 * the handful of names its own domain needs:
 *
 *   <IconProvider set={composeIconSets(appExtras, reiconIconSet)} />
 *
 * A set signals "I don't have this name" by returning null, which is exactly the
 * hook needed to fall through. That also means a set returning an *empty* element
 * for an unknown name silently wins and renders nothing — sets must return null,
 * not a blank fragment.
 *
 * Order is precedence, so put the most specific set first. Sable's own
 * `reiconIconSet` is a sensible last entry if you want a guaranteed glyph for
 * every contract name.
 */
export function composeIconSets(...sets: IconSet[]): IconSet {
	return (props) => {
		for (const set of sets) {
			const rendered = set(props)
			if (rendered !== null && rendered !== undefined) return rendered
		}
		return null
	}
}

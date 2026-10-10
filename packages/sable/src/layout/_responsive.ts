/** A breakpoint name, or `base` for the default (mobile-first) value. */
export type Breakpoint = "base" | "sm" | "md" | "lg" | "xl" | "2xl"

/** A static value, or a per-breakpoint map (`{ base, sm, md, lg, xl, "2xl" }`). */
export type Responsive<T> = T | Partial<Record<Breakpoint, T>>

/** Mobile-first breakpoint order — matches Tailwind's defaults (sm 40 / md 48 / lg 64 / xl 80 / 2xl 96 rem). */
export const BREAKPOINTS: Breakpoint[] = ["base", "sm", "md", "lg", "xl", "2xl"]

/**
 * Emit the per-breakpoint CSS custom properties (`{prefix}-base`, `{prefix}-md`,
 * …) for a responsive numeric value. A bare number sets only `{prefix}-base`; a
 * map sets one var per provided breakpoint. The `styles.css` cascade resolves
 * them mobile-first, so any value works without the consumer's Tailwind scanning
 * a class.
 */
export function responsiveVars(
	prefix: string,
	value: Responsive<number> | undefined,
): Record<string, number> {
	if (value === undefined) return {}
	if (typeof value === "number") return { [`${prefix}-base`]: value }
	const out: Record<string, number> = {}
	for (const bp of BREAKPOINTS) {
		const v = value[bp]
		if (v != null) out[`${prefix}-${bp}`] = v
	}
	return out
}

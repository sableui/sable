import type { CSSProperties } from "react"

/** The device safe-area edges (notch, home indicator, rounded corners). */
export type Edge = "top" | "bottom" | "left" | "right"

/** Edge → the padding property that receives its `env(safe-area-inset-*)` value. */
export const EDGE_PROP: Record<Edge, keyof CSSProperties> = {
	top: "paddingTop",
	bottom: "paddingBottom",
	left: "paddingLeft",
	right: "paddingRight",
}

/**
 * Build a style object that pads the given edges with their `env(safe-area-inset-*)`
 * values. Shared by `SafeArea` and `Region.safeArea` so the two primitives stay
 * consistent.
 */
export function safeAreaInsets(edges: Edge[]): CSSProperties {
	const out: CSSProperties = {}
	for (const edge of edges) {
		out[EDGE_PROP[edge]] = `env(safe-area-inset-${edge}, 0px)` as never
	}
	return out
}

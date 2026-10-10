import accessibility from "./accessibility"
import motion from "./motion"
import scrolling from "./scrolling"
import shape from "./shape"
import spacing from "./spacing"
import surfaces from "./surfaces"
import typography from "./typography"
import type { Foundation } from "./types"

export type {
	Foundation,
	FoundationDetail,
	FoundationNoGo,
	FoundationRule,
	FoundationTerm,
	FoundationVocabulary,
} from "./types"

/** Reading order. `build-registry` emits the same order into llms/foundations. */
export const FOUNDATIONS = [
	typography,
	spacing,
	shape,
	surfaces,
	motion,
	scrolling,
	accessibility,
] as const satisfies readonly Foundation[]

export const FOUNDATIONS_BY_SLUG: Record<string, Foundation> = Object.fromEntries(
	FOUNDATIONS.map((foundation) => [foundation.slug, foundation]),
)

export { accessibility, motion, scrolling, shape, spacing, surfaces, typography }

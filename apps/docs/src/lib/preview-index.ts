/** Data-only roster for root navigation. The renderer table must satisfy this
 * exact set, so neither a missing renderer nor an unlisted one can drift. */
export const PREVIEW_SLUGS = [
	"button", "badge", "pill", "avatar", "status-dot", "note",
	"banner", "inline-status", "label",
	"notification-badge", "marker", "bubble", "separator", "card",
] as const

export type PreviewSlug = typeof PREVIEW_SLUGS[number]

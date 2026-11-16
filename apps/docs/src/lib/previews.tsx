import type { PreviewEntry } from "./preview-kit"
import type { PreviewSlug } from "./preview-index"
export { PREVIEW_SLUGS } from "./preview-index"
// Types only: a value re-export from preview-kit would pull the Playground and
// every helper back into the static graph of docs-ui, which every page loads.
export type { PreviewEntry } from "./preview-kit"

/**
 * Which components can be played with, one lazily loaded module each.
 *
 * Each entry (lib/preview-entries/<slug>.tsx) says how to render its component
 * from a bag of control values: a plausible child, a stage that fits it, and a
 * fixed stand-in for props meta describes as numbers or nodes. Everything else
 * (which controls exist, what they offer, their defaults) still comes from meta.
 *
 * They used to be one static table imported by docs-ui, which every page
 * imports, so every component page shipped a preview for every component.
 * Now ComponentPlayground loads only its own slug's module, on demand.
 */
export const PREVIEW_LOADERS: Record<PreviewSlug, () => Promise<{ default: PreviewEntry }>> = {
	button: () => import("./preview-entries/button"),
	badge: () => import("./preview-entries/badge"),
	pill: () => import("./preview-entries/pill"),
	"gradient-art": () => import("./preview-entries/gradient-art"),
	"media-tile": () => import("./preview-entries/media-tile"),
	avatar: () => import("./preview-entries/avatar"),
	"status-dot": () => import("./preview-entries/status-dot"),
	note: () => import("./preview-entries/note"),
	banner: () => import("./preview-entries/banner"),
	"inline-status": () => import("./preview-entries/inline-status"),
	label: () => import("./preview-entries/label"),
	"notification-badge": () => import("./preview-entries/notification-badge"),
	marker: () => import("./preview-entries/marker"),
	bubble: () => import("./preview-entries/bubble"),
	separator: () => import("./preview-entries/separator"),
	card: () => import("./preview-entries/card"),
	toast: () => import("./preview-entries/toast"),
	spinner: () => import("./preview-entries/spinner"),
	progress: () => import("./preview-entries/progress"),
	meter: () => import("./preview-entries/meter"),
	kbd: () => import("./preview-entries/kbd"),
	input: () => import("./preview-entries/input"),
	textarea: () => import("./preview-entries/textarea"),
	"thinking-orb": () => import("./preview-entries/thinking-orb"),
	"agent-avatar": () => import("./preview-entries/agent-avatar"),
	"empty-state": () => import("./preview-entries/empty-state"),
	entity: () => import("./preview-entries/entity"),
	attachment: () => import("./preview-entries/attachment"),
	"checkbox-card": () => import("./preview-entries/checkbox-card"),
	"radio-card": () => import("./preview-entries/radio-card"),
	toggle: () => import("./preview-entries/toggle"),
	stepper: () => import("./preview-entries/stepper"),
	"file-dropzone": () => import("./preview-entries/file-dropzone"),
	message: () => import("./preview-entries/message"),
	toolbar: () => import("./preview-entries/toolbar"),
	sheet: () => import("./preview-entries/sheet"),
	dialog: () => import("./preview-entries/dialog"),
	tooltip: () => import("./preview-entries/tooltip"),
	"settings-menu": () => import("./preview-entries/settings-menu"),
}

export function hasPreview(slug: string): slug is PreviewSlug {
	return slug in PREVIEW_LOADERS
}

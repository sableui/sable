import type { BlockMeta } from "../lib/meta"

export const mediaPlayerBlockMeta: BlockMeta = {
	name: "MediaPlayerBlock",
	family: "Media & files",
	kind: "card",
	width: { min: "18rem", max: "20rem" },
	summary: "A now-playing card: cover, title and artist as an Entity with a Like action, a position Slider with elapsed and remaining time, and previous / play-pause / next.",
	intent:
		"Reach for this for audio or video playback controls outside the media itself — a mini player, a podcast card, a preview in a feed. Playback over the video frame is the Video component's own chrome.",
	notes: [
		"Play/pause is the one filled control, centred between two ghost skips.",
		"Times are `text-mono-caption`, so the digits do not shift as they count.",
		"The cover is painted from the palette as a placeholder; swap it for the real artwork.",
	],
	a11y: [
		"Every icon-only Button carries aria-label, and play/pause's label follows its state.",
		"The Slider carries aria-label=\"Position\". Give it aria-valuetext in your player (\"1:24 of 3:40\") so the position is read as time, not a percentage.",
	],
}

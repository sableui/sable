import { SELECTION_CARD_CHECKED } from "../../lib/selection-card"

/**
 * RadioCard tone identity. Each tone colors three surfaces in concert so a
 * selected card reads as one deliberate object, not a box with a colored edge:
 *
 *   - `card`   — the card's checked border (+ neutral's subtle muted wash).
 *   - `marker` — the radio ring's checked border.
 *   - `dot`    — the radio indicator fill.
 *   - `glyph`  — the leading icon, a solid-fill glyph in the tone colour (no
 *                container) that anchors the card's identity in both states.
 *
 * `neutral` preserves the primary border + a subtle `muted` wash (legible under a
 * large card fill in every theme; a saturated `accent` would not be); the
 * semantic tones resolve to theme-safe tokens (no palette ref, no `dark:`).
 */
export const radioCardToneClasses = {
	neutral: {
		card: SELECTION_CARD_CHECKED.neutral,
		marker: "group-data-[checked]:border-primary",
		dot: "bg-primary",
		glyph: "text-foreground",
	},
	"3": {
		card: SELECTION_CARD_CHECKED["3"],
		marker: "group-data-[checked]:border-tone-3",
		dot: "bg-tone-3",
		glyph: "text-tone-3",
	},
	"2": {
		card: SELECTION_CARD_CHECKED["2"],
		marker: "group-data-[checked]:border-tone-2",
		dot: "bg-tone-2",
		glyph: "text-tone-2",
	},
	"1": {
		card: SELECTION_CARD_CHECKED["1"],
		marker: "group-data-[checked]:border-tone-1",
		dot: "bg-tone-1",
		glyph: "text-tone-1",
	},
	info: {
		card: SELECTION_CARD_CHECKED.info,
		marker: "group-data-[checked]:border-tone-info",
		dot: "bg-tone-info",
		glyph: "text-tone-info",
	},
	warning: {
		card: SELECTION_CARD_CHECKED.warning,
		marker: "group-data-[checked]:border-tone-warning",
		dot: "bg-tone-warning",
		glyph: "text-tone-warning",
	},
} as const

export type RadioCardTone = keyof typeof radioCardToneClasses

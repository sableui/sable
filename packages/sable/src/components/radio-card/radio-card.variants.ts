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
	standard: {
		card: SELECTION_CARD_CHECKED.standard,
		marker: "group-data-[checked]:border-tone-standard",
		dot: "bg-tone-standard",
		glyph: "text-tone-standard",
	},
	collectible: {
		card: SELECTION_CARD_CHECKED.collectible,
		marker: "group-data-[checked]:border-tone-collectible",
		dot: "bg-tone-collectible",
		glyph: "text-tone-collectible",
	},
	edition: {
		card: SELECTION_CARD_CHECKED.edition,
		marker: "group-data-[checked]:border-tone-edition",
		dot: "bg-tone-edition",
		glyph: "text-tone-edition",
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

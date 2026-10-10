import { SELECTION_CARD_CHECKED } from "../../lib/selection-card"

/**
 * CheckboxCard tone identity — the checkbox twin of `radioCardToneClasses`, with
 * identical tone keys so the two selection-card families pair. Each tone colors
 * the card's checked border, fills the checkbox box on check (with its paired
 * tone-foreground ink on the check mark), and tints the optional leading glyph.
 * `neutral` keeps the primary border + a subtle `muted` wash (a large card fill
 * stays readable with foreground/muted-foreground ink in every theme, whereas a
 * saturated `accent` would not). Semantic tokens only.
 */
export const checkboxCardToneClasses = {
	neutral: {
		card: SELECTION_CARD_CHECKED.neutral,
		box: "group-data-[checked]:border-primary group-data-[checked]:bg-primary group-data-[indeterminate]:border-primary group-data-[indeterminate]:bg-primary",
		check: "text-primary-foreground",
		glyph: "text-foreground",
	},
	standard: {
		card: SELECTION_CARD_CHECKED.standard,
		box: "group-data-[checked]:border-tone-standard group-data-[checked]:bg-tone-standard group-data-[indeterminate]:border-tone-standard group-data-[indeterminate]:bg-tone-standard",
		check: "text-tone-standard-foreground",
		glyph: "text-tone-standard",
	},
	collectible: {
		card: SELECTION_CARD_CHECKED.collectible,
		box: "group-data-[checked]:border-tone-collectible group-data-[checked]:bg-tone-collectible group-data-[indeterminate]:border-tone-collectible group-data-[indeterminate]:bg-tone-collectible",
		check: "text-tone-collectible-foreground",
		glyph: "text-tone-collectible",
	},
	edition: {
		card: SELECTION_CARD_CHECKED.edition,
		box: "group-data-[checked]:border-tone-edition group-data-[checked]:bg-tone-edition group-data-[indeterminate]:border-tone-edition group-data-[indeterminate]:bg-tone-edition",
		check: "text-tone-edition-foreground",
		glyph: "text-tone-edition",
	},
	info: {
		card: SELECTION_CARD_CHECKED.info,
		box: "group-data-[checked]:border-tone-info group-data-[checked]:bg-tone-info group-data-[indeterminate]:border-tone-info group-data-[indeterminate]:bg-tone-info",
		check: "text-tone-info-foreground",
		glyph: "text-tone-info",
	},
	warning: {
		card: SELECTION_CARD_CHECKED.warning,
		box: "group-data-[checked]:border-tone-warning group-data-[checked]:bg-tone-warning group-data-[indeterminate]:border-tone-warning group-data-[indeterminate]:bg-tone-warning",
		check: "text-tone-warning-foreground",
		glyph: "text-tone-warning",
	},
} as const

export type CheckboxCardTone = keyof typeof checkboxCardToneClasses

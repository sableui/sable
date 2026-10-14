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
	"3": {
		card: SELECTION_CARD_CHECKED["3"],
		box: "group-data-[checked]:border-tone-3 group-data-[checked]:bg-tone-3 group-data-[indeterminate]:border-tone-3 group-data-[indeterminate]:bg-tone-3",
		check: "text-tone-3-foreground",
		glyph: "text-tone-3",
	},
	"2": {
		card: SELECTION_CARD_CHECKED["2"],
		box: "group-data-[checked]:border-tone-2 group-data-[checked]:bg-tone-2 group-data-[indeterminate]:border-tone-2 group-data-[indeterminate]:bg-tone-2",
		check: "text-tone-2-foreground",
		glyph: "text-tone-2",
	},
	"1": {
		card: SELECTION_CARD_CHECKED["1"],
		box: "group-data-[checked]:border-tone-1 group-data-[checked]:bg-tone-1 group-data-[indeterminate]:border-tone-1 group-data-[indeterminate]:bg-tone-1",
		check: "text-tone-1-foreground",
		glyph: "text-tone-1",
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

import { FontPicker as SableFontPicker } from "@sableui/react"
import { type FontEntry, FONT_CATALOG, type FontRole, ROLE_LABEL, loadFont, loadPreviews } from "./fonts"

/** What each role is for, short enough to sit beside the family it names. */
const ROLE_NAME: Record<FontRole, string> = { primary: "Body", secondary: "Headings", mono: "Mono" }

/**
 * Where the faces come from is the app's business, not Sable's: a list loads
 * each family subset to the letters of its own name, a pick loads its real
 * weights (both from Google Fonts, see ./fonts). Module scope, so the picker
 * sees one stable loader.
 */
const load = (entry: FontEntry, purpose: "preview" | "use") => (purpose === "preview" ? loadPreviews([entry]) : loadFont(entry))

/**
 * One font role: Sable's FontPicker over the docs' Google Fonts catalog. The
 * row names the current choice in its own face and opens in place into a
 * searchable list — inline rather than a popover, because this is a tool panel
 * and a list that pushes the panel down keeps the choice next to the preview
 * it changes. Arrow keys move through the list without applying anything (each
 * name is already drawn in its face); Enter, Space or a click picks a family,
 * loads its real weights and closes the list.
 */
export function FontPicker({
	role,
	value,
	onChange,
	presetLabel,
	open,
	onOpenChange,
	size = "md",
}: {
	role: FontRole
	value: string
	onChange: (family: string) => void
	/** What "Preset" resolves to right now, shown as its label. */
	presetLabel: string
	open: boolean
	onOpenChange: (open: boolean) => void
	/** md for the simple view; xs is the property-grid rung. */
	size?: "md" | "xs"
}) {
	const title = ROLE_LABEL[role].title
	return (
		<SableFontPicker
			label={ROLE_NAME[role]}
			listLabel={`${title} font`}
			searchLabel={`Search ${title.toLowerCase()} fonts`}
			value={value}
			onValueChange={(family) => family !== value && onChange(family)}
			fonts={FONT_CATALOG[role]}
			options={[
				{ value: "theme", label: `Preset (${presetLabel})`, valueLabel: presetLabel },
				...(role === "secondary" ? [{ value: "sans", label: "Same as primary" }] : []),
			]}
			loadFont={load}
			open={open}
			onOpenChange={onOpenChange}
			size={size}
		/>
	)
}

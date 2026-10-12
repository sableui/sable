"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react"
import {
	DisclosurePicker,
	DisclosurePickerEmpty,
	DisclosurePickerList,
	DisclosurePickerOption,
	DisclosurePickerPanel,
	type DisclosurePickerProps,
	DisclosurePickerTrigger,
} from "../disclosure-picker/disclosure-picker"

/** One family the picker offers. Supplied by the app — Sable bundles no font catalog. */
export interface FontPickerFont {
	/** The family name, as CSS knows it once loaded ("DM Sans"). */
	family: string
	/** A short muted note at the row's end ("Neutral, dense UI"). Searched along with the family. */
	note?: string
	/** The CSS font-family stack to render this option in. @default `"<family>"` */
	stack?: string
}

/** A choice that is not a family — "Theme default", "Same as body" — listed above the fonts, in the app's own face. */
export interface FontPickerOption {
	value: string
	/** The option's row text ("Preset (Figtree)"). */
	label: string
	/** What the row shows while this option is chosen, when it should differ from `label` ("Figtree"). */
	valueLabel?: string
}

export interface FontPickerProps<Font extends FontPickerFont = FontPickerFont>
	extends Omit<DisclosurePickerProps, "children" | "onChange"> {
	/** The chosen family, or the value of one of `options`. */
	value: string
	/**
	 * Called when a family (or option) is picked — Enter, Space or a click —
	 * and only when it differs from `value`. Arrow keys and type-ahead move
	 * through the list without applying or loading anything; Escape closes
	 * without a pick.
	 */
	onValueChange: (value: string) => void
	/** The families to offer, in order. */
	fonts: readonly Font[]
	/** Non-font choices listed first ("Preset", "Same as primary"). */
	options?: readonly FontPickerOption[]
	/** The row's leading caption — the role the font plays ("Body", "Headings"). */
	label?: ReactNode
	/** Accessible name of the list. @default "Font" */
	listLabel?: string
	/**
	 * A search field above the list. On by default: font lists are long, and a
	 * name is the fastest way to one. Pass `false` for a short, curated list
	 * (under a dozen), where the field is a control with nothing to do.
	 * @default true
	 */
	searchable?: boolean
	/** Accessible name of the search field. @default "Search fonts" */
	searchLabel?: string
	/**
	 * Load a face on demand — the app owns where fonts come from (Google Fonts,
	 * a CDN, self-hosted). Called with `"preview"` for every listed family when
	 * the list opens (enough to draw its own name), and with `"use"` for the
	 * chosen family — once it is picked, never while the list is only being
	 * walked. Make it idempotent: it is called again on every open.
	 */
	loadFont?: (font: Font, purpose: "preview" | "use") => void
}

const faceOf = (font: FontPickerFont) => font.stack ?? `"${font.family}"`

/**
 * FontPicker — a DisclosurePicker for a typeface: the row names the chosen
 * family in its own face, and opens in place into a searchable list of
 * families, each drawn in itself. Arrow keys walk the list — each name is
 * already drawn in its face — and Enter (or a click) picks one, which is when
 * its real weights load and the page changes.
 *
 *   <FontPicker label="Body" value={family} onValueChange={setFamily} fonts={FONTS} loadFont={load} />
 *
 * Sable ships the control, not a catalog: `fonts` and `loadFont` come from the
 * app, so it can offer three families or three hundred from any source.
 */
export function FontPicker<Font extends FontPickerFont = FontPickerFont>({
	value,
	onValueChange,
	fonts,
	options = [],
	label,
	listLabel = "Font",
	searchable = true,
	searchLabel = "Search fonts",
	loadFont,
	open: openProp,
	defaultOpen = false,
	onOpenChange,
	...props
}: FontPickerProps<Font>) {
	const [query, setQuery] = useState("")
	// The open state is mirrored here (controlled or not) so previews load when
	// the list opens, not for every family on first paint.
	const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
	const open = openProp ?? uncontrolledOpen
	const setOpen = (next: boolean) => {
		if (openProp === undefined) setUncontrolledOpen(next)
		onOpenChange?.(next)
	}

	useEffect(() => {
		if (open && loadFont) for (const font of fonts) loadFont(font, "preview")
	}, [open, fonts, loadFont])

	const chosenFont = fonts.find((font) => font.family === value)
	useEffect(() => {
		if (chosenFont && loadFont) loadFont(chosenFont, "use")
	}, [chosenFont, loadFont])

	const q = query.trim().toLowerCase()
	const shownFonts = useMemo(
		() => (q ? fonts.filter((font) => font.family.toLowerCase().includes(q) || font.note?.toLowerCase().includes(q)) : fonts),
		[fonts, q],
	)
	const shownOptions = q ? options.filter((option) => option.label.toLowerCase().includes(q)) : options

	const chosenOption = options.find((option) => option.value === value)
	const current = chosenOption ? (chosenOption.valueLabel ?? chosenOption.label) : value
	const currentFace = chosenOption ? undefined : chosenFont ? faceOf(chosenFont) : `"${value}"`

	return (
		<DisclosurePicker open={open} onOpenChange={setOpen} {...props}>
			<DisclosurePickerTrigger label={label}>
				<span style={{ fontFamily: currentFace }}>{current}</span>
			</DisclosurePickerTrigger>
			<DisclosurePickerPanel
				search={
					searchable
						? { value: query, onValueChange: setQuery, placeholder: `Search ${fonts.length} fonts`, label: searchLabel }
						: undefined
				}
			>
				{shownOptions.length + shownFonts.length > 0 ? (
					<DisclosurePickerList aria-label={listLabel} value={value} onValueChange={onValueChange}>
						{shownOptions.map((option) => (
							<DisclosurePickerOption key={option.value} value={option.value}>
								{option.label}
							</DisclosurePickerOption>
						))}
						{shownFonts.map((font) => (
							<DisclosurePickerOption key={font.family} value={font.family} note={font.note}>
								<span style={{ fontFamily: faceOf(font) }}>{font.family}</span>
							</DisclosurePickerOption>
						))}
					</DisclosurePickerList>
				) : null}
				{shownFonts.length === 0 && q ? <DisclosurePickerEmpty>No fonts match “{query}”.</DisclosurePickerEmpty> : null}
			</DisclosurePickerPanel>
		</DisclosurePicker>
	)
}
FontPicker.displayName = "FontPicker"

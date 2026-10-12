import { Density, FontPicker, fontPickerMeta } from "@sableui/react"
import { useState } from "react"
import { Example, MetaFooter, PageHeader, Section, ledeFor } from "../../components/docs-ui"
import { FONT_CATALOG, type FontEntry, loadFont, loadPreviews } from "../../customizer/fonts"

/**
 * The docs' loader: Google Fonts, a preview subset to each family's own name
 * while browsing, the real weights once chosen. Sable never fetches a font.
 */
const load = (entry: FontEntry, purpose: "preview" | "use") => (purpose === "preview" ? loadPreviews([entry]) : loadFont(entry))

const ROLES = [
	{ id: "body", label: "Body", list: "Body font", fonts: FONT_CATALOG.primary, initial: "Inter" },
	{ id: "headings", label: "Headings", list: "Heading font", fonts: FONT_CATALOG.secondary, initial: "Fraunces" },
	{ id: "mono", label: "Mono", list: "Mono font", fonts: FONT_CATALOG.mono, initial: "JetBrains Mono" },
] as const

function Roles({ size }: { size?: "md" | "xs" }) {
	const [open, setOpen] = useState<string | null>(null)
	const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(ROLES.map((role) => [role.id, role.initial])))
	return ROLES.map((role) => (
		<FontPicker
			key={role.id}
			size={size}
			label={role.label}
			listLabel={role.list}
			searchLabel={`Search ${role.list.toLowerCase()}s`}
			value={values[role.id] ?? role.initial}
			onValueChange={(family) => setValues((prev) => ({ ...prev, [role.id]: family }))}
			fonts={role.fonts}
			loadFont={load}
			open={open === role.id}
			onOpenChange={(next) => setOpen(next ? role.id : null)}
		/>
	))
}

const CURATED = FONT_CATALOG.primary.filter((font) => ["Inter", "Figtree", "Geist", "Manrope"].includes(font.family))

function Curated() {
	const [family, setFamily] = useState("theme")
	return (
		<FontPicker
			label="Body"
			listLabel="Body font"
			value={family}
			onValueChange={setFamily}
			fonts={CURATED}
			options={[{ value: "theme", label: "Theme default (Figtree)", valueLabel: "Figtree" }]}
			searchable={false}
			loadFont={load}
		/>
	)
}

export function FontPickerPage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Font Picker" lede={ledeFor(fontPickerMeta)} />

			<Section
				title="One row per role"
				description="Each row names its family in that face and opens in place into a searchable list, each family drawn in itself. Arrow keys move through the families without applying or loading anything; Enter, Space or a click picks one, loads its real weights and closes. The parent keeps one list open at a time."
			>
				<Example>
					<div className="grid w-full max-w-80 gap-2">
						<Roles />
					</div>
				</Example>
			</Section>

			<Section
				title="A short, curated list"
				description="Search is on by default because font lists are long. Under a dozen families, pass searchable={false}. Non-font choices go in options, listed first in the app's own face."
			>
				<Example>
					<div className="w-full max-w-80">
						<Curated />
					</div>
				</Example>
			</Section>

			<Section
				title="Property-grid rung"
				description="size xs inside a compact Density, beside ScrubFields and xs selects in an inspector."
			>
				<Example>
					<Density value="compact" className="grid w-full max-w-64 gap-1">
						<Roles size="xs" />
					</Density>
				</Example>
			</Section>

			<MetaFooter meta={fontPickerMeta} />
		</>
	)
}

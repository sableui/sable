import type { ComponentMeta } from "../../lib/meta"

export const fontPickerMeta: ComponentMeta = {
	name: "FontPicker",
	summary:
		"A DisclosurePicker for a typeface: the row names the chosen family in its own face and opens in place into a searchable list of families, each drawn in itself. The app supplies the families and loads the faces; Sable bundles no catalog.",
	status: "stable",
	keywords: ["font picker", "typeface", "font family", "font selector", "typography", "google fonts", "inspector", "customizer"],
	usage: {
		description:
			"Use FontPicker wherever someone chooses a typeface for a role (body, headings, code) in a panel that shows the result: a theme editor, a document inspector, a brand customizer. It is a DisclosurePicker, so the list opens beneath the row rather than over the preview; arrow keys walk the families (each drawn in its own face) without applying or loading anything, and Enter, Space or a click picks one, loads it and closes the row.",
		bestPractices: [
			{
				guidance: "do",
				description:
					"Pass `loadFont` and load faces lazily: `\"preview\"` fires for every family when the list opens (load just the glyphs of its name — Google Fonts' `text=` parameter makes a 20-font list cost a few KB), `\"use\"` for the chosen one (load its real weights). Make it idempotent and define it once, outside render.",
			},
			{
				guidance: "do",
				description:
					"Put non-font choices — \"Preset (Figtree)\", \"Same as body\" — in `options`, with a short `valueLabel` for the row. They list first and render in the app's face, so they never read as a family.",
			},
			{
				guidance: "do",
				description:
					'Give each row a role `label` ("Body", "Headings", "Mono") and stack them; the caption column aligns. Control `open` from the parent so only one list is open at a time.',
			},
			{
				guidance: "dont",
				description:
					"Leave search on for a short curated list — under a dozen families, pass `searchable={false}`. Search is on by default because font lists are usually long.",
			},
			{
				guidance: "dont",
				description:
					"Use a Select of family names for this. A popup covers the text it changes, and a family name set in the app's face says nothing about the face.",
			},
		],
	},
	related: { components: ["DisclosurePicker", "ThemeSelector", "Select", "Combobox"] },
	props: [
		{ name: "value", type: "string", description: "The chosen family, or the value of one of `options`." },
		{
			name: "onValueChange",
			type: "(value: string) => void",
			description: "Called once a family (or option) is picked — Enter, Space or a click — and only when it differs from `value`; the row then closes. Arrow keys and type-ahead only move focus; Escape closes without a pick.",
		},
		{ name: "fonts", type: "readonly { family: string; note?: string; stack?: string }[]", description: "The families to offer, in order. `note` is a muted annotation (searched too); `stack` the CSS font-family to draw it in (default `\"<family>\"`)." },
		{
			name: "options",
			type: "readonly { value: string; label: string; valueLabel?: string }[]",
			default: "[]",
			description: "Non-font choices listed above the fonts, in the app's face. `valueLabel` is what the row shows while it is chosen.",
		},
		{ name: "label", type: "ReactNode", description: "The row's leading caption — the role the font plays." },
		{ name: "listLabel", type: "string", default: '"Font"', description: "Accessible name of the list." },
		{
			name: "searchable",
			type: "boolean",
			default: "true",
			description: "A search field above the list, filtering by family and note. Pass false for a short curated list (under a dozen).",
		},
		{ name: "searchLabel", type: "string", default: '"Search fonts"', description: "Accessible name of the search field." },
		{
			name: "loadFont",
			type: '(font, purpose: "preview" | "use") => void',
			description: "Loads a face on demand: \"preview\" for every family when the list opens, \"use\" for the chosen one once it is picked (never while the list is only being walked). Receives your own font objects. Idempotent.",
		},
		{ name: "open", type: "boolean", description: "Controlled open state, as DisclosurePicker. Control it to keep one of several rows open at a time." },
		{ name: "defaultOpen", type: "boolean", default: "false", description: "Uncontrolled initial open state." },
		{ name: "onOpenChange", type: "(open: boolean) => void", description: "Called with the next open state." },
		{ name: "size", type: '"md" | "xs"', default: '"md"', description: "md for a settings column; xs for the property-grid rung (see DisclosurePicker)." },
	],
	tokensUsed: ["foreground", "muted-foreground", "popover", "hairline", "panel-field", "ring"],
	a11y: [
		"Inherits DisclosurePicker: a button trigger with aria-expanded/controls whose name is the caption plus the family; a listbox named by `listLabel`, aria-selected on the chosen family.",
		"Keyboard open focuses the search field; ArrowDown steps from it into the list (ArrowUp from the first option steps back); arrows, Home/End and type-ahead move without applying; Enter or Space picks and closes; Escape clears the query, then closes without a pick and returns focus to the row.",
		"Each family is set in its own face, but its name is still plain text, so a screen reader reads the name, not the glyphs.",
	],
	motion: [
		{ slot: "arrival", recipe: "none", part: "root", why: "A property row is present from first paint." },
		{ slot: "response", recipe: "motion-interactive", part: "Trigger", why: "Inherited from DisclosurePicker: the hover step says the value row opens." },
		{ slot: "transition", recipe: "motion-disclosure", part: "Panel", why: "Inherited from DisclosurePicker: the list grows in place, tying the panel's movement to this row." },
		{ slot: "activity", recipe: "none", part: "root", why: "Faces load in the background and swap in when ready; the names are legible in the fallback meanwhile, so there is nothing to wait on." },
	],
	examples: [
		{
			label: "Body font with lazy loading",
			code: `const FONTS = [
  { family: "Inter", note: "Neutral, dense UI" },
  { family: "Figtree", note: "Friendly geometric" },
  { family: "Fraunces", note: "Soft, wonky serif", stack: '"Fraunces", serif' },
]
// Your loader; Sable never fetches fonts itself.
const loadFont = (font: { family: string }, purpose: "preview" | "use") => {
  const id = \`font-\${purpose}-\${font.family}\`
  if (document.getElementById(id)) return
  const link = Object.assign(document.createElement("link"), { id, rel: "stylesheet" })
  const family = font.family.replace(/ /g, "+")
  link.href = purpose === "preview"
    ? \`https://fonts.googleapis.com/css2?family=\${family}&text=\${encodeURIComponent(font.family)}\`
    : \`https://fonts.googleapis.com/css2?family=\${family}:wght@400..700&display=swap\`
  document.head.appendChild(link)
}
const [family, setFamily] = useState("Inter")
<FontPicker label="Body" listLabel="Body font" value={family} onValueChange={setFamily} fonts={FONTS} loadFont={loadFont} searchable={false} />`,
		},
		{
			label: "With a preset option, one row of several",
			code: `const [open, setOpen] = useState<string | null>(null)
const [body, setBody] = useState("theme")
<FontPicker
  label="Body"
  listLabel="Body font"
  value={body}
  onValueChange={setBody}
  options={[{ value: "theme", label: "Preset (Figtree)", valueLabel: "Figtree" }]}
  fonts={[{ family: "Inter" }, { family: "Figtree" }, { family: "Geist" }]}
  open={open === "body"}
  onOpenChange={(next) => setOpen(next ? "body" : null)}
/>`,
		},
	],
}

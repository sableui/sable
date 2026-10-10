import type { ComponentMeta } from "../../lib/meta"

export const searchInputMeta: ComponentMeta = {
	name: "SearchInput",
	summary:
		"Styled search field with a leading magnifier and a clearable X. Soft-square (rounded-sm), card surface, 2px focus ring; the clear button appears only when there is a value.",
	status: "stable",
	keywords: [
		"search",
		"input",
		"filter",
		"query",
	],
	usage: {
		description: "Use SearchInput for text queries that filter or search a known content set.",
		bestPractices: [
			{
				guidance: "do",
				description: "Use a clear placeholder that names the content being searched.",
			},
			{
				guidance: "do",
				description: "Provide a visible clear affordance when query state persists.",
			},
			{
				guidance: "do",
				description: "When a button stands in for search (a header trigger that opens CommandMenu with ⌘K), use CommandMenuTrigger. It wears this field's shell from the same source, so the two cannot drift; a hand-styled button already did once, into a borderless chip that matched neither the field nor a button.",
			},
			{
				guidance: "dont",
				description: "Do not use SearchInput as a command palette; use CommandMenu for global commands, opened from the header by CommandMenuTrigger. A SearchInput that opens a dialog on focus is a text box you cannot type in.",
			},
			{
				guidance: "dont",
				description: "Do not search on every keystroke against an expensive backend without debouncing. The user sees results flicker and reorder under them, and you send a request per character.",
			},
		],
	},
	related: {
		components: [
			"Input",
			"CommandMenu",
			"Combobox",
		],
	},
	props: [
		{
			name: "value",
			type: "string",
			description: "Controlled value of the search field.",
		},
		{
			name: "defaultValue",
			type: "string",
			description: "Uncontrolled initial value. The field tracks its own text, so the clear button still appears and empties it.",
		},
		{
			name: "className",
			type: "string",
			description: "Sizes and places the whole field — magnifier, input and clear button together (e.g. max-w-80). A width cap here keeps the clear button inside the field.",
		},
		{
			name: "inputClassName",
			type: "string",
			description: "Classes for the <input> element alone, for the rare input-only override.",
		},
		{
			name: "onValueChange",
			type: "(value: string) => void",
			description: "Called with the next string on every keystroke.",
		},
		{
			name: "onClear",
			type: "() => void",
			description:
				"Called when the clear button is pressed. The component also fires onValueChange('') so a controlled value resets.",
		},
		{
			name: "placeholder",
			type: "string",
			default: '"Search"',
			description: "Placeholder text shown when the field is empty.",
		},
		{
			name: "disabled",
			type: "boolean",
			default: "false",
			description: "Dims the control and blocks pointer interaction.",
		},
		{
			name: "...props",
			type: 'ComponentPropsWithRef<"input">',
			description:
				"All native input attributes (name, autoFocus, ref, aria-invalid, …) pass through to the <input> except value/onChange, which are owned by value/onValueChange, and className, which sizes the whole field.",
		},
	],
	tokensUsed: [
		"input",
		"card",
		"foreground",
		"muted-foreground",
		"ring",
		"destructive",
	],
	a11y: [
		"Renders a native <input type=\"search\"> — keyboard and form semantics come for free.",
		"Associate a <label htmlFor> (or wrap) — the magnifier glyph is decorative, not a label.",
		"The leading search Icon is pointer-events-none and purely decorative.",
		"The clear button is a real <button> (Sable's ghost icon Button) with aria-label='Clear search' and a focus-visible ring. It is hidden while the field is disabled.",
		"Focus-visible draws a 2px ring in the --ring token; aria-invalid raises the destructive border and ring.",
	],
	examples: [
		{
			label: "Controlled",
			code: 'const [q, setQ] = useState("")\n<SearchInput value={q} onValueChange={setQ} placeholder="Search posts" />',
		},
		{
			label: "With onClear",
			code: '<SearchInput value={q} onValueChange={setQ} onClear={() => console.log("cleared")} />',
		},
		{
			label: "Uncontrolled, sized as a whole",
			code: '<Field label="Search posts"><SearchInput defaultValue="editions" className="max-w-80" /></Field>',
		},
		{
			label: "Disabled",
			code: '<SearchInput disabled placeholder="Search" />',
		},
	],
}

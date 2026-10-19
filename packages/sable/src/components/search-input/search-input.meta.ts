import type { ComponentMeta } from "../../lib/meta"

export const searchInputMeta: ComponentMeta = {
	name: "SearchInput",
	summary:
		"Styled search field with a leading magnifier and a clearable X. Soft-square (rounded-sm), the theme's field surface, 2px focus ring; the clear button appears only when there is a value. size md (form), sm (toolbar, matching Pill lg and Button sm) or xs (inset tool-panel field).",
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
				guidance: "do",
				description: "Light the query in the results it filters with `useMatchHighlight(query)` — a callback ref for the results container, with `selector` to keep it to titles. It paints on the `highlight` pair without wrapping matches in `<mark>`, the same paint Combobox and CommandMenu use for their rows.",
			},
			{
				guidance: "do",
				description: "In a toolbar beside filter chips, use size=\"sm\" with Pill size=\"lg\" (and Button size=\"sm\" for actions). All three stand on --control-sm (32px, 28 compact), the rung the spacing doctrine gives toolbar controls, so the row is one height in either density. Keep md for a search field in a form or a page header beside md buttons, and xs for a filter inside a workspace panel, where it matches Input xs's inset surface.",
			},
			{
				guidance: "dont",
				description: "Do not match a neighbour's height with h-* on className or inputClassName. The magnifier, padding and clear button would stay sized for the old rung; pick the size that shares the neighbour's rung.",
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
			"Pill",
		],
	},
	props: [
		{
			name: "size",
			type: '"md" | "sm" | "xs"',
			default: '"md"',
			description: "The rung of the control ladder, named as on Input, Select and Combobox. md is the form field (--control-md, 40px / 32 compact). sm is the toolbar field (--control-sm, 32px / 28 compact), the rung Pill lg and Button sm share, so filters + search + actions in one row are one height. xs is the tool-panel field (--control-xs, 28px / 24 compact) on Input xs's inset panel-field surface. The magnifier, inline padding and clear button scale with the rung and stay vertically centred.",
		},
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
				"All native input attributes (name, autoFocus, ref, aria-invalid, …) pass through to the <input> except value/onChange, which are owned by value/onValueChange, className, which sizes the whole field, and the native numeric size attribute, which the size prop replaces.",
		},
	],
	tokensUsed: [
		"field-border",
		"field",
		"foreground",
		"muted-foreground",
		"ring",
		"destructive",
		"panel-field",
		"panel-field-hover",
	],
	motion: [
		{
			slot: "arrival",
			recipe: "motion-appear",
			part: "Clear button",
			why: "The X mounts as the first character lands. Fading and settling in from a smaller scale keeps it from popping into the corner of the eye on every new search; removal is instant so an emptied field does not wait on it.",
		},
		{
			slot: "response",
			recipe: "motion-interactive",
			part: "Input",
			why: "The focus ring and invalid border ease in, so focus reads as the field answering rather than a repaint.",
		},
		{
			slot: "transition",
			recipe: "none",
			part: "Root",
			why: "The field has no states of its own to move between — the clear button arriving is its only change, and arrival covers it.",
		},
		{
			slot: "activity",
			recipe: "none",
			part: "Root",
			why: "Searching is the results' job: a list skeleton or a Spinner beside them, not a field that animates while you type.",
		},
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
			code: '<Field label="Search posts"><SearchInput defaultValue="roadmap" className="max-w-80" /></Field>',
		},
		{
			label: "Highlighting matches in the results",
			code: 'const [q, setQ] = useState("")\nconst results = useMatchHighlight<HTMLUListElement>(q, { selector: "[data-title]" })\nconst shown = posts.filter((post) => post.title.toLowerCase().includes(q.trim().toLowerCase()))\n\n<SearchInput value={q} onValueChange={setQ} placeholder="Search posts" />\n<ul ref={results}>\n\t{shown.map((post) => (\n\t\t<li key={post.id}><span data-title>{post.title}</span></li>\n\t))}\n</ul>',
		},
		{
			label: "Filters with search",
			code: "const [filter, setFilter] = useState(\"all\")\nconst [q, setQ] = useState(\"\")\n\n<Row gap={2} align=\"center\" justify=\"between\" wrap>\n\t<Row gap={1}>\n\t\t<Pill size=\"lg\" selected={filter === \"all\"} onClick={() => setFilter(\"all\")}>All 8</Pill>\n\t\t<Pill size=\"lg\" selected={filter === \"products\"} onClick={() => setFilter(\"products\")}>Products 5</Pill>\n\t\t<Pill size=\"lg\" selected={filter === \"oss\"} onClick={() => setFilter(\"oss\")}>Open source 2</Pill>\n\t</Row>\n\t<SearchInput size=\"sm\" value={q} onValueChange={setQ} placeholder=\"Find a project…\" aria-label=\"Find a project\" className=\"max-w-64\" />\n</Row>",
		},
		{
			label: "Sizes",
			code: '<Stack gap={1}>\n\t<SearchInput size="md" placeholder="Search posts" aria-label="Search posts" />\n\t<SearchInput size="sm" placeholder="Find a project…" aria-label="Find a project" />\n\t<SearchInput size="xs" placeholder="Filter layers" aria-label="Filter layers" />\n</Stack>',
		},
		{
			label: "Disabled",
			code: '<SearchInput disabled placeholder="Search" />',
		},
	],
}

import type { ComponentMeta } from "../../lib/meta"

export const checkboxCardMeta: ComponentMeta = {
	name: "CheckboxCard",
	summary:
		"A multi-select selection card — a card-sized Base UI Checkbox with a checkbox box, title, and optional description. The checkbox twin of RadioCard (same tone table). CheckboxGroup lays a column out and can own the selection: give each card a `value` and the group holds the checked values as an array, with an optional parent \"select all\" Checkbox.",
	status: "stable",
	keywords: [
		"checkbox card",
		"select card",
		"multi select",
		"option card",
	],
	usage: {
		description: "Use CheckboxCard when an option needs more visual weight, supporting text, or iconography than a plain checkbox row.",
		bestPractices: [
			{
				guidance: "do",
				description: "Use it for a small number of options where details help users compare choices.",
			},
			{
				guidance: "do",
				description: "Keep the checked state visible across the full card, not only inside the indicator.",
			},
			{
				guidance: "do",
				description: "Let CheckboxGroup own the selection when the cards answer one question: give each card a `value` and read one array from `onValueChange` instead of wiring a toggle per card.",
			},
			{
				guidance: "do",
				description: "Use a plain Checkbox with `parent` for \"select all\", and list every child value in the group's `allValues`. The group works out its checked and mixed states.",
			},
			{
				guidance: "dont",
				description: "Do not use CheckboxCard for long lists; use Checkbox rows or a Combobox with `multiple` instead.",
			},
			{
				guidance: "dont",
				description: "Do not put a link or a button inside the card. The whole card is the checkbox's label, so a nested interactive element is either unreachable or steals the click that should toggle it.",
			},
		],
		anatomy: [
			{
				name: "CheckboxCard",
				required: true,
				description: "One card-shaped checkbox option.",
			},
			{
				name: "CheckboxGroup",
				required: false,
				description: "A grouped set of related checkbox cards. Optionally owns the selected values and a parent \"select all\" checkbox.",
			},
		],
	},
	related: {
		components: [
			"Checkbox",
			"RadioCard",
		],
	},
	props: [
		{
			name: "onCheckedChange",
			type: "(checked: boolean, eventDetails) => void",
			description:
				"Fires with the next checked state (Base UI passes eventDetails second). Pair with `checked` for a controlled card; omit both to let it manage its own state.",
		},
		{
			name: "title",
			type: "ReactNode",
			description: "The card's primary label (text-title-sm).",
		},
		{
			name: "description",
			type: "ReactNode",
			description: "Optional supporting copy beneath the title (text-body-sm, muted).",
		},
		{
			name: "icon",
			type: "ReactNode",
			description: "Optional glyph (a solid <Icon>) in the tone colour. Its presence switches to the two-dimensional card RadioCard uses — icon top-left, checkbox top-right, copy below — so the two cards match in one form.",
		},
		{
			name: "tone",
			type: '"neutral" | "standard" | "collectible" | "edition" | "info" | "warning"',
			default: '"neutral"',
			description:
				"Semantic colour the checked state carries across the border, checkbox box, and icon.",
		},
		{
			name: "value",
			type: "string",
			description:
				"Names the card inside a group-owned CheckboxGroup: the card is checked when the group's value array includes it. Also the value submitted with a form. Inside a CheckboxGroup, `name` stands in for `value` when `value` is omitted.",
		},
		{
			name: "checked / onCheckedChange / defaultChecked / disabled",
			type: "Base UI Checkbox.Root props",
			description:
				"Standard checkbox state. Without a group-owned value, each card is independent — drive checked/onCheckedChange per item for multi-select.",
		},
	],
	subcomponents: [
		{
			name: "CheckboxGroup",
			type: "{ className?: string; children: ReactNode; value?: string[]; defaultValue?: string[]; onValueChange?: (value: string[]) => void; allValues?: string[]; disabled?: boolean }",
			description:
				"Column wrapper (role=group) over Base UI's CheckboxGroup. With no group props it is layout only and each card stays independent. Pass value/defaultValue/onValueChange (string[]) and give each child a `value` to let the group own the selection — works for CheckboxCard and plain Checkbox children alike. Add allValues plus a `<Checkbox parent />` for a select-all box that turns mixed when only some are checked. `disabled` disables every child. onValueChange gets (value, eventDetails). Override the grid via className for multi-column layouts.",
		},
	],
	variants: {
		tone: ["neutral", "standard", "collectible", "edition", "info", "warning"],
	},
	tokensUsed: [
		"input",
		"card",
		"ring",
		"primary",
		"primary-foreground",
		"accent",
		"foreground",
		"muted-foreground",
		"tone-standard",
		"tone-standard-foreground",
		"tone-collectible",
		"tone-collectible-foreground",
		"tone-edition",
		"tone-edition-foreground",
		"tone-info",
		"tone-info-foreground",
		"tone-warning",
		"tone-warning-foreground",
	],
	a11y: [
		"Base UI provides the checkbox role, aria-checked, hidden native input, keyboard toggle, and data-[checked]/data-disabled state.",
		"The whole card is the hit target; focus draws a 2px outline outside the card (not a ring, so the checked tone ring survives focus); Space toggles the focused card.",
		"Selection never relies on colour alone — the filled checkbox box + check mark and the card border all shift.",
		"A parent select-all Checkbox gets aria-checked=mixed and aria-controls pointing at its children from Base UI; give it a visible label.",
	],
	examples: [
		{
			label: "Group-owned selection",
			code: "<CheckboxGroup value={selected} onValueChange={setSelected}>{REASONS.map((r) => (<CheckboxCard key={r} value={r} title={r} />))}</CheckboxGroup>",
		},
		{
			label: "Select all",
			code: '<CheckboxGroup allValues={REASONS} value={selected} onValueChange={setSelected}><Field label="All reasons" orientation="horizontal"><Checkbox parent /></Field>{REASONS.map((r) => (<CheckboxCard key={r} value={r} title={r} />))}</CheckboxGroup>',
		},
		{
			label: "A single independent card",
			code: '<CheckboxCard title="Email me a receipt" description="Sent when the mint settles" checked={receipt} onCheckedChange={setReceipt} />',
		},
		{
			label: "Toned with description",
			code: '<CheckboxCard tone="edition" title="Editions" description="Sell as numbered NFT editions" defaultChecked />',
		},
	],
}

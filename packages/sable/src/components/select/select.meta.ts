import type { ComponentMeta } from "../../lib/meta"

export const selectMeta: ComponentMeta = {
	name: "Select",
	summary:
		"Listbox over Base UI Select — typeahead, roving focus, collision-aware popup, ARIA option wiring, and form integration. Trigger shows the selected value; the popup portals to <body>.",
	keywords: [
		"select",
		"listbox",
		"dropdown",
		"picker",
		"option",
		"choice",
		"typeahead",
		"form",
	],
	usage: {
		description:
			"Use Select when users choose one value from a known, finite set. Use Combobox for searchable or user-entered values, Combobox `multiple` for several choices, and Radio when all options should remain visible.",
		bestPractices: [
			{
				guidance: "do",
				description:
					"Use clear item labels and pass label explicitly when children are richer than plain text.",
			},
			{
				guidance: "do",
				description:
					"Group long option sets with SelectGroup and SelectGroupLabel when categories improve scanning.",
			},
			{
				guidance: "do",
				description:
					"Wrap in Field when the select belongs to a form so label, helper text, and errors are wired automatically.",
			},
			{
				guidance: "dont",
				description:
					"Use Select for very large or fuzzy lists. Use Combobox when typing is the primary way to find an option.",
				instead: ["Combobox"],
			},
			{
				guidance: "dont",
				description:
					"Use Select for binary on/off settings. Use Switch or Checkbox instead.",
				instead: ["Switch", "Checkbox"],
			},
			{
				guidance: "do",
				description:
					"Leave the trigger's type alone on mobile. Below the sm breakpoint the md trigger renders text-body-lg (17px) so it matches the Input and Textarea beside it, which carry that tier because iOS Safari zooms the page when a focused field computes under 16px. A custom field in the same row should follow: a second paired tier under a max-sm: variant, never a hand-set font-size.",
			},
			{
				guidance: "do",
				description:
					"Inside a <Workspace> a Select adapts automatically — trigger and popup both pick up the compact density, including across the portal. Do NOT hand-size it per call site; that was necessary before v0.41 and is now drift.",
			},
		],
		anatomy: [
			{
				name: "Root",
				required: true,
				description:
					"Owns value, open state, form integration, and item collection.",
			},
			{
				name: "Trigger",
				required: true,
				description:
					"The button that shows the selected value and opens the listbox.",
			},
			{
				name: "Content",
				required: true,
				description:
					"The positioned popup containing options and optional groups.",
			},
			{
				name: "Item",
				required: true,
				description:
					"A selectable option with selected and highlighted states.",
			},
		],
	},
	related: {
		components: ["Combobox", "Radio", "Field", "Input"],
		patterns: ["SettingsPage", "AuthPage"],
	},
	status: "stable",
	props: [
		{
			name: "items",
			type: "Record<string, ReactNode> | { value: string; label: ReactNode }[]",
			description:
				"value → label map (a record, or an array of { value, label }). Derived automatically from literal SelectItem children; pass it explicitly when the items are generated in a loop, or a closed trigger renders the raw value instead of the label.",
		},
		{
			name: "Select (Root)",
			type: "Base UI Select.Root props (value, defaultValue, onValueChange, open, defaultOpen, onOpenChange, disabled, required, name, multiple, items)",
			description:
				"Controls the selected value and open state. Uncontrolled by default. When `items` isn't passed, it is derived from the SelectItem children so the closed trigger shows display text instead of the raw value; pass `items` explicitly when item children aren't plain strings.",
		},
	],
	subcomponents: [
		{
			name: "SelectTrigger",
			type: 'Base UI Trigger props + placeholder?: ReactNode + size?: "md" | "xs" + className',
			description:
				'The button. Composes Trigger + Value + a chevron Icon that flips on open (data-[popup-open]). `size="xs"` is the property-grid rung — height, padding, radius AND surface move together, which is why it is a prop and not a className: the xs trigger is an inset `bg-panel-field` field with no border, matching ScrubField on the same row. A consumer overriding only the height gets an md-register 8px radius on a 24px box and a raised card sitting among inset fields; one inspector panel had eleven of those, and both tells are visible at a glance.',
		},
		{
			name: "SelectContent",
			type: "Base UI Popup props + side, align, sideOffset + className",
			description:
				"Portal + Positioner + Popup + List. side=\"bottom\", align=\"start\", sideOffset=6 by default; matches trigger width.",
		},
		{
			name: "SelectItem",
			type: "{ value: string; disabled?: boolean; label?: string } + className",
			description:
				"An option. Composes Item + ItemText + a check ItemIndicator for the selected row. String children double as the item's `label`, so the closed trigger shows the display text — pass `label` explicitly only when children are richer than a string.",
		},
		{
			name: "SelectGroup",
			type: "Base UI Group props + className",
			description: "Optional grouping of related options.",
		},
		{
			name: "SelectGroupLabel",
			type: "Base UI GroupLabel props + className",
			description:
				"The heading associated with a SelectGroup for screen readers.",
		},
		{
			name: "SelectValue",
			type: "Base UI Value props (children render fn) + placeholder",
			description:
				"Renders the selected option's label with a placeholder fallback. Already composed inside SelectTrigger; exported for advanced layouts that render the value outside the default trigger.",
		},
		{
			name: "SelectSeparator",
			type: "Base UI Separator props + className",
			description:
				"A thin themed divider between groups of items. Decorative — Base UI marks it aria-hidden.",
		},
	],
	tokensUsed: [
		"field-border",
		"field",
		"foreground",
		"ring",
		"border",
		"popover",
		"popover-foreground",
		"accent",
		"accent-foreground",
		"muted-foreground",
	],
	motion: [
		{
			slot: "arrival",
			recipe: "motion-pop",
			part: "SelectContent",
			why: "The popup's transform-origin follows Base UI's anchor, so it grows out of the trigger it belongs to. On a dense form with several selects in a column, that origin is the only thing identifying which field the open list is for.",
		},
		{
			slot: "response",
			recipe: "motion-interactive",
			part: "SelectItem",
			why: "Highlight follows both pointer and keyboard. Easing it means arrow-keying down a list is continuous motion rather than a background teleporting between rows, which is what makes a long list readable while moving.",
		},
		{
			slot: "transition",
			recipe: "motion-pop",
			part: "SelectContent",
			why: "Closing collapses back toward the trigger, so the reader's eye is returned to the field that now holds the value they just picked.",
		},
		{
			slot: "activity",
			recipe: "none",
			part: "SelectContent",
			why: "Select takes a resident list of options. Anything that has to be fetched or filtered as you type is Combobox, which owns that state.",
		},
	],
	a11y: [
		"Base UI provides listbox/option roles, aria-expanded, typeahead, roving focus, and a hidden form input.",
		"Esc and click-outside dismiss; arrow keys and Home/End navigate the list.",
		"Selected option carries data-[selected]; the highlighted option carries data-[highlighted].",
		"Animate the popup via data-[starting-style] / data-[ending-style].",
	],
	examples: [
		{
			label: "Basic (controlled)",
			code: '<Select value={value} onValueChange={setValue}><SelectTrigger placeholder="Choose a font" /><SelectContent><SelectItem value="sans">Sans-serif</SelectItem><SelectItem value="serif">Serif</SelectItem><SelectItem value="mono">Monospace</SelectItem></SelectContent></Select>',
		},
		{
			label: "Grouped",
			code: '<SelectContent><SelectGroup><SelectGroupLabel>Weights</SelectGroupLabel><SelectItem value="regular">Regular</SelectItem><SelectItem value="bold">Bold</SelectItem></SelectGroup></SelectContent>',
		},
		{
			label: "Inside Field",
			code: '<Field label="Default visibility" description="Controls how new projects appear."><Select defaultValue="public"><SelectTrigger placeholder="Choose visibility" /><SelectContent><SelectItem value="public">Public</SelectItem><SelectItem value="private">Private</SelectItem><SelectItem value="unlisted">Unlisted</SelectItem></SelectContent></Select></Field>',
		},
		{
			label: "Rich item labels",
			code: '<Select defaultValue="business" items={[{ value: "business", label: "Business" }, { value: "studio", label: "Studio" }]}><SelectTrigger /><SelectContent><SelectItem value="business" label="Business"><span className="flex items-center gap-2"><Badge tone="1">Business</Badge><span>Business plan</span></span></SelectItem><SelectItem value="studio" label="Studio"><span className="flex items-center gap-2"><Badge tone="2">Studio</Badge><span>Studio</span></span></SelectItem></SelectContent></Select>',
		},
	],
}

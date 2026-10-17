import type { ComponentMeta } from "../../lib/meta"

export const comboboxMeta: ComponentMeta = {
	name: "Combobox",
	summary:
		"Autocomplete over Base UI Combobox — type-to-filter, roving focus, ARIA combobox/listbox wiring, collision-aware positioning, Esc/outside dismissal. A search input (with chevron trigger) plus a portal-rendered popup of filterable items.",
	keywords: [
		"combobox",
		"autocomplete",
		"typeahead",
		"search select",
		"filter",
		"suggestions",
		"picker",
	],
	usage: {
		description:
			"Use Combobox when users choose from a list that benefits from typing, filtering, or autocomplete — one value, or several with `multiple` and ComboboxChips (tags, collaborators, categories). Use Select for short finite sets, a Checkbox group when every choice should stay visible, and CommandMenu for global actions.",
		bestPractices: [
			{
				guidance: "do",
				description:
					"Pass items so internal filtering, empty state, and accessibility wiring have the full option set.",
			},
			{
				guidance: "do",
				description:
					"Use ComboboxEmpty with helpful copy for zero matches.",
			},
			{
				guidance: "do",
				description:
					"For results from a server, pass `filter={null}` so Base UI shows the items as the server returned them, fetch from `onInputValueChange`, and make ComboboxEmpty say which state it is in (searching, no results, type to search). Object items take `itemToStringLabel`.",
			},
			{
				guidance: "do",
				description:
					"Wrap in Field when the combobox is part of a form.",
			},
			{
				guidance: "dont",
				description:
					"Use Combobox for tiny option sets where Select or Radio would be easier to scan.",
				instead: ["Select", "Radio"],
			},
			{
				guidance: "do",
				description:
					"Reach for ComboboxVirtualList past roughly a thousand rows, and leave filtering to the root. It reads the filtered list through useFilteredItems(), so the rendered rows and the rows Base UI navigates cannot drift apart.",
			},
			{
				guidance: "do",
				description:
					"Use `multiple` with ComboboxChips for several values from a filterable set, and keep chip labels short so the field does not turn into a paragraph.",
			},
			{
				guidance: "dont",
				description:
					"Use Combobox as a command launcher. Use CommandMenu for actions and navigation.",
				instead: ["CommandMenu"],
			},
			{
				guidance: "dont",
				description:
					"Take filtering over with filteredItems in order to virtualize. Base UI ignores filteredItems while the untouched field still holds the selected item's label, so the list you render and the list it indexes diverge — and the symptom is clicking one row and getting another.",
			},
		],
		anatomy: [
			{
				name: "Root",
				required: true,
				description:
					"Owns selected value, input value, filtering, and open state.",
			},
			{
				name: "Input",
				required: true,
				description:
					"The searchable text field and trigger.",
			},
			{
				name: "Chips",
				required: false,
				description:
					"The field for `multiple`, used in place of Input: one removable chip per selected item plus the text input, in one wrapping shell.",
			},
			{
				name: "Content",
				required: true,
				description:
					"The positioned popup surface.",
			},
			{
				name: "List",
				required: true,
				description:
					"The listbox inside the popup. Takes a render function that receives each filtered item.",
			},
			{
				name: "Item",
				required: true,
				description:
					"A selectable suggestion row.",
			},
			{
				name: "Empty",
				required: false,
				description:
					"Fallback shown when filtering returns no items.",
			},
		],
	},
	related: {
		components: ["Select", "Checkbox", "CommandMenu", "Field", "SearchInput", "Badge"],
		patterns: ["SettingsPage", "ListDetailPage"],
	},
	status: "stable",
	props: [
		{
			name: "Combobox (Root)",
			type: "Base UI Combobox.Root props (items, value, defaultValue, onValueChange, inputValue, onInputValueChange, open, onOpenChange, multiple, autoHighlight, filter, disabled)",
			default: "—",
			description:
				"Groups all parts and owns selection + filter state. Pass `items` (flat array or groups) to enable internal filtering and ComboboxEmpty.",
		},
		{
			name: "items",
			type: "readonly any[] | readonly ComboboxItemGroup[]",
			default: "—",
			description:
				"The pool of options, flat or grouped ({ value, items }). Drives type-to-filter and is required for ComboboxEmpty to render its fallback.",
		},
		{
			name: "multiple",
			type: "boolean",
			default: "false",
			description:
				"Select several items instead of one. `value` / `defaultValue` / `onValueChange` become arrays, choosing an item toggles its membership, and the popup stays open between picks. Pair it with ComboboxChips in place of ComboboxInput; every other part is unchanged.",
		},
		{
			name: "filter",
			type: "null | ((item, query, itemToString?) => boolean)",
			default: "Base UI's locale-aware contains",
			description:
				"How items match the query. `null` turns matching off, for items a server already filtered: pair it with `onInputValueChange` to fetch.",
		},
		{
			name: "onInputValueChange",
			type: "(inputValue: string, eventDetails) => void",
			default: "—",
			description: "Fires as the reader types. The place to fetch results for a server-backed combobox.",
		},
		{
			name: "itemToStringLabel",
			type: "(item) => string",
			default: "item.label for { value, label } items",
			description: "The text an object item shows in the input once chosen, and is matched by. Needed for object items without a `label` field.",
		},
		{
			name: "virtualized",
			type: "boolean",
			default: "false",
			description:
				"Tells Base UI the DOM holds only part of the list. Required when using ComboboxVirtualList.",
		},
	],
	subcomponents: [
		{
			name: "ComboboxInput",
			type: 'Base UI Combobox.Input props (minus the native `size` attribute) + size?: "md" | "xs" + className',
			description:
				'The search field, styled like Input, wrapped with an InputGroup + chevron Trigger that toggles the popup. The chevron flips while the popup is open (data-[popup-open] on the toggle). `size="xs"` is the property-grid rung and mirrors SelectTrigger\'s `xs` exactly — same height, radius and inset surface — so a combobox and a select in one panel are the same shape holding different content (a font-family picker directly above a font-weight select is the case it exists for). Note the type: the native numeric `size` attribute is omitted rather than shadowed, because intersecting a string union onto it resolves to `never` and breaks every call site.',
		},
		{
			name: "ComboboxChips",
			type: 'Base UI Combobox.Input props (minus the native `size` attribute) + size?: "md" | "xs" + chipLabel?: (item) => string + className',
			description:
				'The field for a `multiple` combobox, used in place of ComboboxInput. Each selected item renders as a soft `sm` Badge with a ghost `icon-xs` Button that removes it (labelled "Remove {label}"), followed by the text input; the shell wraps and grows as chips are added. `chipLabel` turns an item into its chip text — defaults to the item for strings/numbers and its `label` field for objects. Keyboard is Base UI\'s: Backspace in an empty field removes the last chip, ←/→ move between chips, Backspace/Delete removes the highlighted one. `size="xs"` mirrors ComboboxInput\'s property-grid rung.',
		},
		{
			name: "ComboboxContent",
			type: "Base UI Popup props + { side?: Side; align?: Align; sideOffset?: number; scroll?: boolean; className?: string }",
			description:
				"Portal + Positioner + Popup — it does not render a list, so put a ComboboxList (or ComboboxVirtualList) inside it. Width matches the input via --anchor-width. side is which side of the input the popup renders against (auto-flips on collision), align its alignment along that side, sideOffset the gap in px. Defaults to side='bottom', align='start', sideOffset=6, scroll=true. Pass scroll={false} when a ComboboxVirtualList inside owns the scrolling.",
		},
		{
			name: "ComboboxList",
			type: "Base UI Combobox.List props (children: ReactNode | (item, index) => ReactNode)",
			description:
				"The listbox. Required inside ComboboxContent: pass a render function and it is called once per filtered item (or per group when `items` is grouped), so the rendered rows always match Base UI's filtering.",
		},
		{
			name: "ComboboxVirtualList",
			type: "{ itemHeight: number; groupLabelHeight?: number; overscan?: number; children: (item, { index }) => ReactNode; renderGroupLabel?; className?; itemClassName? }",
			description:
				"A windowed list: only the rows on screen exist. Fixed row heights (nothing is measured, so late-arriving content changes how a row looks and never where the rows are). Filtering stays Base UI's — the component reads the filtered list through useFilteredItems() — and groups keep their role=group wrapper and label association. Needs virtualized on the root and scroll={false} on ComboboxContent.",
		},
		{
			name: "ComboboxItem",
			type: "Base UI Combobox.Item props + className (value, disabled, index, onClick)",
			description:
				"A suggestion row. Highlights via data-[highlighted]; shows a trailing check (ItemIndicator) when it matches the selected value.",
		},
		{
			name: "ComboboxEmpty",
			type: "Base UI Combobox.Empty props + className",
			description:
				"Fallback shown when the filtered list is empty. Requires the `items` prop on the root.",
		},
		{
			name: "ComboboxGroup",
			type: "Base UI Combobox.Group props + className",
			description:
				"Groups related items under an accessible label auto-associated with the group.",
		},
		{
			name: "ComboboxGroupLabel",
			type: "Base UI Combobox.GroupLabel props + className",
			description:
				"The label for a ComboboxGroup. Auto-associated with the group it sits in.",
		},
	],
	tokensUsed: [
		"input",
		"card",
		"foreground",
		"muted-foreground",
		"ring",
		"destructive",
		"popover",
		"popover-foreground",
		"border",
		"accent",
		"accent-foreground",
		"primary",
		"secondary",
		"secondary-foreground",
	],
	motion: [
		{
			slot: "arrival",
			recipe: "motion-pop",
			part: "ComboboxContent",
			why: "The list grows from the field it filters, its origin on Base UI's anchor. With several comboboxes in a form, that is what attaches the open list to the one being typed in.",
		},
		{
			slot: "response",
			recipe: "motion-interactive",
			part: "ComboboxItem",
			why: "A row's ink eases as the pointer or the arrow keys reach it, so moving through a long filtered list reads as continuous movement rather than rows blinking.",
		},
		{
			slot: "response",
			recipe: "custom",
			part: "Highlight",
			why: "One highlight travels to the active row (lib/highlight-glide: a measured translate on the motion tokens) instead of each row painting its own fill. When the list re-filters under the caret, the highlight sliding to the new match is what shows the keyboard target moved.",
		},
		{
			slot: "response",
			recipe: "motion-interactive",
			part: "Toggle",
			why: "The chevron toggle at the field's edge eases its ink on hover; the change is what tells you it is a separate target from the text box.",
		},
		{
			slot: "transition",
			recipe: "motion-interactive",
			part: "Toggle",
			why: "The chevron turns 180° as the list opens and closes (motion-interactive lists `rotate`), in step with the popup, so it reads as one control changing direction.",
		},
		{
			slot: "transition",
			recipe: "motion-pop",
			part: "ComboboxContent",
			why: "Closing shrinks back toward the field, returning the eye to the input that now holds the value.",
		},
		{
			slot: "activity",
			recipe: "none",
			part: "Root",
			why: "Combobox ships no loading part. A list fetched as you type shows a Spinner (motion-spin) in ComboboxEmpty or the content — where the results will land — and only the caller knows a fetch is in flight.",
		},
	],
	a11y: [
		"Base UI provides role=combobox/listbox/option, roving tabindex, arrow-key navigation, and type-to-filter.",
		"Esc and outside-press dismiss; focus returns to the input on close.",
		"The chevron Trigger carries an aria-label and toggles the suggestions popup.",
		"ComboboxEmpty announces filter results politely; keep it mounted (do not conditionally render it).",
		"Animate open/close via data-[starting-style]/data-[ending-style] attributes.",
		"With `multiple`, the listbox is multi-selectable and each chip's remove button is labelled `Remove {label}`; Backspace in an empty field removes the last chip and ←/→ move between chips, so every chip is reachable without a pointer.",
		"ComboboxVirtualList gives every rendered row aria-setsize (the full filtered count) and aria-posinset, so a screen reader is told the size of the list rather than the size of the window.",
		"A highlight that lands on a row the window has not rendered is scrolled into view by the root, which forwards it to the list; Base UI's own scrollIntoView only reaches rows that exist.",
	],
	examples: [
		{
			label: "Basic",
			code: '<Combobox items={fruits}><ComboboxInput placeholder="Search fruit…" /><ComboboxContent><ComboboxEmpty>No matches.</ComboboxEmpty><ComboboxList>{(item) => (<ComboboxItem key={item} value={item}>{item}</ComboboxItem>)}</ComboboxList></ComboboxContent></Combobox>',
		},
		{
			label: "Controlled value",
			code: '<Combobox items={fruits} value={value} onValueChange={setValue}><ComboboxInput /><ComboboxContent><ComboboxList>{(item) => (<ComboboxItem key={item} value={item}>{item}</ComboboxItem>)}</ComboboxList></ComboboxContent></Combobox>',
		},
		{
			label: "Multiple selection",
			code: '<Combobox multiple items={tags} value={value} onValueChange={setValue}><ComboboxChips placeholder="Add tags…" /><ComboboxContent><ComboboxEmpty>No matching tags.</ComboboxEmpty><ComboboxList>{(item) => (<ComboboxItem key={item} value={item}>{item}</ComboboxItem>)}</ComboboxList></ComboboxContent></Combobox>',
		},
		{
			label: "Async search (server results)",
			code: '<Combobox items={results} filter={null} itemToStringLabel={(person) => person.name} value={person} onValueChange={setPerson} onInputValueChange={setQuery}><ComboboxInput placeholder="Search people…" /><ComboboxContent><ComboboxEmpty>{searching ? "Searching…" : query ? "No one matches." : "Type a name to search."}</ComboboxEmpty><ComboboxList>{(item) => (<ComboboxItem key={item.id} value={item}>{item.name}</ComboboxItem>)}</ComboboxList></ComboboxContent></Combobox>',
		},
		{
			label: "Virtualized (long list)",
			code: '<Combobox virtualized items={districts} value={district} onValueChange={setDistrict}><ComboboxInput placeholder="Search districts…" /><ComboboxContent scroll={false}><ComboboxEmpty>No district matches.</ComboboxEmpty><ComboboxVirtualList itemHeight={32}>{(item) => item.label}</ComboboxVirtualList></ComboboxContent></Combobox>',
		},
		{
			label: "Inside Field",
			code: '<Field label="Creator" description="Search by display name."><Combobox items={creators} value={creator} onValueChange={setCreator}><ComboboxInput placeholder="Search creators" /><ComboboxContent><ComboboxEmpty>No creators found.</ComboboxEmpty><ComboboxList>{(item) => (<ComboboxItem key={item.id} value={item}>{item.name}</ComboboxItem>)}</ComboboxList></ComboboxContent></Combobox></Field>',
		},
	],
}

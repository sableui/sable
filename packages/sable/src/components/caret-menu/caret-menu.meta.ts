import type { ComponentMeta } from "../../lib/meta"

export const caretMenuMeta: ComponentMeta = {
	name: "CaretMenu",
	summary:
		"Suggestions at the caret of a text field, for @mentions and /slash commands. `useCaretTrigger` watches a Textarea, Input or ChatComposer (through `fieldRef`) for a trigger character and reports the query; CaretMenu draws the list beside the trigger and drives it from the field's keys, so focus never leaves the field. The value stays plain text: a mention is inserted as `@Sam Rivera`, a command runs and clears its `/query`.",
	status: "beta",
	keywords: [
		"mention",
		"mentions",
		"at mention",
		"slash command",
		"slash commands",
		"autocomplete",
		"typeahead",
		"suggestions",
		"emoji picker",
		"hashtag",
		"trigger",
	],
	usage: {
		description:
			"Use CaretMenu with `useCaretTrigger` when typing a character in running text should offer choices: `@` for people, `/` for commands, `#` for channels, `:` for emoji. The app owns the items (filter or fetch them from `trigger.match.query`) and what choosing one does; Sable owns detecting the trigger, placing the list at the caret, the keys and the accessibility. Use Combobox when the whole field is a search for one value, and CommandMenu for a global palette.",
		bestPractices: [
			{
				guidance: "do",
				description:
					"Attach the hook's `fieldRef` to the field: `ref` on Textarea or Input, `fieldRef` on ChatComposer. On ChatComposer, Enter picks the highlighted suggestion instead of sending, because CaretMenu takes the Enter first.",
			},
			{
				guidance: "do",
				description:
					"Insert a mention with a trailing space, `trigger.replace(`@${person.name} `)`, so the reader keeps typing; run a slash command and then `trigger.replace(\"\")` to clear `/query` from the field.",
			},
			{
				guidance: "do",
				description:
					"For `@` names with spaces set `allowSpaces: true` on that trigger; for `/` commands set `atStart: true` so `and/or` mid-sentence stays text.",
			},
			{
				guidance: "do",
				description:
					"Fetch remote suggestions from `trigger.match?.query` yourself, debounced, and pass `status` while loading or when nothing matches (\"Searching…\", \"No one matches\"). The status row is also what the list announces.",
			},
			{
				guidance: "dont",
				description:
					"Do not expect chips inside the field. A textarea holds text, so a mention is text. Rendering tokens in the field needs a rich-text editor, which Sable does not own (`sable docs extending-a-component`).",
			},
			{
				guidance: "dont",
				description: "Do not move focus into the list or wrap the field in a Popover. Focus stays in the field; the list is pointed at with aria-activedescendant.",
			},
		],
		anatomy: [
			{ name: "useCaretTrigger", required: true, description: "The hook on the field: trigger detection, the query, the caret anchor, replace() and dismiss()." },
			{ name: "CaretMenu", required: true, description: "The list at the caret, its keys, and its announcements." },
			{ name: "CaretMenuItem", required: true, description: "One suggestion row, with optional icon and description." },
		],
	},
	related: {
		components: ["ChatComposer", "Textarea", "Input", "Combobox", "CommandMenu", "Menu"],
	},
	props: [
		{
			name: "trigger",
			type: "UseCaretTriggerResult",
			description:
				"The result of `useCaretTrigger({ triggers })`, whose `fieldRef` is attached to the field. Each trigger is `{ char, atStart?, allowSpaces?, maxQueryLength? }`; the result carries `match` (`{ trigger, query, start, end }` or null), `replace(text)`, `dismiss()` and `getAnchorRect()`.",
		},
		{
			name: "label",
			type: "string",
			description: "The list's accessible name, e.g. \"People\" or \"Commands\".",
		},
		{
			name: "status",
			type: "ReactNode",
			description:
				"A row under the items for what the list is doing: loading, nothing found, an error. Announced politely in place of the suggestion count. With no items and no status the list stays shut.",
		},
		{
			name: "children",
			type: "ReactNode",
			description: "CaretMenuItems, already filtered for the query.",
		},
		{
			name: "className",
			type: "string",
			description: "Layout classes for the popup, such as a width.",
		},
	],
	subcomponents: [
		{
			name: "CaretMenuItem",
			type: "div props + onSelect: () => void + disabled?: boolean + icon?: ReactNode + description?: ReactNode",
			description:
				"One suggestion, styled as a Menu row. `onSelect` runs on Enter, Tab or click; `icon` and `description` work as on MenuItem. A disabled row shows but the arrow keys skip it.",
		},
	],
	tokensUsed: ["popover", "popover-foreground", "border-floating", "accent", "accent-foreground", "muted-foreground"],
	motion: [
		{
			slot: "arrival",
			recipe: "motion-pop",
			part: "root",
			why: "Scales in from the caret's side, so the list reads as coming from the character just typed. It leaves instantly: it answers a keystroke and should be gone by the next one.",
		},
	],
	a11y: [
		"Focus stays in the field. The field carries aria-autocomplete=\"list\", aria-controls (the listbox) and aria-activedescendant (the highlighted option), so a screen reader follows the arrow keys without focus moving.",
		"An <input> becomes role=\"combobox\" with aria-expanded. A <textarea> keeps its textbox role (combobox would drop multiline), and since a textbox cannot carry aria-expanded, opening is announced through a polite status, mounted from the start: \"3 suggestions\", or the `status` text.",
		"↑/↓ move the highlight and wrap; Enter or Tab choose it; Escape closes the list without reaching an enclosing Dialog or Sheet. Shift+Enter is left alone, so a line break still breaks the line.",
		"Rows keep focus in the field on pointer down, so a click does not blur it and close the list first.",
		"Triggers follow a word boundary (`ana@example.com` and `and/or` stay text), wait for IME composition to end, and stay closed after Escape until the caret leaves that trigger.",
	],
	examples: [
		{
			label: "Mentions and slash commands in a ChatComposer",
			code: 'const trigger = useCaretTrigger({ triggers: [{ char: "@", allowSpaces: true }, { char: "/", atStart: true }] })\nconst q = trigger.match?.query.toLowerCase() ?? ""\nconst commands = trigger.match?.trigger.char === "/"\n\n<ChatComposer fieldRef={trigger.fieldRef} onSend={send} />\n<CaretMenu trigger={trigger} label={commands ? "Commands" : "People"} status={!commands && people.length === 0 ? "No one matches" : undefined}>\n\t{commands\n\t\t? slashCommands.filter((c) => c.name.startsWith(q)).map((c) => (\n\t\t\t<CaretMenuItem key={c.name} description={c.hint} onSelect={() => { c.run(); trigger.replace("") }}>/{c.name}</CaretMenuItem>\n\t\t))\n\t\t: people.filter((p) => p.name.toLowerCase().includes(q)).map((p) => (\n\t\t\t<CaretMenuItem key={p.id} icon={<Avatar size="sm" src={p.avatar} fallback={p.initials} />} onSelect={() => trigger.replace(`@${p.name} `)}>{p.name}</CaretMenuItem>\n\t\t))}\n</CaretMenu>',
		},
		{
			label: "On a Textarea, with remote results",
			code: 'const trigger = useCaretTrigger({ triggers: [{ char: "#" }] })\n// Fetch from trigger.match?.query yourself, debounced; pass the state as status.\n<Textarea ref={trigger.fieldRef} aria-label="Note" />\n<CaretMenu trigger={trigger} label="Channels" status={loading ? "Searching…" : channels.length === 0 ? "No channels match" : undefined}>\n\t{channels.map((c) => <CaretMenuItem key={c.id} onSelect={() => trigger.replace(`#${c.name} `)}>#{c.name}</CaretMenuItem>)}\n</CaretMenu>',
		},
	],
}

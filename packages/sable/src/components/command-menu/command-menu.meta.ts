import type { ComponentMeta } from "../../lib/meta";

export const commandMenuMeta: ComponentMeta = {
	name: "CommandMenu",
	summary:
		"A command palette (Cmd+K) built on our Dialog: a top-aligned wide surface with a search input and a scrollable, JS-filtered list of grouped commands. CommandMenuPanel renders the same palette in place, on a card in the page.",
	keywords: [
		"command",
		"command menu",
		"palette",
		"launcher",
		"cmd k",
		"search",
		"quick action",
		"spotlight",
		"navigation",
		"search trigger",
		"header search",
		"keyboard shortcut",
		"inline command menu",
		"embedded palette",
		"settings search",
	],
	usage: {
		description:
			"Use CommandMenu for global or contextual keyboard-driven actions: navigation, creation, quick settings, or searchable commands. It should feel curated and fast; use Select, Menu, or Combobox for ordinary inline choices.",
		bestPractices: [
			{
				guidance: "do",
				description:
					"Open the palette from a header search with CommandMenuTrigger: a button wearing SearchInput's field shell, with the ⌘K / Ctrl K hint and the page-wide shortcut built in. A palette with no visible trigger still takes useCommandMenuShortcut rather than a hand-written keydown listener.",
			},
			{
				guidance: "dont",
				description:
					"Hand-style a <button> to look like a search field, or put a SearchInput in the header that opens a dialog when focused. The first drifts from the field it imitates; the second is a text box you cannot type in. A header search that opens the palette is CommandMenuTrigger.",
				instead: ["CommandMenuTrigger"],
			},
			{
				guidance: "do",
				description:
					"Group items by task area, such as Navigation, Create, or Settings, so users can scan before typing.",
			},
			{
				guidance: "do",
				description:
					"Keep command labels action-oriented and unique enough to search.",
			},
			{
				guidance: "do",
				description:
					"Provide useful bootstrap items so the menu is valuable before the user types.",
			},
			{
				guidance: "dont",
				description:
					"Use CommandMenu as a replacement for every dropdown. Simple choices belong in Select, Menu, or Tabs.",
				instead: ["Select", "Menu", "Tabs"],
			},
			{
				guidance: "do",
				description:
					"Pass a filter when the palette searches more than one source. Ranking (exact prefix over substring over subsequence) is the caller's to own, and the returned order is kept verbatim — including group order, which follows each group's first surviving row.",
			},
			{
				guidance: "do",
				description:
					"List a command the user cannot currently run as disabled with the reason in hint, rather than filtering it away. A palette that hides what you cannot do teaches you nothing about why.",
			},
			{
				guidance: "do",
				description:
					"Resize the list with listClassName rather than reaching past className into the palette's DOM. className is the dialog surface; listClassName is the Scroller that actually scrolls.",
			},
			{
				guidance: "do",
				description:
					"Use CommandMenuPanel when the palette lives in the page: a sidebar launcher, a settings search, a demo. It takes the same items, filter, query and children, and keeps the same keyboard model; it is a static card, so it does not trap focus or take it on mount, and Esc clears the query instead of closing anything.",
			},
			{
				guidance: "dont",
				description:
					"Hand-build a palette mock from a search glyph, a row of buttons and a highlight. That is CommandMenuPanel, and the hand-built one has no combobox, no filtering and no keyboard model.",
				instead: ["CommandMenuPanel"],
			},
			{
				guidance: "dont",
				description:
					"Dump every app route and action into one uncurated list. Keep the palette opinionated.",
			},
			{
				guidance: "dont",
				description:
					"Rebuild the combobox over Dialog to get consumer-owned ranking. query/onQueryChange and filter are that seam; the keyboard model, activedescendant wiring, and result-count live region come with them.",
			},
		],
		anatomy: [
			{
				name: "Trigger",
				required: false,
				description:
					"CommandMenuTrigger — the search-field-shaped button in a header that opens the palette on click or on ⌘K / Ctrl+K. It sits outside CommandMenu; wire its onOpen to the palette's open state.",
			},
			{
				name: "Dialog surface",
				required: true,
				description:
					"The modal shell that traps focus and positions the launcher. CommandMenuPanel replaces it with a static card in the page (border, card fill, no shadow).",
			},
			{
				name: "Search input",
				required: true,
				description:
					"The combobox input that filters commands while focus remains in the field.",
			},
			{
				name: "Groups",
				required: false,
				description:
					"Labelled command sections that keep results scannable.",
			},
			{
				name: "Items",
				required: true,
				description:
					"Keyboard-selectable command rows that run onSelect and close the palette.",
			},
		],
	},
	related: {
		components: ["Dialog", "SearchInput", "Kbd", "Menu", "Select", "Combobox"],
		patterns: ["DashboardPage", "ListDetailPage"],
	},
	status: "stable",
	props: [
		{
			name: "scope",
			type: "ReactNode",
			description:
				"A scope chip in the header, between the search glyph and the input — \"In: Backdrop\". A scope belongs beside the field rather than in its value: put it in the value and the user deletes prose to widen their search, and your filter parses it back out. Pair with inputProps.onKeyDown handling Backspace on an empty query, or the only way out of a scope is the mouse.",
		},
		{
			name: "inputProps",
			type: "Omit<ComponentProps<'input'>, 'role' | 'value' | 'onChange' | aria-*>",
			description:
				"Extra props for the search input. `onKeyDown` runs BEFORE the palette's own handling and opts out of a key by calling preventDefault() — which is what makes a scope chip Backspace-dismissable. Running first is deliberate: Backspace happens not to be a key the palette claims today, so a plain passthrough would work until the palette grows a 'Backspace clears the query' affordance, at which point the consumer's behaviour breaks silently. The combobox wiring (role, aria relationships, controlled value) is not overridable; aria-label and className compose.",
		},
		{
			name: "open",
			type: "boolean",
			description: "Controlled open state of the palette.",
		},
		{
			name: "onOpenChange",
			type: "(open: boolean) => void",
			description: "Called on open/close (select, Esc, outside click).",
		},
		{
			name: "items",
			type: "CommandItem[]",
			description:
				"Data-driven commands ({ group, label, onSelect, id?, icon?, detail?, stacked?, hint?, disabled? }). stacked puts detail on its own line under the label, for results only their detail tells apart (two tickets with one subject); beside a long label an inline detail truncates first. Ignored when children are provided. id is optional identity: filter is handed these same objects, so it is how a caller that ranks over its own richer model maps the array back onto it — and it becomes the row's DOM id (namespaced to the palette) and React key, so two rows may share a label.",
		},
		{
			name: "query",
			type: "string",
			description:
				"Controlled query. Leave undefined to let the palette own it; either way it resets on close (a controlled caller gets onQueryChange('')).",
		},
		{
			name: "onQueryChange",
			type: "(query: string) => void",
			description:
				"Called on every query change. Required to control query, optional otherwise.",
		},
		{
			name: "filter",
			type: "((items: CommandItem[], query: string) => CommandItem[]) | null",
			default: "case-insensitive substring match on label",
			description:
				"Replaces or disables the built-in match. A function ranks and filters items itself and its order is kept verbatim; null renders items exactly as given. Either also stops declarative CommandMenuItem children self-filtering. The query arrives raw — trimming and case are policy, and this is the prop that hands policy over.",
		},
		{
			name: "highlightMatches",
			type: "boolean",
			default: "true",
			description:
				"Paints the query wherever it appears in a row's label (not its detail or hint), on the `highlight` / `highlight-foreground` pair, through the CSS Custom Highlight API — no `<mark>` in the row, and the accessible name is unchanged. A literal, case-insensitive match, so under a fuzzy `filter` a row that matched as a subsequence keeps an unpainted label. `false` turns it off. Applies to CommandMenuPanel too.",
		},
		{
			name: "listClassName",
			type: "string",
			description:
				"Classes for the scrolling list. className lands on the dialog surface, so this is the seam for the list's own height cap — listClassName=\"max-h-[60vh]\". The list is a Scroller, so the cap lands on the element that scrolls and the edge fades come free.",
		},
		{
			name: "placeholder",
			type: "string",
			default: '"Type a command or search…"',
			description: "Placeholder for the search input.",
		},
		{
			name: "emptyMessage",
			type: "string",
			default: '"No results found."',
			description: "Copy shown when the query matches nothing.",
		},
		{
			name: "title",
			type: "string",
			default: '"Command menu"',
			description:
				"Accessible name for the palette dialog (visually hidden).",
		},
		{
			name: "description",
			type: "string",
			default: '"Search for a command and press Enter to run it."',
			description:
				"Accessible description for the palette dialog (visually hidden).",
		},
		{
			name: "finalFocus",
			type: "RefObject<HTMLElement> | ((closeType) => HTMLElement | false) | false",
			description:
				"Where focus goes when the palette closes. The Dialog default returns it to the trigger — the CommandMenuTrigger, when there is one. A palette opened by the keystroke alone has none, so pass a resolver to restore whatever had focus, or false to restore nothing.",
		},
		{
			name: "children",
			type: "ReactNode",
			description:
				"Declarative commands via CommandMenuGroup / CommandMenuItem. Takes precedence over items.",
		},
	],
	subcomponents: [
		{
			name: "CommandMenuTrigger",
			type: '{ onOpen?: () => void; placeholder?: string; shortcut?: string | false; size?: "sm" | "md"; disabled?: boolean }',
			description:
				"The search field in a header that is really a button. Wears SearchInput's shell (the field fill and outline, leading magnifier, muted placeholder) on the control ladder, with a trailing Kbd: ⌘K on macOS, Ctrl K elsewhere. onOpen runs on click and on the shortcut, which it listens for page-wide (useCommandMenuShortcut). shortcut is the key (default \"k\"); false drops both the hint and the listener. size is sm in a header beside small buttons, md (default) beside Input and SearchInput. It sits outside CommandMenu, so the Dialog returns focus to it on close.",
		},
		{
			name: "useCommandMenuShortcut",
			type: "(onShortcut: (event: KeyboardEvent) => void, key?: string | false) => void",
			description:
				"The page-wide ⌘K / Ctrl+K listener CommandMenuTrigger installs, for a palette with no visible trigger. Ignored while focus is in a text field, textarea, select or contenteditable (Ctrl+K belongs to the field there) except the palette's own input, so the callback may toggle. It calls preventDefault() on a match and skips an event already prevented, so two listeners on one page fire once. key defaults to \"k\"; false turns it off. Removed on unmount.",
		},
		{
			name: "CommandMenuPanel",
			type: "{ items?: CommandItem[]; query?: string; onQueryChange?: (query: string) => void; filter?: CommandFilter; listClassName?: string; placeholder?: string; emptyMessage?: string; title?: string; scope?: ReactNode; inputProps?: ComponentProps<'input'>; className?: string; children?: ReactNode }",
			description:
				"The palette rendered in place: the same search header, filtered and grouped listbox, keyboard model and result-count live region, on a static card (border-border, bg-card, no shadow) instead of in a Dialog. Takes every CommandMenu prop except open, onOpenChange, finalFocus and description; className lands on the card, title names the listbox. Focus is not trapped and the input does not take focus on mount (inputProps.autoFocus opts in). Esc clears the query, and passes through once it is empty, so a Popover around the panel still closes. A chosen row runs its onSelect and the panel stays as it was. The page-wide shortcut does not fire from its input.",
		},
		{
			name: "CommandMenuGroup",
			type: "{ label: string; children }",
			description: "A labelled group of command rows.",
		},
		{
			name: "CommandMenuItem",
			type: "{ onSelect?: () => void; icon?: string; detail?: ReactNode; stacked?: boolean; hint?: ReactNode; disabled?: boolean; id?: string; children }",
			description:
				"A selectable row. Self-filters by its text (unless the root was given a filter), runs onSelect, then closes the palette. detail is secondary text after the label, or under it with stacked; hint is the end-aligned trailing slot — a shortcut, a count, or a disabled row's reason. A disabled row stays listed, stays announced, and stays reachable by arrow key so its reason can be read, but is inert to Enter and to a click.",
		},
	],
	tokensUsed: [
		"highlight",
		"highlight-foreground",
		"card",
		"card-foreground",
		"border",
		"foreground",
		"muted-foreground",
		"accent",
		"accent-foreground",
	],
	motion: [
		{
			slot: "arrival",
			recipe: "motion-pop",
			part: "Dialog",
			why: "The palette opens on DialogContent's recipe over a fading backdrop. It is summoned by a keystroke from nowhere on screen, and the short scale-in is what says a layer arrived rather than the page changing. The inline CommandMenuPanel has no entrance: it is part of the page.",
		},
		{
			slot: "arrival",
			recipe: "motion-appear",
			part: "Clear button",
			why: "The clear button mounts on the first keystroke, beside the caret the eye is already on. Fading in, it reads as the field offering a way back instead of a control blinking into the header. Removal is instant, so an emptied query does not wait on its X.",
		},
		{
			slot: "response",
			recipe: "motion-interactive",
			part: "CommandItem",
			why: "The active row follows both the arrow keys and the pointer, and its fill eases between rows, so scanning results while typing reads as one highlight moving rather than rows flashing in turn.",
		},
		{
			slot: "response",
			recipe: "motion-interactive",
			part: "CommandMenuTrigger",
			why: "The search-shaped trigger eases its ink on hover like the field shell it imitates, so it reads as the field it opens.",
		},
		{
			slot: "transition",
			recipe: "motion-pop",
			part: "Dialog",
			why: "Closing on Enter or Esc shrinks the palette away fast and returns focus where it came from; the exit is the confirmation that the command ran or was dismissed.",
		},
		{
			slot: "activity",
			recipe: "none",
			part: "List",
			why: "Results are filtered synchronously from the items passed in. Async results are the caller's to mark with a Spinner (motion-spin) in the list, where the person is already looking.",
		},
	],
	a11y: [
		"CommandMenuTrigger is a real <button> named by its visible placeholder, with aria-haspopup=dialog and aria-keyshortcuts (Meta+K on macOS, Control+K elsewhere). Its Kbd hint is aria-hidden, so the shortcut is announced once rather than read as part of the name.",
		"The shortcut never fires from inside a text field, textarea, select or contenteditable (Ctrl+K is delete-to-end-of-line in macOS text views), except the palette's own input.",
		"CommandMenuPanel is the same combobox and listbox in the page, with no dialog: it does not trap or steal focus, and Esc clears a non-empty query (stopping there) instead of dismissing. With an empty query Esc is left alone for whatever contains the panel.",
		"Built on Base UI Dialog, so focus trap, scroll lock, and Esc/outside dismissal come for free; the dialog carries a visually-hidden title + description so it is announced.",
		"Follows the ARIA combobox pattern: the search input is role=combobox (aria-autocomplete=list) that owns the role=listbox popup via aria-controls.",
		"ArrowDown/ArrowUp/Home/End and PageUp/PageDown move a virtual aria-activedescendant highlight while focus stays in the input; Enter runs the highlighted command. Arrow keys wrap; page jumps clamp.",
		"Groups expose role=group labelled by their heading; items are role=option and never enter the tab order.",
		"A polite role=status live region announces the result count as the query narrows, so the size of the list is available without reading it.",
		"A disabled row carries aria-disabled and is skipped when seeding the highlight, but stays in the arrow-key walk so its reason can be reached and read.",
		"The component keeps ownership of aria-activedescendant even when a caller claims a key through inputProps.onKeyDown. Skipping a move is coherent (they took responsibility for that key), but nothing may leave the active id naming a row that is not painted as active — so the opt-out returns before any highlight change rather than after it.",
		"Exactly one row is ever painted as active: the pointer takes the highlight over (moving onto a row makes it the aria-activedescendant) rather than adding a hover fill of its own, so what looks highlighted is always what Enter will run.",
	],
	examples: [
		{
			label: "Data-driven",
			code: "<CommandMenu open={open} onOpenChange={setOpen} items={[{ group: 'Navigation', label: 'Go to feed', icon: 'home', onSelect: () => {} }, { group: 'Actions', label: 'New post', onSelect: () => {} }]} />",
		},
		{
			label: "Declarative",
			code: "<CommandMenu open={open} onOpenChange={setOpen}><CommandMenuGroup label='Navigation'><CommandMenuItem icon='home' onSelect={() => {}}>Go to feed</CommandMenuItem></CommandMenuGroup></CommandMenu>",
		},
		{
			label: "Grouped launcher",
			code: '<CommandMenu open={open} onOpenChange={setOpen}><CommandMenuGroup label="Create"><CommandMenuItem icon="plus" onSelect={() => createPost()}>New post</CommandMenuItem><CommandMenuItem icon="sparkles" onSelect={() => createProject()}>New project</CommandMenuItem></CommandMenuGroup><CommandMenuGroup label="Navigation"><CommandMenuItem icon="home" onSelect={() => navigate("/")}>Home</CommandMenuItem><CommandMenuItem icon="gear" onSelect={() => navigate("/settings")}>Settings</CommandMenuItem></CommandMenuGroup></CommandMenu>',
		},
		{
			label: "Consumer-owned ranking",
			code: "<CommandMenu open={open} onOpenChange={setOpen} query={query} onQueryChange={setQuery} filter={(items, q) => rank(items, q)} items={items} />",
		},
		{
			label: "Listed but unavailable",
			code: "<CommandMenu open={open} onOpenChange={setOpen} items={[{ group: 'Layers', label: 'Align left', disabled: true, hint: 'Select another layer to align to', onSelect: () => {} }]} />",
		},
		{
			label: "Inline panel",
			code: "<CommandMenuPanel className=\"w-80\" items={[{ group: 'Create', label: 'New project', icon: 'plus', hint: <Kbd>N</Kbd>, onSelect: () => {} }, { group: 'Settings', label: 'Open settings', icon: 'gear', onSelect: () => {} }]} />",
		},
		{
			label: "Header search trigger",
			code: '<CommandMenuTrigger size="sm" placeholder="Search docs" onOpen={() => setOpen(true)} className="w-56" />\n<CommandMenu open={open} onOpenChange={setOpen} items={items} />',
		},
		{
			label: "Keyboard shortcut with no visible trigger",
			code: "useCommandMenuShortcut(() => setOpen((value) => !value))\n<CommandMenu open={open} onOpenChange={setOpen} items={items} />",
		},
	],
};

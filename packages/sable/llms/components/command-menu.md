# CommandMenu

**Status:** stable

A command palette (Cmd+K) built on our Dialog: a top-aligned wide surface with a search input and a scrollable, JS-filtered list of grouped commands. CommandMenuPanel renders the same palette in place, on a card in the page.

**Keywords:** command, command menu, palette, launcher, cmd k, search, quick action, spotlight, navigation, search trigger, header search, keyboard shortcut, inline command menu, embedded palette, settings search

## Usage

Use CommandMenu for global or contextual keyboard-driven actions: navigation, creation, quick settings, or searchable commands. It should feel curated and fast; use Select, Menu, or Combobox for ordinary inline choices.

### Best practices

- Do: Open the palette from a header search with CommandMenuTrigger: a button wearing SearchInput's field shell, with the ⌘K / Ctrl K hint and the page-wide shortcut built in. A palette with no visible trigger still takes useCommandMenuShortcut rather than a hand-written keydown listener.
- Do: Group items by task area, such as Navigation, Create, or Settings, so users can scan before typing.
- Do: Keep command labels action-oriented and unique enough to search.
- Do: Provide useful bootstrap items so the menu is valuable before the user types.
- Do: Pass a filter when the palette searches more than one source. Ranking (exact prefix over substring over subsequence) is the caller's to own, and the returned order is kept verbatim — including group order, which follows each group's first surviving row.
- Do: List a command the user cannot currently run as disabled with the reason in hint, rather than filtering it away. A palette that hides what you cannot do teaches you nothing about why.
- Do: Resize the list with listClassName rather than reaching past className into the palette's DOM. className is the dialog surface; listClassName is the Scroller that actually scrolls.
- Do: Use CommandMenuPanel when the palette lives in the page: a sidebar launcher, a settings search, a demo. It takes the same items, filter, query and children, and keeps the same keyboard model; it is a static card, so it does not trap focus or take it on mount, and Esc clears the query instead of closing anything.
- Don't: Hand-style a <button> to look like a search field, or put a SearchInput in the header that opens a dialog when focused. The first drifts from the field it imitates; the second is a text box you cannot type in. A header search that opens the palette is CommandMenuTrigger.
- Don't: Use CommandMenu as a replacement for every dropdown. Simple choices belong in Select, Menu, or Tabs.
- Don't: Hand-build a palette mock from a search glyph, a row of buttons and a highlight. That is CommandMenuPanel, and the hand-built one has no combobox, no filtering and no keyboard model.
- Don't: Dump every app route and action into one uncurated list. Keep the palette opinionated.
- Don't: Rebuild the combobox over Dialog to get consumer-owned ranking. query/onQueryChange and filter are that seam; the keyboard model, activedescendant wiring, and result-count live region come with them.

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| Trigger | no | CommandMenuTrigger — the search-field-shaped button in a header that opens the palette on click or on ⌘K / Ctrl+K. It sits outside CommandMenu; wire its onOpen to the palette's open state. |
| Dialog surface | yes | The modal shell that traps focus and positions the launcher. CommandMenuPanel replaces it with a static card in the page (border, card fill, no shadow). |
| Search input | yes | The combobox input that filters commands while focus remains in the field. |
| Groups | no | Labelled command sections that keep results scannable. |
| Items | yes | Keyboard-selectable command rows that run onSelect and close the palette. |

## Subcomponents

| Name | Type | Description |
| --- | --- | --- |
| CommandMenuTrigger | { onOpen?: () => void; placeholder?: string; shortcut?: string \| false; size?: "sm" \| "md"; disabled?: boolean } | The search field in a header that is really a button. Wears SearchInput's shell (border-input, card surface, leading magnifier, muted placeholder) on the control ladder, with a trailing Kbd: ⌘K on macOS, Ctrl K elsewhere. onOpen runs on click and on the shortcut, which it listens for page-wide (useCommandMenuShortcut). shortcut is the key (default "k"); false drops both the hint and the listener. size is sm in a header beside small buttons, md (default) beside Input and SearchInput. It sits outside CommandMenu, so the Dialog returns focus to it on close. |
| useCommandMenuShortcut | (onShortcut: (event: KeyboardEvent) => void, key?: string \| false) => void | The page-wide ⌘K / Ctrl+K listener CommandMenuTrigger installs, for a palette with no visible trigger. Ignored while focus is in a text field, textarea, select or contenteditable (Ctrl+K belongs to the field there) except the palette's own input, so the callback may toggle. It calls preventDefault() on a match and skips an event already prevented, so two listeners on one page fire once. key defaults to "k"; false turns it off. Removed on unmount. |
| CommandMenuPanel | { items?: CommandItem[]; query?: string; onQueryChange?: (query: string) => void; filter?: CommandFilter; listClassName?: string; placeholder?: string; emptyMessage?: string; title?: string; scope?: ReactNode; inputProps?: ComponentProps<'input'>; className?: string; children?: ReactNode } | The palette rendered in place: the same search header, filtered and grouped listbox, keyboard model and result-count live region, on a static card (border-border, bg-card, no shadow) instead of in a Dialog. Takes every CommandMenu prop except open, onOpenChange, finalFocus and description; className lands on the card, title names the listbox. Focus is not trapped and the input does not take focus on mount (inputProps.autoFocus opts in). Esc clears the query, and passes through once it is empty, so a Popover around the panel still closes. A chosen row runs its onSelect and the panel stays as it was. The page-wide shortcut does not fire from its input. |
| CommandMenuGroup | { label: string; children } | A labelled group of command rows. |
| CommandMenuItem | { onSelect?: () => void; icon?: string; detail?: ReactNode; hint?: ReactNode; disabled?: boolean; id?: string; children } | A selectable row. Self-filters by its text (unless the root was given a filter), runs onSelect, then closes the palette. detail is secondary text after the label; hint is the end-aligned trailing slot — a shortcut, a count, or a disabled row's reason. A disabled row stays listed, stays announced, and stays reachable by arrow key so its reason can be read, but is inert to Enter and to a click. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| scope | ReactNode | — | A scope chip in the header, between the search glyph and the input — "In: Backdrop". A scope belongs beside the field rather than in its value: put it in the value and the user deletes prose to widen their search, and your filter parses it back out. Pair with inputProps.onKeyDown handling Backspace on an empty query, or the only way out of a scope is the mouse. |
| inputProps | Omit<ComponentProps<'input'>, 'role' \| 'value' \| 'onChange' \| aria-*> | — | Extra props for the search input. `onKeyDown` runs BEFORE the palette's own handling and opts out of a key by calling preventDefault() — which is what makes a scope chip Backspace-dismissable. Running first is deliberate: Backspace happens not to be a key the palette claims today, so a plain passthrough would work until the palette grows a 'Backspace clears the query' affordance, at which point the consumer's behaviour breaks silently. The combobox wiring (role, aria relationships, controlled value) is not overridable; aria-label and className compose. |
| open | boolean | — | Controlled open state of the palette. |
| onOpenChange | (open: boolean) => void | — | Called on open/close (select, Esc, outside click). |
| items | CommandItem[] | — | Data-driven commands ({ group, label, onSelect, id?, icon?, detail?, hint?, disabled? }). Ignored when children are provided. id is optional identity: filter is handed these same objects, so it is how a caller that ranks over its own richer model maps the array back onto it — and it becomes the row's DOM id (namespaced to the palette) and React key, so two rows may share a label. |
| query | string | — | Controlled query. Leave undefined to let the palette own it; either way it resets on close (a controlled caller gets onQueryChange('')). |
| onQueryChange | (query: string) => void | — | Called on every query change. Required to control query, optional otherwise. |
| filter | ((items: CommandItem[], query: string) => CommandItem[]) \| null | case-insensitive substring match on label | Replaces or disables the built-in match. A function ranks and filters items itself and its order is kept verbatim; null renders items exactly as given. Either also stops declarative CommandMenuItem children self-filtering. The query arrives raw — trimming and case are policy, and this is the prop that hands policy over. |
| listClassName | string | — | Classes for the scrolling list. className lands on the dialog surface, so this is the seam for the list's own height cap — listClassName="max-h-[60vh]". The list is a Scroller, so the cap lands on the element that scrolls and the edge fades come free. |
| placeholder | string | "Type a command or search…" | Placeholder for the search input. |
| emptyMessage | string | "No results found." | Copy shown when the query matches nothing. |
| title | string | "Command menu" | Accessible name for the palette dialog (visually hidden). |
| description | string | "Search for a command and press Enter to run it." | Accessible description for the palette dialog (visually hidden). |
| finalFocus | RefObject<HTMLElement> \| ((closeType) => HTMLElement \| false) \| false | — | Where focus goes when the palette closes. The Dialog default returns it to the trigger — the CommandMenuTrigger, when there is one. A palette opened by the keystroke alone has none, so pass a resolver to restore whatever had focus, or false to restore nothing. |
| children | ReactNode | — | Declarative commands via CommandMenuGroup / CommandMenuItem. Takes precedence over items. |

## Tokens used

`card`, `card-foreground`, `border`, `foreground`, `muted-foreground`, `accent`, `accent-foreground`

## Accessibility

- CommandMenuTrigger is a real <button> named by its visible placeholder, with aria-haspopup=dialog and aria-keyshortcuts (Meta+K on macOS, Control+K elsewhere). Its Kbd hint is aria-hidden, so the shortcut is announced once rather than read as part of the name.
- The shortcut never fires from inside a text field, textarea, select or contenteditable (Ctrl+K is delete-to-end-of-line in macOS text views), except the palette's own input.
- CommandMenuPanel is the same combobox and listbox in the page, with no dialog: it does not trap or steal focus, and Esc clears a non-empty query (stopping there) instead of dismissing. With an empty query Esc is left alone for whatever contains the panel.
- Built on Base UI Dialog, so focus trap, scroll lock, and Esc/outside dismissal come for free; the dialog carries a visually-hidden title + description so it is announced.
- Follows the ARIA combobox pattern: the search input is role=combobox (aria-autocomplete=list) that owns the role=listbox popup via aria-controls.
- ArrowDown/ArrowUp/Home/End and PageUp/PageDown move a virtual aria-activedescendant highlight while focus stays in the input; Enter runs the highlighted command. Arrow keys wrap; page jumps clamp.
- Groups expose role=group labelled by their heading; items are role=option and never enter the tab order.
- A polite role=status live region announces the result count as the query narrows, so the size of the list is available without reading it.
- A disabled row carries aria-disabled and is skipped when seeding the highlight, but stays in the arrow-key walk so its reason can be reached and read.
- The component keeps ownership of aria-activedescendant even when a caller claims a key through inputProps.onKeyDown. Skipping a move is coherent (they took responsibility for that key), but nothing may leave the active id naming a row that is not painted as active — so the opt-out returns before any highlight change rather than after it.
- Exactly one row is ever painted as active: the pointer takes the highlight over (moving onto a row makes it the aria-activedescendant) rather than adding a hover fill of its own, so what looks highlighted is always what Enter will run.

## Related

- Components: Dialog, SearchInput, Kbd, Menu, Select, Combobox
- Patterns: DashboardPage, ListDetailPage

## Examples

### Data-driven

```tsx
import { CommandMenu } from "@sableui/react"

<CommandMenu open={open} onOpenChange={setOpen} items={[{ group: 'Navigation', label: 'Go to feed', icon: 'home', onSelect: () => {} }, { group: 'Actions', label: 'New post', onSelect: () => {} }]} />
```

### Declarative

```tsx
import { CommandMenu, CommandMenuGroup, CommandMenuItem } from "@sableui/react"

<CommandMenu open={open} onOpenChange={setOpen}><CommandMenuGroup label='Navigation'><CommandMenuItem icon='home' onSelect={() => {}}>Go to feed</CommandMenuItem></CommandMenuGroup></CommandMenu>
```

### Grouped launcher

```tsx
import { CommandMenu, CommandMenuGroup, CommandMenuItem } from "@sableui/react"

<CommandMenu open={open} onOpenChange={setOpen}><CommandMenuGroup label="Create"><CommandMenuItem icon="plus" onSelect={() => createPost()}>New post</CommandMenuItem><CommandMenuItem icon="sparkles" onSelect={() => createEdition()}>New edition</CommandMenuItem></CommandMenuGroup><CommandMenuGroup label="Navigation"><CommandMenuItem icon="home" onSelect={() => navigate("/")}>Home</CommandMenuItem><CommandMenuItem icon="gear" onSelect={() => navigate("/settings")}>Settings</CommandMenuItem></CommandMenuGroup></CommandMenu>
```

### Consumer-owned ranking

```tsx
import { CommandMenu } from "@sableui/react"

<CommandMenu open={open} onOpenChange={setOpen} query={query} onQueryChange={setQuery} filter={(items, q) => rank(items, q)} items={items} />
```

### Listed but unavailable

```tsx
import { CommandMenu } from "@sableui/react"

<CommandMenu open={open} onOpenChange={setOpen} items={[{ group: 'Layers', label: 'Align left', disabled: true, hint: 'Select another layer to align to', onSelect: () => {} }]} />
```

### Inline panel

```tsx
import { CommandMenuPanel, Kbd } from "@sableui/react"

<CommandMenuPanel className="w-80" items={[{ group: 'Create', label: 'New project', icon: 'plus', hint: <Kbd>N</Kbd>, onSelect: () => {} }, { group: 'Settings', label: 'Open settings', icon: 'gear', onSelect: () => {} }]} />
```

### Header search trigger

```tsx
import { CommandMenu, CommandMenuTrigger } from "@sableui/react"

<CommandMenuTrigger size="sm" placeholder="Search docs" onOpen={() => setOpen(true)} className="w-56" />
<CommandMenu open={open} onOpenChange={setOpen} items={items} />
```

### Keyboard shortcut with no visible trigger

```tsx
import { CommandMenu, useCommandMenuShortcut } from "@sableui/react"

useCommandMenuShortcut(() => setOpen((value) => !value))
<CommandMenu open={open} onOpenChange={setOpen} items={items} />
```

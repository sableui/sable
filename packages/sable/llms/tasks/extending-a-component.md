# Task: extending a Sable component

You need a component to do something it doesn't do out of the box: be a link,
carry an extra control, react to a key, suggest names as someone types. Before
restyling it from the outside or copying it into the app, go through the
extension points below, roughly in this order. Most needs are one of them, and
each keeps the component's states, density, focus and keyboard contract, which a
copy loses the day it is made.

The split to keep in mind: **behaviour** comes from Base UI and Sable, **look**
comes from variants and tokens, and **what is yours** (content, data, what an
action does) goes in through props and slots.

## 1. Compose an element: `render`

Every component that renders an element takes `render`, and keeps its props,
ref and state on the element you give it. This is how a Sable control becomes a
link, or any router's link:

```tsx
<Button render={<a href="/pricing" />}>See pricing</Button>
<Card render={<Link to="/projects/42" />}>…</Card>
<Button variant="ghost" render={<Link to="/inbox" />} iconStart={<Icon name="inbox" />}>Inbox</Button>
```

A link that looks like a button is `<Button render={<a … />}>`, never an `<a>`
wearing button classes (`sable-lint` flags that as `lookalike-control`).

## 2. Fill a slot

Slots take content you own. The component lays it out and keeps it aligned with
its own parts. Check `sable component <Name> --props` for the full list.

| Component | Slots |
|---|---|
| Button | `iconStart`, `iconEnd`, `badge` |
| ChatComposer | `leading`, `actions`, `attachments`, `footer` (a node, or a function of the send key in effect) |
| Message | `avatar`, `header`, `footer` |
| PageHeader | `actions`, `back` |
| MenuItem, MenuLinkItem, CaretMenuItem | `icon`, `description` |

`className` on a component is for layout (margins, width, alignment). It is not
a slot for a new look; see section 5.

## 3. Hold the state, reach the element

Controlled props (`value` + `onValueChange`, `open` + `onOpenChange`) let the
app own the state and change it from anywhere: clear a draft after a server
confirms the send, open a menu from a shortcut.

Refs reach the element itself. ChatComposer's `fieldRef` is the textarea, which
is enough to focus it, read the caret, or **listen to it**. That last one is an
extension point in its own right: a key handler on the field that handles a key
and calls `event.preventDefault()` owns that key, and ChatComposer does not also
act on it. That is how the suggestion list below takes Enter without the message
being sent.

## 4. Add behaviour on top: mentions and slash commands

The worked example. Mentions and slash commands are behaviour that sits on a
text field, not a new kind of field, so Sable ships the parts every app gets
wrong and leaves the rest to the app:

- **Sable owns:** noticing a trigger character at the caret (`@`, `/`, `#`), on
  a word boundary and after IME composition; placing the list at the caret;
  ↑/↓/Enter/Tab/Escape while focus stays in the field; the ARIA that lets a
  screen reader follow along.
- **The app owns:** the items (filter or fetch them, debounced, from the query),
  the loading and empty states, and what choosing one does.

```tsx
const trigger = useCaretTrigger({
	triggers: [{ char: "@", allowSpaces: true }, { char: "/", atStart: true }],
})
const q = trigger.match?.query.toLowerCase() ?? ""
const commands = trigger.match?.trigger.char === "/"

<ChatComposer fieldRef={trigger.fieldRef} onSend={send} />
<CaretMenu trigger={trigger} label={commands ? "Commands" : "People"} status={loading ? "Searching…" : undefined}>
	{commands
		? slashCommands.filter((c) => c.name.startsWith(q)).map((c) => (
				<CaretMenuItem key={c.name} description={c.hint} onSelect={() => { c.run(); trigger.replace("") }}>
					/{c.name}
				</CaretMenuItem>
			))
		: people.filter((p) => p.name.toLowerCase().includes(q)).map((p) => (
				<CaretMenuItem key={p.id} onSelect={() => trigger.replace(`@${p.name} `)}>{p.name}</CaretMenuItem>
			))}
</CaretMenu>
```

A mention is inserted as text with a trailing space; a command runs and
`replace("")` clears its `/query`. The same hook works on `Textarea` and
`Input` through `ref={trigger.fieldRef}`. `sable component CaretMenu` has the
props and the accessibility notes.

The pattern generalises. To add your own behaviour to a Sable field, attach to
it through its ref, read and write through the field's own input path (the hook's
`replace()` does, so controlled values and undo keep working), and take a key by
handling it first and calling `preventDefault()`.

### Mentions as chips are a different job

`useCaretTrigger` keeps the value a plain string, because that is what a
textarea holds. Showing a mention as a token *inside the field* needs a
rich-text (contenteditable) editor such as TipTap or Lexical, with its own value
model. Sable does not own an editor. Two ways to get chips today:

- Keep text mentions in the field and render them as chips where the message is
  shown: parse `@Name` against your people list when you render the Message.
- Use an editor in place of the composer's field and keep Sable's controls around
  it. A ChatComposer slot for a custom editor is a possible later addition; it
  doesn't exist yet, so don't write code that assumes it.

## 5. Change the look: tokens and presets, not overrides

A component's fill, edge, corners, ink and interaction states come from its
variants and the theme's tokens. To change how it looks:

- **Everywhere:** override tokens on `:root` (or any subtree) after Sable's CSS:
  radius, density, accent, type scale, motion. `sable token --list` lists them.
- **As a reusable direction:** a preset (`sable docs creating-a-preset`), compiled
  to scoped CSS with `sable preset --css <path>`.
- **One component, a look it lacks:** that is a missing variant. Report it (see
  section 8); don't paint it on with `className`. `component-restyle`,
  `destructive-item-ink` and `table-edge-padding` flag the common overrides,
  because a class that repaints a part fights the part's own hover, focus and
  disabled states.

Parts carry `data-slot` names (`chat-composer-attachments`,
`menu-item-description`, `button-group`). They are good test selectors and fine
for layout from a parent. They are not a way around the rule above, and a slot
name a component's docs don't mention may change between versions.

## 6. Add icons: `composeIconSets`

`<IconProvider set={composeIconSets(appExtras, reiconIconSet)}>` adds your own
glyphs alongside Reicon's (list the added names in `.sable/icons.json` so
`sable grade` accepts them). Components keep using semantic names.

## 7. Fix a defect: `sable patch`

When a component is wrong, not merely missing something, patch the installed
module and record why: `sable patch <Component> --reason … --repro …`. Doctor
re-checks it on every upgrade. `sable docs patching-a-component` has the steps.

## 8. App-owned, or a library gap?

It belongs in the app when it is about **your** product: domain data, copy,
business rules, which items a list offers, what an action does, the layout of a
signature surface.

It is a library gap when **another app would need the same thing** and none of
the sections above gets there without fighting the component: a missing
variant, slot, prop, or piece of behaviour. Then:

1. Show the search: `sable search "<need>"` and what came back.
2. Name the missing capability and the smallest API that would cover it.
3. Meanwhile, compose the nearest thing from Sable's parts in the app (not a
   copy of the component), and say in your summary that it is a stand-in for a
   reported gap.

In the Sable repository itself, close the gap in the package and then use it
(`sable docs adding-a-component`).

## Read next

- [patching-a-component.md](./patching-a-component.md): the patch workflow
- [creating-a-preset.md](./creating-a-preset.md): a reusable look
- [building-a-chat.md](./building-a-chat.md): the chat parts and who owns what

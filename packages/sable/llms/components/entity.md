# Entity

**Status:** stable

A list-row record: leading visual + title/subtitle column + trailing action, with truncating text. Presentational by default (no hover); `interactive` rows gain the hover highlight, focus ring, and keyboard activation, and `selected` marks the current one. Compact/comfortable density.

**Keywords:** entity, identity, object, avatar row

## Usage

Use Entity to show a compact identity block for a person, organization, file, project, or other object.

### Best practices

- Do: Use a clear title and one or two useful metadata lines.
- Do: Pair with Avatar or Badge (dot for a status) when identity needs state or type.
- Do: For a list, stack Entity rows directly in a column; each row owns its padding. For a list in a card, put the rows in CardList, which insets them to the card's own padding and divides them, so the rows line up with the card's header instead of being tuned by hand with px-* classes.
- Don't: Do not use Entity for long descriptions, editable fields, or full card content.
- Don't: Do not make the whole row a link when it also carries a trailing action. Nesting an interactive element inside a link is invalid, and the action becomes unreachable by keyboard.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| leading | ReactNode | — | Leading visual — typically an Avatar or an Icon. |
| title | ReactNode | — | Primary line (text-title-sm, truncated). Required. |
| subtitle | ReactNode | — | Secondary line (text-body-sm muted, truncated). |
| action | ReactNode | — | Trailing slot — typically a ghost icon Button or a StatusDot. |
| interactive | boolean | false | Make the whole row a target: the leading visual and text become a native <button> whose hit area stretches over the row (focus ring, Enter/Space). The action stays outside it. Requires onSelect. |
| onSelect | () => void | — | Activation handler for an interactive row (fired on click and Enter/Space). Required when interactive. |
| selected | boolean | false | Interactive rows only: the current row of a selectable list (the record open in a list–detail view). Sets aria-current="true" on the row's button and paints the selected fill, a step off the surface the row sits on, which holds on hover. |
| density | "compact" \| "comfortable" | "compact" | Row padding: compact (12px × 10px, the default) or comfortable (16px × 12px), on the spacing scale. The insets read --entity-px / --entity-py first, which CardList sets from the card's own padding so rows in a card line up with its header. |

## Variants

- **density**: compact, comfortable

## Tokens used

`accent`, `accent-foreground`, `foreground`, `muted-foreground`, `ring`

## Motion

- **arrival** · Root · _no motion_ — Rows arrive with the list they belong to. Entering one at a time is a stagger, and a stagger on a list someone opened to scan is a delay.
- **response** · Root · `motion-interactive` — Only the interactive row reacts: its hover fill, a step off the surface it sits on, eases in. A static row never fakes clickability, and an interactive one answers the pointer without flicker as it moves down a list.
- **transition** · Root · `motion-interactive` — `selected` eases the fill onto the current row of a list–detail view, so opening another record reads as the selection moving rather than two rows flashing.
- **activity** · Root · _no motion_ — A record row has nothing of its own to wait for. A row whose action is pending puts a loading Button in `action`.

## Accessibility

- Default rows are presentational layout; semantics come from the content you place in title/subtitle/action.
- interactive rows render a real <button> around the leading visual and text, with its ::after stretched over the whole row — native focus, a focus-visible ring, and Enter/Space. The action slot sits outside that button and above the overlay, so a Button there stays valid HTML and keeps its own clicks.
- Give any interactive action an accessible label (e.g. aria-label on a ghost icon Button).
- A selected row announces aria-current="true" on its button, so the current record is spoken, not only shown by its fill.

## Related

- Components: Avatar, Badge

## Examples

### Person row

```tsx
import { Avatar, Button, Entity, Icon } from "@sableui/react"

<Entity leading={<Avatar fallback="AM" />} title="Alex Morgan" subtitle="@alex" action={<Button variant="ghost" size="icon" aria-label="More"><Icon name="ellipsis" /></Button>} />
```

### Interactive (selectable) row

```tsx
import { Avatar, Entity } from "@sableui/react"

<Entity interactive onSelect={() => selectUser(user)} leading={<Avatar fallback="AM" />} title="Alex Morgan" subtitle="@alex" />
```

# Entity

**Status:** stable

A list-row record: leading visual + title/subtitle column + trailing action, with truncating text. Presentational by default (no hover); `interactive` rows gain the hover highlight, focus ring, and keyboard activation. Compact/comfortable density.

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
| density | "compact" \| "comfortable" | "compact" | Row padding: compact (12px × 10px, the default) or comfortable (16px × 12px), on the spacing scale. The insets read --entity-px / --entity-py first, which CardList sets from the card's own padding so rows in a card line up with its header. |

## Variants

- **density**: compact, comfortable

## Tokens used

`muted`, `foreground`, `muted-foreground`, `ring`

## Accessibility

- Default rows are presentational layout; semantics come from the content you place in title/subtitle/action.
- interactive rows render a real <button> around the leading visual and text, with its ::after stretched over the whole row — native focus, a focus-visible ring, and Enter/Space. The action slot sits outside that button and above the overlay, so a Button there stays valid HTML and keeps its own clicks.
- Give any interactive action an accessible label (e.g. aria-label on a ghost icon Button).

## Related

- Components: Avatar, Badge, Description

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

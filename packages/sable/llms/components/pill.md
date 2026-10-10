# Pill

**Status:** stable

A chip someone clicks: a filter, a tag choice, an option in a row. Always a button with aria-pressed. appearance="solid" (filters; selected lifts onto the primary surface) or "outline" (quiet chips that annotate content, like reactions); size md or sm. A static label is a Badge.

**Keywords:** pill, chip, filter, tag, toggle chip, category

## Usage

Use Pill for a row of filters or choices a person clicks to narrow or toggle what they see. For a label that only describes something, use Badge.

### Best practices

- Do: Use short text that names the filter or choice.
- Do: Reflect the current choice with selected, so the active filter reads at a glance.
- Don't: Do not use Pill as a static label. A pressable-looking chip that does nothing is the most common cause of dead clicks in a filter row — that is a Badge.
- Don't: Do not use Pill for primary actions or important system status.
- Don't: Do not restyle a Pill with border or background classes to get a quieter chip. That is appearance="outline" (and size="sm" for a small one); an override is a look that exists nowhere else in the system.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| selected | boolean | false | Marks the pill as chosen. Solid lifts onto the primary surface; outline takes a primary tint and soft primary edge. Sets aria-pressed. |
| appearance | "solid" \| "outline" | "solid" | solid for a filter row; outline for quiet chips that annotate other content (a reaction under a message, a tag on a card), where a filled chip would compete with what it annotates. |
| size | "md" \| "sm" | "md" | sm sits on the density ladder's xs control height, for chips under or inside other content. |
| icon | ReactNode | — | Optional leading glyph (e.g. <Icon name="lock" />), rendered before the children with the base gap. |

## Variants

- **appearance**: solid, outline
- **size**: md, sm
- **selected**: true, false

## Tokens used

`secondary`, `secondary-foreground`, `accent`, `accent-foreground`, `primary`, `primary-foreground`, `card`, `border`, `muted-foreground`, `foreground`

## Accessibility

- Renders a native <button type="button"> for focus and keyboard activation.
- Selected state is exposed via aria-pressed.

## Related

- Components: Badge, ToggleGroup

## Examples

### Filter row

```tsx
import { Pill, Row } from "@sableui/react"

<Row gap={1}><Pill selected onClick={() => {}}>All</Pill><Pill onClick={() => {}}>Editions</Pill><Pill onClick={() => {}}>Collectibles</Pill></Row>
```

### Outline, small (reactions)

```tsx
import { Pill, Row } from "@sableui/react"

<Row gap={1}><Pill appearance="outline" size="sm" selected onClick={() => {}}>🎉 3</Pill><Pill appearance="outline" size="sm" onClick={() => {}}>👀</Pill></Row>
```

### With icon

```tsx
import { Icon, Pill } from "@sableui/react"

<Pill icon={<Icon name="lock" />} onClick={() => {}}>Locked</Pill>
```

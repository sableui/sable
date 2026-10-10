# Separator

**Status:** stable

A hairline divider. Horizontal full-width rule or vertical 1px column, tinted with the border token. Optional centered label (horizontal) for a captioned section divider.

**Keywords:** separator, divider, section break, rule

## Usage

Use Separator to divide related groups where spacing alone does not provide enough structure.

### Best practices

- Do: Use it sparingly between sections, menu groups, or dense rows.
- Do: Choose orientation based on the layout direction it separates.
- Don't: Do not use Separator as decoration when hierarchy, spacing, or headings would explain the layout better.
- Don't: Do not use it where space would do. A page whose every section is divided by a rule reads as a form; the rule should mark a real change of subject.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| orientation | "horizontal" \| "vertical" | "horizontal" | Axis of the rule. Vertical stretches to its flex parent's height. |
| label | ReactNode | — | When set (horizontal only), centers a muted caption between two hairline rules. |
| render | ReactElement \| (props, state) => ReactElement | — | Compose with another element/component through the Base UI render prop. Ignored on the labeled variant. |

## Variants

- **orientation**: horizontal, vertical

## Tokens used

`border`, `muted-foreground`

## Accessibility

- Base UI sets role=separator and aria-orientation for assistive tech.
- The labeled variant renders a div with explicit role=separator + aria-orientation (the caption is the visible context).
- Purely decorative dividers can carry aria-hidden when adjacent content already conveys the grouping.

## Related

- Components: Menu, ContextMenu, Card

## Examples

### Horizontal

```tsx
import { Separator } from "@sableui/react"

<Separator />
```

### Labeled section divider

```tsx
import { Separator } from "@sableui/react"

<Separator label="Other holdings" />
```

### Vertical (inside a flex row)

```tsx
import { Row, Separator } from "@sableui/react"

<Row gap={3} className="h-6 items-center"><span>Edit</span><Separator orientation="vertical" /><span>Delete</span></Row>
```

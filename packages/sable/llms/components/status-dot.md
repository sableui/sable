# StatusDot

**Status:** stable

A small colored status dot. Tone variants encode state via semantic tone tokens; sizes scale the diameter. Decorative (aria-hidden) — pair with text. Optional pulse adds a live ping ring.

**Keywords:** status, dot, presence, health, state, online, live, indicator

## Usage

Use StatusDot as a compact visual state cue next to text, avatars, rows, or labels. It is decorative by design, so pair it with visible text or use `<Badge appearance="plain" dot>` when the label and dot should travel together — that is the labelled status line, not a hand-built row.

### Best practices

- Do: Place StatusDot beside a readable state label, person name, or row title.
- Do: Use pulse only for live or in-progress states that are actively changing.
- Don't: Use the dot as the only status indicator; it is aria-hidden and color alone is not enough.
- Don't: Mix many dot sizes in the same list. Keep row indicators visually consistent.

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| Dot | yes | The small tone-colored circle. It is decorative and hidden from assistive tech. |
| Pulse ring | no | Optional motion ring for in-progress or live states. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| tone | "neutral" \| "standard" \| "success" \| "warning" \| "info" \| "edition" \| "collectible" \| "destructive" | "neutral" | Semantic color of the dot. |
| size | "sm" \| "md" \| "lg" | "md" | Dot diameter. |
| pulse | boolean | false | Wrap the dot in an animated ping ring to signal a live state. |

## Variants

- **tone**: neutral, standard, success, warning, info, edition, collectible, destructive
- **size**: sm, md, lg

## Tokens used

`muted-foreground`, `tone-standard`, `success`, `tone-warning`, `tone-info`, `tone-edition`, `tone-collectible`, `destructive`

## Accessibility

- Rendered aria-hidden — purely decorative. Convey status in adjacent text, not color alone.
- A dot conveys state through colour alone, which fails for colour-blind users and announces as nothing. It must always sit beside text that states the same thing, or carry its own accessible name.

## Related

- Components: Badge, Avatar, InlineStatus
- Patterns: DashboardPage, ListDetailPage

## Examples

### Tones

```tsx
import { Row, StatusDot } from "@sableui/react"

<Row gap={2}><StatusDot tone="standard" /><StatusDot tone="info" /><StatusDot tone="warning" /><StatusDot tone="destructive" /></Row>
```

### With label — use Badge

```tsx
import { Badge } from "@sableui/react"

<Badge appearance="plain" tone="success" dot pulse>Live</Badge>
```

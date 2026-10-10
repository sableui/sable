# Badge

**Status:** stable

Compact static label, set on two axes: appearance (soft, outline, solid, overlay on media, plain text) and tone (neutral or a semantic tone). An optional leading icon, or a status dot (with pulse) for state.

**Keywords:** badge, tag, label, status, metadata, chip, pill, tone, category

## Usage

Use Badge for any short static label: metadata, categories, tone-coded labels, a label on artwork (appearance="overlay"), or a status line (appearance="plain" with dot). Use Pill for a chip someone clicks, NotificationBadge for an unread count on an icon, and Banner or Toast for messages that need attention.

### Best practices

- Do: Keep badge text short: one to three words or a compact count.
- Do: Use tone variants when the badge carries meaning, such as success, warning, destructive, edition, or collectible.
- Do: Pair icons with text; the icon reinforces meaning but should not be the only cue.
- Do: Choose appearance and tone separately: appearance is how loud it is (soft by default, solid for emphasis, overlay on images, plain for a status line); tone is what it means.
- Don't: Use a Badge as a button. If it triggers an action, use Button, Toggle, or a menu item.
- Don't: Stack many loud tone badges in one row; too many semantic colors compete with the actual content.

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| Container | yes | The compact pill surface carrying the tone or neutral treatment. |
| Label | yes | Short visible text that names the category, state, role, or metadata value. |
| Icon | no | Optional leading Icon used to reinforce the label. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| appearance | "soft" \| "outline" \| "solid" \| "overlay" \| "plain" | "soft" | How it is drawn. soft: a tinted fill (neutral is the secondary surface). outline: a hairline. solid: the tone at full strength (neutral is the inverted chip). overlay: legible on images — a dark scrim, or the solid tone. plain: no fill or padding, a status line. |
| tone | "neutral" \| "standard" \| "collectible" \| "edition" \| "info" \| "success" \| "warning" \| "destructive" | "neutral" | What it means. Every appearance takes every tone. |
| size | "sm" \| "md" | "md" | "sm" uses tighter padding + text-label-sm; "md" is the default look. |
| icon | ReactNode | — | Optional leading glyph (e.g. <Icon name="lock" />), rendered before the children with the base gap. Ignored when dot is set. |
| dot | boolean | false | A leading status dot in the badge's tone. With appearance="plain" it is a status line (● Ready). |
| pulse | boolean | false | Pulse the dot, for a state in progress. Needs dot. |

## Variants

- **appearance**: soft, outline, solid, overlay, plain
- **tone**: neutral, standard, collectible, edition, info, success, warning, destructive
- **size**: sm, md

## Tokens used

`secondary`, `secondary-foreground`, `border`, `foreground`, `background`, `muted`, `muted-foreground`, `tone-standard`, `tone-collectible`, `tone-edition`, `tone-info`, `success`, `tone-warning`, `destructive`, `overlay`, `overlay-foreground`, `tone-standard-foreground`, `tone-collectible-foreground`, `tone-edition-foreground`, `tone-info-foreground`, `success-foreground`, `tone-warning-foreground`, `destructive-foreground`

## Accessibility

- Badges are static text by default; do not rely on color alone for meaning.
- Use clear label text for semantic tones so assistive tech receives the same status information sighted users see.

## Related

- Components: Pill, StatusDot, NotificationBadge, Banner, Toast
- Patterns: DashboardPage, ListDetailPage

## Examples

### Tones

```tsx
import { Badge, Row } from "@sableui/react"

<Row gap={1}><Badge tone="edition">Edition</Badge><Badge tone="collectible">Collectible</Badge><Badge tone="standard">Standard</Badge></Row>
```

### Solid

```tsx
import { Badge } from "@sableui/react"

<Badge appearance="solid" size="sm">Admin</Badge>
```

### Success

```tsx
import { Badge } from "@sableui/react"

<Badge tone="success">Resolved</Badge>
```

### With icon

```tsx
import { Badge, Icon } from "@sableui/react"

<Badge size="sm" icon={<Icon name="lock" />}>Locked</Badge>
```

### Small

```tsx
import { Badge } from "@sableui/react"

<Badge size="sm" tone="info">New</Badge>
```

### Metadata row

```tsx
import { Badge, Icon, Row } from "@sableui/react"

<Row gap={1}><Badge>12 editions</Badge><Badge appearance="outline">Open edition</Badge><Badge tone="info" icon={<Icon name="info" />}>Curated</Badge></Row>
```

### Semantic state

```tsx
import { Badge, Row } from "@sableui/react"

<Row gap={1}><Badge tone="success">Synced</Badge><Badge tone="warning">Review</Badge><Badge tone="destructive">Blocked</Badge></Row>
```

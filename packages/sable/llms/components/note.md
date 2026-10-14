# Note

**Status:** stable

Callout / admonition box. Its tone follows the shared status-tone vocabulary (neutral/info/success/warning/destructive), pairing a soft tone fill with a matching leading icon. Optional title.

**Keywords:** note, callout, admonition, warning, caveat, hint, context

## Usage

Use Note for helpful supporting information that should sit near the relevant content — including a caveat or warning attached to a form, a dialog, or a section. It is the in-context callout; Banner is the page-level strip.

### Best practices

- Do: Use it for tips, caveats, or secondary context that improves understanding.
- Do: Reach for Note rather than Banner when the message qualifies something on the page — a warning inside a dialog, a caveat above a submit button. Banner is a full-width announcement strip for page- or app-level state; inside a form it reads as a slab, and its soft fill carries no border or tone-colored icon, so the severity stops being visible.
- Do: Keep tone calm and concise so the note does not compete with primary content.
- Do: When the reader can resolve the state, pass `action` rather than putting a Button in children. The prop is data — label plus handler — so the callout owns the placement and weight; a Button dropped into children inherits neither, floats in the box's padding, and (in `secondary`) punches a near-background hole in the tone fill.
- Don't: Do not use Note for state the whole page or app is in (an outage, an offline session, a blocked account) — that is Banner — or for a message tied to one field, which is the field's own error text.
- Don't: Do not give a Note two actions. One remedy reads as the sentence's next move; two make it a decision point, which is a Dialog's job.
- Don't: Do not stack several in a row. Three notes together are a wall of asides; if everything is called out, nothing is.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| action | { label: string; onClick?: () => void; href?: string } | — | A single remedy, rendered below the body and aligned to the text column. Deliberately data, not a slot: Note owns the placement, weight, ink and motion, so the action cannot be styled into a button that outweighs the sentence explaining it. Use onClick for an in-place action (renders a button, no glyph) or href for a link (renders an anchor with a trailing chevron) — the chevron means navigate, so it appears only when the action genuinely goes somewhere. |
| tone | "neutral" \| "info" \| "success" \| "warning" \| "destructive" | "info" | Severity tone — drives the border, fill, and leading icon color/name. The shared status-tone vocabulary (STATUS_TONES). |
| title | string | — | Optional bold lead-in rendered above the body (text-title-sm). |
| icon | string \| ReactNode \| null | — | Override the variant glyph: a string swaps the icon name (keeping the tone color), a ReactNode replaces it, null removes it; omit for the variant default. |

## Variants

- **tone**: neutral, info, success, warning, destructive

## Tokens used

`foreground`, `border`, `muted`, `muted-foreground`, `tone-info`, `tone-warning`, `success`, `destructive`

## Accessibility

- Rendered with role="note" so assistive tech can announce it as an aside.
- Color is never the sole signal — the leading icon and optional title reinforce severity.

## Related

- Components: Banner, InlineStatus, EmptyState

## Examples

### Info

```tsx
import { Note } from "@sableui/react"

<Note tone="info">Reports refresh every hour.</Note>
```

### With title

```tsx
import { Note } from "@sableui/react"

<Note tone="warning" title="Low balance">Add credits before your next export.</Note>
```

### Warning with a remedy, inside a dialog

```tsx
import { Note } from "@sableui/react"

<Note tone="warning" action={{ label: "Unload chat model", onClick: unloadChatModel }}>gemma-4 is holding VRAM — generating now may be slow or fail.</Note>
```

### Custom icon

```tsx
import { Note } from "@sableui/react"

<Note tone="neutral" icon="lock">Pricing cannot be changed after an order is placed.</Note>
```

# InlineStatus

**Status:** stable

A borderless single-line status message — a leading semantic icon + one line of text over the canonical tone scale (neutral/info/success/warning/destructive). The non-boxed sibling of Note for inline affirmations, errors, and progress; pass a custom icon (e.g. a Spinner) for a pending row.

**Keywords:** inline status, state, message, availability

## Usage

Use InlineStatus for short state messages placed near the thing they describe.

### Best practices

- Do: Use it beside inputs, rows, actions, or settings that need local status.
- Do: Keep the message brief and pair color with text.
- Don't: Do not use InlineStatus for global announcements or page-level alerts.
- Don't: Do not use tone as the only signal. Colour alone fails for colour-blind users — the leading icon is what carries the meaning, so never hide it.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| tone | "neutral" \| "info" \| "success" \| "warning" \| "destructive" | "neutral" | Severity tone — drives the leading icon (name + color) and the text color. The shared status-tone vocabulary (STATUS_TONES). |
| size | "sm" \| "md" | "sm" | Text size: sm (text-body-sm) or md (text-body-md). sm is the default for inline placement under a control; md matches surrounding body copy. |
| icon | ReactNode | — | Override the leading glyph (e.g. a <Spinner />); otherwise the tone selects it. |

## Variants

- **tone**: neutral, info, success, warning, destructive
- **size**: sm, md

## Tokens used

`tone-info`, `success`, `tone-warning`, `destructive`, `muted-foreground`

## Accessibility

- Color reinforces, never replaces, meaning — the leading icon and the message text carry the status.
- For a live status (e.g. a form submit result), render it in an aria-live region or pair it with the field's error wiring so the change is announced.

## Related

- Components: StatusDot, Badge, Banner, Note

## Examples

### Tones

```tsx
import { InlineStatus, Stack } from "@sableui/react"

<Stack gap={1}><InlineStatus tone="success">Top-up confirmed.</InlineStatus><InlineStatus tone="destructive">Insufficient balance.</InlineStatus></Stack>
```

### Pending (custom icon)

```tsx
import { InlineStatus, Spinner } from "@sableui/react"

<InlineStatus tone="neutral" icon={<Spinner size="sm" />}>Preparing transaction…</InlineStatus>
```

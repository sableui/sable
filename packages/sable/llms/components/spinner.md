# Spinner

**Status:** stable

Pure SVG activity indicator. No Base UI, no icon dependency — a role=status ring (faint track + rounded-cap arc) that inherits the current text color. Size with the size prop (sm / md / lg), color with text-*.

**Keywords:** spinner, loading, pending, indeterminate

## Usage

Use Spinner for short indeterminate waits where the user cannot know exact progress.

### Best practices

- Do: Use it in compact panels or places where layout is already stable. In a button, use Button's loading prop rather than placing a Spinner by hand — it disables the button, sets aria-busy and sizes the spinner to the button's icon.
- Do: Pair it with accessible loading text when the surrounding label is not enough.
- Don't: Do not use Spinner as the only content for long waits or full page loading. → use **Skeleton**, **PageLoader**
- Don't: Do not use it without an accessible name or a nearby status message. A spinning icon is invisible to a screen reader, so the wait is announced as nothing at all.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| label | string | "Loading" | Accessible label announced by screen readers while visible (sets aria-label on the role=status element). |
| appearance | "ring" \| "dots" | "ring" | ring is the default indicator; dots are three bouncing dots, softer, for chat and inline text. |
| size | "sm" \| "md" \| "lg" | "md" | One scale for both appearances: ring 14 / 16 / 24px, dots 4 / 6 / 8px. |
| className | string | — | Color (text-*); the ring's strokes use currentColor, so it follows the text color. Size with the size prop — a size-* class still overrides the ring for an off-scale context (Button sizes its own spinner this way), but is not the way to pick a size. |

## Variants

- **appearance**: ring, dots
- **size**: sm, md, lg

## Tokens used

`foreground`, `muted-foreground`, `primary-foreground`

## Motion

- **arrival** · Root · _no motion_ — A spinner already signals a wait. Fading it in delays the signal for exactly as long as the user most needs it.
- **response** · Root · _no motion_ — It is a status indicator, not a control.
- **transition** · Root · _no motion_ — One state. Whatever replaces it on completion owns that change.
- **activity** · Root · `motion-spin` — The rotation is the whole component — it is the only thing distinguishing 'working' from 'frozen'. motion-spin rather than Tailwind's animate-spin because the built-in ignores --motion-scale, so the reduced-motion policy cannot freeze it.

## Accessibility

- Wrapped in role=status, a polite live region, with an aria-label (default 'Loading').
- Color comes from currentColor; pair with a text-* token for adequate contrast.
- Spins with the motion-spin utility, which follows --motion-scale, so it slows and stops with the motion setting and reduced-motion.

## Related

- Components: Skeleton, Progress

## Examples

### Dots

```tsx
import { Spinner } from "@sableui/react"

<Spinner appearance="dots" label="Assistant is typing" className="text-muted-foreground" />
```

### Default

```tsx
import { Spinner } from "@sableui/react"

<Spinner />
```

### Sized + tinted

```tsx
import { Spinner } from "@sableui/react"

<Spinner size="lg" className="text-muted-foreground" />
```

### Inside a button (Button owns it — use loading)

```tsx
import { Button } from "@sableui/react"

<Button loading>Saving</Button>
```

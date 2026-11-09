# TextSwap

**Status:** stable

A short label changing in place, with blur, slide or fade replacement. One accessible current string; static first paint, immediate updates under subtle/off motion.

**Keywords:** text replacement, text swap, changing label, status text, blur, crossfade

## Usage

Use for short supplied labels that change after an action, such as a schedule's day or an invoice's current state. It presents state; it never invents progress or cycles messages on a timer.

### Best practices

- Do: Keep the label beside the control or object that changed it, so the replacement explains cause and effect.
- Do: Put aria-live=polite on the root only when the update would otherwise be missed. Visual copies are hidden from accessibility APIs.
- Don't: Do not replace form fields or focused controls with it: it accepts text, not interactive children.
- Don't: Do not use it for numeric quantities or streamed paragraphs. NumberTicker preserves digit places; StreamingText preserves appended prose. → use **NumberTicker**, **StreamingText**

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| text | string | — | The complete current label. |
| effect | "blur" \| "slide" \| "fade" | "blur" | The visual replacement; all share the same accessible string. |
| motion | "full" \| "subtle" \| "off" | "full" | Only turns motion down. Subtle and off replace the label immediately. |

## Motion

- **arrival** · Root · _no motion_ — The initial label is already current and appears at rest.
- **transition** · Current label · `motion-swap-in` — The new label resolves into place; rapid replacements retain only the latest pair.
- **transition** · Previous label · `motion-swap-out` — The previous visual label leaves without duplicating the accessible announcement.

## Accessibility

- Exactly one current string is exposed; visual copies are aria-hidden.
- Motion policy never delays the new text or its announcement. There is no animation on initial mount.

## Related

- Components: NumberTicker, StreamingText, InlineStatus

## Examples

### Action result

```tsx
import { Button, TextSwap } from "@sableui/react"

const [saved, setSaved] = useState(false)
<div className="flex items-center gap-3"><Button onClick={() => setSaved(!saved)}>Toggle saved</Button><TextSwap text={saved ? "Saved" : "Unsaved changes"} aria-live="polite" /></div>
```

### Quiet replacement

```tsx
import { TextSwap } from "@sableui/react"

<TextSwap text="Monday" effect="fade" motion="subtle" />
```

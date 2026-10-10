# Popover

**Status:** stable

Click-triggered overlay over Base UI Popover (focus management, collision-aware positioning, Esc/outside dismissal). Holds interactive content; 18rem-wide surface.

**Keywords:** popover, floating panel, anchored, disclosure

## Usage

Use Popover for anchored secondary content that needs more room than a tooltip but less commitment than a dialog.

### Best practices

- Do: Use it for small pickers, summaries, or contextual controls tied to a trigger.
- Do: Keep focus behavior and dismissal predictable.
- Don't: Do not use Popover for blocking confirmations, long forms, or critical information.
- Don't: Do not put a form that can fail validation inside one. A popover dismisses on outside click, which discards what the user typed with no warning — that is a Dialog.

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| PopoverTrigger | yes | The element that anchors and opens the popover. |
| PopoverContent | yes | The floating content surface. |
| PopoverTitle | no | An optional heading for the content. |
| PopoverDescription | no | Optional supporting copy. |
| PopoverClose | no | An explicit close control when helpful. |
| PopoverArrow | no | An optional arrow pointing to the trigger. |

## Subcomponents

| Name | Type | Description |
| --- | --- | --- |
| PopoverTrigger | Base UI Trigger props + render | The anchor element. Use render={<Button/>} to compose with another component. |
| PopoverContent | Base UI Popup props + side: "top" \| "bottom" \| "left" \| "right" \| "inline-*" + align: "start" \| "center" \| "end" + sideOffset: number + anchor: Element \| Ref \| (() => Element) \| VirtualElement + className | Portals + positions + paints the popup. side picks which side of the trigger to render against (auto-flips on collision; defaults to "bottom"); align sets alignment along that side (defaults to "center"); sideOffset is the gap in px (defaults to 8). anchor positions against a different element/ref/getter than the trigger — Base UI 1.5 has no separate Anchor part, so pass it here to decouple the open-location from the trigger. |
| PopoverTitle | Base UI Title props + className | Accessible heading; Base UI wires aria-labelledby to the popup. |
| PopoverDescription | Base UI Description props + className | Supplementary copy; Base UI wires aria-describedby to the popup. |
| PopoverClose | Base UI Close props + render | A button that closes the popover. Use render={<Button/>} to compose. |
| PopoverArrow | Base UI Arrow props + className | Optional pointer connecting the popup to its trigger. Place inside PopoverContent. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| Popover (Root) | Base UI Popover.Root props (open, defaultOpen, onOpenChange, modal) | — | Groups the trigger and content. Uncontrolled by default. |

## Tokens used

`popover`, `popover-foreground`, `border-floating`, `muted-foreground`

## Accessibility

- Base UI manages focus into and out of the popup, traps focus when modal, and restores focus to the trigger on close.
- Opens on trigger press (click/Enter/Space); dismisses on Esc and outside press.
- PopoverTitle/PopoverDescription wire aria-labelledby/aria-describedby on the popup.
- Enters and exits on the motion-pop recipe (Base UI starting/ending-style attributes), so it follows the motion policy.

## Related

- Components: Tooltip, ContextCard, Dialog

## Examples

### Basic

```tsx
import { Button, Popover, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger } from "@sableui/react"

<Popover><PopoverTrigger render={<Button variant="secondary">Details</Button>} /><PopoverContent><PopoverTitle>Edition details</PopoverTitle><PopoverDescription>A limited run of 100, stored permanently on Arweave.</PopoverDescription></PopoverContent></Popover>
```

### With close

```tsx
import { Button, Popover, PopoverClose, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger } from "@sableui/react"

<Popover><PopoverTrigger render={<Button variant="secondary">Open</Button>} /><PopoverContent><PopoverTitle>Heads up</PopoverTitle><PopoverDescription>Collecting mints a compressed NFT to your wallet.</PopoverDescription><PopoverClose render={<Button size="sm">Got it</Button>} /></PopoverContent></Popover>
```

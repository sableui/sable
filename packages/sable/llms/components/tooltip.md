# Tooltip

**Status:** stable

Hover/focus label over Base UI Tooltip (collision-aware positioning, ARIA wiring, delay grouping via TooltipProvider). Compact popover surface.

**Keywords:** tooltip, hint, hover, assistive

## Usage

Use Tooltip for brief nonessential hints tied to a specific control or piece of text.

### Best practices

- Do: Use it to name icon-only controls or clarify compact UI when the label cannot be visible.
- Do: Keep tooltip content short and noninteractive.
- Don't: Do not put critical instructions, errors, or interactive content inside Tooltip. → use **Popover**, **InlineStatus**
- Don't: Do not let a tooltip serve as an icon button's accessible name. A tooltip is not a name — without its own aria-label the button announces as "button", and the tooltip never opens for a screen reader at all.

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| TooltipProvider | no | Optional provider for shared tooltip timing. |
| TooltipTrigger | yes | The element that owns the hint. |
| TooltipContent | yes | The short hint content. |
| TooltipArrow | no | An optional pointer toward the trigger. |
| SimpleTooltip | no | A convenience wrapper for common tooltip usage. |

## Subcomponents

| Name | Type | Description |
| --- | --- | --- |
| TooltipProvider | Base UI Tooltip.Provider props (delay, closeDelay, timeout) | Wraps an app or group of Tooltips to share open/close delays. Once one tooltip is open, adjacent tooltips open instantly. |
| TooltipTrigger | Base UI Trigger props + render | The anchor element. Use render={<Button/>} to compose with another component. |
| TooltipContent | Base UI Popup props + side \| align \| sideOffset + className | Portals + positions + paints the popup. side ("top" \| "bottom" \| "left" \| "right" \| "inline-*") picks which side of the trigger to render against, defaults to "top", and auto-flips on collision; align ("start" \| "center" \| "end") defaults to "center"; sideOffset (gap between trigger and popup, in pixels) defaults to 6. |
| TooltipArrow | Base UI Arrow props + className | Optional pointer connecting the popup to its trigger — a popover-coloured square turned 45° that carries the border on its outward edges. Place inside TooltipContent. |
| SimpleTooltip | Base UI Tooltip.Root props + content: ReactNode + children: ReactElement + side \| align \| sideOffset | Shorthand wrapping Root + Trigger + Content for the common case. The single child becomes the trigger (via Base UI render); content sets the body; side / align / sideOffset forward to the content with the same defaults. Composition parts remain for advanced use. Inside a TooltipGroup it becomes a trigger of the group's shared tooltip instead. |
| TooltipGroup | { children: ReactNode; motion?: "full" \| "subtle" \| "off" } | One tooltip shared by every SimpleTooltip inside it — for a toolbar or a row of icon buttons. Moving the pointer along the row glides the tooltip to the next trigger and swaps its label (old fades out, new fades in, each sliding toward the direction of travel), instead of closing one tooltip and opening another a few pixels away. Renders no element. Each SimpleTooltip keeps its own content / side / align / sideOffset and `disabled`; root props such as open / onOpenChange belong to the shared tooltip and are ignored inside a group. `motion` turns it down: `subtle` jumps between triggers and only cross-fades the label. The composable Tooltip parts are unaffected. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| side | "top" \| "right" \| "bottom" \| "left" | "top" | On TooltipContent: which side of the trigger to render against. Flips automatically when there is no room. |
| Tooltip (Root) | Base UI Tooltip.Root props (open, defaultOpen, onOpenChange, disabled) | — | Groups the trigger and content. Uncontrolled by default. |

## Tokens used

`popover`, `popover-foreground`, `border-floating`

## Motion

- **arrival** · Content · `motion-pop` — The transform-origin follows the anchor, so the tooltip appears to grow out of the element it describes. That is what binds it to its trigger — a bubble that materialises at full size near two possible triggers belongs to neither.
- **response** · Content · _no motion_ — The tooltip is not a hover target; pointing at it is how you dismiss it. Styling it for the pointer would suggest otherwise.
- **transition** · Content · `motion-pop` — Same recipe, exit direction — it collapses back toward the anchor. Content that fades from a fixed size on close reads as a second, unrelated element disappearing.
- **transition** · TooltipGroup · _custom (outside the recipe layer)_ — Moving between triggers in a group, the one tooltip glides to the next trigger, resizes to its label and cross-fades the text with a short slide toward the direction of travel. Separate tooltips would close here and open there, two surfaces blinking side by side; the glide says it is the same hint following the pointer. Base UI's handle + Viewport supply the shared popup and the previous/current content; the timing is the expressive glide (slow, emphasized), so `subtle` keeps only the cross-fade.
- **activity** · Content · _no motion_ — Tooltip copy is resident before the tooltip opens. Anything that has to be fetched is a Popover with its own loading state.

## Accessibility

- Base UI wires aria-describedby from trigger to popup and manages hover + focus open.
- Opens on keyboard focus, not just hover; dismisses on Esc and blur.
- Animate via data-[starting-style]/data-[ending-style] opacity attributes.
- Tooltip text is supplementary — never put essential-only actions inside a tooltip.

## Related

- Components: Popover, ContextCard

## Examples

### Basic

```tsx
import { Button, Icon, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@sableui/react"

<TooltipProvider><Tooltip><TooltipTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Info"><Icon name="info" /></Button>} /><TooltipContent>Saved to your workspace.</TooltipContent></Tooltip></TooltipProvider>
```

### Sides

```tsx
import { Button, Tooltip, TooltipContent, TooltipTrigger } from "@sableui/react"

<Tooltip><TooltipTrigger render={<Button variant="secondary">Right</Button>} /><TooltipContent side="right">Opens to the right</TooltipContent></Tooltip>
```

### Shorthand (SimpleTooltip)

```tsx
import { Button, Icon, SimpleTooltip } from "@sableui/react"

<SimpleTooltip content="Saved to your workspace."><Button variant="ghost" size="icon-sm" aria-label="Info"><Icon name="info" /></Button></SimpleTooltip>
```

### One tooltip gliding along a toolbar (TooltipGroup)

```tsx
import { Icon, SimpleTooltip, Toolbar, ToolbarButton, TooltipGroup } from "@sableui/react"

<TooltipGroup><Toolbar aria-label="Formatting"><SimpleTooltip content="Bold"><ToolbarButton size="icon-sm" aria-label="Bold"><Icon name="bold" /></ToolbarButton></SimpleTooltip><SimpleTooltip content="Italic"><ToolbarButton size="icon-sm" aria-label="Italic"><Icon name="italic" /></ToolbarButton></SimpleTooltip><SimpleTooltip content="Insert link"><ToolbarButton size="icon-sm" aria-label="Insert link"><Icon name="link" /></ToolbarButton></SimpleTooltip></Toolbar></TooltipGroup>
```

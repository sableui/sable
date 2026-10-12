# Sheet

**Status:** stable

Edge-anchored drawer over Base UI Drawer — focus trap, scroll lock, Esc/outside dismissal, portal backdrop, plus swipe-to-dismiss on touch. Slides in from a viewport edge via side and swipes back out toward the same edge.

**Keywords:** sheet, drawer, side panel, overlay, swipe to dismiss

## Usage

Use Sheet for secondary workflows that slide in while preserving context from the underlying page.

### Best practices

- Do: Use it for inspect, edit, filter, or create flows that relate to the current page.
- Do: Include clear title, close path, and footer actions for task-oriented sheets.
- Don't: Do not use Sheet for simple confirmations or deeply nested workflows.
- Don't: Do not use it on desktop where a Dialog fits. A sheet's affordance is edge-anchored travel for thumb reach; on a wide viewport it becomes a dialog that arrives from the wrong place.

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| SheetTrigger | no | The element that opens the sheet. |
| SheetContent | yes | The sliding panel content. |
| SheetClose | no | An explicit close control. |
| SheetHeader | no | The title and description region. |
| SheetTitle | no | The sheet heading. |
| SheetDescription | no | Supporting context for the sheet. |
| SheetList | no | Edge-to-edge rows (Entity) aligned with the header — a queue, notifications, a picker. |
| SheetFooter | no | Footer actions for the workflow. |

## Subcomponents

| Name | Type | Description |
| --- | --- | --- |
| SheetContent | Base UI Drawer.Popup props (initialFocus, finalFocus, …) + side: "right" \| "left" \| "top" \| "bottom" + className | Backdrop + edge-anchored popup; portals to <body>. side picks which viewport edge the sheet anchors to and slides in from (defaults to "right"). Left/right are full-height side panels; top/bottom span the width up to 80vh. On touch it swipes closed toward that same edge (right swipes right, left swipes left, top swipes up, bottom swipes down). |
| SheetTrigger | Base UI Drawer.Trigger props (render) | Element that opens the sheet. Compose via render prop. |
| SheetClose | Base UI Drawer.Close props (render) | Element that dismisses the sheet. Compose via render prop. |
| SheetHeader | ComponentProps<"div"> | Top section holding SheetTitle/SheetDescription. |
| SheetTitle | Base UI Drawer.Title props + className | The sheet's accessible name — wires aria-labelledby on the popup. |
| SheetDescription | Base UI Drawer.Description props + className | Muted supporting line; wires aria-describedby. |
| SheetList | ComponentProps<"div"> | Rows that run edge to edge in the sheet, Entity most often. It bleeds through the sheet's padding (--sheet-p) and hands it back to each row as --entity-px, so row content lines up with SheetHeader and a row's hover fill reaches the panel's edges. Without it a list of Entity rows sits 12px in from the header. The Sheet equivalent of CardList. |
| SheetFooter | ComponentProps<"div"> | Bottom row for actions, pinned after the scrollable body. In a bottom sheet it stacks: full width, the primary on top, every button at the cta height. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| Sheet (Root) | Base UI Drawer.Root props (open, defaultOpen, onOpenChange, onOpenChangeComplete, modal, disablePointerDismissal, actionsRef, handle) — minus swipeDirection and snap points | — | Controls open state. Uncontrolled by default. The dismiss swipe direction is not a prop: it follows SheetContent's side. onOpenChange reports reason "swipe" when a swipe closed it. |

## Variants

- **side**: right, left, top, bottom

## Tokens used

`popover`, `popover-foreground`, `border`, `muted-foreground`

## Accessibility

- Base UI provides focus trapping, scroll lock, aria-modal, and labelled-by wiring (SheetTitle).
- The panel scrolls its own content (thin scrollbar, contained overscroll) when it outgrows its bound — the full height on left/right, 80vh on top/bottom.
- Esc and click-outside dismiss by default; on touch, a swipe toward the sheet's own edge dismisses too. A short or slow drag springs back.
- Swipe is an extra path, never the only one: Esc, click-outside and SheetClose all still work.
- Focus matches Dialog: the first tabbable on mouse/keyboard open, the panel itself on touch (so the virtual keyboard stays down); focus returns to the trigger on close.
- Render a SheetClose inside SheetContent so screen-reader users can escape the popup.
- Slide animation runs via data-[starting-style]/data-[ending-style] attributes on the motion-duration token; while swiping the panel tracks the finger directly, and a released swipe finishes on the same token (scaled by flick speed), so reduced motion makes it instant.
- A mouse drag that starts on sheet content selects text rather than dragging the panel; mouse dragging only starts from the padding edge.

## Related

- Components: Dialog, Popover, Sidebar

## Examples

### List of rows (a queue)

```tsx
import { Button, Entity, GradientArt, Sheet, SheetContent, SheetHeader, SheetList, SheetTitle, SheetTrigger } from "@sableui/react"

<Sheet><SheetTrigger render={<Button variant="secondary">Queue</Button>} /><SheetContent><SheetHeader><SheetTitle>Up next</SheetTitle></SheetHeader><SheetList>{queue.map((track) => <Entity key={track.id} leading={<GradientArt aria-hidden seed={track.title} className="size-10 rounded-sm" />} title={track.title} subtitle={track.artist} />)}</SheetList></SheetContent></Sheet>
```

### Basic (right)

```tsx
import { Button, Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@sableui/react"

<Sheet><SheetTrigger render={<Button>Open</Button>} /><SheetContent><SheetHeader><SheetTitle>Filters</SheetTitle><SheetDescription>Narrow the feed.</SheetDescription></SheetHeader><SheetFooter><SheetClose render={<Button variant="secondary">Cancel</Button>} /><SheetClose render={<Button>Apply</Button>} /></SheetFooter></SheetContent></Sheet>
```

### Left side

```tsx
import { Button, Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@sableui/react"

<Sheet><SheetTrigger render={<Button variant="secondary">Menu</Button>} /><SheetContent side="left"><SheetHeader><SheetTitle>Navigation</SheetTitle></SheetHeader><SheetFooter><SheetClose render={<Button variant="secondary">Close</Button>} /></SheetFooter></SheetContent></Sheet>
```

### Bottom side

```tsx
import { Button, Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@sableui/react"

<Sheet><SheetTrigger render={<Button variant="secondary">Details</Button>} /><SheetContent side="bottom"><SheetHeader><SheetTitle>Edition details</SheetTitle></SheetHeader><SheetFooter><SheetClose render={<Button variant="secondary">Close</Button>} /></SheetFooter></SheetContent></Sheet>
```

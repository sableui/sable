# Sheet

**Status:** stable

Edge-anchored drawer over Base UI Drawer — focus trap, scroll lock, Esc/outside dismissal, portal backdrop, plus swipe-to-dismiss on touch. Slides in from a viewport edge via side and swipes back out toward the same edge.

**Keywords:** sheet, drawer, side panel, overlay, swipe to dismiss, bottom sheet, snap points, detents

## Usage

Use Sheet for secondary workflows that slide in while preserving context from the underlying page.

### Best practices

- Do: Use it for inspect, edit, filter, or create flows that relate to the current page.
- Do: Include clear title, close path, and footer actions for task-oriented sheets.
- Do: Give a bottom sheet snap points when it shows a summary first and detail on demand (a map result, a now-playing panel): `snapPoints={[0.4, 1]}`. The first stop is where it opens; put what matters at that height, because the rest is a drag away.
- Don't: Do not use Sheet for simple confirmations or deeply nested workflows. → use **Dialog**
- Don't: Do not use it on desktop where a Dialog fits. A sheet's affordance is edge-anchored travel for thumb reach; on a wide viewport it becomes a dialog that arrives from the wrong place. → use **Dialog**

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
| SheetContent | Base UI Drawer.Popup props (initialFocus, finalFocus, …) + side: "right" \| "left" \| "top" \| "bottom" + className | Backdrop + edge-anchored popup; portals to <body>. side picks which viewport edge the sheet anchors to and slides in from (defaults to "right"). Left/right are full-height side panels; top/bottom span the width up to 80vh. A bottom sheet with snapPoints is as tall as its highest stop allows (the viewport less a top gap), shows a drag handle, and translates down to the active stop; the part below the screen becomes bottom padding, so its scroll area and SheetFooter end at the visible edge. A bottom sheet rides above the on-screen keyboard (measured from visualViewport). On touch it swipes closed toward that same edge (right swipes right, left swipes left, top swipes up, bottom swipes down). |
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
| Sheet (Root) | Base UI Drawer.Root props (open, defaultOpen, onOpenChange, onOpenChangeComplete, modal, disablePointerDismissal, actionsRef, handle, snapPoints, snapPoint, defaultSnapPoint, onSnapPointChange, snapToSequentialPoints) — minus swipeDirection | — | Controls open state. Uncontrolled by default. The dismiss swipe direction is not a prop: it follows SheetContent's side. onOpenChange reports reason "swipe" when a swipe closed it. |
| snapPoints | (number \| string)[] | — | Stops a bottom sheet rests at, smallest first: a fraction of the viewport (0.4), pixels (320), or a px/rem string ("20rem"). The panel is the full stop's height and opens at the first stop; a swipe moves between stops and a swipe below the first closes it. side="bottom" only: other sides ignore them, with a development warning. |
| snapPoint | number \| string \| null | — | The active stop, controlled. Pair with onSnapPointChange; use defaultSnapPoint to open at a different stop uncontrolled. |
| onSnapPointChange | (snapPoint: number \| string \| null, eventDetails) => void | — | Fires when a swipe (or your code) moves the sheet to another stop. |
| snapToSequentialPoints | boolean | false | Move one stop per swipe, by distance. Off, a fast flick can skip past a stop. |

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
- Snap points add stops, not a gate: at any stop the content scrolls within the visible part and every control stays reachable by keyboard, so nothing needs the drag. The handle is decorative (aria-hidden).
- A bottom sheet stays above the on-screen keyboard: its bottom edge is lifted by the height the keyboard takes from the visual viewport, so a focused field is not covered. An app that sets interactive-widget=resizes-content in its viewport meta gets the same result from the browser, and the inset reads 0.

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

### Bottom sheet with snap points

```tsx
import { Button, Entity, Sheet, SheetContent, SheetDescription, SheetHeader, SheetList, SheetTitle, SheetTrigger } from "@sableui/react"

<Sheet snapPoints={[0.4, 1]}><SheetTrigger render={<Button variant="secondary">Nearby</Button>} /><SheetContent side="bottom"><SheetHeader><SheetTitle>12 places nearby</SheetTitle><SheetDescription>Drag up for the full list.</SheetDescription></SheetHeader><SheetList>{places.map((place) => <Entity key={place.id} title={place.name} subtitle={place.distance} />)}</SheetList></SheetContent></Sheet>
```

### Bottom side

```tsx
import { Button, Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@sableui/react"

<Sheet><SheetTrigger render={<Button variant="secondary">Details</Button>} /><SheetContent side="bottom"><SheetHeader><SheetTitle>Order details</SheetTitle></SheetHeader><SheetFooter><SheetClose render={<Button variant="secondary">Close</Button>} /></SheetFooter></SheetContent></Sheet>
```

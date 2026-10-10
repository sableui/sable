# Scroller

**Status:** stable

Scroll container that fades its leading/trailing edges when content overflows. Tracks scroll position to toggle the fades.

**Keywords:** scroller, overflow, horizontal scroll, carousel

## Usage

Use Scroller to create a contained overflow region for content that naturally extends beyond the viewport.

### Best practices

- Do: Use it for chip rows, media strips, or comparison sets where horizontal browsing is expected.
- Do: Keep scroll affordances visible enough that overflow is discoverable.
- Do: Put everything on `className` — sizing (`max-h-80`, `h-64`, `flex-1 min-h-0`) and chrome (`rounded-lg border`, `bg-card`) alike. It styles the Scroller's outer box, and the scrolling element inside it is `flex-1 min-h-0`, so a cap on the Scroller is still a cap on what scrolls.
- Do: Pass `label` on any Scroller with real content. It is a focusable region, and an unnamed one announces as a bare group — "Tags" or "Recent covers" costs a word and is the difference between navigable and not.
- Don't: Do not use Scroller to hide primary page layout or required controls.
- Don't: Do not add your own wheel handler to make a horizontal strip mouse-scrollable — it already is. A second handler double-scrolls and usually loses the end-release, which traps the page.
- Don't: Do not reach past it with a child selector (`[&>div]:snap-x`). The scrolling element is addressable by name: `viewportClassName`.
- Don't: Do not use it to hide overflow you should have laid out. It exists to make an intentionally scrolling strip legible, not to contain content that overflowed by accident.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| orientation | "vertical" \| "horizontal" | "vertical" | "vertical" scrolls and fades top/bottom; "horizontal" scrolls and fades left/right. |
| wheelScroll | boolean | true | On a horizontal Scroller, let a vertical mouse wheel scroll it sideways. Ignored when vertical. Turn it off only if the region is inside something that owns the wheel itself (a map, a canvas). |
| label | string | — | Accessible name for the scroll region. The region takes focus, so it should say what it contains; without one a screen reader announces an unnamed group. |
| viewportClassName | string | — | Classes for the inner element that actually scrolls. Narrow on purpose — `className` is what you want almost always. This is for the few utilities that only mean something on the scrolling box: `snap-x`, `scroll-smooth`, `scroll-p-*`. |
| ...div props | ComponentPropsWithRef<'div'> | — | Everything except `className`/`style` spreads onto the SCROLLING element — `role`, `id`, `aria-*`, `data-*` and event handlers all describe the thing that scrolls, and CommandMenu relies on it to make this component its listbox. `ref` and `onScroll` likewise address the scroller, and compose with the component's own. |

## Variants

- **orientation**: vertical, horizontal
- **wheelScroll**: true, false

## Tokens used

`ring`

## Accessibility

- The edge fades are a CSS mask-image on the scrolling element, not overlay elements — there is nothing in the DOM to intercept a pointer or be read by assistive tech, and the content under a fade stays fully interactive.
- Two boxes: a chrome box carrying `className` (border, background, radius, sizing) and, inside it, the element that actually scrolls and carries the fade mask. They are split because a `mask-image` applies to its element's own border — so with both on one box, a bordered Scroller watched its frame dissolve at the scrolling edge. The axis is published as `data-orientation`, not `aria-orientation`, which is invalid on `role="group"`.
- The scroll region uses native overflow and contains overscroll, so a gesture that runs out of content does not scroll the page behind it.
- It is focusable (`tabIndex=0`, `role="group"`) and handles arrows, Home/End and PageUp/PageDown along its own axis. Chrome 128+ and Firefox make scrollable regions focusable on their own; Safari does not, so a strip with a hidden scrollbar and no focusable children is unreachable there. Declaring it makes the behaviour a property of the component, not of the reader's browser. Pass `label` to name it — an unnamed focusable region announces as a bare group.
- On a horizontal Scroller, a vertical mouse wheel scrolls it sideways, because most mice have no horizontal wheel and the content past the fold is otherwise unreachable on them. The strip releases the wheel at both ends so it never traps the page, and leaves trackpad `deltaX` gestures and `shift+wheel` to the browser.
- Cross-axis arrow keys are deliberately not captured, and a consumer can take the arrows entirely by calling `preventDefault()` in their own `onKeyDown` — a strip of interactive chips usually wants them for roving focus.

## Related

- Components: Carousel, Marquee

## Examples

### Vertical with overflow

```tsx
import { Scroller } from "@sableui/react"

<Scroller label="Editions" className="h-64"><ul className="space-y-2 p-4">{items.map((item) => (<li key={item.id} className="text-body-sm">{item.title}</li>))}</ul></Scroller>
```

### Capped, scrolls past the cap

```tsx
import { Scroller } from "@sableui/react"

<Scroller label="Versions" className="max-h-80 rounded-md border border-border"><ul className="divide-y divide-border">{versions.map((v) => (<li key={v.id} className="px-3 py-2 text-body-sm">{v.label}</li>))}</ul></Scroller>
```

### Horizontal

```tsx
import { Scroller } from "@sableui/react"

<Scroller orientation="horizontal" label="Recent covers" className="w-full"><div className="flex gap-3 p-4">{covers.map((src) => (<img key={src} src={src} alt="" className="h-32 w-32 rounded-lg object-cover" />))}</div></Scroller>
```

### Snap points on the scrolling box

```tsx
import { Scroller } from "@sableui/react"

<Scroller orientation="horizontal" label="Covers" className="w-full rounded-lg border border-border" viewportClassName="snap-x snap-mandatory scroll-smooth"><div className="flex gap-3 p-4">{covers.map((src) => (<img key={src} src={src} alt="" className="h-32 w-32 snap-start rounded-lg object-cover" />))}</div></Scroller>
```

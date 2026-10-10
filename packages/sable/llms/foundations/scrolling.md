# Scrolling

Every scroll container declares a policy. Vertical regions get a quiet bar that appears only while you are in them; horizontal strips get edge fades instead of a rail.

**2 policies · vertical gets a bar · horizontal gets a fade**

## Policies

| Name | Value | Use |
|---|---|---|
| `scrollbar-quiet` | 4px thumb · hidden at rest → 12% active → 16% hovered → 20% dragging | The default for vertical scrolling. Grows to 6px under the pointer. |
| `scrollbar-hidden` | no bar | Only when something else carries the affordance — and you can name it (an edge fade, paging controls). |
| `<Scroller>` | edge fades + wheel mapping | Horizontal strips: media rows, chip rows, tab overflow. |
| `useScrollActivity` | data-scrolling for ~600ms | Lets the bar respond to touch drags and programmatic scrolls, which hover cannot see. |

## Rules

1. **Every overflow-*-auto|scroll declares scrollbar-quiet or scrollbar-hidden.** Left bare, the platform draws its own: on Windows, stepper arrows hard against the padding edge that poke out of rounded corners. *Enforced by sable-lint: unmanaged-overflow (also checked over every registry example).*
2. **Vertical regions get a bar; horizontal regions get an edge fade.** A vertical list needs position feedback. A horizontal strip needs 'there is more this way', which a fade says better than a 4px rail.
3. **A horizontal region must work without a horizontal input.** Most mice have no horizontal wheel. Scroller maps the vertical wheel sideways and handles arrow keys, Home and End.
4. **Reveal on scrolling, not only on hover.** Touch drags and programmatic scrolls (a chat following a reply) hover nothing, and those are the moments a reader needs to see where they are.

## Never

- **Never:** scrollbar-hidden on a vertical list with no fade or paging. **Instead:** scrollbar-quiet. It leaves the reader with no sense of position and nothing to discover.
- **Never:** A styled ::-webkit-scrollbar written per component. **Instead:** The scrollbar-quiet utility. Chromium ignores ::-webkit-scrollbar once scrollbar-width is set; the utility handles both engines.

## Details

### A scrolling panel

```tsx
// before
<div className="overflow-y-auto">
// after
<div className="overflow-y-auto scrollbar-quiet" ref={useScrollActivity()}>
```

No bar at rest; it appears while scrolling, hovered or focused, and fades a beat after. Content cut off at the edge is what says the region scrolls.

**Related:** `sable docs surfaces` · `sable docs accessibility` · `sable component Scroller`

# Tilt

**Status:** stable

Optional bounded mouse depth on a surface. Coalesces samples into one requestAnimationFrame and writes transform locally. Static on touch, subtle motion and reduced motion.

**Keywords:** tilt, pointer depth, 3d card, perspective, mouse movement

## Usage

Use for one illustrative card or image whose content already works without the effect. The wrapper owns transform; put an independently transformed element inside it rather than overriding the wrapper's transform while tracking.

### Best practices

- Do: Keep maxAngle small, and inspect the full surface bounds next to neighboring content.
- Do: Keep the actual action in a Button or link inside the surface. Tilt itself is decorative and never becomes a tab stop.
- Don't: Do not enable pointer tracking for touch scrolling or when motion is subtle/off. No device-orientation access is required.
- Don't: Do not apply it to dense reading surfaces or animate pointer samples through React state.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| maxAngle | number | 6 | Maximum rotation per axis in degrees, bounded to 0–15. 0 turns the lean off; a surface that was leaning eases back to flat. |
| motion | "full" \| "subtle" \| "off" | — | Only turns motion down. Pointer depth is expressive. |

## Motion

- **arrival** · Root · _no motion_ — The surface starts flat and still.
- **response** · Root · _custom (outside the recipe layer)_ — The lean ramps up over --motion-duration-base as the pointer arrives (it enters at an edge, where the lean is largest), then follows the pointer once per frame with no easing behind it. Leaving eases back to flat. The surface takes a compositor layer only while it leans, promoted and released while flat, so text and images neither pop mid-gesture nor sit soft at rest.

## Accessibility

- No information or essential action depends on the tilt; touch and keyboard retain the same content.
- Respects full/subtle/off motion at the provider, scope and component levels. Adds no interactive role or tab stop.

## Related

- Components: Card, MediaImage, Button

## Examples

### Illustrative surface

```tsx
import { Card, CardContent, Tilt } from "@sableui/react"

<Tilt><Card><CardContent>Studio membership</CardContent></Card></Tilt>
```

### Static equivalent

```tsx
import { Card, CardContent, Tilt } from "@sableui/react"

<Tilt motion="off" maxAngle={3}><Card><CardContent>All content remains available</CardContent></Card></Tilt>
```

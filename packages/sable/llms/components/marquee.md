# Marquee

**Status:** stable

Seamless, constant-speed infinite loop (logos, tags, testimonials). Zero-dependency: duplicates children to fill the track and advances exactly one group + gap per iteration so it never seams. Pauses on hover/focus; freezes to a scroll region when motion is off/reduced.

**Keywords:** marquee, ticker, scrolling, ambient

## Usage

Use Marquee for decorative or ambient continuous content where motion supports the surface.

### Best practices

- Do: Use it for low-priority repeated content such as logos, tags, or lightweight highlights.
- Do: Respect reduced motion and keep the content understandable without relying on animation.
- Don't: Do not put critical messages, controls, or required reading inside Marquee.
- Don't: Do not put content that must be read in a Marquee. It moves continuously, so anything longer than a logo or a short label cannot be read reliably — and it must stop for prefers-reduced-motion.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| direction | "left" \| "right" \| "up" \| "down" | "left" | Scroll direction; up/down switch to a vertical loop, which needs a bounded height (e.g. className="h-56"). |
| speed | number | 40 | Constant speed in px/s — independent of content length. |
| gap | string | "calc(var(--spacing) * 8)" | Gap between items (any CSS length). Use a spacing-scale value (calc(var(--spacing) * n)) so it moves with density. |
| pauseOnHover | boolean | true | Pause while hovered or keyboard-focused (WCAG 2.2.2). |
| controls | boolean | false | Render a visible pause/play control — recommended for WCAG 2.2.2 when content auto-scrolls. |
| fade | boolean | false | Fade the leading/trailing edges with a mask. |
| label | string | — | Accessible label for the scrolling region. |

## Accessibility

- Duplicate groups are aria-hidden, so screen readers read the content once.
- Pauses on hover and focus-within; under prefers-reduced-motion / MotionProvider off it stops and becomes a normal scroll region.
- Decorative by default — pass a label only when the row conveys meaning.

## Related

- Components: Scroller, Carousel, Badge

## Examples

### Logo row

```tsx
import { Marquee } from "@sableui/react"

<Marquee>{logos.map((l) => <img key={l.id} src={l.src} alt={l.name} className="h-8" />)}</Marquee>
```

### Reverse, faster

```tsx
import { Badge, Marquee } from "@sableui/react"

<Marquee direction="right" speed={70}>{tags.map((t) => <Badge key={t} appearance="outline">{t}</Badge>)}</Marquee>
```

### Vertical

```tsx
import { Marquee } from "@sableui/react"

<Marquee direction="up" className="h-64">{items}</Marquee>
```

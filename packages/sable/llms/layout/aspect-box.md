# AspectBox

**Status:** stable

Reserves space via aspect-ratio so async media loads with zero layout shift. Wrap images, video, embeds. The ratio is a class reading a CSS variable, so className reshapes it at a breakpoint (md:aspect-video).

**Keywords:** aspect box, aspect ratio, media, layout shift

## Usage

Use AspectBox to reserve stable aspect-ratio space for async media, embeds, and responsive previews.

### Best practices

- Do: Use it around images, video, and embeds that should not shift layout while loading.
- Do: Match the ratio to the expected media or design slot.
- Don't: Do not use AspectBox for content whose height should grow with text or controls.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| ratio | number | 16/9 | Width / height ratio (e.g. 1 for square, 4/5 for portrait). |

## Related

- Components: Video, Dialog, Browser

## Examples

### Cover image slot

```tsx
import { AspectBox } from "@sableui/react"

<AspectBox ratio={16 / 9}><img src={post.coverUrl} alt={post.title} className="size-full object-cover" /></AspectBox>
```

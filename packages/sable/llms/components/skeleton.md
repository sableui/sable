# Skeleton

**Status:** stable

Loading placeholder — a muted, shimmering block (rounded-md bg-muted motion-shimmer). Shape it with utility classes; rounded-full for circles.

**Keywords:** skeleton, loading, placeholder, pending

## Usage

Use Skeleton to reserve space and hint at the shape of content while data is loading.

### Best practices

- Do: Match the approximate size and rhythm of the eventual content.
- Do: Use it for content regions where layout stability matters during loading.
- Don't: Do not leave Skeleton visible after an error or empty state; switch to EmptyState (tone='destructive' for an error). → use **EmptyState**
- Don't: Do not use a skeleton whose shape differs from the content that replaces it. A mismatched placeholder causes a visible jump, which is worse than a brief spinner.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| ...props | ComponentPropsWithRef<"div"> | — | All native div props plus className. Size and shape the placeholder with utilities (h-*, w-*, size-*, rounded-full). |

## Tokens used

`muted`

## Motion

- **arrival** · Root · _no motion_ — A skeleton stands in for content that has not arrived; fading the placeholder in adds a wait before the wait.
- **response** · Root · _no motion_ — Nothing here is interactive. A skeleton that reacted to the pointer would invite a click on a thing that cannot be clicked.
- **transition** · Root · _no motion_ — The skeleton has one state. Swapping it for real content is the parent's job, and the parent decides whether that swap is animated.
- **activity** · Root · `motion-shimmer` — The sweep is the entire point of the component: it is what separates 'still loading' from 'loaded, and empty'. A static grey block is indistinguishable from a broken layout, which is why users reload the page. It is one band of light against the viewport, so every skeleton in a loading layout lights in sequence as a single wave rather than each block flashing at its own speed; each pass eases in, glides and settles, then rests off-screen before the next.

## Accessibility

- Purely presentational; the shimmer sweep is decorative, and it stops under reduced motion because motion-shimmer follows --motion-scale.
- Mark the loading region with aria-busy="true" on a parent, and swap in real content (with the same layout) once loaded to avoid shift.

## Related

- Components: Spinner, PageLoader

## Examples

### Shapes

```tsx
import { Skeleton } from "@sableui/react"

<Skeleton className="h-4 w-40" /><Skeleton className="size-10 rounded-full" /><Skeleton className="h-40 w-full" />
```

### Post-card composition

```tsx
import { Skeleton } from "@sableui/react"

<div className="flex items-center gap-3"><Skeleton className="size-10 rounded-full" /><div className="space-y-2"><Skeleton className="h-3 w-32" /><Skeleton className="h-3 w-20" /></div></div>
```

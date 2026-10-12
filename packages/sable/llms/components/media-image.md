# MediaImage

**Status:** beta

An image that fills its box and falls back to GradientArt seeded by the item when it has no source or the source fails — Avatar's image-load tracking, for covers, thumbnails and product shots instead of faces.

**Keywords:** image, img, image fallback, broken image, cover art, album art, thumbnail, placeholder image, onError, missing image

## Usage

Use MediaImage wherever content imagery may be missing or broken: a cover in a grid, a thumbnail in a row, a product shot. It fills the box it is given — an AspectBox for a cover, a sized and rounded box for a thumbnail — shows a quiet muted surface while the image loads, fades the image in once decoded, and paints GradientArt seeded by the item when there is no image to show, so a grid of missing covers still reads as distinct things. For a person use Avatar; for a whole tile with title and actions use MediaTile, which composes this.

### Best practices

- Do: Give the box the shape: `<AspectBox ratio={1} className="rounded-md"><MediaImage … /></AspectBox>`, or `size-14 rounded-md` on MediaImage itself for a thumbnail. It clips to whatever radius the box has.
- Do: Pass `seed` (the title or an id) when `alt` is empty, so the fallback art is the item's own and stays the same in every list it appears in.
- Do: Leave `alt` empty when a visible title sits next to the image — a tile, a row — and describe it when the image stands alone. A set `alt` also names the fallback, so the description survives a broken URL.
- Don't: Do not hand-write `<img onError={() => setBroken(true)}>`. An image that fails before hydration never fires the handler on a prerendered page; MediaImage preloads off the DOM and catches it.
- Don't: Do not use it for profile pictures. A person is a circle with initials — Avatar, whose `variant="art"` is the same fallback with the person's initials over it.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| src | string | — | Image URL. Omitted, empty or failing to load ⇒ the fallback shows. |
| alt | string | "" | Alt text. Empty is decorative — right beside a visible title. When set and no image shows, it names the fallback instead. |
| seed | string \| number | — | Seeds the fallback art. Defaults to `alt`; pass the title or an id when `alt` is empty. |
| fallback | ReactNode | — | Replaces the GradientArt fallback — a glyph or monogram. Fills the frame under the same clipping. |
| fit | "cover" \| "contain" | "cover" | `cover` crops to fill (artwork, photos); `contain` letterboxes on the muted surface (a logo, a product that must not be cropped). |
| srcSet | string | — | Responsive sources, passed to the `<img>`. |
| sizes | string | — | The `sizes` attribute for `srcSet`. |
| loading | "lazy" \| "eager" | "lazy" | Native lazy loading. Use `eager` for the first row of a grid above the fold. |
| className | string | — | Sizing and rounding when MediaImage is the box itself (`size-14 rounded-md`). Inside an AspectBox it already fills. |

## Variants

- **fit**: cover, contain

## Tokens used

`muted`, `art-1`, `art-2`, `art-3`, `art-4`, `art-5`, `art-6`, `art-ground`

## Motion

- **arrival** · image · `motion-fade` — The image fades in over the muted surface once it has decoded, so a slow cover settles in instead of popping row by row as the grid loads.
- **response** · root · _no motion_ — Imagery, not a control. The tile or row around it answers the pointer.
- **transition** · root · _no motion_ — Its only state change is loading → loaded or failed, which the arrival covers.
- **activity** · root · _no motion_ — A loading image rests on a static muted surface; a shimmer per cover across a long grid would be noise.

## Accessibility

- `alt` defaults to empty (decorative), because the usual neighbour is a visible title that already names the item; describe the image when it stands alone.
- When no image is on screen and `alt` is set, the frame takes `role="img"` with that label, so a broken URL does not erase the description. The fallback art itself is always aria-hidden.
- The `<img>` mounts only once it has loaded, so assistive technology never meets a broken-image icon.

## Related

- Components: MediaTile, Avatar, GradientArt, AspectBox

## Examples

### Cover with fallback

```tsx
import { AspectBox, MediaImage } from "@sableui/react"

<AspectBox ratio={1} className="rounded-md">
	<MediaImage src={album.cover} seed={album.title} />
</AspectBox>
```

### No image yet

```tsx
import { AspectBox, MediaImage } from "@sableui/react"

<AspectBox ratio={1} className="rounded-md">
	<MediaImage seed="Low tide, high noon" />
</AspectBox>
```

### Row thumbnail

```tsx
import { MediaImage } from "@sableui/react"

<MediaImage src={track.art} seed={track.title} className="size-12 shrink-0 rounded-sm" />
```

### Logo, never cropped

```tsx
import { AspectBox, MediaImage } from "@sableui/react"

<AspectBox ratio={16 / 9} className="rounded-lg">
	<MediaImage src={brand.logo} alt={brand.name} fit="contain" />
</AspectBox>
```

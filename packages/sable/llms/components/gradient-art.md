# GradientArt

**Status:** beta

Placeholder artwork painted by a static WebGL shader from the preset's own art direction (the --art-* tokens: palette, ground, warp, softness, grain) — Ember burns, Prism airbrushes, Meridian is grainy monochrome — with a CSS gradient underneath for prerendered pages and browsers without WebGL2.

**Keywords:** gradient, mesh gradient, grain, shader, artwork, placeholder image, cover, banner, avatar fallback, generative

## Usage

Use GradientArt where a real image belongs but none exists yet, or where the image is decoration: a product cover before upload, a profile banner, an album tile, an avatar with no photo. It reads the theme's own tokens, so it follows every preset, mode and live edit; `seed` fixes each item's composition so a list of covers or avatars stays individually recognisable.

### Best practices

- Do: Pass a stable `seed` per item — the name for an avatar, the title for a cover. Each item then keeps the same art across renders, reloads and themes, which is what lets someone recognise it.
- Do: Size it with layout classes (`aspect-[4/3]`, `h-20`, `size-10 rounded-full`) and put any glyph or initials inside as children; they render above the art.
- Do: Keep the default `mesh` for covers, tiles and avatars. Reach for `grain` where a printed, tactile surface suits — a banner, a hero card — and keep one variant per surface type so art reads as a system.
- Don't: Do not put body text over it. The art spans the palette's lightest and most saturated tones, so no single ink is guaranteed to clear contrast across it; reserve overlays for a short label on a scrim or an avatar's initials.
- Don't: Do not pass colours, and reach for `tones` rarely. The art follows the preset's --art-* tokens on purpose; to change how a product's art looks, set the --theme-art-* hooks in its theme or preset, so every cover, banner and avatar changes together.
- Don't: Do not use it as a page or hero background. It paints at the element's pixel size, so a full-viewport instance costs a large frame on every theme change; it is sized for covers, banners and tiles.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| variant | "mesh" \| "grain" | "mesh" | mesh: soft spots of colour pulled together by gentle waves. grain: glowing light over deep corners with a printed texture. |
| tones | ("info" \| "3" \| "2" \| "1" \| "warning")[] | — | Paint these `--tone-*` colours instead of the preset's art palette. Leave unset to follow the preset's art direction. |
| seed | string \| number | — | Fixes the composition: the same seed paints the same art in every theme. Pass a stable id. |
| children | ReactNode | — | Rendered above the art — initials, a glyph, a short label. |
| className | string | — | Size and shape: aspect, height, rounding. |

## Variants

- **variant**: mesh, grain

## Tokens used

`art-1`, `art-2`, `art-3`, `art-4`, `art-5`, `art-6`, `art-ground`, `art-warp`, `art-softness`, `art-grain`, `primary`, `tone-info`, `tone-3`, `tone-2`, `tone-1`, `tone-warning`

## Motion

- **arrival** · canvas · `motion-interactive` — The shader frame fades in over the CSS gradient it replaces, so the swap from fallback to shader reads as the art settling rather than a flash.
- **response** · root · _no motion_ — Artwork, not a control: it does not react to the pointer.
- **transition** · canvas · _custom (outside the recipe layer)_ — A theme change repaints the frame in place on the next animation frame; there are no states to move between.
- **activity** · root · _no motion_ — Static by design: nothing animates between paints, so it costs nothing while idle and respects reduced motion without a branch.

## Accessibility

- Decorative by default: the canvas is aria-hidden. When the art stands for something (an avatar), label the element that contains it, not the art.
- Children render above the art in the normal reading order, so initials or a label are announced as usual.

## Related

- Components: Avatar, Card, AspectBox

## Examples

### Product cover

```tsx
import { GradientArt } from "@sableui/react"

<GradientArt seed="Untitled (gold rush)" className="aspect-[4/3] rounded-lg" />
```

### Grain banner

```tsx
import { GradientArt } from "@sableui/react"

<GradientArt variant="grain" seed="juno" tones={["info", "1"]} className="h-20 rounded-md" />
```

### Avatar with initials

```tsx
import { GradientArt } from "@sableui/react"

<GradientArt seed="Mara Okafor" className="grid size-10 place-items-center rounded-full text-label-md text-overlay-foreground">MO</GradientArt>
```

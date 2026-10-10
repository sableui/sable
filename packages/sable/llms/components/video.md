# Video

**Status:** stable

Styled 16:9 video player frame. Mounts a native <video> when given a src, or shows a poster/placeholder with a centered play overlay.

**Keywords:** video, media, player, demo

## Usage

Use Video to embed playable or previewable video media inside a page.

### Best practices

- Do: Use captions, poster imagery, and controls when the video carries information.
- Do: Keep the surrounding layout stable while media loads.
- Don't: Do not autoplay important audio or make video the only way to access required information.
- Don't: Do not ship it without captions or a transcript. Captions are what make video usable for deaf users and searchable for everyone; a video with neither is inaccessible content you also cannot index.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| onRequestPlay | () => void | — | Placeholder only (no src): renders the play mark as a real button labelled "Play video" that calls this — e.g. to load the source. Without it the mark is decorative. |
| src | string | — | Video source URL. When omitted, a poster/placeholder with a play overlay renders. |
| poster | string | — | Poster image shown before playback (and as the placeholder backdrop). |
| controls | boolean | true | Show native playback controls. |

## Tokens used

`border`, `overlay`, `overlay-foreground`, `ring`

## Accessibility

- Mounts a native <video> element, preserving built-in keyboard controls when controls is enabled.
- Without onRequestPlay the placeholder play mark is decorative (aria-hidden) — nothing on the frame pretends to be pressable. With it, the mark is a native button named "Play video".

## Related

- Components: Carousel, Dialog, Badge

## Examples

### With a poster

```tsx
import { Video } from "@sableui/react"

<Video poster="/cover.jpg" src="/clip.mp4" />
```

### Placeholder (no src)

```tsx
import { Video } from "@sableui/react"

<Video poster="/cover.jpg" />
```

### Placeholder that loads on play

```tsx
import { Video } from "@sableui/react"

<Video poster="/cover.jpg" src={src} onRequestPlay={() => setSrc("/clip.mp4")} />
```

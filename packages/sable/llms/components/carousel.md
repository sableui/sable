# Carousel

**Status:** stable

Generic, accessible, zero-dependency slide carousel. Transform track with measured slide pitch — multiple slides per view, infinite loop (cloned ends), pointer drag-to-swipe with snap, autoplay (with a pause control + hover/focus/reduced-motion pausing), arrows, dots, counter, and keyboard. Motion is token-driven.

**Keywords:** carousel, gallery, slides, horizontal

## Usage

Use Carousel for a curated, finite sequence of media or cards that benefits from horizontal browsing.

### Best practices

- Do: Use obvious previous and next controls and make the current position understandable.
- Do: Keep slide content independent so users do not need every slide to complete a task.
- Don't: Do not hide critical information or primary conversion actions only inside later slides.
- Don't: Do not autoplay without a visible pause control. Motion that cannot be stopped fails WCAG 2.2.2 and makes the surrounding text hard to read.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| children | ReactNode | — | Each top-level child becomes one slide. |
| slidesToShow | number \| { base?: number; sm?: number; md?: number; lg?: number; xl?: number } | 1 | Slides visible per view. A number, or a mobile-first breakpoint set keyed to Tailwind's default min-widths (sm 640, md 768, lg 1024, xl 1280px); a missing key inherits from the next smaller defined one, and base (default 1) is also the server-render value. Resolved with matchMedia, so no hand-rolled resize hook is needed. |
| gap | string | "0px" | Gap between slides (any CSS length). Use the spacing scale — e.g. "calc(var(--spacing) * 4)" — so density moves it. |
| loop | boolean | false | Infinite loop via cloned ends (needs count > slidesToShow). |
| autoplay | number | 0 | Auto-advance interval in ms (0 = off). Pauses on hover/focus/reduced-motion and exposes a play/pause control. |
| arrows | boolean | true | Prev/next arrow buttons. |
| dots | boolean | true | Pagination dots. |
| counter | boolean | false | An N / M slide counter. |
| draggable | boolean | true | Pointer drag-to-swipe. |
| index | number | — | Controlled active index. |
| defaultIndex | number | 0 | Initial index (uncontrolled). |
| onIndexChange | (index: number) => void | — | Notified when the active index changes. |
| label | string | — | Accessible label for the carousel region. |
| slideClassName | string | — | Class for each slide wrapper (e.g. an aspect ratio). |
| arrowClassName | string | — | Class for both prev/next arrow buttons. Merged through cn(), so a radius or shadow utility replaces the default rounded-full shadow-md rather than stacking with it. |
| motion | "full" \| "subtle" \| "off" | "full" | How much motion this component uses: `full` (default) inherits the app's policy, `subtle` keeps feedback and drops the glide, `off` stills it. It can only turn motion down — it never overrides a reader's reduce-motion setting. Under subtle the slides still travel and the active dot snaps; off also cuts between slides and pauses autoplay. |

## Tokens used

`border`, `ring`, `popover`, `popover-foreground`, `foreground`, `muted-foreground`

## Motion

- **arrival** · Root · _no motion_ — A carousel arrives with its section. Its content already moves on every advance; an entrance on top would make the first view feel like an advance nobody asked for.
- **response** · Dot · `motion-interactive` — The dot's 24px hit area eases its focus ring and the dot brightens under the pointer, which is how a 6px mark tells you it is a button.
- **transition** · Track · _custom (outside the recipe layer)_ — The slide track's translate is set inline from the measured slide pitch, on --motion-duration-slow and the emphasized easing, and switched off during a drag so the track follows the finger. A recipe cannot carry a measured, drag-interrupted offset. Essential: it is the answer to "next", so it plays under subtle.
- **transition** · Dot · `motion-glide` — The active dot stretches to a bar while the one it left shrinks, on one timeline, so the row keeps its length and the mark reads as travelling with the slide. It used to change width unanimated and jumped while the slides beside it glided. Expressive: motion="subtle" snaps it.
- **activity** · Root · _no motion_ — Autoplay's progress is the slides themselves advancing and the play/pause control; a separate timer animation would put a second clock beside the first.

## Accessibility

- Region carries aria-roledescription='carousel'; each slide is a group with aria-roledescription='slide' and an 'N of M' label; clones are aria-hidden.
- Arrows and dots are real buttons (dots set aria-current); Left/Right arrow keys navigate when the viewport is focused.
- A polite live region announces the active slide; it goes silent while auto-rotating (APG).
- Autoplay exposes a pause/play control and pauses on hover, focus, and under prefers-reduced-motion (which also makes transitions instant).

## Related

- Components: Scroller, Dialog

## Examples

### Looping media

```tsx
import { Carousel } from "@sableui/react"

<Carousel loop dots slideClassName="aspect-video">{images.map((s) => <img key={s.id} src={s.url} alt={s.alt} className="size-full object-cover" />)}</Carousel>
```

### Multiple per view

```tsx
import { Carousel } from "@sableui/react"

<Carousel slidesToShow={3} gap="calc(var(--spacing) * 4)">{cards}</Carousel>
```

### Responsive per view

```tsx
import { Carousel } from "@sableui/react"

<Carousel slidesToShow={{ base: 1, sm: 2, lg: 3 }} gap="calc(var(--spacing) * 6)" label="Templates">{cards}</Carousel>
```

### Autoplay

```tsx
import { Carousel } from "@sableui/react"

<Carousel loop autoplay={4000} counter>{slides}</Carousel>
```

### Subtle motion

```tsx
import { Carousel } from "@sableui/react"

<Carousel loop motion="subtle" label="Gallery">{slides}</Carousel>
```

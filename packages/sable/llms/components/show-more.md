# ShowMore

**Status:** stable

Collapsible content region that clips children to a collapsed height, fades the cut edge, and reveals the rest with a toggle.

**Keywords:** show more, disclosure, truncate, expand

## Usage

Use ShowMore to reveal additional content after an intentionally shortened preview.

### Best practices

- Do: Use it when the preview is useful on its own and the rest is optional.
- Do: Make the expanded state reversible when collapsing helps users regain context.
- Don't: Do not place it on a card or tinted surface without checking the fade. The cut-edge gradient fades to the page background color, so on any other surface it reads as a visible band.
- Don't: Do not hide required steps, important warnings, or primary actions behind ShowMore.
- Don't: Do not use it to hide content search engines or screen readers need. Collapsed content is still in the DOM here, but if the user must read it to act, it should not be behind a toggle.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| collapsedHeight | number | 96 | Collapsed height of the content region in px. The inner wrapper clips to this height until expanded. The toggle and fade only appear when the measured content is taller than this; content that already fits shows in full with no control. Expanding animates to the measured height. |
| collapsedLines | number | — | Collapsed height as a count of the content's own lines (measured from its line height). Wins over collapsedHeight, and is the one to prefer: the preview keeps the same number of lines when the type scale or density changes, where a px height shows fewer as type grows. |
| children | ReactNode | — | The content to collapse and reveal. |

## Tokens used

`background`, `foreground`, `ring`

## Motion

- **arrival** · Root · _no motion_ — The preview arrives with the content it clips. Its fade and toggle appear only once a measurement proves the content overflows.
- **response** · Toggle · `motion-interactive` — The toggle is a link Button, so its hover and focus ease on Button's recipe.
- **transition** · Content · _custom (outside the recipe layer)_ — The region eases its max-height between the collapsed and the measured full height on the slow motion token. motion-disclosure keys on Base UI's starting and ending styles, which this self-contained toggle does not have. The text unrolling in place keeps the reader's line; a snap drops them at a different scroll position.
- **transition** · Fade · `motion-interactive` — The bottom fade dissolves as the region opens and returns as it closes, so the cut edge and the reveal read as one movement.
- **transition** · Chevron · `motion-interactive` — The chevron turns 180° in step with the region (motion-interactive lists `rotate`), so the toggle visibly points at what it will do next.
- **activity** · Root · _no motion_ — Expanding is local and instant; nothing loads.

## Accessibility

- The toggle is a real <button> with aria-expanded reflecting the open state.
- The fade overlay is pointer-events-none and decorative; it never traps clicks.
- Collapsed content stays in the DOM, so screen readers can still reach it.

## Related

- Components: Collapsible

## Examples

### Long paragraph

```tsx
import { ShowMore } from "@sableui/react"

<ShowMore><p className="text-body-md text-foreground">A long paragraph that exceeds the collapsed height…</p></ShowMore>
```

### Collapsed to a line count

```tsx
import { ShowMore } from "@sableui/react"

<ShowMore collapsedLines={6}><p className="text-body-md text-foreground">{post.description}</p></ShowMore>
```

# LikeButton

**Status:** stable

A pressed-or-not toggle for a like, a star or a save, with its count. Pressing it on fills the glyph, which blooms while a ring and a spray of dots burst from it and the count rolls up; pressing it off is quiet.

**Keywords:** like, heart, favorite, favourite, love, star, bookmark, save, upvote, reaction, count, toggle

## Usage

Use LikeButton for a personal, reversible endorsement that other people can see the tally of: liking a post, starring a repository, saving a recipe. It is the one place in Sable that celebrates, because the person chose it and it costs nothing to undo.

### Best practices

- Do: Pass the server's total as `count` and update it when the save lands. The button shows the viewer's own like at once, before the save, and goes back to `count` exactly whenever it changes, so a failed save that leaves `count` alone can also turn `pressed` back off.
- Do: Match the glyph, family and label to the meaning: `icon="star" tone="yellow" label="Star"` for a star. The label is the accessible name, so it must say what pressing does.
- Do: Use `format={{ notation: "compact" }}` once counts pass a few thousand, so a feed of buttons keeps one width.
- Don't: Do not use it for a setting or a view switch (bold, mute, grid or list). Those are tools, not endorsements, and a burst on every press of a formatting control is noise; use Toggle. → use **Toggle**
- Don't: Do not use it for a rating or a verdict on an answer (helpful, not helpful). That is a question with two sides; use Feedback. → use **Feedback**
- Don't: Do not press it for the user. A burst is a reply to a person's choice — liking something on their behalf, or on load, turns delight into a notification.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| count | number | — | The total, rolled when it changes. Pressing adds or removes the viewer's like at once; the button shows `count` exactly again whenever `count` changes. Omit it for a bare glyph (an icon-size button). |
| pressed | boolean | — | Controlled pressed state. |
| defaultPressed | boolean | false | Initial pressed state when uncontrolled. |
| onPressedChange | (pressed: boolean, event) => void | — | Called when the user presses it, with the new state. |
| icon | string | "heart" | The glyph, by icon name. Its `solid` variant is shown while pressed. |
| tone | PaletteColor | "red" | The palette family the glyph fills with while pressed, and the burst blooms from. A family, so it follows the theme. |
| label | string | "Like" | The accessible name, read before the count. |
| format | Intl.NumberFormatOptions | — | How to write the count, e.g. `{ notation: "compact" }`. |
| variant | "ghost" \| "outline" \| "secondary" | "ghost" | The Button surface. |
| size | "xs" \| "sm" \| "md" | "sm" | A Button size; without a count, the matching icon size. |
| disabled | boolean | false | Disables it. |
| motion | "full" \| "subtle" \| "off" | "full" | How much motion this component uses: `full` (default) inherits the app's policy, `subtle` keeps feedback and drops the flourish, `off` stills it. It can only turn motion down — it never overrides a reader's reduce-motion setting. The bloom and the burst are the flourish; the fill and the count changing stay. |

## Variants

- **variant**: ghost, outline, secondary
- **size**: xs, sm, md
- **tone**: red, orange, yellow, green, teal, blue, purple, pink

## Tokens used

`palette-dot`, `accent`, `ring`

## Motion

- **arrival** · Root · _no motion_ — It arrives with the post or row it belongs to. A page that loads with likes already given must be still: nothing blooms on mount.
- **response** · Glyph · `motion-bloom` — Pressing it on is the moment. The glyph is 16px, so it needs real amplitude to read as an event: it grows from nothing past its size and settles, after a 90ms beat in which the ring leads. Inherits Button's motion-press for the press itself. Pressing off has no bloom — taking a like back is not a celebration.
- **transition** · Burst · _custom (outside the recipe layer)_ — The follow-through: <Burst> draws a disc that hollows into a ring and shifts colour, then dots thrown outward in the theme's palette families. Expressive only — under `subtle` or reduced motion it renders nothing and the fill alone answers the press. The count rolls with NumberTicker.
- **activity** · Root · _no motion_ — There is no in-between state to show: the like is shown at once, before it is saved.

## Accessibility

- A native <button> through Button, with `aria-pressed`. Enter and Space press it.
- The accessible name is the label then the count ("Like 1,301"); the burst is aria-hidden and the rolling digits are hidden behind the count's real text.
- The pressed state is carried by the filled glyph and `aria-pressed`, never by colour alone.
- Under reduced motion the glyph fills and the count changes at once; the bloom and the burst are dropped.

## Related

- Components: Toggle, Feedback, NumberTicker, Button

## Examples

### A post's likes

```tsx
import { LikeButton } from "@sableui/react"

<LikeButton count={post.likes} defaultPressed={post.liked} onPressedChange={(on) => api.like(post.id, on)} />
```

### Star a repository

```tsx
import { LikeButton } from "@sableui/react"

<LikeButton icon="star" tone="yellow" label="Star" variant="outline" count={repo.stars} format={{ notation: "compact" }} />
```

### Bare glyph

```tsx
import { LikeButton } from "@sableui/react"

<LikeButton label="Save recipe" />
```

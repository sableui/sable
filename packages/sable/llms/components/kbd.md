# Kbd

**Status:** stable

A keyboard key indicator. Renders a raised <kbd> key cap sized from the surrounding text, so one Kbd fits body copy, menus and tooltips; KbdGroup sets one cap per key for a combo. `mod` renders the platform modifier (⌘ or Ctrl); `variant="ghost"` is the bare label for menu rows and tooltips.

**Keywords:** keyboard, shortcut, key, kbd

## Usage

Use Kbd to display keyboard keys or shortcuts in help text, menus, and docs.

### Best practices

- Do: Use it only for literal keyboard input such as Cmd, Enter, or Esc.
- Do: Show a combo as one cap per key inside KbdGroup — `<KbdGroup><Kbd mod /><Kbd>K</Kbd></KbdGroup>` — not several keys typed into one cap.
- Do: Use `variant="ghost"` where the shortcut sits on a surface of its own — a menu row's trailing slot, a tooltip — so it reads as a hint, not a second control.
- Don't: Do not use Kbd as a decorative badge or button replacement.
- Don't: Do not set a text size on a Kbd. It sizes itself from the text around it.
- Don't: Do not hardcode ⌘ or Ctrl. The modifier differs by platform; use `<Kbd mod />`, which renders ⌘ on macOS/iOS and Ctrl elsewhere, or Windows users read Mac keys.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| mod | boolean | false | Render the platform's shortcut modifier in place of children: ⌘ on macOS and iOS, Ctrl everywhere else. Server-rendered as Ctrl and corrected on hydration. |
| variant | "key" \| "ghost" | "key" | `key`: a raised cap on the surface it sits on, with a heavier bottom edge as the key's lip. `ghost`: the bare label, for menu rows, tooltips and other surfaces that are already a frame. |
| className | string | — | Merge additional classes onto the key cap. |
| ...props | ComponentPropsWithRef<"kbd"> | — | All native <kbd> attributes (children, ref, etc.). |

## Tokens used

`border`, `border-strong`, `background`, `muted-foreground`

## Accessibility

- Uses the semantic <kbd> element so assistive tech announces keyboard input.
- KbdGroup is itself a <kbd> around the per-key caps — the HTML spelling of one key combination — so the combo is announced as a single piece of input.
- Sized in em from the surrounding text, so it scales with the user's text size and never shrinks below 12px.

## Related

- Components: Code, Menu, CommandMenu

## Examples

### Single keys

```tsx
import { Kbd } from "@sableui/react"

<Kbd>Esc</Kbd>
```

### Combo

```tsx
import { Kbd, KbdGroup } from "@sableui/react"

<KbdGroup><Kbd mod /><Kbd>K</Kbd></KbdGroup>
```

### In a menu row

```tsx
import { Kbd, MenuItem } from "@sableui/react"

<MenuItem>Search<KbdGroup className="ms-auto"><Kbd variant="ghost" mod /><Kbd variant="ghost">K</Kbd></KbdGroup></MenuItem>
```

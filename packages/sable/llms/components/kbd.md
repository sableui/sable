# Kbd

**Status:** stable

A keyboard key indicator. Renders a styled <kbd> key cap in monospace; compose several with a + between to show a shortcut combo. `mod` renders the platform modifier (⌘ or Ctrl).

**Keywords:** keyboard, shortcut, key, kbd

## Usage

Use Kbd to display keyboard keys or shortcuts in help text, menus, and docs.

### Best practices

- Do: Use it only for literal keyboard input such as Cmd, Enter, or Esc.
- Do: Keep multi-key shortcuts readable by separating individual keys.
- Don't: Do not use Kbd as a decorative badge or button replacement.
- Don't: Do not hardcode ⌘ or Ctrl. The modifier differs by platform; use `<Kbd mod />`, which renders ⌘ on macOS/iOS and Ctrl elsewhere, or Windows users read Mac keys.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| mod | boolean | false | Render the platform's shortcut modifier in place of children: ⌘ on macOS and iOS, Ctrl everywhere else. Server-rendered as Ctrl and corrected on hydration. |
| className | string | — | Merge additional classes onto the key cap. |
| ...props | ComponentPropsWithRef<"kbd"> | — | All native <kbd> attributes (children, ref, etc.). |

## Tokens used

`border`, `muted`, `muted-foreground`

## Accessibility

- Uses the semantic <kbd> element so assistive tech announces keyboard input.
- Monospace key text keeps single keys and symbols legible at small sizes.

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
import { Kbd, Row } from "@sableui/react"

<Row gap={1}><Kbd mod /><span>+</span><Kbd>K</Kbd></Row>
```

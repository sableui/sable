# Textarea

**Status:** stable

Styled native multi-line text control. Soft-square, card surface, --ring focus, and an aria-invalid destructive error state.

**Keywords:** textarea, multi line input, form, text

## Usage

Use Textarea for multi-line freeform text entry such as notes, descriptions, or messages.

### Best practices

- Do: Use labels, helper text, and character limits when expectations are specific.
- Do: Size it to the expected amount of input without making the page feel blocked.
- Do: Keep a focusable field at 16px or larger on mobile. iOS Safari zooms the whole page when a focused textarea computes under 16px and never zooms back out. Textarea handles this itself — below the sm breakpoint it renders text-body-lg (17px) and returns to text-body-md at sm and up. Build a custom field the same way: a second paired tier under a max-sm: variant, never a hand-set font-size.
- Don't: Do not override the type with a page tier below 16px (text-body-md, text-body-sm) without a >=16px mobile arm — that reintroduces the iOS focus zoom.
- Don't: Do not use Textarea for short single-line values; use Input.
- Don't: Do not leave it at the default height for long-form input. A two-row textarea for a paragraph forces the user to write through a letterbox.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| aria-invalid | boolean | — | When true, swaps the input border to the destructive token to signal a validation error. |
| disabled | boolean | false | Dims the control to 50% and blocks pointer interaction. |
| rows | number | — | Native textarea row count. The floor is min-h-20 on the spacing scale, so it moves with density. |
| autoResize | boolean | false | Grows to fit content via CSS field-sizing: content (no JS). The min-height stays the floor; browsers without field-sizing fall back to the fixed min-height. |
| ...props | ComponentPropsWithRef<"textarea"> | — | All native textarea attributes (value, placeholder, onChange, name, ref, …). |

## Tokens used

`input`, `card`, `foreground`, `muted-foreground`, `ring`, `destructive`

## Accessibility

- Renders a native <textarea> — label association, keyboard, and screen-reader semantics come for free.
- Renders through Base UI's Field.Control: inside a Field it picks up the label, description, error and validity wiring from context.
- Pair with a <label htmlFor> (or aria-label) for an accessible name.
- Set aria-invalid and reference an error message via aria-describedby to announce validation failures.
- Focus-visible draws a 2px ring in the --ring token.

## Related

- Components: Input, Form, Label

## Examples

### Default

```tsx
import { Textarea } from "@sableui/react"

<Textarea placeholder="Write a caption…" />
```

### With rows

```tsx
import { Textarea } from "@sableui/react"

<Textarea rows={6} placeholder="Tell your team what this project is for…" />
```

### Auto-resize

```tsx
import { Textarea } from "@sableui/react"

<Textarea autoResize placeholder="Grows as you type…" />
```

### Invalid

```tsx
import { Textarea } from "@sableui/react"

<Textarea aria-invalid defaultValue="Too long" />
```

### Disabled

```tsx
import { Textarea } from "@sableui/react"

<Textarea disabled defaultValue="Notes lock once the invoice is sent." />
```

# Input

**Status:** stable

Styled native text input. Soft-square (rounded-sm), card surface, 2px focus ring; aria-invalid raises the destructive error treatment.

**Keywords:** input, text input, field, form, email, search, file, invalid, validation

## Usage

Use Input for short freeform text, search, email, password, file, and native input types. In forms, wrap Input in Field so label, description, required state, and validation messaging stay accessible and consistent.

### Best practices

- Do: Pair every Input with a visible label through Field or an explicit label/htmlFor connection.
- Do: Use type, inputMode, autoComplete, and placeholder as progressive hints, not as the only label.
- Do: Set aria-invalid or use Field error copy when validation fails.
- Do: Keep a focusable field at 16px or larger on mobile. iOS Safari zooms the whole page when a focused input computes under 16px and never zooms back out. Input handles this itself — below the sm breakpoint it renders text-body-lg (17px) and returns to text-body-md at sm and up. Build a custom field the same way: a second paired tier under a max-sm: variant, never a hand-set font-size.
- Don't: Override an Input's type with a page tier below 16px (text-body-md, text-body-sm, text-label-*) without a >=16px mobile arm — that reintroduces the iOS focus zoom.
- Don't: Use placeholder text as the label; it disappears once the user types and is not enough context.
- Don't: Use Input for long body copy. Use Textarea for multi-line content.

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| Input | yes | The native input element with Sable surface, disabled, focus, and invalid styling. |
| Label | yes | Usually provided by Field or a separate Label. It gives the input its visible purpose. |
| Description | no | Optional helper copy connected through aria-describedby when using Field. |
| Error | no | Validation message paired with aria-invalid and destructive styling. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| size | "md" \| "xs" | "md" | md is the form field. xs is the dense inset field of a tool panel (an inset canvas fill, no outline, tight padding) — the same ladder as Select and Combobox. Use it instead of overriding the height with className. |
| type | string | "text" | Native input type (text, email, password, search, number, file, …). type="file" themes the native selector button via file: token utilities. |
| disabled | boolean | false | Dims the control and blocks pointer interaction. |
| aria-invalid | boolean | — | Surfaces the destructive border + ring. Base UI form fields set this automatically. |
| ...props | ComponentPropsWithRef<"input"> | — | All native input attributes (placeholder, value, onChange, ref, …) pass through. |

## Variants

- **size**: md, xs

## Tokens used

`input`, `card`, `foreground`, `muted-foreground`, `ring`, `destructive`

## Accessibility

- Renders a native <input> — labels, keyboard, and form semantics come for free.
- Renders through Base UI's Input (Field.Control): inside a Field it picks up the label, description, error and validity wiring from context, even when nested in a wrapper.
- Always associate a <label htmlFor> (or wrap) — placeholder text is not a label.
- Focus-visible ring uses the --ring token at 40% opacity.
- Set aria-invalid='true' on error so the destructive treatment is conveyed, not color-only.

## Related

- Components: Field, Form, Textarea, SearchInput, NumberField
- Patterns: SettingsPage, AuthPage

## Examples

### Default

```tsx
import { Input } from "@sableui/react"

<Input placeholder="Search posts" />
```

### With a label

```tsx
import { Field, Input } from "@sableui/react"

<Field label="Email"><Input type="email" placeholder="you@example.com" /></Field>
```

### Field with helper text

```tsx
import { Field, Input } from "@sableui/react"

<Field label="Display name" description="Shown on your public profile."><Input placeholder="Nova Reed" /></Field>
```

### Field error

```tsx
import { Field, Input } from "@sableui/react"

<Field label="Email" error="Enter a valid email address."><Input type="email" defaultValue="not-an-email" /></Field>
```

### Search input

```tsx
import { Field, Input } from "@sableui/react"

<Field label="Search posts"><Input type="search" placeholder="Search by title, creator, or tag" /></Field>
```

### Invalid

```tsx
import { Input } from "@sableui/react"

<Input aria-invalid defaultValue="not-an-email" />
```

### File

```tsx
import { Input } from "@sableui/react"

<Input type="file" accept="image/*" />
```

### Disabled

```tsx
import { Input } from "@sableui/react"

<Input disabled placeholder="Disabled" />
```

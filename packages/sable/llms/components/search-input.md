# SearchInput

**Status:** stable

Styled search field with a leading magnifier and a clearable X. Soft-square (rounded-sm), card surface, 2px focus ring; the clear button appears only when there is a value.

**Keywords:** search, input, filter, query

## Usage

Use SearchInput for text queries that filter or search a known content set.

### Best practices

- Do: Use a clear placeholder that names the content being searched.
- Do: Provide a visible clear affordance when query state persists.
- Do: When a button stands in for search (a header trigger that opens CommandMenu with ⌘K), use CommandMenuTrigger. It wears this field's shell from the same source, so the two cannot drift; a hand-styled button already did once, into a borderless chip that matched neither the field nor a button.
- Don't: Do not use SearchInput as a command palette; use CommandMenu for global commands, opened from the header by CommandMenuTrigger. A SearchInput that opens a dialog on focus is a text box you cannot type in.
- Don't: Do not search on every keystroke against an expensive backend without debouncing. The user sees results flicker and reorder under them, and you send a request per character.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| value | string | — | Controlled value of the search field. |
| defaultValue | string | — | Uncontrolled initial value. The field tracks its own text, so the clear button still appears and empties it. |
| className | string | — | Sizes and places the whole field — magnifier, input and clear button together (e.g. max-w-80). A width cap here keeps the clear button inside the field. |
| inputClassName | string | — | Classes for the <input> element alone, for the rare input-only override. |
| onValueChange | (value: string) => void | — | Called with the next string on every keystroke. |
| onClear | () => void | — | Called when the clear button is pressed. The component also fires onValueChange('') so a controlled value resets. |
| placeholder | string | "Search" | Placeholder text shown when the field is empty. |
| disabled | boolean | false | Dims the control and blocks pointer interaction. |
| ...props | ComponentPropsWithRef<"input"> | — | All native input attributes (name, autoFocus, ref, aria-invalid, …) pass through to the <input> except value/onChange, which are owned by value/onValueChange, and className, which sizes the whole field. |

## Tokens used

`input`, `card`, `foreground`, `muted-foreground`, `ring`, `destructive`

## Accessibility

- Renders a native <input type="search"> — keyboard and form semantics come for free.
- Associate a <label htmlFor> (or wrap) — the magnifier glyph is decorative, not a label.
- The leading search Icon is pointer-events-none and purely decorative.
- The clear button is a real <button> (Sable's ghost icon Button) with aria-label='Clear search' and a focus-visible ring. It is hidden while the field is disabled.
- Focus-visible draws a 2px ring in the --ring token; aria-invalid raises the destructive border and ring.

## Related

- Components: Input, CommandMenu, Combobox

## Examples

### Controlled

```tsx
import { SearchInput } from "@sableui/react"

const [q, setQ] = useState("")
<SearchInput value={q} onValueChange={setQ} placeholder="Search posts" />
```

### With onClear

```tsx
import { SearchInput } from "@sableui/react"

<SearchInput value={q} onValueChange={setQ} onClear={() => console.log("cleared")} />
```

### Uncontrolled, sized as a whole

```tsx
import { Field, SearchInput } from "@sableui/react"

<Field label="Search posts"><SearchInput defaultValue="editions" className="max-w-80" /></Field>
```

### Disabled

```tsx
import { SearchInput } from "@sableui/react"

<SearchInput disabled placeholder="Search" />
```

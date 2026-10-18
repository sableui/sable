# InputGroup

**Status:** stable

An Input with addons inside the same field: a prefix or suffix ("https://", ".com", "$"), an icon, or a borderless Button such as copy or reveal. One shell, one focus ring, one error state; a Field's label and error wiring reaches the Input inside.

**Keywords:** input group, input addon, prefix, suffix, adornment, url input, currency input, password reveal, copy field, icon in input

## Usage

Use InputGroup when something belongs inside the field with the text: a unit, a fixed prefix, an icon, or a small action on the value itself (copy, reveal, clear). Use Field's `trailing` for an action beside the field (Apply next to a promo code), SearchInput for search, and NumberField for numbers with steppers.

### Best practices

- Do: Keep text addons short and fixed ("https://", "kg", "USD"). They are part of the field, not its label.
- Do: For a button addon, use a borderless Button (`variant="ghost"`, `size="icon-sm"`) with an aria-label. The addon tightens around it, so it sits as far from the edge as from the top and bottom.
- Do: Wrap the group in Field for a label and errors: `<Field label="Website"><InputGroup leading="https://"><Input /></InputGroup></Field>`.
- Don't: Do not put the value's meaning only in an addon. A screen reader hears the label and the text, so "Price (USD)" belongs in the label too.
- Don't: Do not restyle an Input to fake an addon; the group owns the border, the fill and the ring.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| leading | ReactNode | — | Inside the field, before the text: a prefix ("https://", "$"), an icon, or a borderless Button. |
| trailing | ReactNode | — | Inside the field, after the text: a suffix (".com", "kg"), an icon, or a borderless Button (copy, reveal, clear). |
| children | ReactElement | — | The single `<Input />`. It keeps its own props and type; the group takes over its border, fill and focus ring. |
| id / required / disabled / aria-describedby / aria-invalid | control props | — | Forwarded to the Input, not set on the group. This is how a Field's wiring reaches the text box when the group is its child. |
| className | string | — | Layout classes for the group (width, margins). |

## Tokens used

`field-border`, `field`, `ring`, `destructive`, `muted-foreground`, `foreground`

## Motion

- **arrival** · Root · _no motion_ — It arrives with the form it belongs to. A field that animated in on its own would be briefly unusable for no stated reason.
- **response** · Root · `motion-interactive` — The shell owns one focus ring for the input and its addons and eases it in, so focusing the text, or tabbing to a copy button inside the field, reads as the one field taking focus.
- **transition** · Root · `motion-interactive` — An invalid value turns the shell's edge destructive on the same ease, so the error lands as the field changing state rather than a red box swapping in.
- **activity** · Root · _no motion_ — A field does no work of its own. A pending check (an availability lookup) puts a Spinner in `trailing`, which is where its answer will appear.

## Accessibility

- The Input stays the focusable control; the group draws the focus ring around the whole field while it is focused.
- Inside a Field, the label, description and error are wired to the Input itself, not the group.
- Text addons are plain text beside the input, read in order; put a unit or currency in the label as well so it is not only visual.
- A button addon is a real Button with its own focus stop and needs an aria-label.

## Related

- Components: Input, Field, SearchInput, NumberField, Button

## Examples

### Prefix and suffix

```tsx
import { Field, Input, InputGroup } from "@sableui/react"

<Field label="Website"><InputGroup leading="https://" trailing=".com"><Input placeholder="example" /></InputGroup></Field>
```

### Leading icon

```tsx
import { Field, Icon, Input, InputGroup } from "@sableui/react"

<Field label="Email"><InputGroup leading={<Icon name="mail" />}><Input type="email" placeholder="you@example.com" /></InputGroup></Field>
```

### Copy button

```tsx
import { Button, Field, Icon, Input, InputGroup } from "@sableui/react"

<Field label="API key"><InputGroup trailing={<Button variant="ghost" size="icon-sm" aria-label="Copy key" onClick={copy}><span aria-hidden="true" className="motion-icon-swap"><span data-active={!copied} className="inline-flex"><Icon name="copy" /></span><span data-active={copied} className="inline-flex"><Icon name="check" /></span></span></Button>}><Input readOnly value={key} /></InputGroup></Field>
```

### Password with reveal

```tsx
import { Button, Field, Icon, Input, InputGroup } from "@sableui/react"

<Field label="Password"><InputGroup trailing={<Button variant="ghost" size="icon-sm" aria-label={shown ? "Hide password" : "Show password"} aria-pressed={shown} onClick={() => setShown(!shown)}><Icon name={shown ? "eye-off" : "eye"} /></Button>}><Input type={shown ? "text" : "password"} autoComplete="current-password" /></InputGroup></Field>
```

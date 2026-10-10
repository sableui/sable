# Form

**Status:** stable

A styled <form> plus Field — the form orchestration layer, built on Base UI Form and Field. Field wires a label, control, helper text, and error message together with correct a11y (htmlFor, aria-labelledby, aria-describedby, aria-invalid, required) automatically, around any Sable control. Validation-library-agnostic: pass each Field an error string, or let Form check native constraints and Field validate functions on submit.

**Keywords:** form, field, label, validation, error, required, settings, input

## Usage

Use Form and Field as the default wrapper for Sable form controls. Field owns the label, description, required state, and error wiring so agents do not hand-roll inconsistent label/input relationships.

### Best practices

- Do: Wrap each control in Field unless a specialized component already owns its label and error semantics.
- Do: Use Field error for validation messages so aria-invalid and aria-describedby are wired together.
- Do: For built-in checks, put required / type="email" / minLength on the control (or a validate function on Field) inside a Form: on submit the message appears under the field and the first invalid control is focused. Pass server errors to Form errors, keyed by Field name.
- Do: Use horizontal Field orientation only for one-line boolean controls like Checkbox, Switch, or Radio.
- Don't: Use placeholder text as the only label. A visible label should identify the field.
- Don't: Wrap multiple controls in one Field. Field expects a single child control and wires that one control (an Input or Textarea nested in a wrapper is still found through context).

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| Form | yes | The native form element (Base UI Form) with vertical field spacing; validates its Fields on submit. |
| Field | yes | The label/control/helper/error wrapper for one control. |
| Control | yes | The single Sable control. Base UI-backed controls register with Field through context; the child is also cloned with the same wiring. |
| Error | no | Validation copy associated with the control: the error prop when set, otherwise the Base UI validation message (native constraint, validate function, or Form errors). |

## Subcomponents

| Name | Type | Description |
| --- | --- | --- |
| Field | { label?: ReactNode; description?: ReactNode; error?: ReactNode; required?: boolean; disabled?: boolean; name?: string; validate?: (value, formValues) => string \| string[] \| null \| Promise<…>; validationMode?: "onSubmit" \| "onBlur" \| "onChange"; validationDebounceTime?: number; orientation?: "vertical" \| "horizontal"; className?: string; children: ReactElement } | Wraps a single control element (e.g. <Input />) on Base UI Field and wires label (htmlFor + aria-labelledby), helper text and error (aria-describedby), aria-invalid, and required onto it automatically. Base UI-backed controls (Input, Textarea, Select, Combobox, NumberField, Checkbox, Switch, Slider, OtpField…) register through context; the child is also cloned so plain elements keep the same wiring. error renders a destructive message and takes precedence; without it the slot shows Base UI's validation message when the field fails (native constraint, validate, or Form errors). required adds the native attribute plus a visual asterisk (defaults to false). disabled disables the control and dims the label. name keys the field in Form errors / onFormSubmit. validationMode overrides the Form's. orientation defaults to "vertical" (label → control); "horizontal" places control then label inline for a single checkbox / switch / radio — the control centres on the label's first line (it stays there when the label wraps) and description/error sit in the label's column. The root, label, description, error and control carry data-invalid / data-valid, data-touched, data-dirty, data-filled, data-focused and data-disabled for state styling. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| Form | { validationMode?: "onSubmit" \| "onBlur" \| "onChange"; errors?: Record<string, string \| string[]>; onFormSubmit?: (values, details) => void; actionsRef?: RefObject<Form.Actions> } + ComponentPropsWithRef<"form"> | — | A <form> laid out as a vertical column with comfortable field spacing (override with className, e.g. gap-4). On submit it validates every Field (native constraints plus Field validate), shows each message under its field, focuses the first invalid control, and only then calls onSubmit. validationMode defaults to "onSubmit" (then live re-validation on change). errors shows external (e.g. server) messages keyed by Field name and clears one when its field is edited. onFormSubmit receives the named Field values and prevents the native submit. A control outside any Field is still checked by the browser before onSubmit runs; pass noValidate to skip that. |
| validationMode | "onSubmit" \| "onBlur" \| "onChange" | "onSubmit" | When Fields validate. After the first submit, fields re-check as the user edits. A Field's own validationMode wins. |
| errors | Record<string, string \| string[]> | — | External (e.g. server) messages keyed by Field name, shown under that field. Each clears when its field is edited. |
| onFormSubmit | (values: Record<string, unknown>, details) => void | — | Called with the named Field values after validation passes; prevents the native submit. |
| actionsRef | RefObject<{ validate(name?: string): void }> | — | Imperative handle to validate every field, or one by name. |

## Tokens used

`muted-foreground`, `destructive`

## Accessibility

- Field auto-wires label htmlFor ↔ control id, aria-describedby (description + error), and aria-invalid — so the label, helper, and error are all announced for the control.
- required adds the native `required` attribute (not just a visual asterisk); the asterisk is aria-hidden.
- Error text is associated via aria-describedby and reinforced by the destructive color, not color alone.
- Inside Form, a failed submit focuses the first invalid control and shows its message inline instead of a browser bubble.

## Related

- Components: Input, Textarea, Select, Checkbox, Switch, Button
- Patterns: SettingsPage, AuthPage

## Examples

### Text field

```tsx
import { Field, Input } from "@sableui/react"

<Field label="Email" description="We'll never share it." required><Input type="email" /></Field>
```

### Field with an error

```tsx
import { Field, Input } from "@sableui/react"

<Field label="Password" error="Must be at least 8 characters."><Input type="password" /></Field>
```

### Validated on submit

```tsx
import { Button, Field, Form, Input } from "@sableui/react"

<Form onSubmit={handleSubmit}><Field label="Handle" required validate={(value) => String(value).length < 3 ? "At least 3 characters." : null}><Input name="handle" /></Field><Button type="submit">Claim</Button></Form>
```

### Server errors

```tsx
import { Field, Form, Input } from "@sableui/react"

<Form errors={serverErrors}><Field label="Email" name="email"><Input type="email" /></Field></Form>
```

### Form

```tsx
import { Button, Checkbox, Field, Form, Input } from "@sableui/react"

<Form onSubmit={handleSubmit}><Field label="Name"><Input /></Field><Field label="Subscribe" orientation="horizontal"><Checkbox /></Field><Button type="submit">Save</Button></Form>
```

### Settings form

```tsx
import { Button, Field, Form, Input, Select, SelectContent, SelectItem, SelectTrigger } from "@sableui/react"

<Form onSubmit={handleSubmit}><Field label="Display name" description="Shown on your profile."><Input defaultValue="Nova Reed" /></Field><Field label="Visibility"><Select defaultValue="public"><SelectTrigger /><SelectContent><SelectItem value="public">Public</SelectItem><SelectItem value="private">Private</SelectItem></SelectContent></Select></Field><Button type="submit">Save changes</Button></Form>
```

# OtpField

**Status:** stable

One-time-code entry over Base UI's OTP Field — one slot per character, SMS autofill on the first slot, paste fills every slot, and only one tab stop for the whole code.

**Keywords:** otp, one-time code, one-time password, verification code, 2fa, two-factor, mfa, pin, passcode, input otp

## Usage

Use OtpField for a short, fixed-length code the user copies from somewhere else — an SMS or email verification code, an authenticator app, a device pairing PIN. The slots show how long the code is and where the user is in it, which a plain Input cannot.

### Best practices

- Do: Set `length` to the exact length the server sends, and verify in `onValueComplete` (or with `autoSubmit` inside a form). Most users paste or autofill the whole code at once, so the moment of completion is the natural submit.
- Do: Label it through a `Field` ("Verification code") and say where the code was sent in the description. The first slot takes the field's name; the rest are announced by position.
- Do: Use `groupSize` for codes of 6 or more so the user can check the code in chunks against the message they are reading from.
- Do: Clear the error as soon as the user edits the code (`onValueChange` → reset the error), and set it again when the next code is refused. Each refusal is then a fresh change to invalid, so the field shakes for every wrong code, not only the first.
- Don't: Do not use OtpField for a password, an arbitrary-length PIN, or anything the user types from memory. Slots promise a fixed length; use Input with `type="password"` and `autocomplete="current-password"` instead.
- Don't: Do not intercept paste or clear the field on a wrong code before the user has seen the error. Blocking paste breaks SMS autofill and password managers, and wiping the slots erases the evidence of which digit was wrong.
- Don't: Do not swap it for NumberField because the code is digits. A code is an identifier, not a quantity: NumberField strips leading zeros and offers steppers that make no sense here.

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| Root | yes | A role=group that holds the value, carries the field label and description, and reports completion. |
| Slot | yes | One input per character. The first carries autocomplete="one-time-code" and accepts the whole code. |
| Group gap | no | A decorative dash inserted every `groupSize` slots; hidden from assistive tech. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| length | number | 6 | Number of character slots. Completion fires when every slot is filled. |
| groupSize | number | — | Insert a visual gap every N slots (3 renders 123 – 456). The value stays one contiguous string. |
| value / defaultValue | string | — | Controlled / uncontrolled code. |
| onValueChange | (value: string, details) => void | — | Fires on every edit. `details.reason` is input-change, input-clear, input-paste or keyboard. |
| onValueComplete | (value: string, details) => void | — | Fires once every slot is filled — the place to verify the code. Also fires when a complete code is pasted over a complete value. |
| onValueInvalid | (attempted: string, details) => void | — | Fires when typed or pasted text contains characters `validationType` rejects, so you can explain the rejection rather than letting it vanish. |
| validationType | "numeric" \| "alpha" \| "alphanumeric" \| "none" | "numeric" | Which characters a slot accepts. Also picks the virtual keyboard (numeric → number pad). |
| autoSubmit | boolean | false | Submit the owning form when the code becomes complete. |
| mask | boolean | false | Render slots as password inputs. Only for codes that are secret on screen, such as a card PIN. |
| getSlotLabel | (index: number, length: number) => string | Character N of L | Accessible name for slots after the first. Override to localize. |
| aria-invalid | boolean | — | Marks every slot invalid (destructive border and digits). Turning it on after mount shakes the field once. `<Field error>` sets it for you. |
| motion | "full" \| "subtle" \| "off" | "full" | How much motion this component uses: `full` (default) inherits the app's policy, `subtle` keeps feedback and drops the flourish, `off` stills it. It can only turn motion down — it never overrides a reader's reduce-motion setting. The shake is the flourish; the destructive colour stays at every level. |
| disabled / readOnly / required / name / id / form | — | — | Standard form-control props. `id` lands on the first slot, so `<Field>` and `<label htmlFor>` name the field. |

## Tokens used

`input`, `card`, `foreground`, `muted-foreground`, `border-strong`, `primary`, `ring`, `destructive`

## Motion

- **arrival** · Root · _no motion_ — A code field is part of the form it sits in and appears with it. Animating it in would delay the one thing the user arrived to do — paste the code they just copied.
- **response** · Slot · `motion-interactive` — Focus moves between slots on every keystroke. The eased ring and border are what let the eye follow the cursor across six identical boxes instead of hunting for it after each digit.
- **transition** · Slot · `motion-interactive` — A filled slot strengthens its border, so a pasted code visibly lands in every slot at once. Easing it reads as the code arriving rather than the field flickering.
- **transition** · Root · `motion-shake` — A refused code shakes the field once as it turns invalid — the short horizontal no that makes a second wrong code feel noticed rather than ignored. It never carries the refusal alone: the digits and borders turn destructive and the Field says why. It plays on the change to invalid, not on mount, and is expressive, so `subtle` keeps only the colour.
- **activity** · Root · _no motion_ — Verifying the code is the form's work, not the field's. Show it on the submit Button's `loading` state, where the user expects the answer to appear.

## Accessibility

- The root is a role=group named by the field label; the first slot shares the label through `id`/`htmlFor`, and later slots are announced by position ("Character 2 of 6").
- Only one slot is in the tab order. Arrow keys, Home/End and Backspace move between slots; Tab leaves the whole field.
- The first slot carries autocomplete="one-time-code" and the numeric virtual keyboard, so iOS and Android offer the SMS code above the keyboard.
- Slots render at 20px (`text-mono-lg`), above the 16px floor that stops iOS Safari zooming on focus.
- An invalid code is never signalled by motion alone: every slot carries aria-invalid, the digits and borders turn destructive, and the Field's error message is wired through aria-describedby. The shake resolves instantly under reduced motion and `subtle`.

## Related

- Components: Input, Form, NumberField

## Examples

### Six digits

```tsx
import { Field, OtpField } from "@sableui/react"

<Field label="Verification code"><OtpField length={6} onValueComplete={verify} /></Field>
```

### In a field, grouped

```tsx
import { Field, OtpField } from "@sableui/react"

<Field label="Verification code" description="Enter the 6-digit code we sent to your phone."><OtpField length={6} groupSize={3} /></Field>
```

### With an error

```tsx
import { Field, OtpField } from "@sableui/react"

<Field label="Verification code" error="That code has expired. Request a new code and try again."><OtpField length={6} groupSize={3} defaultValue="482913" /></Field>
```

### Verify on completion, shake on a wrong code

```tsx
import { Field, OtpField } from "@sableui/react"

const [code, setCode] = useState("")
const [wrong, setWrong] = useState(false)
<Field label="Verification code" error={wrong ? "That code does not match. Check the message and try again." : undefined}><OtpField length={6} groupSize={3} value={code} onValueChange={(next) => { setCode(next); setWrong(false) }} onValueComplete={(value) => setWrong(value !== expected)} /></Field>
```

### Alphanumeric

```tsx
import { Field, OtpField } from "@sableui/react"

<Field label="Pairing code"><OtpField length={8} groupSize={4} validationType="alphanumeric" /></Field>
```

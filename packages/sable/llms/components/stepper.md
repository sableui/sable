# Stepper

**Status:** stable

Where the user is in a multi-step flow — an ordered list of numbered steps, horizontal or vertical, each complete, current, upcoming or in error, with aria-current="step" on the current one. `indicator="dot"` turns it into a timeline of events (an order's delivery) with dots instead of numbers.

**Keywords:** stepper, steps, wizard, multi-step form, checkout steps, onboarding progress, progress steps, timeline

## Usage

Use Stepper above or beside a flow that is split into a known, small number of named steps — checkout, onboarding, an import wizard — so the user can see how far they have come and what is left. It reports position; the flow's own Back and Continue buttons move it.

### Best practices

- Do: Drive it from one number (`current`) and override a single step's `status` only for what a number cannot say — a completed step that now needs attention is `status="error"`.
- Do: Name steps with a word or two ("Shipping", "Payment"). Go vertical when steps need a description or there are more than five; horizontal titles truncate first.
- Do: Give completed steps `onSelect` only when going back to edit them actually works, and keep the user's later answers when they do.
- Don't: Do not use Stepper for a task with unknown length or for a percentage. That is Progress; a stepper promises a fixed set of named stops.
- Don't: Do not use it as navigation between independent sections. Sections the user can visit in any order are Tabs; a stepper implies each step depends on the one before.
- Don't: Do not make upcoming steps pressable to skip ahead. A step that looks reachable but is not is worse than one that is plainly locked.

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| Stepper | yes | The ordered list. Takes `current` and `orientation`, and an aria-label naming the flow. |
| StepperItem | yes | One step: a numbered disc (a check when complete, a warning mark on error) — or, with `indicator="dot"`, a dot centred on the title's first line — a title, and an optional description. |
| Connector | no | The line to the next step, filled once this step is complete. Drawn automatically between items. |

## Subcomponents

| Name | Type | Description |
| --- | --- | --- |
| StepperItem | { title: ReactNode; description?: ReactNode; status?: StepStatus; onSelect?: () => void } + li props | One step. `status` overrides the derived state; `onSelect` makes the disc and title a button for returning to the step. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| current | number | 0 | Zero-based index of the current step. Earlier steps derive complete, later ones upcoming. |
| orientation | "horizontal" \| "vertical" | "horizontal" | Horizontal for a short flow across the top of a form; vertical for long flows, narrow columns or steps with descriptions. A horizontal stepper narrower than 28rem (a phone) compacts itself: every disc stays, only the current step's title shows, and the other titles stay for screen readers. No breakpoint code needed. |
| indicator | "number" \| "dot" | "number" | `number` for a flow the user moves through; `dot` for a timeline of events (delivery tracking, a document's history) where the position number adds nothing. The dot centres on the title's first line and scales with its type at every density. |
| statusLabels | Partial<Record<StepStatus, string>> | — | Screen-reader status words appended to each title (Completed, Current step, Not started, Needs attention). Override to localize. |
| aria-label | string | — | Names the flow ("Checkout progress"). Every Stepper needs one. |

## Variants

- **orientation**: horizontal, vertical
- **indicator**: number, dot
- **status**: complete, current, upcoming, error

## Tokens used

`primary`, `primary-foreground`, `background`, `foreground`, `muted-foreground`, `border-strong`, `destructive`, `destructive-foreground`, `ring`

## Motion

- **arrival** · Stepper · _no motion_ — The stepper frames the flow and is on screen before any step is. Animating it in would compete with the step content, which is what changed.
- **response** · StepperItem · `motion-interactive` — Only steps with onSelect respond, and the eased underline is what tells a returning user that this completed step can be reopened while the upcoming ones cannot.
- **transition** · Indicator · `motion-interactive` — When the user continues, the disc they leave fills and its connector darkens. Easing the colour makes that read as one step completing rather than the whole bar re-rendering.
- **activity** · Stepper · _no motion_ — A step is a place, not a process. Saving or validating between steps belongs on the Continue button's loading state; a pulsing disc would suggest the step itself is busy.

## Accessibility

- Renders an ordered list, so assistive tech announces the step count and each step's position.
- The current step carries aria-current="step"; every title also gets a visually hidden status word (Completed, Not started, Needs attention), so state never depends on colour or the disc glyph.
- Discs and connectors are aria-hidden — the number is already the list position.
- Steps with onSelect render as native buttons with a visible focus ring; steps without it are not focusable.

## Related

- Components: Progress, Tabs, Form, Button

## Examples

### Checkout

```tsx
import { Stepper, StepperItem } from "@sableui/react"

<Stepper current={1} aria-label="Checkout progress">
	<StepperItem title="Cart" />
	<StepperItem title="Shipping" />
	<StepperItem title="Payment" />
	<StepperItem title="Review" />
</Stepper>
```

### Vertical with descriptions

```tsx
import { Stepper, StepperItem } from "@sableui/react"

<Stepper orientation="vertical" current={2} aria-label="Workspace setup">
	<StepperItem title="Create account" description="Email verified" />
	<StepperItem title="Invite team" description="3 people invited" />
	<StepperItem title="Connect data" description="Choose a source to import from" />
	<StepperItem title="Launch" />
</Stepper>
```

### Delivery timeline (dots)

```tsx
import { Stepper, StepperItem } from "@sableui/react"

<Stepper orientation="vertical" indicator="dot" current={2} aria-label="Delivery status">
	<StepperItem title="Order placed" description="Oct 9, 10:14 AM" />
	<StepperItem title="Printed and packed" description="Oct 10, 4:02 PM" />
	<StepperItem title="Out for delivery" description="Arriving today by 6 PM" />
	<StepperItem title="Delivered" />
</Stepper>
```

### A completed step with an error

```tsx
import { Stepper, StepperItem } from "@sableui/react"

<Stepper current={2} aria-label="Checkout progress">
	<StepperItem title="Cart" onSelect={() => console.log("cart")} />
	<StepperItem title="Shipping" status="error" description="Address needs a postcode" onSelect={() => console.log("shipping")} />
	<StepperItem title="Payment" />
</Stepper>
```

# Feedback

**Status:** stable

A compact feedback popover. Composes Popover + Textarea + Button + Toggle into a rating row plus a message field; submitting reports the rating + message and closes the popover.

**Keywords:** feedback, sentiment, rating, prompt

## Usage

Use Feedback to collect lightweight sentiment, usefulness, or quality signals from users.

### Best practices

- Do: Ask for feedback at a moment when the user has enough context to answer.
- Do: Keep the prompt short and optional unless feedback is required by the workflow.
- Don't: Do not use Feedback for errors, alerts, or required support forms.
- Don't: Do not require the message field. Most feedback is a rating with no comment, and forcing prose is how a feedback control stops being used.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| label | string | "Feedback" | Trigger button text. |
| heading | string | "Send feedback" | Heading shown above the rating row. |
| placeholder | string | "What can we improve?" | Placeholder for the message field. |
| submitLabel | string | "Send" | Submit button text. |
| ratings | FeedbackRating[] | 🙁 / 😐 / 🙂 | The rating options shown as a row of toggles. Each is { value, label }. |
| onSubmit | (data: { rating?: string; message: string }) => void | — | Called with the selected rating + message when the form is submitted. |

## Tokens used

`popover`, `popover-foreground`, `border`, `input`, `card`, `foreground`, `muted-foreground`, `accent`, `accent-foreground`, `ring`

## Accessibility

- Trigger opens the popover on press; Base UI manages focus into the form and restores it to the trigger on close.
- The rating row is a Base UI ToggleGroup with arrow-key roving focus; each toggle carries an aria-label.
- The form is named by its heading (aria-labelledby), so it is announced as "Send feedback" rather than an unnamed form.
- The message field carries an aria-label matching its placeholder.
- Submit is disabled until there is a rating or a non-whitespace message. Either alone is a complete answer.

## Related

- Components: Toast, Banner, Form

## Examples

### Basic

```tsx
import { Feedback } from "@sableui/react"

<Feedback onSubmit={({ rating, message }) => console.log(rating, message)} />
```

### Custom labels

```tsx
import { Feedback } from "@sableui/react"

<Feedback label="Tell us" submitLabel="Send it" placeholder="Describe the issue…" />
```

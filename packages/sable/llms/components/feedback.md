# Feedback

**Status:** stable

A compact feedback popover. Composes Popover + Textarea + Button + Toggle into a rating row plus a message field; submitting reports the rating + message, shows a brief drawn-check thanks, and closes the popover.

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
| onSubmit | (data: { rating?: string; message: string }) => void | — | Called with the selected rating + message when the form is submitted. The thanks shows right away; send the report in the background. |
| successMessage | string | "Thanks for the feedback." | The line shown, and read out, for about 1.2s after sending, before the popover closes on its own. |
| motion | "full" \| "subtle" \| "off" | "full" | How much motion this component uses: `full` (default) inherits the app's policy, `subtle` keeps feedback and drops the flourish, `off` stills it. It can only turn motion down — it never overrides a reader's reduce-motion setting. The drawn check is the flourish; the thanks line and its dwell stay. |

## Tokens used

`popover`, `popover-foreground`, `border`, `input`, `card`, `foreground`, `muted-foreground`, `accent`, `accent-foreground`, `ring`, `success`, `success-mark`

## Motion

- **arrival** · Popover · `motion-pop` — The form opens from its trigger, so the eye goes from the button it pressed to the field it should type in. Popover owns the recipe.
- **response** · Rating toggles · `motion-interactive` — The rating row is a choice among a few similar marks. The eased selected fill is what makes the pick read as made, not just hovered.
- **response** · Chosen rating mark · `motion-bloom` — The mark itself answers the pick: it blooms past its size and settles, so choosing reads as a small decision landing rather than a fill changing. Only the chosen mark, only on choosing — nothing blooms when the form opens or a pick is let go. Expressive: under subtle the fill alone answers.
- **transition** · Thanks · `motion-tick` — Sending is the one moment the person needs to know their words arrived. The form fades out in place and a check draws itself in over it, then the popover closes. Without it the popover just vanished, which looks the same as the form being dismissed or the message lost.
- **activity** · Root · _no motion_ — The thanks shows as soon as the form is sent; delivery is the app's background work. A spinner for a one-line report would make a quick, optional gesture feel heavy.

## Accessibility

- Trigger opens the popover on press; Base UI manages focus into the form and restores it to the trigger on close.
- The rating row is a Base UI ToggleGroup with arrow-key roving focus; each toggle carries an aria-label.
- The form is named by its heading (aria-labelledby), so it is announced as "Send feedback" rather than an unnamed form.
- The message field carries an aria-label matching its placeholder.
- Submit is disabled until there is a rating or a non-whitespace message. Either alone is a complete answer.
- On send, focus moves to the thanks line (tabIndex=-1), which reads it out, and the form becomes inert so focus cannot land in invisible fields. The line is not also a live region, which read it twice. When the popover closes, Base UI returns focus to the trigger.
- The thanks dwell (about 1.2s) is a reading time, not motion, so it is the same under reduced motion.

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

### Custom thanks

```tsx
import { Feedback } from "@sableui/react"

<Feedback successMessage="Got it — thank you." onSubmit={({ rating, message }) => report(rating, message)} />
```

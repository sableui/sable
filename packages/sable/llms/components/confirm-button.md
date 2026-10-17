# ConfirmButton

**Status:** stable

An inline two-step confirm for a low-stakes destructive or irreversible action: the first press arms it ("Delete" → "Confirm delete?", destructive), a second press within a few seconds runs it, and leaving it disarms it.

**Keywords:** confirm, confirmation, two-step, press again, click again, arm, delete, remove, destructive, inline confirm, hold to confirm

## Usage

Use ConfirmButton when an action deserves one beat of second thought but not a modal: deleting a draft, removing a row, revoking one token, clearing a list that can be rebuilt. The question appears on the button the user is already pressing, so confirming costs one more press in the same place and backing out costs nothing.

### Best practices

- Do: Keep the idle label a plain verb ("Delete", "Remove", "Revoke") and let the confirm label ask about it ("Confirm delete?" by default, or `confirmLabel`). The user should read the consequence on the very control they are about to press again.
- Do: Leave room for it to grow. The button eases wider to fit the question, so give it space at the end of a row or in a table's action column rather than wedging it between fixed-width neighbours.
- Do: Return the promise from `onConfirm` when the action is async. The button stays armed with a spinner until it settles and refuses further presses, so a slow network cannot run it twice.
- Don't: Do not use it for high-stakes or wide-reaching actions — deleting a project, an account, anything other people depend on. Those need the consequence spelled out and a typed or deliberate confirmation; use DestructiveActionModal. → use **DestructiveActionModal**
- Don't: Do not use it where an undo is possible. If the action can be reversed, run it on the first press and offer Undo in a Toast — no question at all is faster than a good question. → use **Toast**
- Don't: Do not use it for a non-destructive primary action ("Save", "Send"). Asking twice for something harmless teaches people to press twice without reading, which is what defeats the confirm when it matters; use Button. → use **Button**

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| children | ReactNode | — | The idle label — the action, e.g. "Delete". |
| confirmLabel | ReactNode | "Confirm <label>?" | The label while armed. Defaults to "Confirm delete?" for a text label "Delete" (first letter lowered) and "Confirm?" otherwise. Pass it to localise. |
| onConfirm | () => unknown | — | Runs on the second press while armed. Return a promise to hold the button armed with a spinner until it settles. |
| timeout | number | 3000 | How long it waits for the second press, in ms. A decision time, so it is not scaled by motion settings. |
| variant | ButtonVariant | "secondary" | The idle look — any Button variant. |
| confirmVariant | ButtonVariant | "destructive" | The armed look — any Button variant. |
| size | "xs" \| "sm" \| "md" \| "cta" | "md" | A labelled Button size. Icon-only sizes are excluded: the label is the interaction. |
| icon | ReactNode | — | A leading icon kept through both states, e.g. `<Icon name="trash" />`. |
| disabled | boolean | false | Disables it; disabling while armed also disarms. |
| confirmHint | string | "Press again to confirm." | Read to assistive tech after the armed label when it arms. Override to localise. |
| motion | "full" \| "subtle" \| "off" | "full" | How much motion this component uses: `full` (default) inherits the app's policy, `subtle` keeps feedback and drops the flourish, `off` stills it. It can only turn motion down — it never overrides a reader's reduce-motion setting. The width easing and the draining countdown are the flourish; the label cross-fade and colour change stay. |

## Variants

- **variant**: primary, secondary, ghost, outline, destructive, link, floating, field, on-color, on-color-outline, on-color-ghost
- **confirmVariant**: destructive, primary, secondary, outline
- **size**: xs, sm, md, cta

## Tokens used

`secondary`, `secondary-foreground`, `destructive`, `destructive-foreground`, `ring`

## Motion

- **arrival** · Root · _no motion_ — It is a button in a row of actions, and arrives with that row. Its moment is the arming, not the mount.
- **response** · Root · `motion-press` — Inherited from Button with motion-interactive. The press settle confirms the first press landed even before the label has finished changing — which is what stops a second, accidental press.
- **transition** · Root · `motion-size` — Arming changes the label, so the button's width changes. Easing it makes the button visibly grow into the question and its neighbours travel, instead of the row jumping under the pointer that is about to press again. useAutoSize measures the content and writes a px width for motion-size to ease between (a content-sized box is width:auto before and after, which cannot transition). The labels cross-fade in one cell so there is never a frame with both or neither.
- **activity** · Countdown · _custom (outside the recipe layer)_ — While armed, a thin line drains along the foot of the button over the timeout — the only way to see that the question expires. A transition on scale, timed by the `timeout` prop and multiplied by the motion scale and expressive factor, so under reduced motion or `subtle` it is absent rather than frozen full.

## Accessibility

- A native <button> through Button. Focus stays on it through both presses; Enter and Space confirm exactly as a click does.
- Only the current label is in the accessible name — the other is aria-hidden — so the name changes to the question while armed.
- Arming is also announced through a polite role=status region outside the button ("Confirm delete? Press again to confirm."), because a focused button's name change is not read by every screen reader.
- Escape disarms and is consumed, so it does not also close the dialog or popover around it. Focus leaving, a press elsewhere, or the timeout disarm it too.
- A second press within 300ms of arming is ignored: a double-click is a habit, not a decision.
- Under reduced motion the label still changes and the colour still turns; only the width easing and countdown are dropped.

## Related

- Components: Button, DestructiveActionModal, Toast, OverflowMenu

## Examples

### Delete a row

```tsx
import { ConfirmButton, Icon } from "@sableui/react"

<ConfirmButton icon={<Icon name="trash" />} onConfirm={() => removeRow(id)}>Delete</ConfirmButton>
```

### Custom question, longer wait

```tsx
import { ConfirmButton } from "@sableui/react"

<ConfirmButton variant="ghost" size="sm" confirmLabel="Revoke this key?" timeout={5000} onConfirm={revokeKey}>Revoke</ConfirmButton>
```

### Async confirm

```tsx
import { ConfirmButton } from "@sableui/react"

<ConfirmButton onConfirm={() => api.deleteDraft(draft.id)}>Discard draft</ConfirmButton>
```

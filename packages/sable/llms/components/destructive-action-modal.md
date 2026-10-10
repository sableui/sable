# DestructiveActionModal

**Status:** stable

Confirmation modal for irreversible actions, built on AlertDialog (role=alertdialog; a backdrop click does not dismiss). Pairs a secondary Cancel with a destructive confirm; awaits an async onConfirm (spinner + stays open on failure) or takes an external pending flag; optional body slot and type-to-confirm guard for high-stakes deletions.

**Keywords:** destructive, modal, confirmation, danger

## Usage

Use DestructiveActionModal to confirm irreversible or high-risk actions before they run.

### Best practices

- Do: Name the affected object and the consequence of the action in plain language.
- Do: Make the destructive action visually distinct from the cancel path.
- Don't: Do not use it for routine low-risk actions where undo or inline confirmation would be faster.
- Don't: Do not put the destructive action where Cancel usually sits, or make it the default focus. A confirmation dialog exists to add friction; autofocusing Delete removes the friction it was added for.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| open | boolean | — | Controlled open state. |
| onOpenChange | (open: boolean) => void | — | Called when the open state should change (Esc, Cancel, or confirm). A backdrop click does not dismiss. |
| title | ReactNode | — | Modal heading — names the irreversible action. |
| description | ReactNode | — | Optional supporting copy explaining the consequence. |
| confirmLabel | string | "Delete" | Label for the destructive confirm button. |
| cancelLabel | string | "Cancel" | Label for the dismissing secondary button. |
| onConfirm | () => void \| Promise<void> | — | Called when the user confirms. If it returns a Promise the modal shows an in-flight spinner, closes on resolve, and stays open on reject; if void it closes immediately (unless pending is controlled). |
| pending | boolean | — | Externally-driven in-flight state. Overrides the internal await tracking; the parent owns closing (the modal stays open on a synchronous confirm). |
| confirmingLabel | string | confirmLabel | Confirm-button label shown while the action is in flight. |
| children | ReactNode | — | Body content rendered between the description and the type-to-confirm Input / footer — e.g. a warning <Note>. |
| confirmText | string | — | When set, renders an Input the user must type matching to enable the destructive confirm button. |

## Tokens used

`card`, `card-foreground`, `border`, `muted-foreground`, `foreground`, `input`, `destructive`, `destructive-foreground`, `secondary`, `secondary-foreground`

## Accessibility

- Built on AlertDialog (Base UI): role="alertdialog", focus trapping, scroll lock, and aria-modal. Esc dismisses; a click on the backdrop does not, so a stray click can't throw away the decision.
- Focus opens on Cancel — the safe action — even when a type-to-confirm Input comes first, so a reflexive Enter never fires the destructive action.
- The title labels the modal; the description describes it.
- The type-to-confirm Input is wired to its label via htmlFor; the destructive Button is disabled (not just hidden) until the text matches.
- While a confirm is in flight (awaited onConfirm or pending), both buttons disable, the confirm Button sets aria-busy, and Esc dismissal is blocked so the action can't be interrupted or double-fired.

## Related

- Components: Dialog, Button, Banner

## Examples

### Basic

```tsx
import { DestructiveActionModal } from "@sableui/react"

<DestructiveActionModal open={open} onOpenChange={setOpen} title='Delete post?' description='This permanently removes the post. This cannot be undone.' onConfirm={handleDelete} />
```

### Async confirm (awaited spinner)

```tsx
import { DestructiveActionModal } from "@sableui/react"

<DestructiveActionModal open={open} onOpenChange={setOpen} title='Block user?' description='They can no longer interact with you.' confirmLabel='Block' confirmingLabel='Blocking…' onConfirm={() => blockUser(id)} />
```

### Body slot + type-to-confirm

```tsx
import { DestructiveActionModal, Note } from "@sableui/react"

<DestructiveActionModal open={open} onOpenChange={setOpen} title='Delete this post?' confirmText='gold rush' confirmLabel='Delete forever' onConfirm={handleDelete}><Note tone='warning'>Collectors who minted this edition keep their copies.</Note></DestructiveActionModal>
```

# Toast

**Status:** stable

Imperative notification system over Base UI Toast — auto-dismiss timers, swipe-to-dismiss, focus management, ARIA live-region announcements, and a limit-aware stack. Wrap the app in ToastProvider, then push toasts from anywhere with the global, Sonner-shaped toast() (toast.success/error/info/warning/loading/promise/dismiss) or the useToast() hook inside components.

**Keywords:** toast, notification, snackbar, feedback, success, error, promise, loading, undo

## Usage

Use Toast for transient feedback caused by a user action: saved, failed, copied, queued, uploaded, or undone. Use Banner for persistent page/app state and InlineStatus or Field errors for feedback that must remain attached to content.

### Best practices

- Do: Mount one ToastProvider near the app root before any code calls toast() or useToast().
- Do: Use toast.promise for async actions so loading, success, and error states stay tied to one notification.
- Do: Keep toast copy short and outcome-focused. Add an action only when it is immediately useful, such as Undo.
- Don't: Use Toast for critical blockers or persistent outages. Use Banner or Dialog when the user must notice and act.
- Don't: Fire multiple toasts for one operation. Update the same toast when a task progresses.
- Don't: Put the only path to an action in a toast that auto-dismisses. An Undo that expires on a timer is data loss on a schedule, so error toasts and any toast carrying actionProps default to timeout 0 and wait to be read — pass an explicit timeout only when the action is also reachable somewhere else. When a timeout exists at all, 5s is the floor: anything shorter cannot be read and acted on.

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| Viewport | yes | The positioned live-region stack rendered by ToastProvider. |
| Surface | yes | The individual ToastRoot containing title, description, action, and close affordance. |
| Title | yes | Short outcome text, used as the accessible name. |
| Description | no | Optional detail or context beneath the title. |
| Action | no | Optional inline action such as Undo or Retry. |

## Subcomponents

| Name | Type | Description |
| --- | --- | --- |
| ToastRoot | Base UI Toast.Root props + className (requires the `toast` object) | A single toast surface. Animates enter/leave via data-[starting-style]/data-[ending-style]; swipe-to-dismiss is wired by Base UI. |
| ToastContent | Base UI Toast.Content props + className | The toast's contents as one row. In a stacked viewport it fades on the cards behind the front one and returns when the stack fans out. Wrap a hand-composed toast's parts in it so a stacked viewport can hide them. |
| ToastTitle | Base UI Toast.Title props + className | The toast headline (text-title-sm). Auto-associated as the toast's accessible name. |
| ToastDescription | Base UI Toast.Description props + className | Supporting body copy beneath the title (text-body-sm, muted). Auto-associated as the toast's accessible description. |
| ToastClose | Base UI Toast.Close props + className | Dismiss button. Base UI handles the close and leave animation; labelled "Dismiss" by default. |
| ToastAction | Base UI Toast.Action props + className | Inline action button (e.g. Undo). The imperative path renders one on every toast and Base UI sources its label and handler from that toast's `actionProps`, rendering nothing when there are none — so `toast(msg, { actionProps })` is all an action needs. Reach for the component directly only when composing a toast by hand; compose with render={<Button … />}. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| ToastProvider | { children, timeout?, limit?, closeIcon?, position?, stacked?, viewportClassName? } | — | Wraps Base UI Toast.Provider and renders the themed Viewport + toast list. Mount once near the app root, above any caller of useToast(). |
| position | "top-left" \| "top-center" \| "top-right" \| "bottom-left" \| "bottom-center" \| "bottom-right" | "top-right" | Screen anchor for the toast stack. |
| stacked | boolean | false | Stack the toasts like a deck of cards, the newest in front and the older ones peeking out behind it, a step smaller, instead of listing them one under another. Hovering or focusing the stack fans it out into the list. Use it when an app can raise several toasts in a row, so they don't take over the corner of the page. |
| viewportClassName | string | — | Extra classes merged LAST onto the fixed viewport region — for safe-area insets or an offset (e.g. clearing a sidebar). |
| timeout | number | 5000 | Default auto-dismiss time in ms for toasts. 0 keeps a toast until it is dismissed. Error toasts, loading toasts, and any toast carrying actionProps default to 0 regardless of this value; a per-toast timeout overrides both. |
| limit | number | 3 | Maximum toasts shown at once; older toasts are pushed out when the limit is exceeded. |
| closeIcon | ReactNode | <Icon name="xmark" /> | Override the dismiss-button glyph. The default already follows the injected icon set. |
| useToast / useToastManager | () => { toasts, add, close, update, promise } | — | Manager hook for use inside components. add({ title, description, timeout?, type?, priority?, actionProps? }) returns the new toast id and applies the same persistence default as toast.* — an error, loading, or actionProps toast stays until dismissed unless you pass a timeout. close(id), update(id, opts), and promise(p, opts) round out the API. |
| toast | (message, options?) => string  &  { success, error, warning, info, message, loading, promise, dismiss, update, add, custom } | — | Imperative singleton callable OUTSIDE React (event handlers, utilities, non-React code) — the Sonner-shaped surface that makes migrating a lib/toast wrapper a near drop-in. Requires a mounted <ToastProvider> (it binds the shared manager). Each call returns the toast id; toast.dismiss(id?) closes one or all; toast.promise(p, { loading, success, error }) and toast.update(id, opts) handle async + in-place updates. |
| type (toast option) | "success" \| "error" \| "warning" \| "info" \| "loading" | — | Set by the toast.* helpers. Drives a semantic left accent (success→success, error→destructive, warning→tone-warning, info→tone-info); loading shows a spinner. Both loading and error persist until updated or dismissed unless the call supplies a timeout. |

## Tokens used

`popover`, `popover-foreground`, `border`, `muted-foreground`, `accent`, `accent-foreground`, `secondary`, `secondary-foreground`, `ring`, `success`, `tone-warning`, `tone-info`, `destructive`

## Motion

- **arrival** · ToastRoot · `motion-slide-left` — A toast interrupts without being asked, so where it came from is the reader's first question. Sliding in from the viewport edge answers it and marks the toast as belonging to the edge rather than to whatever it happens to cover.
- **response** · ToastAction · `motion-interactive` — Toasts are on a timer, so the action has to look actionable at a glance — there is no time to hunt for the hit target.
- **transition** · ToastRoot · `motion-slide-left` — Leaving the same way it entered keeps the stack legible when several dismiss at once; toasts that fade in place leave the remaining ones jumping to fill gaps with no visible cause.
- **transition** · ToastRoot (stacked) · _custom (outside the recipe layer)_ — A stacked toast arrives from the anchored edge in front of the others, which step back and shrink to make room; hovering fans the deck out into the list. Moving every card, rather than snapping them, shows that the new one went on top and the old ones are still there.
- **activity** · ToastRoot · _no motion_ — A toast reports a result that has already happened. Anything still in flight belongs in the surface that started it, where the reader is still looking.

## Accessibility

- Base UI announces toasts through an ARIA live region — `low` priority is polite, `high` is assertive.
- Auto-dismiss timers pause on hover/focus and while the window is hidden.
- ToastClose is keyboard-focusable and labelled; Esc dismisses the focused toast.
- ToastClose draws a 24px box (21px against the desktop root) and carries a 24x24+ POINTER TARGET behind it, per WCAG 2.5.8 — the glyph stays quiet because a dismiss control should not be the loudest thing in a toast. Base UI keeps the button out of the accessibility tree until the toast is focused; the toast itself is the announced element.
- An action does NOT dismiss its toast — Base UI leaves that to the handler, so an action that opens a confirmation keeps the toast it is confirming. Call `toast.dismiss(id)` yourself when the action should close it.
- Animate enter/leave via data-[starting-style]/data-[ending-style] rather than mount/unmount flips.

## Related

- Components: Banner, InlineStatus, Button, Progress
- Patterns: DashboardPage, SettingsPage

## Examples

### Imperative (from anywhere)

```tsx
import { toast } from "@sableui/react"

toast.success("Saved", { description: "Your post is live." })
```

### Promise (loading → success / error)

```tsx
import { toast } from "@sableui/react"

toast.promise(publish(), { loading: "Publishing…", success: "Published", error: "Failed to publish" })
```

### Persistent loading, updated in place

```tsx
import { toast } from "@sableui/react"

const id = toast.loading("Pinning to Arweave…"); /* later */ toast.update(id, { title: "Pinned", type: "success", timeout: 4000 })
```

### Custom toast markup (composed parts)

```tsx
import { Icon, toast, ToastClose, ToastDescription, ToastRoot, ToastTitle, ToastViewport, useToast } from "@sableui/react"

const { toasts } = useToast()
<ToastViewport>{toasts.map((t) => (<ToastRoot key={t.id} toast={t}><div className="flex min-w-0 flex-col gap-1"><ToastTitle>{t.title}</ToastTitle><ToastDescription>{t.description}</ToastDescription></div><ToastClose><Icon name="xmark" /></ToastClose></ToastRoot>))}</ToastViewport>
```

### Undo action

```tsx
import { toast } from "@sableui/react"

toast.message("Post archived", { actionProps: { children: "Undo", onClick: () => restorePost() } })
```

### Stacked

```tsx
import { ToastProvider } from "@sableui/react"

<ToastProvider stacked position="bottom-right">{children}</ToastProvider>
```

### Provider with app chrome

```tsx
import { AppShell, Button, Region, toast, ToastProvider } from "@sableui/react"

<ToastProvider position="bottom-right" limit={3}><AppShell><Region max="feed"><Button onClick={() => toast.success("Saved")}>Save</Button></Region></AppShell></ToastProvider>
```

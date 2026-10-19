# Dialog

**Status:** stable

Modal surface over Base UI Dialog (focus trap, scroll lock, Esc/outside dismissal). Centered on desktop; max-width 500px. size="fullscreen" is the full-bleed media viewer (image, video, Carousel) over a near-opaque scrim.

**Keywords:** dialog, modal, overlay, confirmation, alert, form, focus trap, sheet, lightbox, fullscreen, image viewer, media overlay, gallery

## Usage

Use Dialog for focused decisions, short modal forms, confirmations, and content that temporarily blocks the underlying page. Prefer Sheet for side-panel workflows, Popover for lightweight anchored content, and inline sections for content that should remain part of the page.

### Best practices

- Do: Always include DialogTitle and usually DialogDescription so the modal has an accessible name and context.
- Do: Keep the footer actions explicit: a safe escape path plus the primary or destructive action.
- Do: Use showCloseButton for dismissible informational dialogs; keep destructive confirmations action-led.
- Do: In a destructive confirmation, state the consequence in DialogDescription ("This is permanent.") and reserve the destructive button variant for actions that cannot be undone.
- Do: Use size="fullscreen" when an image, video, or gallery needs a larger view than the layout can give it. Give the popup an accessible name (aria-label on DialogContent, or a visually hidden DialogTitle) and alt text on the media.
- Do: Open a dialog from your own button with controlled open/onOpenChange when the trigger is not a DialogTrigger (a menu item, a row action, a keyboard shortcut). Focus returns on close to whatever held it when the dialog opened, with no finalFocus wiring; pass finalFocus only to send it somewhere else.
- Do: Set keepMounted on DialogContent for a draft the user may come back to (a compose form, a long comment, a half-filled request). Closing by Esc or a stray click then hides the dialog instead of unmounting it, so the fields are still filled when it reopens. Clear the draft yourself on submit or discard.
- Do: Use the AlertDialog family for a confirmation that must be answered (discard changes, leave without saving). It looks identical but is role="alertdialog" and a backdrop click does not dismiss it — only Cancel, Esc, or the action. For irreversible deletes, use DestructiveActionModal, which is built on it.
- Don't: Put large multipage workflows in a centered dialog. Use Sheet or a page route when the task needs space. → use **Sheet**
- Don't: Use size="fullscreen" for forms, confirmations, or anything that isn't media. A dialog that happens to need room is a Sheet or a page; the fullscreen affordances (dark scrim, corner close, centred content) all assume something to look at. → use **Sheet**
- Don't: Hide the close button at size="fullscreen" without another visible way out. A full-bleed viewer that only Esc dismisses is a dead end for anyone who doesn't know the key.
- Don't: Open a dialog for passive status updates. Use Toast, Banner, or InlineStatus instead. → use **Toast**, **Banner**, **InlineStatus**
- Don't: Set keepMounted by default. A dialog that should open fresh (a confirmation, a create form after a successful save) would show stale input, and live content (polling, video) keeps running while hidden.

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| Trigger | no | The element that opens the dialog when using the composed trigger pattern. |
| Overlay | yes | The dimming backdrop behind the modal content. |
| Content | yes | The modal surface that receives focus trap, labelled-by, and described-by wiring. |
| Header | yes | Title and optional description that explain the decision or task. |
| Footer | no | Action row for cancel, confirm, submit, or destructive choices. |

## Subcomponents

| Name | Type | Description |
| --- | --- | --- |
| DialogContent | Base UI Popup props (initialFocus, finalFocus) + size?: "default" \| "fullscreen" + showCloseButton?: boolean + scroll?: boolean + keepMounted?: boolean + className | Backdrop + popup; portals to <body>. Composes DialogOverlay by default. size="fullscreen" is the media viewer: a near-opaque scrim (bg-overlay/95), an edge-to-edge popup that centres its children with no card chrome, motion-fade instead of motion-pop, and a safe-area-aware floating close button (Button variant="floating"); at that size showCloseButton defaults to true and scroll to false, and the media fits itself with max-h-full max-w-full object-contain. At the default size, showCloseButton (defaults to false) renders a built-in close (X) button in the top-end corner, and the header leaves room for it (Icon name="xmark"). The popup caps at the viewport height less a 1rem margin and wraps its children in a scrolling region, so a tall dialog scrolls instead of overflowing a viewport whose own scroll is locked; pass scroll={false} when the dialog owns its internal layout (a pinned header over a scrolling body) and supplies its own min-h-0 scroll region. keepMounted (default false) keeps the content mounted and hidden while closed, so a draft survives close and reopen. finalFocus defaults to the element focused when the dialog opened, trigger or not; an explicit finalFocus (a ref, a function, or false) wins. |
| DialogOverlay | Base UI Backdrop props + size?: "default" \| "fullscreen" + className | The styleable scrim/backdrop — bg-overlay/(--scrim-alpha) by default (50% light, 72% dark, so it dims a near-black page as visibly as a white one), near-opaque bg-overlay/95 at size="fullscreen". Composed into DialogContent (at the matching size) by default; exported for manual styling. |
| DialogTrigger | Base UI Dialog.Trigger props (render) | Element that opens the dialog. Compose via render prop. |
| DialogClose | Base UI Dialog.Close props (render) | Element that dismisses the dialog. Compose via render prop. |
| DialogHeader | ComponentProps<"div"> | Top section holding DialogTitle/DialogDescription. |
| DialogTitle | Base UI Dialog.Title props + className | The dialog's accessible name — wires aria-labelledby on the popup. |
| DialogDescription | Base UI Dialog.Description props + className | Muted supporting line; wires aria-describedby. |
| DialogFooter | ComponentProps<"div"> | Bottom action row (right-aligned buttons). |
| AlertDialog (Root) | Base UI AlertDialog.Root props (open, defaultOpen, onOpenChange) | Root for a confirmation that needs an answer. Always modal; the popup is role="alertdialog" and a click outside does not dismiss — only an AlertDialogClose, an action that sets open to false, or Esc. Returns focus on close to the element focused when it opened, exactly as Dialog does. |
| AlertDialogTrigger | Base UI AlertDialog.Trigger props (render) | Opens the alert dialog. |
| AlertDialogContent / AlertDialogOverlay / AlertDialogTitle / AlertDialogDescription / AlertDialogHeader / AlertDialogFooter / AlertDialogClose | Same props as the matching Dialog part | The Dialog parts under AlertDialog names — Base UI shares the popup, backdrop, title, description and close parts between the two, so the surface is identical. Pass initialFocus to AlertDialogContent (a ref to the Cancel button) to open focus on the safe action. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| Dialog (Root) | Base UI Dialog.Root props (open, defaultOpen, onOpenChange, modal) | — | Controls open state. Uncontrolled by default. Records the element that holds focus when the dialog opens (through a DialogTrigger, or your own button flipping a controlled open) and returns focus there on close. |
| open | boolean | — | Controlled open state. Pair with onOpenChange — for a dialog opened from your own button instead of a DialogTrigger. |
| defaultOpen | boolean | false | Initial open state when uncontrolled. |
| onOpenChange | (open: boolean, eventDetails) => void | — | Called when the dialog asks to open or close (a trigger, Esc, an outside click, DialogClose). |

## Variants

- **size**: default, fullscreen

## Tokens used

`popover`, `popover-foreground`, `border`, `muted-foreground`, `overlay`, `overlay-foreground`, `accent`, `accent-foreground`, `ring`

## Motion

- **arrival** · DialogOverlay · `motion-fade` — The scrim is what tells the reader the page behind is no longer live. Appearing at full opacity in one frame reads as a page navigation — the surrounding context vanishes instead of receding.
- **arrival** · DialogContent · `motion-pop` — The panel scales up as the scrim darkens, so the two read as one event. Overlay and panel arriving on separate timings is the most common way a modal feels cheap.
- **response** · DialogClose · `motion-interactive` — The close affordance is a small icon in a corner and is often the only control a reader looks for. Its hover state has to be findable, not just present.
- **transition** · DialogContent · `motion-pop` — Exit runs the same recipe in reverse so dismissal is legibly the inverse of opening. A modal that fades out having scaled in leaves the reader unsure whether it closed or navigated away.
- **activity** · DialogContent · _no motion_ — The dialog is a container. Work happening inside it is the content's to report — a dialog-level indicator would claim the whole surface is busy when usually one field is.

## Accessibility

- Base UI provides focus trapping, scroll lock, aria-modal, and labelled-by wiring (DialogTitle).
- Content taller than the viewport scrolls inside the dialog (thin scrollbar, contained overscroll) rather than overflowing off screen — the page behind is scroll-locked, so anything past the edge would be unreachable.
- On close, focus returns to the element that held it when the dialog opened, whether a DialogTrigger opened it or your own button set a controlled open. It is captured before the content mounts, so an autoFocus field inside cannot displace it. If that element has left the page, Base UI's default (the trigger, if any) applies; an explicit finalFocus on the content always wins. AlertDialog and Sheet behave the same.
- keepMounted hides closed content with the hidden attribute, so a kept draft is out of the accessibility tree and the tab order until the dialog reopens.
- Esc and click-outside dismiss by default. AlertDialog keeps Esc but ignores click-outside, and its popup is role="alertdialog".
- Animate via data-[starting-style]/data-[ending-style] attributes.
- size="fullscreen" has no title chrome, so name the popup yourself: aria-label on DialogContent (or a visually hidden DialogTitle), plus alt text on the media — the zoomed image is a separate image to assistive technology. Its built-in close button carries aria-label="Close" and clears the safe-area insets (notch, home indicator).

## Related

- Components: Sheet, Popover, Toast, Button, Form, Note, Carousel, Video
- Patterns: SettingsPage, AuthPage

## Examples

### Fullscreen media

```tsx
import { Button, Dialog, DialogContent, DialogTrigger } from "@sableui/react"

<Dialog><DialogTrigger render={<Button variant="secondary">View full size</Button>} /><DialogContent size="fullscreen" aria-label="Studio, 2026"><img src={url} alt="Studio, 2026" className="max-h-full max-w-full object-contain p-8" /></DialogContent></Dialog>
```

### Fullscreen gallery

```tsx
import { Button, Carousel, Dialog, DialogContent, DialogTrigger } from "@sableui/react"

<Dialog><DialogTrigger render={<Button>Open gallery</Button>} /><DialogContent size="fullscreen" aria-label="Gallery"><Carousel loop dots counter label="Gallery" className="w-full max-w-4xl px-8">{images.map((src) => <img key={src} src={src} alt="" className="size-full object-contain" />)}</Carousel></DialogContent></Dialog>
```

### Basic

```tsx
import { Button, Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@sableui/react"

<Dialog><DialogTrigger render={<Button>Open</Button>} /><DialogContent><DialogHeader><DialogTitle>Plan details</DialogTitle><DialogDescription>Up to 10 seats, billed monthly per seat.</DialogDescription></DialogHeader><DialogFooter><DialogClose render={<Button variant="secondary">Close</Button>} /><DialogClose render={<Button>Upgrade</Button>} /></DialogFooter></DialogContent></Dialog>
```

### Settings form

```tsx
import { Button, Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, Field, Form, Input } from "@sableui/react"

<Dialog><DialogTrigger render={<Button variant="secondary">Rename collection</Button>} /><DialogContent showCloseButton><DialogHeader><DialogTitle>Rename collection</DialogTitle><DialogDescription>Update the display name shown to collectors.</DialogDescription></DialogHeader><Form><Field label="Collection name"><Input defaultValue="Midnight Archive" /></Field><DialogFooter><DialogClose render={<Button variant="secondary">Cancel</Button>} /><Button type="submit">Save changes</Button></DialogFooter></Form></DialogContent></Dialog>
```

### Opened from your own button, keeping a draft

```tsx
import { Button, Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Field, Textarea } from "@sableui/react"

const [open, setOpen] = useState(false)

<Button variant="secondary" onClick={() => setOpen(true)}>New message</Button>
<Dialog open={open} onOpenChange={setOpen}>
	<DialogContent keepMounted showCloseButton>
		<DialogHeader>
			<DialogTitle>New message</DialogTitle>
			<DialogDescription>Close it any time. Your draft is here when you come back.</DialogDescription>
		</DialogHeader>
		<Field label="Message"><Textarea /></Field>
		<DialogFooter>
			<DialogClose render={<Button variant="secondary">Close</Button>} />
			<Button onClick={() => setOpen(false)}>Send</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>
```

### Destructive confirmation

```tsx
import { AlertDialog, AlertDialogClose, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, Button } from "@sableui/react"

<AlertDialog><AlertDialogTrigger render={<Button variant="destructive">Delete project</Button>} /><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete project?</AlertDialogTitle><AlertDialogDescription>This removes the project and cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogClose render={<Button variant="secondary">Cancel</Button>} /><Button variant="destructive" onClick={deleteProject}>Delete project</Button></AlertDialogFooter></AlertDialogContent></AlertDialog>
```

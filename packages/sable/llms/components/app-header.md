# AppHeader

**Status:** stable

Mobile top bar (sticky, hidden at lg) with leading / title / actions slots on a 3-column grid that keeps the title optically centered. Grows into the top safe-area.

**Keywords:** app header, top bar, mobile header, chrome

## Usage

Use AppHeader for compact application chrome at the top of a screen, usually with navigation, identity, and a small action set. Pass it to AppShell's `header` slot so screen content clears it on mobile (it is sticky and hides itself at lg).

### Best practices

- Do: Keep the header actions narrow and predictable so the page title remains legible.
- Do: Use it once per app view as chrome, not as repeated content inside page sections.
- Don't: Do not overload it with filters, forms, or page-specific controls that belong in the content area.
- Don't: Do not render more than one per app, or put a second one inside a route. It is sticky chrome, so two of them stack and permanently eat the top of the viewport.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| leading | ReactNode | — | Leading slot — back button, create action, or menu trigger. |
| title | ReactNode | — | Center slot — brand wordmark or contextual page title. |
| actions | ReactNode | — | Trailing slot — wallet trigger, action buttons. |

## Tokens used

`background`, `border`, `foreground`

## Accessibility

- Renders a <header> landmark.
- Pair with a leading control that has an accessible label (e.g. a BackButton).

## Related

- Components: AppShell, PageHeader, BottomNav

## Examples

### Contextual header

```tsx
import { AppHeader, Button, Icon } from "@sableui/react"

<AppHeader leading={<Button size="icon" variant="ghost" aria-label="Back"><Icon name="chevron-left" /></Button>} title="Notifications" />
```

### Choosing between AppHeader and PageHeader

```tsx
import { AppHeader, AppShell, PageHeader, Region } from "@sableui/react"

// AppHeader is APP chrome — it persists across routes and holds global
// affordances (brand, search, account). One per app.
<AppShell header={<AppHeader title="Studio" />}>
  <Region max="content">Route content</Region>
</AppShell>

// PageHeader is CONTENT — it introduces the current route and scrolls away
// with it. One per page, INSIDE the region.
<Region max="content">
  <PageHeader title="Billing" description="Plans, invoices, payment methods." />
</Region>

// ✗ Putting route-specific actions in AppHeader. They then persist onto routes
//   where they mean nothing, and the header becomes a dumping ground.
```

# Banner

**Status:** stable

Full-width, page-level announcement bar. A tone (neutral, info, success, warning, the decorative 1, destructive) × an appearance (soft tint or loud solid fill), and an optional leading scope label. Centers its message, or — with a trailing action — switches to a leading-text + trailing-button layout. Optionally sticky and dismissible.

**Keywords:** banner, announcement, alert, status, message, warning, success, offline, sticky

## Usage

Use Banner for page-level or app-level messages that affect the current experience: outages, maintenance, success confirmations, policy notices, or major warnings. Prefer Toast for transient feedback from a specific action, and prefer InlineStatus for local row or form state.

### Best practices

- Do: Use soft appearance for contextual notices and solid appearance for urgent, blocking, or system-wide states.
- Do: Set live='polite' or live='assertive' only when the banner appears or changes dynamically.
- Do: Include one clear action when the user can resolve or inspect the state.
- Don't: Use multiple stacked solid banners unless the page is genuinely blocked by multiple independent states.
- Don't: Use Banner for field-level validation, row status, or small local hints; use Field, InlineStatus, or Badge instead.
- Don't: Use Banner inside a dialog, a form, or a section to qualify the content around it — that is Note. Banner is a full-width announcement strip for page- or app-level state, so in a modal it reads as a slab heavier than the fields it warns about, and its soft appearance has no border and no tone-colored icon: the severity survives only as a faint wash.

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| Message | yes | The short announcement text. It should explain the state in plain language. |
| Action | no | Optional trailing action that changes the layout from centered copy to text plus action. |
| Dismiss | no | Optional close control for notices the user can safely hide. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| tone | "neutral" \| "info" \| "success" \| "warning" \| "1" \| "destructive" | "neutral" | Neutral surface or a tone that encodes the announcement's intent (info / success / warning / the decorative 1 / destructive). |
| appearance | "soft" \| "solid" | "soft" | "soft" is a quiet tinted fill; "solid" is the full tone with its paired ink — for loud, can't-miss states (offline, chain-down, RPC errors). |
| label | ReactNode | — | A short scope label ("Preview", "Staging", a project name) in a leading chip — a Badge that reads on soft and solid fills. |
| action | ReactNode | — | A trailing action (e.g. a Button). Switches the bar to leading text + trailing action instead of centered text. |
| sticky | boolean | false | Stick the banner to the top of its scroll container (sticky top-0, z-30). |
| live | "off" \| "polite" \| "assertive" | "off" | ARIA live-region politeness for banners shown/updated at runtime (offline, RPC-down, "N new posts"). "polite" → role=status; "assertive" → role=alert. "off" keeps a static labelled region. |
| dismissible | boolean | false | Render a trailing close button that hides the banner when clicked. |
| onDismiss | () => void | — | Called after the banner is dismissed. |

## Variants

- **tone**: neutral, info, success, warning, 1, destructive
- **appearance**: soft, solid

## Tokens used

`secondary`, `secondary-foreground`, `foreground`, `background`, `tone-info`, `tone-info-foreground`, `success`, `success-foreground`, `tone-warning`, `tone-warning-foreground`, `tone-1`, `tone-1-foreground`, `destructive`, `destructive-foreground`

## Accessibility

- Static banners render as a labelled region (role=region); set `live` to announce dynamic status bars (role=status / role=alert) when they appear or change.
- The dismiss control is Button (on-color-ghost, icon-xs) with an aria-label; it takes the bar's own ink, so its glyph and focus ring stay legible on soft and solid fills alike.
- Solid fills pair each tone with its theme-adaptive ink token, so text stays legible in light and dark.

## Related

- Components: Note, AppShell, Toast, InlineStatus, EmptyState, Button
- Patterns: DashboardPage

## Examples

### Tones

```tsx
import { Banner } from "@sableui/react"

<Banner tone="info">Maintenance window tonight at 02:00 UTC.</Banner>
```

### Solid (loud)

```tsx
import { Banner } from "@sableui/react"

<Banner tone="destructive" appearance="solid" live="assertive">Payments are down. Checkout and upgrades are temporarily disabled.</Banner>
```

### Success

```tsx
import { Banner } from "@sableui/react"

<Banner tone="success" live="polite">Credits authorized for Studio.</Banner>
```

### Action

```tsx
import { Banner, Button } from "@sableui/react"

<Banner sticky action={<Button variant="outline" size="sm">Refresh</Button>}>12 new posts</Banner>
```

### Dismissible

```tsx
import { Banner } from "@sableui/react"

<Banner tone="warning" dismissible>Your session expires soon.</Banner>
```

### Recoverable warning

```tsx
import { Banner, Button } from "@sableui/react"

<Banner tone="warning" action={<Button variant="outline" size="sm">Reconnect</Button>}>Calendar sync paused.</Banner>
```

### App-shell outage

```tsx
import { AppShell, Banner, EmptyState, Region } from "@sableui/react"

<AppShell banners={<Banner tone="destructive" appearance="solid" live="assertive">Uploads are temporarily unavailable.</Banner>}><Region max="feed"><EmptyState title="Uploads paused" description="Existing posts are still visible while the service recovers." /></Region></AppShell>
```

# RelativeTime

**Status:** stable

A human relative timestamp (e.g. "3 minutes ago") that reveals the full absolute date/time on hover or focus. Renders a native <time> element wrapped in our Tooltip; the absolute time is formatted with date-fns format(date, 'PPpp') (e.g. "Apr 29, 2025, 4:05:12 PM").

**Keywords:** relative time, timestamp, time ago, date

## Usage

Use RelativeTime to show recent activity or timestamps in conversational relative language.

### Best practices

- Do: Use it for feeds, audit summaries, comments, and activity streams.
- Do: Expose the exact timestamp when precision matters.
- Don't: Do not use RelativeTime as the only date format for legal, billing, or audit-critical records.
- Don't: Do not render it during SSR without a stable absolute fallback. "2 minutes ago" computed on the server differs from the client's value, which is a hydration mismatch — and it silently drifts as the page sits open.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| date | Date \| string \| number | — | The instant to render. Accepts a Date, an ISO/parseable string, or an epoch number (ms). Coerced to a Date for date-fns. |
| className | string | — | Merged onto the <time> trigger element (the visible relative label). |
| ...time props | Omit<ComponentPropsWithRef<"time">, "dateTime" \| "children"> | — | Remaining native <time> attributes pass through to the trigger. dateTime is set automatically from the parsed ISO value. |

## Tokens used

`popover`, `popover-foreground`, `border`, `ring`

## Motion

- **arrival** · Root · _no motion_ — It is a word in a line of text and arrives with that line.
- **response** · Root · _no motion_ — The only hover change on the timestamp is a dotted underline, and text-decoration-line is discrete: CSS cannot tween it, so a transition here would animate nothing and imply the snap had been handled.
- **response** · Tooltip · `motion-pop` — The pointer's real answer is the absolute time, which arrives in a Tooltip on its own fast pop. That short entrance is what makes the full date read as belonging to the word under the cursor.
- **transition** · Root · _no motion_ — The label does not tick: it is computed when the component renders, so it never changes in front of the reader. A timestamp rolling from one minute to two would pull the eye off the content it dates.
- **activity** · Root · _no motion_ — A timestamp has nothing to wait for.

## Accessibility

- Renders a semantic <time> element with a machine-readable dateTime (ISO) attribute.
- The <time> carries tabIndex=0 (it is not focusable natively), so the absolute time — exposed via Base UI's Tooltip, which opens on keyboard focus as well as hover and wires aria-describedby — is reachable from the keyboard.
- It inherits the type size of the surrounding text rather than setting its own, so it sits inside a meta row or message header without changing tier.
- Wrap the page or a group in <TooltipProvider> to share open/close delays.
- Relative phrasing is supplementary; the dateTime attribute remains the canonical machine value.

## Related

- Components: InlineStatus, Table

## Examples

### Basic

```tsx
import { RelativeTime, TooltipProvider } from "@sableui/react"

<TooltipProvider><RelativeTime date={new Date()} /></TooltipProvider>
```

### From an ISO string

```tsx
import { RelativeTime, TooltipProvider } from "@sableui/react"

<TooltipProvider><RelativeTime date="2025-04-29T16:05:12Z" /></TooltipProvider>
```

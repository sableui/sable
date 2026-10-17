# NotificationBadge

**Status:** stable

An unread indicator. Renders a bare dot or a count pill (capped as "{max}+"), or nothing when there's nothing to show. A changing count rolls to its new number, and a badge that appears after being empty pops in. overlay pins it to the corner of a relative host; it is aria-hidden, so the host's name carries the count.

**Keywords:** notification, badge, count, unread

## Usage

Use NotificationBadge to show a compact unread count, alert count, or attention marker.

### Best practices

- Do: Place it on or near the item that owns the notifications.
- Do: Use compact counts and cap large numbers when exact precision is not useful.
- Don't: Do not use NotificationBadge as a standalone status label or category marker.
- Don't: Do not show a bare dot when the count is meaningful. A dot says "something"; if the user can act on "how many", show the number.
- Don't: Do not put a neutral badge on a secondary host. Both are the secondary surface, so the badge disappears; use primary or destructive there.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| dot | boolean | false | Render a bare dot indicator with no number. Takes precedence over count. |
| count | number | — | Unread count. Renders nothing when <= 0 and dot is unset. |
| max | number | 99 | Cap before showing "{max}+". |
| tone | "destructive" \| "primary" \| "neutral" | "destructive" | Fill color. destructive for alarming counts; primary/neutral for non-alarming ones. |
| size | "sm" \| "md" \| "lg" | "md" | Scales the dot/pill on the spacing scale (count pill: sm 16px, md 18px, lg 20px at the default density). |
| overlay | boolean | false | Pin to the top-end corner of the nearest relative host (an icon button) — one placement for every caller instead of hand-tuned absolute offsets. |
| motion | "full" \| "subtle" \| "off" | "full" | How much motion this component uses: `full` (default) inherits the app's policy, `subtle` keeps feedback and drops the flourish, `off` stills it. It can only turn motion down — it never overrides a reader's reduce-motion setting. Under `subtle` the count updates in place and the badge fades in without the pop. |

## Variants

- **tone**: destructive, primary, neutral
- **size**: sm, md, lg
- **overlay**: true, false

## Tokens used

`destructive`, `destructive-foreground`, `primary`, `primary-foreground`, `secondary`, `secondary-foreground`

## Motion

- **arrival** · root · `motion-appear` — A badge that shows up after being empty is the news — something just arrived — so it fades and scales in where it sits instead of popping into existence. Never on first paint: a badge that mounts with a count is content, and a page of them popping on load is noise.
- **response** · root · _no motion_ — It is decorative and not interactive; the host it sits on answers the pointer.
- **transition** · Count · _custom (outside the recipe layer)_ — The count rolls to its new number through NumberTicker (expressive), so 3 → 4 reads as one more arriving rather than a different badge. Past the cap the ticker holds at max with a static "+", so a count climbing beyond 99 does not keep rolling a badge that has not changed.
- **activity** · root · _no motion_ — An unread count has no working state.

## Accessibility

- The badge is aria-hidden: a count rendered on a control is not associated with it, so the host needs an accessible name that includes the count — "Notifications, 3 unread" — or a screen-reader user hears "Notifications, button" and never learns there is anything new. Pass aria-hidden={false} only for a standalone badge whose number is the information.
- A dot carries no number and no words: on its own it tells a sighted user only that something changed, and tells everyone else nothing. Pair it with a label that says what is new, and never make its colour the only difference between two states.

## Related

- Components: Badge, StatusDot, NumberTicker

## Examples

### Dot + counts

```tsx
import { NotificationBadge, Row } from "@sableui/react"

<Row gap={3}><NotificationBadge dot /><NotificationBadge count={3} /><NotificationBadge count={128} /></Row>
```

### Overlay on an icon button

```tsx
import { Button, Icon, NotificationBadge } from "@sableui/react"

<Button variant="secondary" size="icon" aria-label="Notifications, 5 unread" className="relative"><Icon name="bell" /><NotificationBadge count={5} overlay /></Button>
```

# BottomNav

**Status:** stable

Mobile bottom tab bar (fixed, hidden at lg), with home-indicator safe-area padding and evenly distributed BottomNavItem tabs. Items are router-agnostic via `render`.

**Keywords:** bottom nav, mobile nav, tabs, app navigation

## Usage

Use BottomNav for a small set of top-level mobile destinations that should remain reachable with one thumb. Mount it through `<AppShell bottomNav={…}>` so the content area reserves matching bottom space; it hides at lg, where the Sidebar takes over.

### Best practices

- Do: Limit the nav to the primary destinations users switch between often.
- Do: Give every item a clear label (it is the accessible name), and turn on showLabel when the icons alone are not obvious.
- Don't: Do not use BottomNav for desktop navigation, dense menus, or page-local actions.
- Don't: Do not omit the safe-area padding by overriding its padding-bottom. On a device with a home indicator the last row of targets ends up under the gesture area, where taps dismiss the app instead.

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| BottomNav | yes | The fixed or anchored navigation container. |
| BottomNavItem | yes | One destination with label, icon, and active state. |

## Subcomponents

| Name | Type | Description |
| --- | --- | --- |
| BottomNavItem | { label: string; icon?: ReactNode; active?: boolean; badge?: ReactNode; showLabel?: boolean; render?: useRender.RenderProp } + button props | A single tab, placed as a child of BottomNav. `label` is the accessible name (aria-label) and optional visible label; `icon` is the glyph node (consumer swaps fill weight for the active state); `active` marks the current route (active ink + aria-current); `badge` overlays a corner dot/count on the icon; `showLabel` shows the label text beneath the icon — defaults to false (icon-only); turn it on when the icons alone are not self-evident; `render` renders as another element, e.g. render={<Link to="/x" />}. |

## Tokens used

`background`, `border`, `muted-foreground`, `foreground`, `ring`

## Motion

- **arrival** · Root · _no motion_ — Fixed app chrome, present from the first paint of every screen. Animating it in on navigation would make each route change look like the app restarting.
- **response** · BottomNavItem · `motion-interactive` — The ink steps up on hover and the focus ring eases in, so a pointer or a keyboard on a tablet gets the same answer as every other control in the app.
- **response** · BottomNavItem · `motion-press` — On a phone there is no hover to say a tap landed, and a route can take a beat to paint. The settle on press is the receipt; without it people tap the tab a second time.
- **transition** · BottomNavItem · `motion-interactive` — Changing tab eases the active ink out of one item and into the next. It is a cross-fade, not a travelling indicator: each item owns its colour, so there is no single mark to glide.
- **activity** · Root · _no motion_ — Navigation has no working state of its own. A slow route shows its pending state in the page it is loading, not in the tab bar.

## Accessibility

- BottomNav renders a <nav> landmark.
- Each tab is a 44px minimum touch target with an aria-label.
- Active tab carries aria-current="page".

## Related

- Components: Sidebar, SideNav, AppHeader

## Examples

### Tab bar

```tsx
import { BottomNav, BottomNavItem, Icon, NotificationBadge } from "@sableui/react"
// <Link> = your router's link (react-router, next/link, @tanstack/router, …)

<BottomNav><BottomNavItem icon={<Icon name="home" />} label="Home" active render={<Link to="/" />} /><BottomNavItem icon={<Icon name="bell" />} label="Notifications" badge={<NotificationBadge dot />} render={<Link to="/notifications" />} /></BottomNav>
```

### When NOT to use it

```tsx
import { AppShell, BottomNav, BottomNavItem, Icon, Region } from "@sableui/react"

// BottomNav is for 3–5 PEER destinations on a small viewport — the mobile
// counterpart to SideNav, not an action bar.

// ✗ Actions. A bottom bar of verbs (Save / Share / Delete) is a toolbar; it
//   competes with the OS gesture area and has no "current" state to show.
// ✗ More than five items. Past that, labels truncate and targets shrink below
//   the 44px floor — use a "More" destination that opens a Sheet.
// ✗ Nested navigation. BottomNav switches top-level sections only; drilling in
//   happens inside the section, with Breadcrumbs or a back affordance.

<AppShell bottomNav={<BottomNav>
  <BottomNavItem label="Home" icon={<Icon name="home" />} active />
  <BottomNavItem label="Search" icon={<Icon name="search" />} />
  <BottomNavItem label="Account" icon={<Icon name="user" />} />
</BottomNav>}>
  <Region max="feed">Route content</Region>
</AppShell>
```

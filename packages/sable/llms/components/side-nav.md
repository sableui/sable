# SideNav

**Status:** stable

A lightweight in-content vertical navigation list - the settings / docs sub-nav, distinct from the app-chrome Sidebar. Router-agnostic items, optional SideNavGroup sections, and an explicit active-state vocabulary for content rails or sidebar chrome.

**Keywords:** side nav, navigation, settings nav, sidebar, rail, docs nav, active item, group

## Usage

Use SideNav for vertical navigation inside a settings page, documentation area, dashboard rail, or sidebar chrome. It is router-agnostic: compose items with render={<Link />} and choose activeVariant based on whether the nav sits in content or app chrome.

### Best practices

- Do: Use aria-label on SideNav when a page contains more than one nav landmark.
- Do: Group related items with SideNavGroup when the rail has more than one conceptual area.
- Do: Use size='lg' and activeVariant='sidebar' when the nav is part of persistent app chrome.
- Do: Inside a rounded, padded frame, give each item rounded-concentric-<outer>/<inset> (e.g. rounded-concentric-lg/2 in a rounded-lg p-2 box). The rows' own radius is fixed per size, and a same-radius row inset into a frame reads as a second system.
- Don't: Use SideNav for bottom mobile navigation; use BottomNav in AppShell's bottomNav slot.
- Don't: Mix content and sidebar active variants in the same rail unless individual items intentionally override the group.

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| Nav | yes | The landmark container for the vertical navigation list. |
| Group | no | Optional labelled cluster of related navigation items. |
| Item | yes | Interactive row with label, optional icon, optional badge, and active state. |
| Badge | no | Trailing count or state indicator aligned to the row end. |

## Subcomponents

| Name | Type | Description |
| --- | --- | --- |
| SideNavItem | { label: ReactNode; icon?: ReactNode; active?: boolean; badge?: ReactNode; size?: "md" \| "lg"; activeVariant?: "content" \| "sidebar"; render?: useRender.RenderProp } + button props | A single row. label is the row text; icon is an optional leading icon; active marks the current sub-section (active fill + aria-current="page"); badge is a trailing node (e.g. a count) pushed to the row end; size and activeVariant override the enclosing SideNav per item; render composes another element, e.g. render={<Link to="/x" />}. |
| SideNavGroup | { label?: ReactNode } + div props | A labelled section within a SideNav - groups settings into areas. label renders an optional sentence-case caption heading above the group's items. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| size | "md" \| "lg" | — | Density shared by all items. "md" (default) = the lightweight in-content sub-nav; "lg" = chrome-weight (larger label + icon, roomier rows) for a rail that pairs with the app Sidebar. |
| activeVariant | "content" \| "sidebar" | "content" | Active-state token vocabulary shared by all items. "content" uses bg-accent/text-accent-foreground for local rails inside the content area; "sidebar" uses bg-sidebar-accent/text-sidebar-accent-foreground for SideNavs rendered inside app chrome. |

## Tokens used

`muted`, `muted-foreground`, `foreground`, `accent`, `accent-foreground`, `ring`, `sidebar-foreground`, `sidebar-accent`, `sidebar-accent-foreground`, `sidebar-ring`

## Accessibility

- SideNav renders a <nav> landmark; pair multiple navs with aria-label to distinguish them.
- The active item carries aria-current="page".
- Items expose a focus-visible ring; the active state is reinforced by weight + fill, not colour alone.
- Use activeVariant="content" for local in-page rails and activeVariant="sidebar" when a SideNav is placed on Sidebar chrome.

## Related

- Components: Sidebar, AppShell, BottomNav, Badge, Icon
- Patterns: SettingsPage, DashboardPage

## Examples

### Settings sub-nav

```tsx
import { SideNav, SideNavItem } from "@sableui/react"
// <Link> = your router's link (react-router, next/link, @tanstack/router, …)

<SideNav><SideNavItem label="Profile" active render={<Link to="/settings/profile" />} /><SideNavItem label="Account" render={<Link to="/settings/account" />} /><SideNavItem label="Notifications" render={<Link to="/settings/notifications" />} /></SideNav>
```

### Grouped

```tsx
import { SideNav, SideNavGroup, SideNavItem } from "@sableui/react"
// <Link> = your router's link (react-router, next/link, @tanstack/router, …)

<SideNav><SideNavGroup label="Account"><SideNavItem label="Profile" active render={<Link to="/settings/profile" />} /><SideNavItem label="Security" render={<Link to="/settings/security" />} /></SideNavGroup><SideNavGroup label="Workspace"><SideNavItem label="Members" render={<Link to="/settings/members" />} /></SideNavGroup></SideNav>
```

### Chrome-weight rail (size=lg)

```tsx
import { SideNav, SideNavItem } from "@sableui/react"
// <Link> = your router's link (react-router, next/link, @tanstack/router, …)

<SideNav size="lg"><SideNavItem label="Profile" active render={<Link to="/settings/profile" />} /><SideNavItem label="Wallets" render={<Link to="/settings/wallets" />} /><SideNavItem label="Security" render={<Link to="/settings/security" />} /></SideNav>
```

### Inside Sidebar chrome

```tsx
import { SideNav, SideNavItem } from "@sableui/react"
// <Link> = your router's link (react-router, next/link, @tanstack/router, …)

<SideNav size="lg" activeVariant="sidebar"><SideNavItem label="Overview" active render={<Link to="/" />} /><SideNavItem label="Reports" render={<Link to="/reports" />} /><SideNavItem label="Settings" render={<Link to="/settings" />} /></SideNav>
```

### Grouped with icons and badges

```tsx
import { Badge, Icon, SideNav, SideNavGroup, SideNavItem } from "@sableui/react"
// <Link> = your router's link (react-router, next/link, @tanstack/router, …)

<SideNav aria-label="Settings sections"><SideNavGroup label="Account"><SideNavItem icon={<Icon name="user" />} label="Profile" active render={<Link to="/settings/profile" />} /><SideNavItem icon={<Icon name="lock" />} label="Security" badge={<Badge tone="warning" size="sm">2</Badge>} render={<Link to="/settings/security" />} /></SideNavGroup><SideNavGroup label="Workspace"><SideNavItem icon={<Icon name="bell" />} label="Notifications" render={<Link to="/settings/notifications" />} /></SideNavGroup></SideNav>
```

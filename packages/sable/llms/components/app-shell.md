# AppShell

**Status:** stable

The application frame: slots for status banners, a mobile header, a desktop sidebar, main content, a mobile bottom nav, a persistent dock (a now-playing or call bar), and floating overlays — plus a built-in skip link and #main-content target.

**Keywords:** app shell, layout, frame, sidebar, header, bottom nav, mobile, banners, main, dock, player bar, now playing, persistent

## Usage

Use AppShell as the outer product frame for authenticated or app-like experiences. It coordinates responsive chrome slots and guarantees a skip link plus main landmark; put route content inside the children and let AppHeader, Sidebar, BottomNav, and Banner own their own semantics.

### Best practices

- Do: Use AppShell once around the route tree or major app area so the skip link and main landmark stay stable.
- Do: Pass app-wide outage or status messages through banners so they remain above the frame.
- Do: Use Region inside the main content to choose each route's reading width.
- Do: Wrap EVERY return of a route in its own Page or Region — including early returns for loading, empty and error states. AppShell's <main> deliberately carries no padding (it is a frame, and padding belongs to the region that chose the width), so a route that returns a bare spinner or error renders flush against the chrome. This is the most common conversion bug: the happy path gets a Page, the three early returns do not.
- Don't: Nest AppShell inside route cards or panels. It is page chrome, not local content.
- Don't: Put desktop-only navigation in the mobile header slot or mobile-only controls in the sidebar slot.

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| Banners | no | Full-width app status messages rendered above the shell. |
| Header | no | Mobile top chrome, usually AppHeader. |
| Sidebar | no | Desktop navigation chrome, usually Sidebar. |
| Main | yes | The route content landmark with id main-content. |
| Bottom nav | no | Mobile fixed navigation with reserved bottom space. |
| Dock | no | Persistent bottom chrome that outlives routes — a now-playing bar, a call bar. Sticky above the bottom nav; the desktop Sidebar shortens to clear it. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| banners | ReactNode | — | Full-width status banners pinned in flow above the frame (offline / chain-down). |
| header | ReactNode | — | Mobile top header (e.g. AppHeader); expected to hide itself at lg. |
| sidebar | ReactNode | — | Desktop side navigation (e.g. Sidebar); expected to hide itself below lg. Leading column of the body row. |
| bottomNav | ReactNode | — | Mobile bottom navigation (e.g. BottomNav); fixed to the bottom edge. main reserves space for it. |
| dock | ReactNode | — | Persistent chrome kept on screen across routes (a now-playing bar, an active-call bar, an upload tray). Full width, sticky to the bottom edge and above bottomNav on mobile; its height is published as --dock-height and the app Sidebar subtracts it. In flow, so main needs no reserved space. The contents paint their own surface and top border, and name themselves (e.g. <section aria-label="Player">). Mount AppShell in a layout that survives navigation, or the playback restarts. |
| overlays | ReactNode | — | Floating overlays — a message launcher, FAB, or modal mount points. |

## Tokens used

`background`, `foreground`, `primary`, `primary-foreground`

## Accessibility

- Renders a skip link to #main-content as the first focusable element.
- Wraps content in a <main id="main-content"> landmark.
- Slot components own their own ARIA (nav landmarks, labels).
- The dock follows <main> in DOM order, so keyboard and screen-reader users reach the player after the page content, not before it.

## Related

- Components: AppHeader, Sidebar, SideNav, BottomNav, Banner
- Patterns: DashboardPage, FeedPage, SettingsPage

## Examples

### Full frame

```tsx
import { AppHeader, AppShell, Banner, BottomNav, BottomNavItem, Icon, PageHeader, Region, Sidebar, SidebarItem, SidebarNav } from "@sableui/react"
// <Link> = your router's link (react-router, next/link, @tanstack/router, …)

<AppShell
  banners={<Banner tone="warning">Network congested — mints may be slow.</Banner>}
  header={<AppHeader title="Studio" />}
  sidebar={
    <Sidebar>
      <SidebarNav>
        <SidebarItem icon={<Icon name="home" />} label="Home" active render={<Link to="/" />} />
        <SidebarItem icon={<Icon name="bell" />} label="Notifications" render={<Link to="/notifications" />} />
        <SidebarItem icon={<Icon name="gear" />} label="Settings" render={<Link to="/settings" />} />
      </SidebarNav>
    </Sidebar>
  }
  bottomNav={
    <BottomNav>
      <BottomNavItem icon={<Icon name="home" />} label="Home" active render={<Link to="/" />} />
      <BottomNavItem icon={<Icon name="bell" />} label="Alerts" render={<Link to="/notifications" />} />
    </BottomNav>
  }
>
  <Region max="feed">
    <PageHeader title="Home" description="Latest posts from artists you follow." />
  </Region>
</AppShell>
```

### Minimal (sidebar + content only)

```tsx
import { AppShell, Icon, PageHeader, Region, Sidebar, SidebarItem, SidebarNav } from "@sableui/react"
// <Link> = your router's link (react-router, next/link, @tanstack/router, …)

<AppShell
  sidebar={
    <Sidebar>
      <SidebarNav>
        <SidebarItem icon={<Icon name="home" />} label="Dashboard" active render={<Link to="/" />} />
      </SidebarNav>
    </Sidebar>
  }
>
  <Region max="wide">
    <PageHeader title="Dashboard" />
  </Region>
</AppShell>
```

### Route content width

```tsx
import { AppShell, Card, CardContent, CardHeader, CardTitle, Field, Icon, Input, PageHeader, Region, Sidebar, SidebarItem, SidebarNav } from "@sableui/react"

<AppShell sidebar={<Sidebar><SidebarNav><SidebarItem icon={<Icon name="home" />} label="Home" active /></SidebarNav></Sidebar>}><Region max="content"><PageHeader title="Settings" description="Manage account and workspace preferences." /><Card><CardHeader><CardTitle>Profile</CardTitle></CardHeader><CardContent><Field label="Display name"><Input defaultValue="Nova" /></Field></CardContent></Card></Region></AppShell>
```

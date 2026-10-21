# Sidebar

**Status:** stable

Desktop side-navigation rail (in-flow sticky, hidden below lg) with SidebarHeader / SidebarBrand / SidebarNav / SidebarGroup / SidebarItem / SidebarFooter / SidebarAccount parts, all on one set of columns. Items are router-agnostic via the `render` prop; an optional collapsed icon-rail mode reveals labels in tooltips.

**Keywords:** sidebar, navigation, app chrome, rail, nav group, section label, account, user menu, profile, account switcher, workspace switcher, sidebar footer

## Usage

Use Sidebar for persistent desktop navigation or application chrome outside the main content region.

### Best practices

- Do: Use it for stable app destinations that should remain visible while content changes.
- Do: Keep item labels predictable and active state obvious.
- Do: Set surface="page" when a full-width top bar sits above the rail. A theme's tinted or dark rail is for a full-height rail that frames the app.
- Do: Keep surface="rail" inside AppShell frame="inset": the rail's tint becomes the ground the main panel floats on. Do not add a border-r class back — the gap is the divider.
- Do: Group items with SidebarGroup and end the rail with one SidebarAccount that opens the account menu (settings, appearance, sign out). Every part sits on the same icon and label columns, at either density.
- Don't: Do not put SideNav, an Entity or a stack of ghost Buttons in the rail. Each brings its own insets, so the icons and labels land on four different columns. SideNav is the in-page section list; the rail has its own parts.
- Don't: Do not put a Badge or pill in the account row. Its one quiet detail line carries the plan, role or 'Demo'.
- Don't: Do not use Sidebar for page-local settings, filters, or temporary action groups.
- Don't: Do not put page content in it. It is fixed-width chrome OUTSIDE the content grid, so anything in it is exempt from the page's measure and rhythm.

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| Sidebar | yes | The persistent navigation container. |
| SidebarItem | yes | One navigation destination or action. |

## Subcomponents

| Name | Type | Description |
| --- | --- | --- |
| SidebarHeader | div props | The top of the rail, at least 64px tall (the chrome bar's height inside a compact Workspace, so it lines up with the WorkspaceBar beside it). It holds SidebarBrand and may take a second row under it, such as a search field or a notifications button: give that row basis-full and the header grows to hold it instead of clipping. |
| SidebarBrand | { mark: ReactNode; label: ReactNode; render?: useRender.RenderProp } + div props | The brand row, inside SidebarHeader, on the same grid as SidebarItem: mark in the icons' 24px slot, label on the labels' column, so a logo lines up with the nav below it without copying the rail's inset numbers. Collapsed, it shows the mark alone (named by a string label). render={<Link to="/" />} makes it the home link. |
| SidebarItem | { label: ReactNode; icon?: ReactNode; active?: boolean; badge?: ReactNode; render?: useRender.RenderProp } + button props | A single nav row, 44px on a page and 32px inside a compact scope such as a Workspace (the rail reads the density; nothing to set). label is the row text (inline when expanded, in a hover tooltip when collapsed); icon is the leading icon node (the consumer swaps fill weight for the active state); active marks the current route (accent fill + aria-current="page"); badge is a trailing node (e.g. a count) pushed to the row end and hidden when collapsed; render composes another element, e.g. render={<Link to="/x" />}. |
| SidebarGroup | { label?: ReactNode } + div props | A labelled run of SidebarItems inside SidebarNav ("Workspace", "Favorites"). The label starts on the items' icon column; collapsed, a hairline stands in for it and the label stays as the group's accessible name. |
| SidebarAccount | { avatar: ReactNode; label: ReactNode; detail?: ReactNode; indicator?: ReactNode \| false; render?: useRender.RenderProp } + button props | The account row at the foot of the rail, inside SidebarFooter: the avatar in the icon slot (Avatar xs on a page rail, 2xs in a compact one), the label on the label column, one muted detail line, and an up-down chevron. Make it the trigger of the account Menu (render it through MenuTrigger render) and put Settings, appearance and sign-out there; it holds its fill while the menu is open. Collapsed, the avatar alone, with the label in a tooltip. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| collapsed | boolean | false | Collapse the rail to an icon-only width (--sidebar-width-collapsed). Items hide their label + badge and reveal the label in a hover tooltip; the content area reflows. Controlled — wire a toggle from app state. Read the state in custom header/footer content via useSidebar(). |
| icons | boolean | true | Render the leading icon on each SidebarItem. Set false for a text-only rail. Ignored while collapsed (icon-only by definition). |
| variant | "app" \| "inline" | "app" | Where the rail lives. "app" is the page's chrome column — sticky, full viewport height, hidden below lg where AppHeader + BottomNav take over. "inline" is always visible and fills its parent's height, for a rail inside a bounded frame (a nested shell, an embedded preview). Use it instead of overriding the layout with !important classes. |
| surface | "rail" \| "page" | "rail" | Which surface the rail is painted on. "rail" is its own --sidebar-* surface with a border — right for a full-height rail that frames the app, which a theme may tint or paint dark. "page" uses the page's surface and ink with no border — use it when a full-width header sits above the rail, where a tinted column starting under a page-coloured bar reads as pasted on. Use it instead of overriding bg-/text- classes, which the rail's re-pointed tokens defeat. In AppShell's sidebar slot with frame="inset", the rail's surface is also the shell's ground: from lg a "rail" rail drops its border (the gap around the main panel divides them) and either surface stretches to the shell's body row instead of sizing to the viewport. AppShell signals this to its sidebar slot only, so a Sidebar elsewhere in the page is unaffected. |
| motion | "full" \| "subtle" \| "off" | "full" | How much motion this component uses: `full` inherits the app's policy, `subtle` keeps feedback and drops the collapse ease and the current-page glide, `off` stills it. It can only turn motion down — it never overrides a reader's reduce-motion setting. |

## Variants

- **variant**: app, inline

## Tokens used

`sidebar`, `sidebar-foreground`, `sidebar-border`, `sidebar-accent`, `sidebar-accent-foreground`, `sidebar-ring`, `shell-ground`

## Motion

- **arrival** · Root · _no motion_ — The rail is the app's frame, present from first paint. It is not summoned, so it has no entrance.
- **response** · SidebarItem · `motion-interactive` — Rows ease their hover fill (SideNav's row recipe on the rail rung), so moving down the nav reads as the pointer travelling rather than rows flashing.
- **transition** · SidebarNav · `motion-glide` — The current-page fill is one element that travels to the new item when the page changes inside a persistent layout, so the marker reads as moving rather than one row dimming while another lights. It lands in place on first paint, and each item keeps its own fill as the server-render fallback. Expressive: `subtle` moves it at once.
- **transition** · Root · `motion-size` — Collapsing to the icon rail eases the width instead of jumping 192px in one frame, so the content beside it visibly takes the room the rail gave up. Nothing inside jumps — a collapsed row's centred icon and an expanded row's inset icon sit on the same column — and labels leave at once and fade back in on reopen, clipped to the rail meanwhile. It reflows the page for the length of the ease, which is acceptable for a deliberate user toggle and never happens on load. Expressive: `subtle` snaps.
- **activity** · Root · _no motion_ — Navigation chrome has no working state; a loading route shows it in the page.

## Accessibility

- SidebarNav renders a <nav> landmark.
- Active item carries aria-current="page".
- Items expose a focus-visible ring (sidebar-ring).
- Collapsed: items take their accessible name from a string label (or aria-label) and reveal the visible label via the tooltip, so the rail stays usable by keyboard and screen readers.

## Related

- Components: SideNav, BottomNav, AppShell

## Examples

### Rail with nav

```tsx
import { Icon, NotificationBadge, Sidebar, SidebarBrand, SidebarFooter, SidebarHeader, SidebarItem, SidebarNav } from "@sableui/react"
// <Link> = your router's link (react-router, next/link, @tanstack/router, …)

<Sidebar><SidebarHeader><SidebarBrand mark={<Icon name="music" variant="solid" />} label="Undertow" render={<Link to="/" />} /></SidebarHeader><SidebarNav><SidebarItem icon={<Icon name="bell" />} label="Notifications" badge={<NotificationBadge count={3} />} render={<Link to="/notifications" />} /></SidebarNav><SidebarFooter>{account}</SidebarFooter></Sidebar>
```

### Collapsible (icon rail)

```tsx
import { Button, Icon, Sidebar, SidebarFooter, SidebarItem, SidebarNav } from "@sableui/react"
// <Link> = your router's link (react-router, next/link, @tanstack/router, …)

const [collapsed, setCollapsed] = useState(false)
<Sidebar collapsed={collapsed}><SidebarNav><SidebarItem icon={<Icon name="home" />} label="Home" active render={<Link to="/" />} /></SidebarNav><SidebarFooter><Button variant="ghost" size="icon" onClick={() => setCollapsed((c) => !c)} aria-label="Toggle sidebar"><Icon name="chevron-left" /></Button></SidebarFooter></Sidebar>
```

### Grouped nav with an account menu

```tsx
import { Avatar, Icon, Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger, Sidebar, SidebarAccount, SidebarBrand, SidebarFooter, SidebarGroup, SidebarHeader, SidebarItem, SidebarNav } from "@sableui/react"

<Sidebar><SidebarHeader><SidebarBrand mark={<Avatar shape="square" size="xs" fallback="F" alt="" />} label="Forma Studio" /></SidebarHeader><SidebarNav><SidebarItem icon={<Icon name="inbox" />} label="Inbox" badge={<span className="text-ui-num">4</span>} /><SidebarGroup label="Workspace"><SidebarItem icon={<Icon name="folder" />} label="Projects" active /><SidebarItem icon={<Icon name="users" />} label="Clients" /></SidebarGroup></SidebarNav><SidebarFooter><Menu><MenuTrigger render={<SidebarAccount avatar={<Avatar size="xs" fallback="EL" alt="" />} label="Emma Lee" detail="Forma Studio" />} /><MenuContent side="top" align="start"><MenuItem>Settings</MenuItem><MenuSeparator /><MenuItem>Sign out</MenuItem></MenuContent></Menu></SidebarFooter></Sidebar>
```

### Inline (inside a bounded frame)

```tsx
import { Icon, Sidebar, SidebarItem, SidebarNav } from "@sableui/react"

<div className="flex h-80 overflow-hidden rounded-lg border border-border"><Sidebar variant="inline"><SidebarNav><SidebarItem icon={<Icon name="home" />} label="Home" active /></SidebarNav></Sidebar><div className="flex-1 p-6">Content</div></div>
```

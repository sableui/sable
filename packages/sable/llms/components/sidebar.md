# Sidebar

**Status:** stable

Desktop side-navigation rail (in-flow sticky, hidden below lg) with SidebarHeader / SidebarBrand / SidebarNav / SidebarItem / SidebarFooter parts. Items are router-agnostic via the `render` prop; an optional collapsed icon-rail mode reveals labels in tooltips.

**Keywords:** sidebar, navigation, app chrome, rail

## Usage

Use Sidebar for persistent desktop navigation or application chrome outside the main content region.

### Best practices

- Do: Use it for stable app destinations that should remain visible while content changes.
- Do: Keep item labels predictable and active state obvious.
- Do: Set surface="page" when a full-width top bar sits above the rail. A theme's tinted or dark rail is for a full-height rail that frames the app.
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
| SidebarHeader | div props | The top of the rail, at least 64px tall. It holds SidebarBrand and may take a second row under it, such as a search field or a notifications button: give that row basis-full and the header grows to hold it instead of clipping. |
| SidebarBrand | { mark: ReactNode; label: ReactNode; render?: useRender.RenderProp } + div props | The brand row, inside SidebarHeader, on the same grid as SidebarItem: mark in the icons' 24px slot, label on the labels' column, so a logo lines up with the nav below it without copying the rail's inset numbers. Collapsed, it shows the mark alone (named by a string label). render={<Link to="/" />} makes it the home link. |
| SidebarItem | { label: ReactNode; icon?: ReactNode; active?: boolean; badge?: ReactNode; render?: useRender.RenderProp } + button props | A single nav row. label is the row text (inline when expanded, in a hover tooltip when collapsed); icon is the leading icon node (the consumer swaps fill weight for the active state); active marks the current route (accent fill + aria-current="page"); badge is a trailing node (e.g. a count) pushed to the row end and hidden when collapsed; render composes another element, e.g. render={<Link to="/x" />}. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| collapsed | boolean | false | Collapse the rail to an icon-only width (--sidebar-width-collapsed). Items hide their label + badge and reveal the label in a hover tooltip; the content area reflows. Controlled — wire a toggle from app state. Read the state in custom header/footer content via useSidebar(). |
| icons | boolean | true | Render the leading icon on each SidebarItem. Set false for a text-only rail. Ignored while collapsed (icon-only by definition). |
| variant | "app" \| "inline" | "app" | Where the rail lives. "app" is the page's chrome column — sticky, full viewport height, hidden below lg where AppHeader + BottomNav take over. "inline" is always visible and fills its parent's height, for a rail inside a bounded frame (a nested shell, an embedded preview). Use it instead of overriding the layout with !important classes. |
| surface | "rail" \| "page" | "rail" | Which surface the rail is painted on. "rail" is its own --sidebar-* surface with a border — right for a full-height rail that frames the app, which a theme may tint or paint dark. "page" uses the page's surface and ink with no border — use it when a full-width header sits above the rail, where a tinted column starting under a page-coloured bar reads as pasted on. Use it instead of overriding bg-/text- classes, which the rail's re-pointed tokens defeat. |

## Variants

- **variant**: app, inline

## Tokens used

`sidebar`, `sidebar-foreground`, `sidebar-border`, `sidebar-accent`, `sidebar-accent-foreground`, `sidebar-ring`

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

### Inline (inside a bounded frame)

```tsx
import { Icon, Sidebar, SidebarItem, SidebarNav } from "@sableui/react"

<div className="flex h-80 overflow-hidden rounded-lg border border-border"><Sidebar variant="inline"><SidebarNav><SidebarItem icon={<Icon name="home" />} label="Home" active /></SidebarNav></Sidebar><div className="flex-1 p-6">Content</div></div>
```

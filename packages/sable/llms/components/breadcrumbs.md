# Breadcrumbs

**Status:** stable

Navigation trail showing the path to the current page. A labelled <nav> wraps an inline <ol> of crumbs — interactive ancestor links, separators, and a non-interactive current page. No Base UI.

**Keywords:** breadcrumbs, hierarchy, path, navigation

## Usage

Use Breadcrumbs to show the user's location inside a hierarchy and provide lightweight parent navigation.

### Best practices

- Do: Use breadcrumbs when users can arrive deep in a nested structure.
- Do: Keep the current page as text so it reads as location, not another link.
- Don't: Do not use breadcrumbs as a substitute for primary navigation or step progress.
- Don't: Do not make the last crumb a link. It points at the page you are already on, and screen readers announce it as a destination; render it as the current page with aria-current.

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| BreadcrumbItem | yes | A single step in the path. |
| BreadcrumbLink | no | A linked ancestor destination. |
| BreadcrumbPage | yes | The current non-linked page. |
| BreadcrumbSeparator | no | The visual separator between steps. |

## Subcomponents

| Name | Type | Description |
| --- | --- | --- |
| BreadcrumbItem | ComponentPropsWithRef<'li'> | A single crumb slot (<li>) holding a link or the current page. |
| BreadcrumbLink | ComponentPropsWithRef<'a'> & { render?: useRender.RenderProp } | An interactive ancestor crumb (<a>). Muted by default, brightens to foreground on hover/focus. render composes another element with the crumb's styling, e.g. a router link: render={<Link to="/library" />}, so navigating stays in the app. |
| BreadcrumbPage | ComponentPropsWithRef<'span'> | The current-page crumb (<span aria-current="page">). Non-interactive, full-contrast. |
| BreadcrumbSeparator | ComponentPropsWithRef<'li'> + { children? } | Decorative divider (<li aria-hidden>) between crumbs. Defaults to a chevron-right icon; pass children to swap the glyph. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| Breadcrumbs | ComponentPropsWithRef<'nav'> | — | The trail root. Renders <nav aria-label="Breadcrumb"> around a flex <ol>. Pass the crumb parts as children. |

## Tokens used

`muted-foreground`, `foreground`

## Motion

- **arrival** · Root · _no motion_ — The trail is page furniture, rendered with the page header. An entrance would replay on every navigation, which is exactly when the reader looks at it to get their bearings.
- **response** · BreadcrumbLink · `motion-interactive` — Ancestors are muted until hovered or focused. Easing the ink makes the trail read as links answering the pointer; a hard snap across a row of small text looks like flicker.
- **transition** · Root · _no motion_ — A breadcrumb has no state of its own. The current page changes by navigation, which replaces the trail; animating between two trails would imply the path itself moved.
- **activity** · Root · _no motion_ — It never works in the background. A route that is still loading says so in the page, not in its address.

## Accessibility

- The <nav> carries aria-label="Breadcrumb" so assistive tech announces the landmark.
- Crumbs sit in an ordered list (<ol>) to convey hierarchy and position.
- The current page uses aria-current="page" and is rendered as plain text, not a link.
- Separators are aria-hidden so the chevron glyph is not announced.

## Related

- Components: SideNav, PageHeader

## Examples

### Three-level trail

```tsx
import { BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, Breadcrumbs, BreadcrumbSeparator } from "@sableui/react"

<Breadcrumbs><BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbLink href="/library">Library</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>Reports</BreadcrumbPage></BreadcrumbItem></Breadcrumbs>
```

### Custom separator

```tsx
import { BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, Breadcrumbs, BreadcrumbSeparator } from "@sableui/react"

<Breadcrumbs><BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator>/</BreadcrumbSeparator><BreadcrumbItem><BreadcrumbPage>Settings</BreadcrumbPage></BreadcrumbItem></Breadcrumbs>
```

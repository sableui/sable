# Region

**Status:** stable

The page region: fluid, edge-to-edge with the fluid page inset (--page-inset). Opt-in centered max cap picked by ROLE (prose/form/feed/content/wide/full), never a global page max-width. The root of nearly every route.

**Keywords:** region, page width, container, layout

## Usage

Use Region as the page-width primitive that applies fluid page inset and an optional purpose-named max width.

### Best practices

- Do: Choose the max value by content role, such as prose, form, feed, content, wide, or full.
- Do: Use Region near the route or section boundary so inner layout stays intentional.
- Don't: Do not use Region as a global wrapper that forces every page into the same max width.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| as | ElementType | "div" | Semantic element to render (e.g. "main", "section", "nav"). |
| inset | boolean | true | Apply the fluid horizontal page inset (--page-inset). |
| max | "prose" \| "form" \| "feed" \| "content" \| "wide" \| "full" \| CSS length | — | Opt-in centered max-width cap, purpose-named: prose 65ch (long-form reading) · form 480px (auth, narrow single-column forms) · feed 640px (single-column timeline) · content 896px (settings/admin panes) · wide 1280px (dashboards, tables, card grids) · full 1536px (full-bleed ceiling). Omit for fully fluid. |
| bleed | boolean | false | Full-bleed: edge to edge with no inset. Overrides inset. |
| safeArea | boolean \| ("top"\|"bottom"\|"left"\|"right")[] | false | env(safe-area-inset-*) padding for fixed or native-shell surfaces. true pads top+bottom; pass an edge array to target edges. |

## Related

- Components: Page, Grid, Columns

## Examples

### Settings pane

```tsx
import { PageHeader, Region } from "@sableui/react"

<Region as="main" max="content"><PageHeader title="Settings" /></Region>
```

### Fluid dashboard region

```tsx
import { Card, CardHeader, CardTitle, Grid, Region } from "@sableui/react"

<Region max="wide"><Grid minItemWidth="16rem"><Card><CardHeader><CardTitle>Revenue</CardTitle></CardHeader></Card><Card><CardHeader><CardTitle>Collects</CardTitle></CardHeader></Card></Grid></Region>
```

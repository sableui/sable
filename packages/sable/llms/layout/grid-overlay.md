# GridOverlay

**Status:** stable

Dev/docs structure visualizer — overlays the column grid so the layout skeleton is legible. Place inside a position:relative container; never ships in product UI.

**Keywords:** grid overlay, debug, layout visualizer, docs

## Usage

Use GridOverlay only as a development or documentation visualizer for the column structure.

### Best practices

- Do: Use it inside a position-relative layout while debugging alignment.
- Do: Keep it gated behind docs, debug, or development-only state.
- Don't: Do not ship GridOverlay as visible product UI.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| columns | number | 12 | Number of column bands. |
| gap | string | var(--grid-gutter) | Gap between bands. |
| inset | boolean | true | Align bands to the fluid page inset. |
| show | boolean | true | Toggle visibility. |

## Related

- Components: Grid, Columns, Region

## Examples

### Debugging a layout

```tsx
import { Card, CardContent, Col, Columns, GridOverlay } from "@sableui/react"

<div className="relative"><GridOverlay show={debug} /><Columns count={12}><Col span={8}><Card><CardContent><p className="text-body-md">Main</p></CardContent></Card></Col><Col span={4}><Card><CardContent><p className="text-body-md">Rail</p></CardContent></Card></Col></Columns></div>
```

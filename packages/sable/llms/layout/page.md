# Page

**Status:** stable

A route shell: Region (inset + opt-in max cap) whose children flow as a vertically-rhythmic Stack. Use as the top-level wrapper of a route's content — distinct from AppShell (the frame around routes) and PageHeader (the heading block inside).

**Keywords:** page, route shell, region, stack

## Usage

Use Page as a route content shell that combines Region sizing with vertical rhythm.

### Best practices

- Do: Use it as the top-level wrapper for route content after application chrome.
- Do: Set max by the page's content role rather than by the current viewport.
- Don't: Do not confuse Page with AppShell; Page is content, AppShell is the frame around routes.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| gap | number \| string | 4 | Vertical gap between stacked page sections. Number = rhythm units (×8px, so 4 = 32px); string = raw CSS. |
| align | "start" \| "center" \| "end" \| "stretch" | "stretch" | Cross-axis alignment of the stacked sections. |
| …RegionProps | as, inset, max, bleed, safeArea | — | All Region props pass through (Page IS a Region). |

## Related

- Components: Region, Stack, PageHeader, AppShell

## Examples

### Feed route

```tsx
import { Card, CardContent, Page, PageHeader } from "@sableui/react"

<Page as="main" max="feed"><PageHeader title="Home" description="Latest posts from people you follow." /><Card><CardContent><p className="text-body-md">First post.</p></CardContent></Card></Page>
```

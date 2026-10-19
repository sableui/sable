# Bleed

**Status:** stable

Escape a width-capped or inset ancestor to span the full CONTENT area (container-query units, so it stops at a fixed Sidebar instead of bleeding under it). Hero bands, profile covers, full-bleed media inside a capped Page. Width and margins are classes, so a breakpoint can turn the bleed off (lg:mx-0 lg:w-auto).

**Keywords:** bleed, full bleed, media band, layout

## Usage

Use Bleed to let a band or media element escape an inset or width-capped ancestor while staying within the content area.

### Best practices

- Do: Use it for hero bands, profile covers, or media that should align beyond a capped page column.
- Do: Keep surrounding content inside Region or Page so the bleed remains intentional.
- Don't: Do not use Bleed to place content under fixed app chrome or sidebars.

## Related

- Components: Page, Region, AspectBox

## Examples

### Full-bleed hero inside a capped page

```tsx
import { AspectBox, Bleed, Page, PageHeader } from "@sableui/react"

<Page max="feed"><Bleed><AspectBox ratio={3}><img src="/cover.jpg" alt="" className="size-full object-cover" /></AspectBox></Bleed><PageHeader title="Profile" /></Page>
```

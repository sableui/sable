# Card

**Status:** stable

Raised surface container (rounded-lg) with optional Header/Title/Description/Action/Content/Footer parts. A density knob trades the part padding (comfortable vs compact) for denser section panels. `render` makes the whole card one link or button, with a hover, a full-card focus ring and motion.

**Keywords:** card, surface, panel, container, tile, section, header, footer, settings, link card, clickable card, nav card

## Usage

Use Card for a discrete thing with its own boundary, such as one product, one notification, one metric, or one setting cluster. Do not use Card as the default way to group every page section; whitespace, headings, Stack, Section, and dividers often create cleaner hierarchy.

### Best practices

- Do: Use Card when the item could be reordered, removed, selected, or compared independently.
- Do: Keep sibling cards on the same density and padding rhythm so lists and grids scan cleanly.
- Do: Use CardHeader, CardContent, and CardFooter when the card has a stable title/body/action structure.
- Do: Make the whole card one link (`render={<a href="…" />}`) when the card IS a single destination — a nav tile, a gallery item, a news teaser — and nothing inside it is interactive. All of the card text becomes the accessible name of the link, so keep it short: a title and a line.
- Don't: Make a card a link when it holds its own buttons, menus, switches or links. Interactive content nested in a link is invalid HTML and announces twice; keep the card a plain surface and put the link on its title or in CardFooter instead.
- Don't: Wrap every settings section or form group in a card; use headings, Stack, or the SettingsPage pattern instead.
- Don't: Nest cards inside cards. Flatten the hierarchy or use dividers and spacing inside one card.

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| Container | yes | The raised or flat surface that creates the item boundary. |
| Header | no | Optional title, description, and aligned action area for the card's identity. |
| Content | yes | The body region. It should contain the information or controls that belong to this one item. |
| Footer | no | Optional action or metadata row, usually lower-emphasis than the header. |

## Subcomponents

| Name | Type | Description |
| --- | --- | --- |
| CardHeader | ComponentPropsWithRef<"div"> | Top section holding CardTitle/CardDescription (and optionally CardAction). Padding follows the density knob. |
| CardTitle | ComponentPropsWithRef<"div"> & { render?: useRender.RenderProp } | The card's name (text-title-lg). A div by default; pass `render={<h2 />}` (or h3…) to make it a heading in the page outline, at the level the card's position calls for. |
| CardDescription | ComponentPropsWithRef<"div"> | Muted supporting line under the title. |
| CardAction | ComponentPropsWithRef<"div"> | Header-aligned top-right action slot (e.g. an overflow menu, switch, or close button). Place inside CardHeader, which becomes a 2-column grid when present and collapses to a single column otherwise. A ghost or link Button that ends the slot bleeds by its own padding at the end, so a "View all" label or a "⋯" glyph sits on the card's content edge; filled buttons keep their edge there. |
| CardContent | ComponentPropsWithRef<"div"> & { flush?: boolean } | The body region. Padding follows the density knob on all sides — does not assume a preceding CardHeader, so it is safe to use standalone (e.g. no CardHeader in the card). When paired with CardHeader, the seam stays tight because CardHeader zeroes its own bottom padding. `flush` runs it edge to edge for a table: the Table insets its first and last columns by exactly the card padding, so it lines up with the header — never hand-set pl-6/pr-6 on columns. |
| CardList | ComponentPropsWithRef<"div"> | Rows that run edge to edge in the card (Entity rows, most often), divided by hairlines. Insets each row to the card's own padding, so a list card lines up with every other card at any density — no hand-tuned px-* on the rows. Under a CardHeader it opens with a hairline and a gap; alone it fills the card. |
| CardFooter | ComponentPropsWithRef<"div"> & { actions?: boolean } | Bottom row for actions/meta. Padding follows the density knob. `actions` marks it as the card's action row (buttons only): in a sheet (IosSheet, a bottom SheetContent) it becomes a full-width stack pinned to the bottom, primary on top; on a page nothing changes. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| variant | "default" \| "flat" | "default" | "default" raises with bg-card + border + soft shadow; "flat" is transparent, for a card inside a section that already frames it. A flat card made a link or button shows its shape only on hover (the muted fill), so over a photo with square bottom corners it reads as a cropped image at rest: give a linked media card the default variant. |
| density | "comfortable" \| "compact" | "comfortable" | Padding of the Header/Content/Footer parts: comfortable = p-6 (default), compact = p-4 for denser section panels (pair compact with the flat variant for a settings / form section panel). Threaded to the parts via the inherited --card-p custom property. Card sets --card-p via inline style, which beats a plain (non-!important) stylesheet override of the same property on the same element — use this prop rather than a className override; if an external override is unavoidable, it needs !important. |
| render | useRender.RenderProp | — | Replace the rendered element through the Base UI render prop — most often `render={<a href="/x" />}` (or a router Link) to make the whole card one link. When the rendered element is a link (a[href]) or a button, the card gains a hover state (stronger border and shadow; a muted fill when flat), a full-card focus-visible ring and motion-interactive easing. Any other element (article, li) stays a static surface. Children can answer the hover with `group-hover/card:`. |

## Variants

- **variant**: default, flat
- **density**: comfortable, compact

## Tokens used

`card`, `card-foreground`, `border`, `border-strong`, `muted`, `muted-foreground`, `ring`

## Motion

- **arrival** · Container · _no motion_ — A card is part of the layout it ships in; whatever stages that region owns the entrance. A card that fades in on its own delays reading the thing it holds.
- **response** · Container · `motion-interactive` — Only when the card is rendered as a link or button. The border, shadow and ring ease in so the pointer reads as landing on one target, not as the grid flickering. No motion-press: a 0.97 settle on a surface this large reads as the layout lurching. A static card has no response, so it gets no transition.
- **transition** · Container · _no motion_ — A card has no states of its own to move between. Selection is CheckboxCard or RadioCard; disclosure is Collapsible or Accordion.
- **activity** · Container · _no motion_ — A card does not work on anything. Loading content inside it is a Skeleton's job.

## Accessibility

- Purely presentational by default; add headings/landmarks in content as needed.
- Rendered as a link or button, the whole card is one target: its full text is the accessible name, and the focus ring wraps the whole card. Nothing interactive may sit inside it — nested links or buttons inside a link are invalid and unreachable for keyboard users in some browsers.
- A Card is a container, not a landmark and not a heading. If its title is the only heading in the region, render it as a real heading element with a title tier — a visually-styled div gives screen-reader heading navigation nothing to find.

## Related

- Components: Region, Stack, Separator, Button, Badge
- Patterns: DashboardPage, SettingsPage, ListDetailPage

## Examples

### With parts

```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@sableui/react"

<Card><CardHeader><CardTitle>Studio plan</CardTitle><CardDescription>Up to 10 seats.</CardDescription></CardHeader><CardContent><p className="text-body-md">Every seat gets unlimited projects and shared reports.</p></CardContent></Card>
```

### With a header action

```tsx
import { Button, Card, CardAction, CardContent, CardHeader, CardTitle, Icon } from "@sableui/react"

<Card><CardHeader><CardTitle>Seats</CardTitle><CardAction><Button variant="ghost" size="icon-sm" aria-label="More"><Icon name="ellipsis" /></Button></CardAction></CardHeader><CardContent><p className="text-body-md text-muted-foreground">24 of 100 seats in use.</p></CardContent></Card>
```

### Compact section panel

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@sableui/react"

<Card variant="flat" density="compact"><CardHeader><CardTitle>Notifications</CardTitle></CardHeader><CardContent><p className="text-body-sm text-muted-foreground">Push and email are enabled.</p></CardContent></Card>
```

### Product card with actions

```tsx
import { Badge, Button, Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@sableui/react"

<Card><CardHeader><CardTitle>Midnight Archive</CardTitle><CardDescription>Template · 24 pages</CardDescription><CardAction><Badge tone="1">New</Badge></CardAction></CardHeader><CardContent><p className="text-body-sm text-muted-foreground">A project template with a brief, a timeline and a review board.</p></CardContent><CardFooter><Button size="sm">Use template</Button><Button size="sm" variant="ghost">Preview</Button></CardFooter></Card>
```

### Whole card as a link

```tsx
import { Card, CardContent, CardDescription, CardTitle, Icon } from "@sableui/react"

<Card render={<a href="/components" />}><CardContent className="flex items-center justify-between gap-4"><div className="min-w-0"><CardTitle>Components</CardTitle><CardDescription>Every building block, with live examples.</CardDescription></div><Icon name="chevron-right" className="text-sm text-muted-foreground motion-interactive group-hover/card:translate-x-0.5 group-hover/card:text-foreground" /></CardContent></Card>
```

### Metric card

```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@sableui/react"

<Card density="compact"><CardHeader><CardTitle>Revenue</CardTitle><CardDescription>Last 30 days</CardDescription></CardHeader><CardContent><p className="text-heading-3">$12,840</p><p className="text-body-sm text-success">+12.8% from previous period</p></CardContent></Card>
```

### List card

```tsx
import { Avatar, Card, CardDescription, CardHeader, CardList, CardTitle, Entity } from "@sableui/react"

<Card><CardHeader><CardTitle>Members</CardTitle><CardDescription>3 people can edit this space.</CardDescription></CardHeader><CardList>{people.map((p) => <Entity key={p.id} interactive onSelect={() => open(p)} leading={<Avatar fallback={p.initials} alt={p.name} />} title={p.name} subtitle={p.role} />)}</CardList></Card>
```

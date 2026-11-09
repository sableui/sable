# CardStack

**Status:** stable

A compact collection of overlapping cards, opened by pressing the front card or a separate button. Expanded cards return to normal flow; back-card controls are inert while collapsed. Opening and closing is one eased movement: the height and every card travel together.

**Keywords:** card stack, collection, fan, stacked cards, browse collection

## Usage

Use for a small collection someone can inspect together: documents, photographs or project summaries. Supply the cards; CardStack owns overlap and expansion without a second overlay or gesture dependency.

### Best practices

- Do: Use trigger="stack" for presentational cards. Pressing the front card expands or collapses the collection without a separate control.
- Do: Give label a collection name and expandLabel a concrete action, including the item count when useful.
- Do: Keep the collection small. Use stable child keys so expanding does not reset state inside a card.
- Don't: Do not put an essential action exclusively on a covered card. The visible expansion control must reach it by keyboard and touch.
- Don't: Do not use the front card as a trigger when it contains links, inputs or other controls. Keep the separate button trigger for interactive cards.
- Don't: Do not use this for a long feed or a multi-page gallery; use a Grid or Carousel instead. → use **Carousel**

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| label | string | — | Accessible collection name. |
| expanded | boolean | — | Controlled expansion. |
| defaultExpanded | boolean | false | Initial uncontrolled expansion. |
| onExpandedChange | (expanded: boolean) => void | — | Called by the expansion control. |
| trigger | "button" \| "stack" | "button" | A separate button, or the front card itself. Use stack only when the front card contains no interactive controls. |
| expandLabel | string | "Browse collection" | Expansion action. Visible on the button trigger; an accessible description on the stack trigger, whose name comes from its visible content. |
| collapseLabel | string | "Collapse collection" | Collapse action. Visible on the button trigger; an accessible description on the stack trigger. |
| motion | "full" \| "subtle" \| "off" | — | Only turns motion down. Expansion remains available at every level. |

## Motion

- **arrival** · Collection · _no motion_ — The collection starts at rest, without a page-load stagger.
- **transition** · Collection and cards · _custom (outside the recipe layer)_ — Height and each card's position ease together on --motion-duration-slow and --motion-ease-standard (WAAPI, read from the tokens), so the cards never hang outside the box or snap into place. Expressive: subtle and off change layout at once. A toggle mid-way starts from what is on screen.
- **transition** · Cards · `motion-stack-card` — The fan straightens and returns on the same duration and curve as the travel; expanded cards read normally.

## Accessibility

- The trigger exposes aria-expanded and aria-controls. A stack trigger keeps its visible card content as its accessible name; its description names the expansion or collapse action.
- Base UI owns Enter/Space activation on the stack trigger, which retains focus through expansion and collapse.
- Covered cards are inert and aria-hidden until expanded. Expansion is explicit on touch and keyboard; hover is never required.

## Related

- Components: Card, Carousel, Collapsible

## Examples

### Project collection

```tsx
import { Card, CardContent, CardStack } from "@sableui/react"

<CardStack label="Projects" trigger="stack" expandLabel="Show 2 projects"><Card><CardContent>Research</CardContent></Card><Card><CardContent>Design</CardContent></Card></CardStack>
```

### Controlled and still

```tsx
import { Card, CardContent, CardStack } from "@sableui/react"

const [open, setOpen] = useState(true)
<CardStack label="Documents" expanded={open} onExpandedChange={setOpen} motion="off"><Card><CardContent>Brief</CardContent></Card><Card><CardContent>Notes</CardContent></Card></CardStack>
```

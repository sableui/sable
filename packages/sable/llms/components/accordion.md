# Accordion

**Status:** stable

Stacked, collapsible disclosure sections over Base UI Accordion — roving focus, arrow-key navigation, ARIA region/heading/button wiring, and an animated height transition. Each item pairs a full-width trigger (with a rotating chevron) and a panel.

**Keywords:** accordion, disclosure, collapse, faq

## Usage

Use Accordion to reveal a vertical set of related sections while keeping the surrounding page scannable.

### Best practices

- Do: Use concise trigger text that describes the content revealed below it.
- Do: Keep section content focused so expanding one item does not feel like navigating to a new page.
- Don't: Do not hide required fields, primary actions, or critical errors inside collapsed sections.
- Don't: Do not nest an Accordion inside an Accordion. Two layers of roving focus fight each other, and the arrow keys become ambiguous — flatten the hierarchy or use a Tree.

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| AccordionItem | yes | One expandable section in the group. |
| AccordionTrigger | yes | The button-like control that opens the section. |
| AccordionPanel | yes | The content revealed by the trigger. |

## Subcomponents

| Name | Type | Description |
| --- | --- | --- |
| AccordionItem | Base UI Accordion.Item props + className (value, disabled, onOpenChange) | Pairs a header with its panel. Give each a stable `value` to control or set initial open state. |
| AccordionTrigger | Base UI Accordion.Trigger props + className + indicator?: ReactNode | The header button (Header + Trigger composed). Renders children plus a chevron that rotates via data-[panel-open] by default; pass `indicator` to replace the icon and its open-state behavior entirely (e.g. a plus that becomes an × for a FAQ-style toggle). |
| AccordionPanel | Base UI Accordion.Panel props + className (keepMounted, hiddenUntilFound) | The collapsible body. Animates height using the --accordion-panel-height CSS var; fades on data-[starting-style]/data-[ending-style]. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| Accordion (Root) | Base UI Accordion.Root props (value, defaultValue, multiple, disabled, onValueChange, orientation, loopFocus, keepMounted, hiddenUntilFound) | — | Groups all items and owns the open value(s). Uncontrolled via defaultValue, controlled via value. |
| defaultValue | Value[] | [] | Uncontrolled set of item values that start expanded (e.g. ['faq-1']). |
| value | Value[] | — | Controlled set of expanded item values; pair with onValueChange. |
| onValueChange | (value: Value[]) => void | — | Called with the new set of expanded item values when an item opens or closes. |
| multiple | boolean | false | Whether more than one item can be open at the same time. When false, opening one closes the others. |

## Tokens used

`border`, `foreground`, `muted-foreground`, `ring`

## Motion

- **arrival** · Root · _no motion_ — An accordion is page furniture that is present from first paint. Animating it in would stage content the reader is already scanning past.
- **response** · AccordionTrigger · `motion-interactive` — The whole header row is the hit target, and it looks like a heading rather than a control. The hover shift is what tells the reader it can be clicked before they click it.
- **transition** · AccordionPanel · `motion-disclosure` — Panel height is the only cue that content came from THIS header rather than appearing at the bottom of the page. Snapping it open moves everything below by a screenful with nothing connecting cause to effect.
- **activity** · Root · _no motion_ — Nothing here is indeterminate — the panel content is already resident. A panel that loads on expand should put its own loader inside the panel.

## Accessibility

- Base UI renders the trigger inside an <h3> heading and wires aria-expanded / aria-controls to the panel region.
- Arrow keys move roving focus between triggers; Home/End jump to the first/last; loopFocus wraps by default.
- Each trigger toggles its panel with Enter/Space; the panel is announced as a labelled region.
- A disabled AccordionItem dims and is skipped by keyboard focus while neighbouring items stay interactive.
- The chevron rotation is driven by data-[panel-open] and the focus ring by focus-visible — both honor reduced-motion via the consumer's transitions.

## Related

- Components: Collapsible, Tabs

## Examples

### Single (default)

```tsx
import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger } from "@sableui/react"

<Accordion defaultValue={["a"]}><AccordionItem value="a"><AccordionTrigger>Can I cancel anytime?</AccordionTrigger><AccordionPanel>Yes — from billing settings.</AccordionPanel></AccordionItem><AccordionItem value="b"><AccordionTrigger>How much?</AccordionTrigger><AccordionPanel>$16 per seat each month.</AccordionPanel></AccordionItem></Accordion>
```

### Multiple open

```tsx
import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger } from "@sableui/react"

<Accordion multiple defaultValue={["a", "b"]}><AccordionItem value="a"><AccordionTrigger>First</AccordionTrigger><AccordionPanel>One.</AccordionPanel></AccordionItem><AccordionItem value="b"><AccordionTrigger>Second</AccordionTrigger><AccordionPanel>Two.</AccordionPanel></AccordionItem></Accordion>
```

### Custom indicator (plus-becomes-×)

```tsx
import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger, Icon } from "@sableui/react"

<Accordion defaultValue={["a"]}><AccordionItem value="a"><AccordionTrigger indicator={<Icon name="plus" className="text-xs text-muted-foreground transition-transform [[data-panel-open]_&]:rotate-45" />}>Can I cancel anytime?</AccordionTrigger><AccordionPanel>Yes — from billing settings.</AccordionPanel></AccordionItem></Accordion>
```

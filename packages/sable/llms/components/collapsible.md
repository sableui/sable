# Collapsible

**Status:** stable

Show/hide a panel of content over Base UI Collapsible — open/close state, ARIA expanded wiring, and the animated height transition. The minimal primitive behind Accordion: a trigger that toggles an overflow-clipped panel.

**Keywords:** collapsible, disclosure, expand, collapse

## Usage

Use Collapsible for a single piece of optional content that can expand in place.

### Best practices

- Do: Use it for local detail, advanced settings, or secondary context.
- Do: Make the trigger label describe the hidden content, not the mechanism.
- Don't: Do not use Collapsible for multi-section navigation; use Accordion or Tabs instead. → use **Accordion**, **Tabs**
- Don't: Do not animate it by transitioning height from auto. Use the motion-disclosure recipe, which transitions to the measured panel height — `auto` does not animate and the panel will snap.

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| CollapsibleTrigger | yes | The control that toggles the panel. |
| CollapsiblePanel | yes | The content that expands or collapses. |
| CollapsibleIndicator | no | A visual affordance for open or closed state. |

## Subcomponents

| Name | Type | Description |
| --- | --- | --- |
| CollapsibleTrigger | Base UI Collapsible.Trigger props + render | The button that toggles the panel. Compose with render={<Button variant="ghost" … />}. |
| CollapsiblePanel | Base UI Collapsible.Panel props + className (keepMounted, hiddenUntilFound) | The collapsible contents. Overflow-hidden; animates height via the --collapsible-panel-height var Base UI sets. |
| CollapsibleIndicator | { className? } | Auto-rotating disclosure chevron. Place it inside the trigger content and add the `group/collapsible` class to the trigger so it flips 180° on open. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| Collapsible (Root) | Base UI Collapsible.Root props (open, defaultOpen, onOpenChange, disabled) | — | Groups the trigger and panel and owns open state. Uncontrolled by default; pass `open` + `onOpenChange` to control it. |
| defaultOpen | boolean | false | Whether the panel starts open in the uncontrolled case. |
| disabled | boolean | false | Disables the trigger and prevents toggling. |

## Tokens used

`foreground`, `muted-foreground`

## Motion

- **arrival** · Root · _no motion_ — A collapsible is part of the page it sits in, present from first paint. Its trigger is what the reader notices, not an entrance.
- **response** · CollapsibleTrigger · _no motion_ — The trigger is whatever the consumer renders (usually a Button), and that control brings its own response. Adding one here would double it.
- **transition** · CollapsiblePanel · `motion-disclosure` — The height change ties the content that appears to the trigger that was pressed; snapped open, everything below jumps with nothing linking cause to effect.
- **transition** · CollapsibleIndicator · `motion-interactive` — The chevron turns with the panel rather than flipping in one frame: motion-interactive lists `rotate`, the property rotate-180 writes.
- **activity** · Root · _no motion_ — Nothing here is indeterminate; content that loads on open should put its own loader inside the panel.

## Accessibility

- Base UI wires aria-expanded on the trigger and aria-controls/id between trigger and panel.
- Trigger is a real <button>; toggles on click and Enter/Space.
- Animate open/close via data-[starting-style]/data-[ending-style]; data-[panel-open] marks the open state.
- Set hiddenUntilFound on the panel to let in-page browser search expand it.

## Related

- Components: Accordion, ShowMore

## Examples

### Basic

```tsx
import { Button, Collapsible, CollapsiblePanel, CollapsibleTrigger } from "@sableui/react"

<Collapsible><CollapsibleTrigger render={<Button variant="ghost">Details</Button>} /><CollapsiblePanel><p className="pt-3">Hidden content revealed on toggle.</p></CollapsiblePanel></Collapsible>
```

### Open by default

```tsx
import { Button, Collapsible, CollapsiblePanel, CollapsibleTrigger } from "@sableui/react"

<Collapsible defaultOpen><CollapsibleTrigger render={<Button variant="ghost">Summary</Button>} /><CollapsiblePanel><p className="pt-3">Visible on first render.</p></CollapsiblePanel></Collapsible>
```

### With rotating chevron

```tsx
import { Button, Collapsible, CollapsibleIndicator, CollapsiblePanel, CollapsibleTrigger } from "@sableui/react"

<Collapsible><CollapsibleTrigger className="group/collapsible" render={<Button variant="ghost">Details <CollapsibleIndicator /></Button>} /><CollapsiblePanel><p className="pt-3">Revealed on toggle.</p></CollapsiblePanel></Collapsible>
```

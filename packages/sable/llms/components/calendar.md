# Calendar

**Status:** stable

Date picker grid wrapping react-day-picker v9, themed entirely with semantic tokens (no external stylesheet). Supports single, multiple, and range selection; nav chevrons render through the injected icon set.

**Keywords:** calendar, date grid, month, schedule

## Usage

Use Calendar to browse or choose dates in a month grid, especially when relative date position matters.

### Best practices

- Do: Use it when users need to compare weekdays, ranges, or nearby dates.
- Do: Provide selected, disabled, and today states when date choice is interactive.
- Don't: Do not use Calendar when a compact DatePicker (with granularity="minute" for a time) would be faster.
- Don't: Do not use it as the only way to enter a date. A grid is slow for a date far from today and unusable for someone who knows the value — always pair it with a text input.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| mode | "single" \| "multiple" \| "range" | — | Selection behavior. Pair with the matching selected/onSelect shape (Date, Date[], or DateRange). |
| selected | Date \| Date[] \| DateRange \| undefined | — | The controlled selection. Shape follows mode. |
| onSelect | (value, triggerDate, modifiers, event) => void | — | Fires when a day is chosen. The first argument's type follows mode. |
| defaultMonth | Date | — | The month shown on first render (uncontrolled navigation). |
| month | Date | — | Controlled displayed month; pair with onMonthChange. |
| numberOfMonths | number | 1 | How many month grids to render side by side. |
| disabled | Matcher \| Matcher[] | — | Days matching this are dimmed and non-selectable (e.g. { before: new Date() }). |
| showOutsideDays | boolean | true | Render leading/trailing days from adjacent months, dimmed. |
| bare | boolean | false | Drop the card frame (border, fill, padding) so the grid sits flush inside a surface that already has one, such as a Popover. DatePicker renders its Calendar this way. |
| motion | "full" \| "subtle" \| "off" | "full" | How much motion this component uses: `full` inherits the app's policy, `subtle` keeps feedback and drops the month slide, `off` stills it. It can only turn motion down — it never overrides a reader's reduce-motion setting. |
| className | string | — | Merged onto the bordered card container that wraps the grid. |
| classNames | Partial<ClassNames> | — | Per-part class overrides merged over the themed defaults. Themed slots: months, month, nav, button_previous, button_next, month_caption, caption_label, month_grid, weekdays, weekday, week, day, day_button, range_start, range_middle, range_end, selected, today, outside, disabled, hidden. Selection/state slots (selected/today/range_*/outside/disabled) style the day CELL; the inner day button is targeted via the [&>button] descendant. |
| components | Partial<CustomComponents> | — | Render overrides for RDP parts. Chevron is supplied by default and merged with yours. |

## Variants

- **mode**: single, multiple, range

## Tokens used

`card`, `card-foreground`, `border`, `primary`, `primary-foreground`, `accent`, `accent-foreground`, `muted-foreground`, `ring`

## Motion

- **arrival** · Root · _no motion_ — Inline, it arrives with its form; in a DatePicker the Popover carries the entrance. A grid that animated in by itself would put a second motion on the same opening.
- **response** · Day · `motion-interactive` — Days ease their hover wash, and the month arrows are ghost Buttons on Button's own recipe. Across a seven-column grid the pointer crosses many cells at once, and an eased wash reads as a cursor travelling rather than a grid flashing.
- **transition** · Day · `motion-interactive` — Picking a day eases the primary fill onto it and off the previous one, so a click reads as the selection moving rather than two cells flipping. A range's band is painted on the cells, which carry the same recipe, so the band eases along with its endpoints as the range grows.
- **transition** · Month · _custom (outside the recipe layer)_ — Paging months slides the outgoing grid toward the edge it is leaving by and brings the new one in from the other, over a short travel with a fade (react-day-picker's `animate` mode on Sable keyframes in styles.css), so forward and back read as direction rather than a grid swapping in one frame. RDP adds a single class per part, which a recipe utility cannot be; mirrored in RTL. Expressive: Calendar turns `animate` on only at full motion, and an explicit `animate` prop still wins.
- **activity** · Root · _no motion_ — Days are resident data; nothing in the grid loads. Availability fetched per month belongs to the surface around the calendar.

## Accessibility

- react-day-picker manages the roving-tabindex grid, arrow-key navigation, and ARIA roles/labels for the calendar.
- Selected days use bg-primary/text-primary-foreground for AA contrast; today is marked with a dot under the number (not a ring, which is reserved for keyboard focus) rather than color alone.
- Disabled and outside days are dimmed and removed from the tab order.
- Nav chevrons resolve through the injected IconProvider; ensure chevron-left and chevron-right are registered in the icon set.

## Related

- Components: DatePicker

## Examples

### Single date

```tsx
import { Calendar } from "@sableui/react"

const [date, setDate] = useState<Date>()
<Calendar mode="single" selected={date} onSelect={setDate} />
```

### Range

```tsx
import { Calendar } from "@sableui/react"
import type { DateRange } from "react-day-picker"

const [range, setRange] = useState<DateRange>()
<Calendar mode="range" selected={range} onSelect={setRange} numberOfMonths={2} />
```

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
| className | string | — | Merged onto the bordered card container that wraps the grid. |
| classNames | Partial<ClassNames> | — | Per-part class overrides merged over the themed defaults. Themed slots: months, month, nav, button_previous, button_next, month_caption, caption_label, month_grid, weekdays, weekday, week, day, day_button, range_start, range_middle, range_end, selected, today, outside, disabled, hidden. Selection/state slots (selected/today/range_*/outside/disabled) style the day CELL; the inner day button is targeted via the [&>button] descendant. |
| components | Partial<CustomComponents> | — | Render overrides for RDP parts. Chevron is supplied by default and merged with yours. |

## Variants

- **mode**: single, multiple, range

## Tokens used

`card`, `card-foreground`, `border`, `primary`, `primary-foreground`, `accent`, `accent-foreground`, `muted-foreground`, `ring`

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

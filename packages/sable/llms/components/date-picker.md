# DatePicker

**Status:** stable

Date, date-range, date-and-time or time picker: a field-shaped trigger (the Input / SelectTrigger shell) opens a Popover holding Sable's Calendar. With granularity="day" selecting a day fires onValueChange and closes; granularity="minute" adds an hour + minute row of Selects and keeps the time-of-day when the day changes; granularity="time" is that row alone; mode="range" picks a start and an end day. With a name it submits its value in a form.

**Keywords:** date picker, due date, property row, inspector, calendar, date input, date time picker, date range picker, range, time picker, time field, time, schedule, form

## Usage

Use DatePicker when users need to choose one date — or, with granularity="minute", one date and time; with granularity="time", a time of day; with mode="range", a start and an end day — from a compact control.

### Best practices

- Do: Use it in forms where a typed date alone would be error-prone.
- Do: Show clear selected and disabled states when date rules apply.
- Do: Set granularity="minute" when a time matters, with a minuteStep that matches the real precision (15 for meetings, 5 for scheduled posts).
- Do: Use mode="range" for a stay, a report period or a leave request — one control holding both ends — rather than two DatePickers whose order the user has to police.
- Do: Give it a name inside a form: it submits yyyy-MM-dd (a day), yyyy-MM-ddTHH:mm (a minute), HH:mm (a time) or yyyy-MM-dd/yyyy-MM-dd (a range), the formats a server already parses from native date inputs. Wrap it in <Field required> and an empty picker blocks the submit.
- Don't: Do not show a time without saying which zone it is in. A meeting time with no zone is wrong for everyone not in yours — wrap the picker in a Field whose description names the zone.
- Don't: Do not leave the format ambiguous. `03/04` is two different dates depending on the reader's locale — the trigger shows a formatted date precisely so the interpretation is not guessed.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| mode | "single" \| "range" | "single" | One date, or a { from, to } range. In range mode the first pick sets the start, the second the end (in either order) and closes the popover; value, defaultValue and onValueChange take a DateRange (exported), and granularity is always "day". |
| value | Date \| DateRange | — | The selected date (controlled), or the { from, to } range under mode="range" (to is unset while only the start is picked). When absent, the trigger shows a muted placeholder. |
| defaultValue | Date \| DateRange | — | Initial value when uncontrolled (no `value` prop). |
| onValueChange | ((date: Date \| undefined) => void) \| ((range: DateRange \| undefined) => void) | — | Fired when the day is chosen or cleared, and under granularity="minute" / "time" when the hour or minute changes. With granularity="day" it also closes the popover. In range mode it fires on both picks: with only from after the first, with both after the second. |
| onChange | (date: Date \| undefined) => void | — | Deprecated alias for onValueChange, kept for backwards compatibility. Both fire when set; prefer onValueChange. |
| granularity | "day" \| "minute" \| "time" | "day" | What the picker chooses. "minute" adds an hour + minute row and keeps the popover open so day and time can be set in any order. "time" is the hour + minute row alone, with no calendar: the value is a Date that keeps its day (today when there was none). |
| minuteStep | number | 5 | Minute increment for the time row (granularity="minute" or "time"). |
| defaultTime | string | "00:00" | Time-of-day shown and applied while nothing is selected yet, as 24h "HH:mm" — the first day pick lands on this time instead of midnight (granularity="minute" or "time"). |
| placeholder | string | "Pick a date" ("Pick date & time" for minute, "Pick a time" for time, "Pick a date range" in range mode) | Trigger label shown when no date is selected. |
| disabled | boolean | — | Disable the trigger and block selection. |
| readOnly | boolean | — | Show the value without letting it change: the popover does not open, and the submitted value is not validated. |
| name | string | — | Name of the submitted value. A visually hidden input carries it into FormData: yyyy-MM-dd for a day, yyyy-MM-ddTHH:mm (local, the datetime-local format) for a minute, HH:mm for a time, and an ISO 8601 interval yyyy-MM-dd/yyyy-MM-dd for a range (empty until both ends are picked). Empty when nothing is selected. It reaches native FormData and onSubmit, not Form's onFormSubmit values object, which lists Base UI controls only. |
| form | string | — | The id of the <form> the value belongs to, when the picker sits outside it. |
| required | boolean | — | A value is needed before the form submits: the trigger is aria-required, and a native or Sable Form submit is blocked while empty, with focus moved to the trigger. A wrapping <Field required> sets it. |
| minDate | Date | — | Earliest selectable day (inclusive). Earlier days are disabled and navigation is bounded. |
| maxDate | Date | — | Latest selectable day (inclusive). Later days are disabled and navigation is bounded. |
| size | "md" \| "sm" \| "xs" | "md" | The trigger's rung. md is the form field beside Input and Select. sm is md one rung down, the same raised field: a date filter in a toolbar beside an sm SelectTrigger and sm buttons. xs is the property-grid rung (24px in a workspace): an inset panel-field well with no border, the same shape as SelectTrigger size="xs" and ScrubField on the neighbouring rows of an inspector — use it for a due date in a PropertyRow instead of a native date input. |
| locale | Locale (date-fns) | — | The date-fns locale for the calendar (month and weekday names, first day of the week) and for the trigger's label, so both speak one language. Without it both are English (en-US), identical on the server and the client. import { de } from "date-fns/locale". |
| formatOptions | Intl.DateTimeFormatOptions | — | How the trigger writes the chosen date, as Intl.DateTimeFormat options in locale (en-US without one) — { month: "short", day: "numeric" } for "Oct 23" where the rest of a list writes dates that way. Omitted: "Oct 23, 2026" (with "at 14:30" under granularity="minute"). |
| timeLabel | string | "Time" | Accessible name of the time row's group. |
| hourLabel | string | "Hour" | Accessible name of the hour Select. |
| minuteLabel | string | "Minute" | Accessible name of the minute Select. |
| className | string | — | Extra classes merged onto the trigger. |
| ref / id / aria-* / … | button attributes | — | ref and every other button attribute are forwarded to the trigger, so a wrapping Field ties its label to the picker and announces its description and error, and a ref can focus it. Pass the aria attributes yourself only when labelling the picker without a Field. |

## Tokens used

`primary`, `primary-foreground`, `accent`, `accent-foreground`, `foreground`, `muted-foreground`, `popover`, `popover-foreground`, `border`, `field-border`, `field`, `ring`

## Accessibility

- Trigger opens on click/Enter/Space; the popover traps focus and restores it to the trigger on close (Base UI Popover).
- The calendar grid (react-day-picker) provides a roving tabindex, arrow-key day navigation, and aria-selected on the chosen day.
- Navigation chevrons render through the Icon adapter and inherit the calendar's button labels.
- Esc and outside press dismiss the popover.
- In a form the value rides a visually hidden, aria-hidden input with tabIndex -1 (not type=hidden, which constraint validation skips). When a required, empty picker blocks a submit the browser focuses that input, which hands focus straight to the trigger.
- With granularity="minute" the hour and minute Selects are full Base UI listboxes (typeahead, ARIA) labelled "Hour" and "Minute" (hourLabel / minuteLabel) inside a group named "Time" (timeLabel); selecting a day keeps the chosen time-of-day, so day and time can be set in any order.

## Related

- Components: Calendar, Field

## Examples

### In an inspector row

```tsx
import { DatePicker, PanelSection, PropertyRow } from "@sableui/react"

<PanelSection title="Properties">
	<PropertyRow label="Due date">
		<DatePicker size="xs" aria-label="Due date" value={due} onValueChange={setDue} formatOptions={{ month: "short", day: "numeric" }} />
	</PropertyRow>
</PanelSection>
```

### Controlled

```tsx
import { DatePicker } from "@sableui/react"

const [date, setDate] = useState<Date>()
<DatePicker value={date} onValueChange={setDate} />
```

### Custom placeholder

```tsx
import { DatePicker } from "@sableui/react"

<DatePicker placeholder="Schedule for…" value={date} onValueChange={setDate} />
```

### Date and time

```tsx
import { DatePicker } from "@sableui/react"

const [start, setStart] = useState<Date>()
<DatePicker granularity="minute" value={start} onValueChange={setStart} minDate={new Date()} defaultTime="09:00" minuteStep={15} />
```

### Date range

```tsx
import { DatePicker, type DateRange } from "@sableui/react"

const [stay, setStay] = useState<DateRange>()
<DatePicker mode="range" value={stay} onValueChange={setStay} minDate={new Date()} placeholder="Check-in – check-out" />
```

### In a form

```tsx
import { Button, DatePicker, Field, Form } from "@sableui/react"

<Form onSubmit={(event) => { event.preventDefault(); save(new FormData(event.currentTarget)) }}>
	<Field label="Check-in" required>
		<DatePicker name="checkin" minDate={new Date()} />
	</Field>
	<Field label="Opens at">
		<DatePicker name="opens" granularity="time" minuteStep={15} defaultTime="09:00" />
	</Field>
	<Button type="submit">Book</Button>
</Form>
```

### Localised (de from date-fns/locale)

```tsx
import { DatePicker } from "@sableui/react"

<DatePicker locale={de} value={date} onValueChange={setDate} placeholder="Datum wählen" />
```

### Disabled

```tsx
import { DatePicker } from "@sableui/react"

<DatePicker disabled />
```

### Bounded (no past dates)

```tsx
import { DatePicker } from "@sableui/react"

<DatePicker value={date} onValueChange={setDate} minDate={new Date()} />
```

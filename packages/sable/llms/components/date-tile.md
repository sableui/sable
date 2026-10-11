# DateTile

**Status:** stable

A calendar-page date: the short month on a primary band over the day number, in a <time> element. The leading visual of an event, booking or deadline row.

**Keywords:** date, calendar, event, day, month, schedule, booking, tile

## Usage

Use DateTile as the leading visual when the date is what a reader scans a list or card by — events, bookings, deadlines, releases. It sits beside a title and a time line, usually in an Entity's `leading` slot or a flex row in a CardContent. For a date inside a sentence or a row's metadata, use text or RelativeTime instead.

### Best practices

- Do: Pair the tile with a title and the full time or range in text beside it; the tile only names the day.
- Do: Keep every row of a list on DateTile so the dates line up as one column.
- Don't: Use it for timestamps ("2 hours ago", "Oct 14, 10:02") — that is RelativeTime or plain metadata text.
- Don't: Stretch it to its neighbour's height or restyle the band per row; the tile is a fixed shape so a column of them reads as one calendar.

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| Band | yes | The short month name on the primary colour. |
| Day | yes | The day of the month, on the muted surface. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| date | Date | — | The day to show, read in local time. Rendered as `<time dateTime="YYYY-MM-DD">`. |
| locale | string | runtime locale | BCP 47 locale for the month name. |

## Tokens used

`muted`, `primary`, `primary-foreground`, `foreground`

## Motion

- **arrival** · Tile · _no motion_ — A static label; it appears with whatever row or card holds it.
- **response** · Tile · _no motion_ — Not interactive.
- **transition** · Tile · _no motion_ — It has no states to move between.
- **activity** · Tile · _no motion_ — Nothing runs in the background.

## Accessibility

- Renders a <time> with a machine-readable `dateTime`, so the day is announced as text ("Oct 14") and parsable as a date.
- The tile names only the day — state the weekday, time or range in the text beside it, where it is read in order.

## Related

- Components: Entity, Card, RelativeTime, Calendar

## Examples

### Event row

```tsx
import { DateTile, Row, Stack } from "@sableui/react"

<Row gap={4} align="start">
	<DateTile date={new Date(2026, 9, 14)} />
	<Stack gap={1}>
		<span className="text-title-lg">Design review</span>
		<span className="text-body-sm text-muted-foreground">Tuesday, 2:00 – 2:45 PM</span>
	</Stack>
</Row>
```

### In an Entity list

```tsx
import { CardList, DateTile, Entity } from "@sableui/react"

<CardList>
	<Entity leading={<DateTile date={new Date(2026, 9, 14)} />} title="Design review" subtitle="Tuesday, 2:00 PM" />
	<Entity leading={<DateTile date={new Date(2026, 9, 21)} />} title="Launch" subtitle="Tuesday, all day" />
</CardList>
```

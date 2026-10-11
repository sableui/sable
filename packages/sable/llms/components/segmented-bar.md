# SegmentedBar

**Status:** stable

One bar split into the parts of a whole — revenue by type, storage by kind, results by outcome. Segments size by their share of the total; the bar is one labelled image to assistive tech.

**Keywords:** breakdown, stacked, segmented, proportion, split, distribution, category, bar, share

## Usage

Use SegmentedBar when a stat card or row needs to show how a total divides into a few categories. Pair it with a legend you compose (StatusDot + label + share), placed where the card has room. For one reading against a range (storage used, quota), use Meter; for task completion, use Progress.

### Best practices

- Do: Keep it to two to six segments and give the same category the same tone everywhere it appears.
- Do: Show the legend's shares in text ("42%") — colour identifies a segment, but the number is what a reader compares.
- Don't: Use it for a single value against a limit; that is Meter, which carries the meter role and its value.
- Don't: Rely on tone order alone to tell segments apart; a legend row per segment, with its label, is required.

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| Track | yes | The rounded bar; segments fill it edge to edge with a hairline gap. |
| Segment | yes | One category, sized by its share of the total and filled with its tone. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| segments | { label: string; value: number; tone?: SegmentedBarTone }[] | — | The categories, left to right. Values in any unit; zero or negative values are skipped. |
| label | string | — | What the bar breaks down. Prefixes the accessible summary of every segment's share. |
| size | "sm" \| "md" \| "lg" | "md" | Bar thickness — the same rails as Meter and Progress. |
| locale | string | runtime locale | Locale for the spoken percentages. |

## Variants

- **size**: sm, md, lg
- **tone**: edition, collectible, standard, info, primary, neutral, success, warning, destructive

## Tokens used

`tone-edition`, `tone-collectible`, `tone-standard`, `tone-info`, `primary`, `muted-foreground`, `success`, `tone-warning`, `destructive`

## Motion

- **arrival** · SegmentedBar · _no motion_ — A breakdown is a reading, present with the card that reports it; growing the segments in on load would act out a change that did not happen.
- **response** · SegmentedBar · _no motion_ — It reports and accepts no input.
- **transition** · Segment · _custom (outside the recipe layer)_ — Each segment's share and colour ease on the motion tokens when the data changes (no recipe animates flex-grow), so the reader sees which part grew.
- **activity** · SegmentedBar · _no motion_ — No indeterminate state — an unknown breakdown is not drawn.

## Accessibility

- Rendered role=img with an aria-label built from `label` and each segment's share ("Revenue by type: Editions 42%, Collectibles 27%"), so the whole breakdown is read in one stop.
- Colour alone does not identify a segment: always show a legend with each segment's label beside the bar.

## Related

- Components: Meter, Progress, StatusDot, Card
- Patterns: DashboardPage

## Examples

### With a legend

```tsx
import { SegmentedBar, Stack, StatusDot } from "@sableui/react"

const sales = [
	{ label: "Editions", value: 42, tone: "edition" },
	{ label: "Collectibles", value: 27, tone: "collectible" },
	{ label: "Standard", value: 19, tone: "standard" },
] as const

<Stack gap={3}>
	<SegmentedBar label="Revenue by type" segments={[...sales]} size="lg" />
	<ul className="flex flex-col gap-1.5">
		{sales.map((s) => (
			<li key={s.label} className="flex items-center gap-2 text-body-sm">
				<StatusDot tone={s.tone} />
				<span className="flex-1 text-muted-foreground">{s.label}</span>
				<span className="text-mono-caption">{s.value}%</span>
			</li>
		))}
	</ul>
</Stack>
```

### Test results — status tones

```tsx
import { SegmentedBar } from "@sableui/react"

<SegmentedBar
	label="Test results"
	segments={[
		{ label: "Passed", value: 412, tone: "success" },
		{ label: "Flaky", value: 9, tone: "warning" },
		{ label: "Failed", value: 3, tone: "destructive" },
	]}
/>
```

# Pill

**Status:** stable

A chip someone clicks: a filter, a tag choice, an option in a row. Always a button with aria-pressed. appearance="solid" (filters; selected lifts onto the primary surface) or "outline" (quiet chips that annotate content, like reactions); size lg, md or sm. A static label is a Badge.

**Keywords:** pill, chip, filter, tag, toggle chip, category

## Usage

Use Pill for a row of filters or choices a person clicks to narrow or toggle what they see. For a label that only describes something, use Badge.

### Best practices

- Do: Use short text that names the filter or choice.
- Do: Reflect the current choice with selected, so the active filter reads at a glance.
- Do: In a toolbar where filter chips share a row with a search field ("All 8 · Products 5 · Open source 2 … [Find a project]"), pair Pill size="lg" with SearchInput size="sm", and Button size="sm" for any action beside them. All three stand on --control-sm (32px, 28 compact), the rung the spacing doctrine gives toolbar controls, so the row is one height in either density. Pill md (28px) has no text field of its height in the page register, so md beside a field always reads as a mismatch.
- Don't: Do not use Pill as a static label. A pressable-looking chip that does nothing is the most common cause of dead clicks in a filter row — that is a Badge. → use **Badge**
- Don't: Do not use Pill for primary actions or important system status.
- Don't: Do not restyle a Pill with border or background classes to get a quieter chip. That is appearance="outline" (and size="sm" for a small one); an override is a look that exists nowhere else in the system. Likewise never set h-* on a Pill to match a neighbour: pick the size that shares its rung.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| selected | boolean | false | Marks the pill as chosen. Solid lifts onto the primary surface; outline takes a primary tint and soft primary edge. Sets aria-pressed. |
| appearance | "solid" \| "outline" | "solid" | solid for a filter row; outline for quiet chips that annotate other content (a reaction under a message, a tag on a card), where a filled chip would compete with what it annotates. |
| size | "lg" \| "md" \| "sm" | "md" | lg sits on --control-sm (32px, 28 compact), the toolbar rung it shares with SearchInput sm and Button sm, for a filter row beside a search field. md sits on --control-xs (28px, 24 compact), the chip in a row of its own or among content. sm is a fixed 24px (the target floor, which density does not shrink), for chips under or inside other content. |
| tone | "neutral" \| "red" \| "orange" \| "yellow" \| "green" \| "teal" \| "blue" \| "purple" \| "pink" | "neutral" | neutral is the chip as described. A palette family colours it as a category, like the choices in a tag picker: a wash at rest, the solid family colour when selected. Painted from the theme's generated palette. |
| icon | ReactNode | — | Optional leading glyph (e.g. <Icon name="lock" />), rendered before the children with the base gap. |

## Variants

- **appearance**: solid, outline
- **size**: lg, md, sm
- **selected**: true, false
- **tone**: neutral, red, orange, yellow, green, teal, blue, purple, pink

## Tokens used

`palette-wash`, `palette-wash-strong`, `palette-edge`, `palette-solid`, `palette-text`, `palette-solid-ink`, `secondary`, `secondary-foreground`, `accent`, `accent-foreground`, `primary`, `primary-foreground`, `card`, `border`, `muted-foreground`, `foreground`

## Motion

- **arrival** · Root · _no motion_ — Pills arrive with the filter row or the content they annotate. A chip that animated in alone would read as a filter someone just added.
- **response** · Root · `motion-interactive` — The hover wash eases, so sweeping the pointer along a filter row reads as one cursor moving rather than chips flashing in turn.
- **response** · Root · `motion-press` — A pill often toggles a filter that takes a moment to reach the results; the settle on press confirms the click landed before they change.
- **transition** · Root · `motion-interactive` — `selected` lifts the chip onto its selected surface on the same ease, so toggling reads as this chip changing state, not a different chip appearing in its place.
- **activity** · Root · _no motion_ — A chip is a choice, not a process. If applying it is slow, the results show it.

## Accessibility

- Renders a native <button type="button"> for focus and keyboard activation.
- Selected state is exposed via aria-pressed.

## Related

- Components: Badge, ToggleGroup, SearchInput

## Examples

### Tag picker

```tsx
import { Pill, Row } from "@sableui/react"

<Row gap={1}><Pill tone="blue" selected onClick={() => {}}>Design</Pill><Pill tone="teal" onClick={() => {}}>Research</Pill><Pill tone="orange" onClick={() => {}}>Marketing</Pill></Row>
```

### Filter row

```tsx
import { Pill, Row } from "@sableui/react"

<Row gap={1}><Pill selected onClick={() => {}}>All</Pill><Pill onClick={() => {}}>Projects</Pill><Pill onClick={() => {}}>Reports</Pill></Row>
```

### Filters with search

```tsx
import { Pill, Row, SearchInput } from "@sableui/react"

const [filter, setFilter] = useState("all")
const [q, setQ] = useState("")

<Row gap={2} align="center" justify="between" wrap>
	<Row gap={1}>
		<Pill size="lg" selected={filter === "all"} onClick={() => setFilter("all")}>All 8</Pill>
		<Pill size="lg" selected={filter === "products"} onClick={() => setFilter("products")}>Products 5</Pill>
		<Pill size="lg" selected={filter === "oss"} onClick={() => setFilter("oss")}>Open source 2</Pill>
	</Row>
	<SearchInput size="sm" value={q} onValueChange={setQ} placeholder="Find a project…" aria-label="Find a project" className="max-w-64" />
</Row>
```

### Outline, small (reactions)

```tsx
import { Pill, Row } from "@sableui/react"

<Row gap={1}><Pill appearance="outline" size="sm" selected onClick={() => {}}>🎉 3</Pill><Pill appearance="outline" size="sm" onClick={() => {}}>👀</Pill></Row>
```

### With icon

```tsx
import { Icon, Pill } from "@sableui/react"

<Pill icon={<Icon name="lock" />} onClick={() => {}}>Locked</Pill>
```

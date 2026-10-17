# RadioCard

**Status:** stable

A selectable card option (radio-card) over Base UI RadioGroup + Radio. RadioGroup shares selection state; each RadioCard is a card with a radio indicator, title, and description. Add an icon to switch to the richer two-dimensional card, and a tone to give the selected state a semantic colour identity.

**Keywords:** radio-card, choice card, selection, option card

## Usage

Use RadioCard for visual choice cards when users compare a small set of named options.

### Best practices

- Do: Use it when labels, descriptions, or icons make options easier to understand.
- Do: Make the selected state explicit and preserve keyboard access through the group.
- Don't: Do not use RadioCard for dense menus, long lists, or simple yes/no settings.
- Don't: Do not use a single RadioCard on its own. It is a radio, so one option cannot be deselected — a lone one is a switch, and should be a Switch.

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| RadioCard | yes | One selectable option card. |
| RadioGroup | no | A grouped set of related choice cards. |

## Subcomponents

| Name | Type | Description |
| --- | --- | --- |
| RadioGroup | Base UI RadioGroup props (value, defaultValue, onValueChange, name, disabled, readOnly, required) + className | The group container that wraps the RadioCard cards and shares their selection state. Controlled via value + onValueChange; uncontrolled via defaultValue. Lays its cards out in a single column by default; override with className (e.g. 'grid sm:grid-cols-3') for a grid — the group is a flex column, so a grid-cols-* class alone does nothing. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| value | string | — | The unique value that pairs this card with the group's selected value. |
| title | ReactNode | — | The card's primary label (rendered as text-title-sm). |
| description | ReactNode | — | Optional supporting copy beneath the title (text-body-sm, muted). |
| trailing | ReactNode | — | End-aligned on the title's line: a price, a delivery date, a count. The title takes the rest of the row. |
| icon | ReactNode | — | Leading icon (e.g. a solid <Icon>). Its presence switches to the two-dimensional card — icon top-left, indicator top-right, copy below — and the glyph is rendered as a solid-fill icon in the tone colour. |
| tone | "neutral" \| "3" \| "2" \| "1" \| "info" \| "warning" | "neutral" | Semantic colour the selected state carries across the border, radio, and icon glyph. Neutral uses the primary ring with a muted wash. |
| disabled | boolean | false | Dims the card and blocks selection. The group skips it during keyboard navigation. |
| titleClassName | string | — | Merged onto the title span (default text-title-sm) — e.g. to tighten copy in a two-column layout. |
| descriptionClassName | string | — | Merged onto the description span (default text-body-sm text-muted-foreground). |

## Variants

- **tone**: neutral, 3, 2, 1, info, warning

## Tokens used

`input`, `card`, `foreground`, `primary`, `muted`, `ring`, `muted-foreground`, `tone-3`, `tone-2`, `tone-1`, `tone-info`, `tone-warning`

## Motion

- **arrival** · Root · _no motion_ — Cards arrive with the form. A plan picker that animated each card in would delay the choice it exists to make.
- **response** · Root · `motion-interactive` — The edge steps toward the ring colour on hover, eased. On a card-sized target a hard snap across the whole border reads as the layout flickering.
- **response** · Root · `motion-press` — The settle on press confirms a click anywhere in the card — the radio is small, and without it a click in the card's body can feel like it missed the control.
- **transition** · Root · `motion-interactive` — Checking eases the tone ring and wash onto the new card as the old one releases, so the choice reads as moving between cards rather than two cards repainting.
- **transition** · Indicator · `motion-interactive` — The radio dot grows in on a spring, the same mark as Radio, so a card and a plain radio confirm a choice the same way.
- **activity** · Root · _no motion_ — A choice commits instantly. A slow write belongs to the surrounding form's pending state.

## Accessibility

- Base UI provides the radiogroup/radio roles, aria-checked, hidden native inputs, and roving tabindex.
- Arrow keys move and select between cards; Space selects the focused card; Tab enters/leaves the group.
- Checked state styling reads from the data-[checked] attribute; disabled cards from data-disabled.
- focus-within draws a 2px ring on the focused card; the whole card is the hit target.
- The icon is decorative — the title labels the card — so selection meaning never relies on colour alone (the border ring and the filled radio both shift; the neutral tone adds a muted fill).

## Related

- Components: Radio, CheckboxCard, Select

## Examples

### Post type (tone + icon)

```tsx
import { Icon, RadioCard, RadioGroup } from "@sableui/react"

<RadioGroup defaultValue="starter" className="grid sm:grid-cols-3"><RadioCard value="starter" tone="3" icon={<Icon name="plus" />} title="Starter" description="Free for one person" /><RadioCard value="studio" tone="2" icon={<Icon name="gem" />} title="Studio" description="For small teams" /><RadioCard value="business" tone="1" icon={<Icon name="image-stack" />} title="Business" description="SSO and audit log" /></RadioGroup>
```

### Plan picker (plain)

```tsx
import { RadioCard, RadioGroup } from "@sableui/react"

<RadioGroup defaultValue="pro"><RadioCard value="free" title="Free" description="For trying things out." /><RadioCard value="pro" title="Pro" description="For growing teams." /><RadioCard value="enterprise" title="Enterprise" description="Custom limits and support." /></RadioGroup>
```

### With a disabled option

```tsx
import { RadioCard, RadioGroup } from "@sableui/react"

<RadioGroup defaultValue="free"><RadioCard value="free" title="Free" description="For trying things out." /><RadioCard value="enterprise" title="Enterprise" description="Contact sales to enable." disabled /></RadioGroup>
```

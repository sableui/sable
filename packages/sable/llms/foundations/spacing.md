# Spacing & sizing

One scale, derived from the type: the baseline is one line of body text, split into steps every gap, inset and line height lands on. Space is assigned by role. Controls read a height ladder that a density scope can retune all at once.

**Baseline from the type · 8px steps · 3 roles · 1 control ladder**

## Spacing by role

Steps below 2 (8px) are optical correction only.

| Name | Value | Use |
|---|---|---|
| `Inset  p-4` | 16px | Padding inside a surface. p-3 for a dense card, px-3 py-2 for a row. |
| `Stack, within a group  gap-2` | 1 step · 8px | Label to field, title to description. |
| `Stack, between groups  gap-4 – gap-6` | 2–3 steps · 16–24px | Field to field, card to card. |
| `Stack, between sections  gap-12+` | 48px+ | Major regions of a page. |
| `Inline  gap-2 – gap-3` | 8–12px | Icon to label, control to control. |

## The control ladder

Comfortable values; data-density="compact" (or <Density>) redefines every step for a region.

| Name | Value | Use |
|---|---|---|
| `h-(--control-xs)` | 28px · compact 24 | Inline chips, tree rows. |
| `h-(--control-sm)` | 32px · compact 28 | Compact buttons, toolbar controls. |
| `h-(--control-md)` | 40px · compact 32 | The default: inputs, buttons, selects, menu triggers. |
| `h-(--control-cta)` | 44px · compact 36 | The primary call to action; clears the touch floor on its own. |
| `h-(--control-lg)` | 48px · compact 40 | Prominent or touch-first actions. |

## Icons and touch

| Name | Value | Use |
|---|---|---|
| `text-base (16px)` | sm | Inline with label-md / body-sm. |
| `text-xl (20px)` | md · default | The default UI glyph beside label-lg. |
| `hit-target` | 44×44px | Keeps a visually small control's hit area at the WCAG floor without moving layout. |

## Rules

1. **Every margin, padding and gap is a step on the scale, and vertical space between blocks is whole baseline steps: an even Tailwind step (2, 4, 6, 8, 12) or a Stack/Row/Grid gap number.** The baseline is one line of body text split into steps; line heights round to it. An odd step (3, 5) is half a baseline step. It is a rhythm to keep, not a grid to force: components stay as tall as their content.
2. **Padding, gaps and insets in a component sit on the spacing scale: a step (p-4, gap-2) or --spacing(n) inside an arbitrary value (p-[var(--card-p,--spacing(6))]).** --spacing derives from the baseline step and the density (Character) control moves the leading it comes from, so anything on the scale moves with it. A literal p-[1.5rem] or padding: "12px" stays put while everything around it tightens. Keep fixed rem/px for what must not scale: a 1px hairline, a ring width. *Enforced by design-lint: fixed-spacing (library source).*
3. **Related things sit closer than unrelated things.** Proximity groups content without a divider line. Use space first; reach for a border only when space is not enough.
4. **Space lives on the container (gap), not on children (margins).** gap survives reordering, conditional children and RTL; per-child margins do not.
5. **Control heights read the --control-* ladder.** A density scope retunes every control at once. A hardcoded height has to be found and overridden by hand. *Enforced by sable-lint: raw-control-height.*
6. **Single-column content inside a card stacks with flex flex-col and a gap, not CSS grid.** A grid track sizes to its widest min-content child, so one long unbreakable string (a URL, a code line, a table) blows the column out past the card. A flex column lets children shrink to the card.
7. **A compact surface drops one whole step; a spacious one adds one.** Moving in whole steps keeps density changes proportional.
8. **Every interactive element clears a 44×44px hit area.** WCAG 2.5.5. Use padding or hit-target to grow the hit area; never a bigger glyph.
9. **Borderless controls get roughly twice the gap of bordered ones.** A border declares where a control ends. Two ghost buttons 12px apart read as one target.

## Never

- **Never:** Arbitrary values: p-[15px], gap-[7px], mt-[13px]. **Instead:** The nearest scale step. Arbitrary values cannot follow density or a customized scale.
- **Never:** h-[40px] on a control. **Instead:** h-(--control-md). It will not follow <Density>. *Enforced by sable-lint: raw-control-height.*
- **Never:** Icons sized with type utilities (text-body-md on an <Icon>). **Instead:** text-{size} scale classes. Type utilities carry line-height and tracking that misalign glyphs.
- **Never:** A fixed width sized to an English label. **Instead:** padding-inline and max-width with wrapping. German and Finnish run 30–50% longer.

## Details

### A dense region in one attribute

```tsx
// before
<div className="[&_button]:h-8 [&_input]:h-8">…</div>
// after
<Density value="compact">…</Density>
```

Every control, menu and popup inside retunes, including portaled overlays.

### Grouping by space

```tsx
// before
<Separator /> between every field
// after
<Stack gap={3}> between groups (24px), <Stack gap={1}> inside a group (8px)
```

Spacing steps do the work of every divider, with less ink. Stack's numeric gap counts --rhythm-unit — one baseline step — so it follows the type and the density control like every other spacing value.

**Related:** `sable docs shape` · `sable docs typography` · `sable docs building-a-tool` · `sable token layout`

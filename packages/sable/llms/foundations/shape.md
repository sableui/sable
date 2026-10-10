# Shape

Radius signals what something is: tight on containers, full on actions. Nested corners stay concentric, and one edge treatment marks a boundary.

**7 radius steps · concentric nesting · 1 edge treatment per boundary**

## The radius ladder

Each step is 4px apart, so common insets land on a real step. Themes and the customizer retune every step together.

| Name | Value | Use |
|---|---|---|
| `rounded-none` | 0 | Full-bleed media. |
| `rounded-xs` | 4px | Tags, kbd, small inline marks. |
| `rounded-sm` | 8px | Inputs, menu items, list rows. |
| `rounded-md` | 12px | Popovers, menus, toasts. |
| `rounded-lg` | 16px | Cards, dialogs, sheets. |
| `rounded-xl` | 20px | Hero surfaces. |
| `rounded-full` | pill | Buttons (via --button-radius), avatars, pills, dots. |

## Edges

| Name | Value | Use |
|---|---|---|
| `border-border` | hairline | The default edge: inputs, cards, badges. |
| `border-border-strong` | hairline, higher contrast | Structural rules: table grids, section separators. |
| `border-border-floating` | faint, alpha | Every floating surface: popovers, menus, selects, tooltips, dialogs, sheets, toasts. Lighter than border; the shadow carries the elevation. |
| `ring-2 ring-ring` | 2px focus ring | Focus only. Never a thick border. |

## Rules

1. **Nested corners are concentric: inner radius = outer radius − inset. Write it as rounded-concentric-<outer>/<inset>, not a hardcoded step.** A 12px popover with 4px padding takes 8px items. The utility computes the subtraction from the live tokens, so the pair stays concentric when a theme or the customizer rescales the radius ladder; a hardcoded rounded-sm drifts.
2. **A list of rows inside a rounded popup uses popup-inset on the popup, rounded-popup-item on the rows and popup-bleed on a separator.** All three derive from the popup's radius: the inset grows to a third of it (never below --spacing(1), so density moves it too), the rows take what is left, and a separator bleeds by exactly the inset. A rounder look gets more room instead of rows that round into pills, and the default ladder still lands on the familiar 4px inset and 8px rows. *Enforced by sable-lint: popup-separator-bleed.*
3. **A Button, Pill or Badge gets its look from a variant, never from override classes.** border, bg, rounded, ring and shadow classes on a component fight the variant's own hover, selected and focus states, and give one call site a look no other site can ask for. Use the variant that exists (Button variant="floating" over content, "on-color" on a fill; Pill appearance="outline"; Badge appearance and tone) or add one to the component. *Enforced by sable-lint: component-restyle.*
4. **The outer radius is always at least the inner radius.** If the inset is larger than the outer radius, square the inner element or step the container up.
5. **Never mix radii within one component.** A component reads as one object when its corners agree.
6. **Actions are full; containers are tight.** The contrast itself says 'this is a control'. A theme flattens buttons through --button-radius, not by editing each one.
7. **High-contrast outlines (selection, emphasis) are inset rings; hairline chrome is a border.** Rings anti-alias on rounded corners at any display scale; a 1px light border on dark snaps to the pixel grid and looks jagged.
8. **One edge treatment per boundary: a border, a ring or a shadow.** Stacking all three makes an edge heavier than the content it holds.
9. **Prefer a tonal step or space over a divider line.** The flattest thing that reads is best.

## Never

- **Never:** rounded-[10px] or any off-ladder radius. **Instead:** The ladder step for the role. Off-ladder radii cannot follow a theme or the customizer's radius control.
- **Never:** A card inside a card with the same radius. **Instead:** Flatten the inner one, or use rounded-concentric-*. Nested surfaces with equal corners look misaligned at every corner.
- **Never:** <Button className="rounded-full">, <Pill className="border bg-card">, a -mx-1 separator in a popup. **Instead:** The component's variant (add one if it is missing); popup-bleed for the separator. An override fights the component's own states and does not follow the radius ladder, the density or a theme. *Enforced by sable-lint: component-restyle, popup-separator-bleed.*
- **Never:** border-2 for emphasis or focus. **Instead:** ring-2 ring-ring for focus; a tonal fill for emphasis. A thick border shifts layout and competes with the focus ring.

## Details

### Crisp selected outlines on dark surfaces

```tsx
// before
<button className="rounded-lg border border-foreground">
// after
<button className="rounded-lg ring-[1.5px] ring-foreground ring-inset">
```

A 1px high-contrast border on a rounded corner snaps unevenly at fractional device-pixel ratios (Windows 125%/150%) and reads as jagged, worst light-on-dark. A box-shadow ring is anti-aliased instead, and inset keeps it from changing the element's size. Keep hairline borders for low-contrast chrome, where the snapping is invisible.

### Concentric menu items

```tsx
// before
<div className="rounded-md p-1"><div className="rounded-md">Item</div></div>
// after
<div className="rounded-md popup-inset"><div className="rounded-popup-item">Item</div></div>
```

12px outer − 4px inset = 8px inner at the default ladder, and the utilities keep the subtraction right when a preset or the customizer rescales the radius or the density.

**Related:** `sable docs surfaces` · `sable docs spacing` · `sable token radii`

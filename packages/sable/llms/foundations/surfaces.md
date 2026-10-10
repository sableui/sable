# Surfaces & elevation

Depth is a step up the surface ladder, chosen by how transient a surface is. Dark mode lifts with lighter tones and edge light; light mode adds soft shadows.

**4 surface tokens · 5 elevation roles · 1 shadow per surface · 1 layer scale**

## The surface ladder

| Name | Value | Use |
|---|---|---|
| `bg-background` | the page | The document body; the furthest-back surface. |
| `bg-card` | +1 step | Resting containers: cards, panels, dialogs. |
| `bg-muted` | +1 step, quieter | Wells, code blocks, inactive fills inside a card. |
| `bg-popover` | +2 steps | Anything that floats: menus, popovers, selects, tooltips. Always distinct from card, so a menu in a dialog never melts into it. |
| `bg-overlay` | scrim | Behind modals, and pills over imagery. |

## Elevation by role

Raise by transience — how much a surface floats over content — not by importance.

| Name | Value | Use |
|---|---|---|
| `Resting` | no shadow | Page content and flat cards. A hairline border if it needs an edge. |
| `Raised  shadow-sm` | subtle | A draggable card, a sticky header over scrolled content. |
| `Floating  shadow-md` | anchored | Menus, popovers, selects, dropdowns. |
| `Modal  shadow-lg` | with scrim | Dialogs, sheets, the command menu. |
| `Top  shadow-xl` | rare | The toast stack. |

## Layers

| Name | Value | Use |
|---|---|---|
| `z-(--z-sticky)` | 30 | Sticky in-content chrome: table headers. |
| `z-(--z-nav)` | 40 | App chrome: header, sidebar, bottom nav. |
| `z-(--z-overlay)` | 50 | Every portaled transient surface. |
| `z-(--z-toast)` | 60 | Toasts, above modals. |
| `z-(--z-skip-link)` | 100 | The skip link, above everything. |

## Rules

1. **Pick the elevation role, not a shadow value.** Elevation is a five-step system. A custom box-shadow cannot follow a theme or the light/dark split.
2. **Floating surfaces use bg-popover, resting ones bg-card. Anything with shadow-md or above floats: menus, popovers, selects, tooltips, dialogs, sheets, toasts, a floating panel.** In dark mode popover is guaranteed lighter than card, so a menu opened inside a dialog always reads as on top of it. In light mode several presets make background, card and popover the same colour, so the fill alone never carries elevation. *Enforced by themes.test.ts + sable-lint: floating-surface.*
3. **A floating surface's edge is border-border-floating (or ring-border-floating), never the full border-border. The shadow carries the elevation.** A full hairline plus a shadow stacks into a heavy dark outline. border-floating is a faint alpha edge: it defines the shape against a same-coloured page in light mode and reads as a lit edge in dark mode, where shadows barely show. *Enforced by sable-lint: floating-surface.*
4. **A recessed area inside a surface (a segmented-control track, a pad, a preview well) is sable-well, and it takes no outline. Whatever sits on the well takes the surface's own colour back (bg-popover inside a popover).** sable-well mixes a fixed amount of ink into the surface it sits in, so it is the same visible step on the page, in a card or in a floating panel, in every theme and mode. A fixed bg-muted can nearly vanish inside a popover in dark mode, and adding an outline to every well to compensate stacks a panel into boxes.
5. **One shadow per surface; never a heavy shadow with a heavy border.** Stacked depth cues read as decoration rather than position.
6. **Do not elevate a static section to make it stand out.** Elevation means 'this floats'. Use a tonal step or space for emphasis.
7. **For modals, the scrim is the primary depth cue.** The scrim is what tells the user the page behind is inert; the shadow is secondary.
8. **Stack with the named layer scale.** Overlays portal to the end of body and order themselves by open order; the layer only has to clear in-flow chrome.

## Never

- **Never:** z-[9999] or any raw z-index. **Instead:** z-(--z-overlay) and the other named layers. Raw z-indexes become a bidding war that a future overlay always loses. *Enforced by sable-lint: raw-z-index.*
- **Never:** shadow-[0_8px_30px_rgba(0,0,0,.2)] or any custom shadow. **Instead:** shadow-sm … shadow-xl by role. Custom shadows ignore the theme's light/dark elevation recipes.
- **Never:** bg-card on a popover, or bg-popover on a resting card. **Instead:** Match the token to the role. Swapping them is how floating surfaces melt into the surface beneath.

## Details

### A menu inside a dialog

```tsx
// before
Dialog bg-card · Menu bg-card — identical in dark mode
// after
Dialog bg-card · Menu bg-popover — one step lighter, plus edge light
```

The menu reads as above the dialog without any prop.

**Related:** `sable docs shape` · `sable docs token-intent`

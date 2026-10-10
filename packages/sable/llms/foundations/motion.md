# Motion

Motion explains a change: where something came from, what responded, and that work is happening. It is subtle by default, built from named recipes, and one switch turns it off.

**4 slots · 3 speeds · enter-only overshoot · 1 kill switch**

## Three speeds

Match duration to the distance and size of what moves. Each value is multiplied by --motion-scale. Two edge steps sit outside the three: --motion-duration-instant (75ms) for a checkbox tick or tab swap, and --motion-duration-slower (500ms) for progress and value changes.

| Name | Value | Use |
|---|---|---|
| `fast  --motion-duration-fast` | 150ms | Hover, press, focus, tooltips, small toggles. Also every exit. |
| `base  --motion-duration-base` | 200ms | Menus, popovers, tabs, disclosure. The default enter. |
| `slow  --motion-duration-slow` | 300ms | Dialogs, sheets, page-level transitions. |

## Recipes

Reach for one named class before writing a transition.

| Name | Value | Use |
|---|---|---|
| `motion-interactive` | fast · standard | Hover/focus/press chrome on anything clickable. Replaces transition-colors. |
| `motion-press` | fast · scale settle | Tactile press. Always paired with motion-interactive. |
| `motion-fade` | enter base / exit fast | Scrims and backdrops. |
| `motion-pop` | enter base · spring | Anchored or centred surfaces: popovers, menus, dialogs. |
| `motion-slide-{up,down,left,right}` | enter base / exit fast | Directional surfaces: sheets, toasts. |
| `motion-disclosure` | base · standard | Height changes: accordion, collapsible. |
| `motion-icon-swap` | enter · emphasized cross-fade | Two icons of one control trading places: play/pause, outline/fill. |
| `motion-draw` | slower · decelerate | SVG line art drawing on when a <Reveal> scrolls in. The path needs pathLength="1"; stagger siblings with --motion-draw-delay. |
| `motion-spin · pulse · shimmer · dot-bounce · ping` | loops | Activity. Scale-aware, so reduced motion freezes them. |

## Easings

| Name | Value | Use |
|---|---|---|
| `ease-standard` | cubic-bezier(0.4, 0, 0.2, 1) | The default for state changes. |
| `ease-decelerate` | cubic-bezier(0, 0, 0.2, 1) | Entrances: arrive fast, settle slowly. |
| `ease-emphasized` | cubic-bezier(0.2, 0, 0, 1) | Large surfaces covering a lot of distance. |
| `ease-spring` | ~4% overshoot | A gentle pop on enter. Never on exit. |
| `ease-bounce` | ~10% overshoot | A playful pop, opt-in only. Enter only, never on exit. |

## The four slots

Every interactive component answers all four, by filling the slot or declining it with a reason in meta.motion.

| Name | Value | Use |
|---|---|---|
| `arrival` | fade · slide · pop · Reveal | How does it enter? |
| `response` | motion-interactive · motion-press | What happens under the pointer? |
| `transition` | motion-disclosure · eased transform | How does it move between its own states? |
| `activity` | spin · pulse · shimmer | How do you tell working from frozen? |

## Rules

1. **Every motion has a reason: orientation, feedback, continuity or activity.** Motion with no reason is latency. If you cannot say which of the four it serves, remove it.
2. **Reach for a recipe first; drop to tokens only when none fits.** Recipes are reviewed once and respect the kill switch. A bespoke transition string is reviewed never. *Enforced by sable-lint: transition-colors, transition-all.*
3. **Exits are one step faster than entrances, and never overshoot.** Something leaving should get out of the way. A bounce on exit draws the eye to what the user just dismissed.
4. **Animate opacity and transform only.** They run on the compositor. Width, height, top and left cause layout on every frame. motion-disclosure is the one sanctioned exception.
5. **Durations come from tokens, so --motion-scale can stop them.** prefers-reduced-motion and <MotionProvider> off both set --motion-scale to 0. A raw duration ignores that. *Enforced by sable-lint: raw-duration, builtin-animate.*
6. **Interactive elements always respond. Something styled for hover with no motion recipe snaps.** A snap between states reads as broken. The four prohibitive rules could not catch missing motion, so this one does. *Enforced by sable-lint: static-interactive.*
7. **JS motion reads useMotion().enabled and does nothing when it is false.** Reduced motion is an accessibility setting, not a style preference.

## Never

- **Never:** Tailwind's animate-spin / animate-pulse / animate-ping / animate-bounce. **Instead:** motion-spin, motion-pulse, motion-ping, motion-dot-bounce. The built-ins ignore --motion-scale, so reduced motion cannot freeze them. *Enforced by sable-lint: builtin-animate.*
- **Never:** duration-150, duration-300, or any raw duration utility. **Instead:** duration-(--motion-duration-fast) and siblings. Raw durations bypass the kill switch. *Enforced by sable-lint: raw-duration.*
- **Never:** transition-all, or transition-colors on its own. **Instead:** motion-interactive, or name the properties you animate. transition-all animates unrelated layout changes and defeats the browser's pre-computation. *Enforced by sable-lint: transition-all, transition-colors.*
- **Never:** Motion on first paint of static content, or staggered entrances on every list. **Instead:** Reveal for one deliberate moment per view. Entrance choreography repeated everywhere becomes a loading delay.
- **Never:** The motion library in the core package. **Instead:** src/motion (WAAPI, IntersectionObserver, View Transitions). Sable's motion layer is zero-dependency; drag, FLIP and velocity springs belong in an optional adapter.

## Details

### Hover that respects the kill switch

```tsx
// before
<button className="transition-colors duration-150 sable-surface-interactive">
// after
<button className="motion-interactive sable-surface-interactive">
```

Same feel, but reduced motion now resolves it instantly.

### Faster exits

```tsx
// before
transition: opacity 200ms ease-in-out;  /* in and out */
// after
data-[starting-style]: enter 200ms decelerate · data-[ending-style]: exit 150ms standard
```

motion-pop and motion-slide-* already do this; dismissing feels responsive instead of sluggish.

**Related:** `sable docs accessibility` · `sable docs reviewing-motion` · `sable token motion`

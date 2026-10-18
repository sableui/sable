# Motion

Motion explains a change: where something came from, what responded, and that work is happening. Components ship crafted by default: one indicator travels instead of two blinking, numbers roll, ticks draw, a refused answer shakes. It is built from named recipes, comes in two levels, and one switch turns it off.

**4 slots · 3 speeds · 2 levels · enter-only overshoot · 1 kill switch**

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
| `motion-icon-swap` | enter · emphasized cross-fade | Two icons of one control trading places: play/pause, outline/fill, copy/check. |
| `motion-glide` | slow · emphasized · expressive | ONE indicator travelling to the selected option: tabs, segmented thumb, active dot. |
| `motion-shake` | ~400ms decaying · expressive | A refused answer: wrong code, invalid submit. Plays while data-shake is set (useShake). Never the only signal. |
| `motion-tick` | fast fade + base wipe · expressive | A check mark that draws itself in. Exits only fade. |
| `motion-appear` | fast fade + base scale | A small control mounting in place: a clear button, a send arrow, a badge. @starting-style, no JS. |
| `motion-arrive` | base · decelerate · staggered · expressive | Items a user action brings into a list: a folder's children on expand, a row just added. Never on every render. |
| `motion-size` | base · emphasized · expressive | An element easing between intrinsic sizes when its label changes: a two-step confirm, Copy → Copied. |
| `motion-bloom` | slower · 0 → 1.2 → 1 · expressive | A small glyph landing in its on state: a liked heart, a picked rating, a toast's status icon. Remount it (key) to replay; never on the resting state. |
| `<Burst>` | slower ring + thrown dots · expressive | The follow-through behind a bloom, in the theme's palette families. Only on a choice a person made: a like, a star, a finished task. |
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

## Two levels

Essential motion answers the user; expressive motion narrates continuity. Expressive durations are also multiplied by --motion-expressive, which `subtle` sets to 0. Each level can only turn motion down from what surrounds it.

| Name | Value | Use |
|---|---|---|
| `essential` | always, unless off | Colour and focus feedback, press, overlay arrival, disclosure height, loaders, chart hover. |
| `expressive` | full only | Glides, rolling numbers (NumberTicker), drawn ticks, blooms and bursts, shakes, staggers, chart arrival and morph, scroll reveals, spring overshoot. |
| `full` | default | Both levels play. The crafted default. |
| `subtle` | data-motion="subtle" | Essential only; nothing overshoots. For dense tools, embedded widgets, readers who want calm without stillness. |
| `off` | data-motion="off" · reduce-motion | Nothing moves; every state still changes. |
| `where` | provider · scope · prop | <MotionProvider policy> for the app, <MotionScope level> for a region, `motion` on a component that owns a flourish. |

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
8. **One thing travels; two things do not blink. When a selection, a value or a mark changes in place, move the one element that represents it.** A fill switching off here and on there is two events the eye has to connect. A glide, a roll or a draw is one, and it is most of what makes an interface feel made rather than assembled.
9. **Flourishes are expressive: multiply their durations by --motion-expressive and gate JS ones on useMotion().expressive.** `subtle` promises the answers without the choreography. A glide on a plain token keeps playing after someone asked for calm.
10. **A state change finishes its story: refused shakes and says why, success confirms in place, armed asks again.** Motion that starts a change and leaves the outcome to a snap reads as unfinished. ConfirmButton, OtpField's invalid shake and the copy-to-check swap are the reference cases.
11. **Amplitude scales with smallness. A 16px glyph that turns on grows from nothing past its size; a surface travels from 0.96 and a press settles to 0.97.** The same 4% that is right for a dialog is invisible on an icon, which is why a state change on a small control used to read as a colour swap with no life in it. A dialog that overshot 20% would lurch. Size, not importance, sets how far a thing moves.
12. **Stage a moment: the main object lands first, the follow-through after it.** A ring that opens, a glyph that blooms 90ms later, dots thrown 60ms after that read as one event with a cause and an effect. Everything starting on the same frame reads as a flash. LikeButton and the toast's status glyph are the reference cases.
13. **Celebrate only what a person chose, and only at full motion.** A burst is a reply. On a like it is delight; on a system event, on load, or on every row of a list it is a notification wearing confetti. Under subtle the fill alone answers.
14. **Component motion props and MotionScope only turn motion down.** `full` on a component means inherit. Nothing below the provider can switch motion back on for a reader who asked for it off.

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

### A selection that travels

```tsx
// before
<Tab className="data-[active]:border-b-2 data-[active]:border-foreground" />
// after
<Tabs.Indicator className="motion-glide left-(--active-tab-left) w-(--active-tab-width)" />
```

The underline used to vanish under one tab and appear under the next. Now it slides, and Tabs renders it for you.

### A value that rolls

```tsx
// before
<span>{total}</span>
// after
<NumberTicker value={total} format={{ style: "currency", currency: "USD" }} />
```

The digits that changed roll; the ones that did not stay still, so the eye goes straight to the difference.

### A glyph that lands

```tsx
// before
<Icon name="heart" variant={liked ? "solid" : "regular"} />
// after
<LikeButton count={likes} defaultPressed={liked} />
```

The heart used to swap fill in one frame. Now it blooms past its size and settles while a ring and dots burst from it, and the count rolls: the same state, told as an event.

### Faster exits

```tsx
// before
transition: opacity 200ms ease-in-out;  /* in and out */
// after
data-[starting-style]: enter 200ms decelerate · data-[ending-style]: exit 150ms standard
```

motion-pop and motion-slide-* already do this; dismissing feels responsive instead of sluggish.

**Related:** `sable docs accessibility` · `sable docs reviewing-motion` · `sable token motion`

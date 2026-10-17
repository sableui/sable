# CONTRIBUTING.md — @sableui/react

Rules for changing **this package**. Building an app *with* Sable? Read [`AGENTS.md`](./AGENTS.md) instead — it is the consumer contract and is all an agent building with Sable needs. Design rationale lives in [`DESIGN.md`](./DESIGN.md); the typed foundations rules (typography, motion, spacing, shape, surfaces, accessibility) live in `src/foundations/` and are served as `sable docs <topic>`.

The checks are the specification. Every rule below names the gate that enforces it; when prose and a gate disagree, the gate wins and the prose is the bug.

## The six hard rules

> **These are enforced, not honor-system.** `pnpm design-lint` (`scripts/design-lint.mjs`, also a CI gate) fails the build on the drift below. A genuine rare exception needs an *auditable* comment that **requires** a reason: `// design-lint-disable-next-line <ruleId> -- <why>` (also `-line`, and block `disable`/`enable`). A disable with no reason is itself an error. Full table: `DESIGN.md → Enforcement`.

1. **Components reference semantic tokens only.** Use `bg-card`, `text-muted-foreground`, `bg-tone-1`, `text-primary`, etc. — never raw palette steps (`--purple-heart-700`) and never inline `oklch()`/hex. For text/icons on a tone fill use the theme-adaptive `text-tone-*-foreground` ink (no `dark:` variant); for scrims, media letterbox, and pills on imagery use `bg-overlay`/`text-overlay-foreground`. Palette names are theme-internal; a component that names a palette breaks themeability — and `design-lint`'s `palette-ref` rule now has **zero** sanctioned exceptions.
2. **Paired typography utilities, never decomposed.** Use `text-heading-1`, `text-body-md`, `text-label-lg`, … Each bundles size + weight + line-height + tracking. Do **not** combine `text-{size}` + `font-{weight}` + `tracking-{x}` by hand. (Icons are the exception — size them with `text-{size}` scales, never type utilities.)
3. **Base UI is behavior; `components/` is the public API.** Each component wraps `@base-ui/react` directly inside its own folder (use the **`render` prop** for composition; read state from `data-[state=…]` attributes) and owns 100% of the styling. There is no separate primitives tier. Consumers import only from the package root barrel.
4. **Semantic icons in components.** Use `<Icon name="…">`. Concrete icon-package imports belong only in `src/icon-sets/`, which nothing in the core graph imports. Apps supply the set through `<IconProvider>` (Reicon from `@sableui/react/icons/reicon`, or their own).
5. **Every scroll container declares a scrollbar policy.** An `overflow-*-auto|scroll` utility must be paired with `scrollbar-quiet` (a 4px thumb, invisible at rest, fading in while the region scrolls) or `scrollbar-hidden` (no bar — only when something else carries the affordance, and you should be able to name it). Left bare, the platform draws its own: on Windows that means stepper arrows hard against the padding edge, poking out of any rounded corner. Vertical scrolling takes a bar; **horizontal takes none** — an edge fade says "there is more this way" better than a rail does, which is why `Scroller` splits by axis. New scroll container? Reach for `useScrollActivity` so the bar appears on touch drags and programmatic scrolls, which hover cannot see. Enforced by `design-lint`'s `unmanaged-overflow` **and** by `build-registry` over every registry example. Full rationale: `DESIGN.md → Scrolling`.
6. **Tailwind v4 packaging discipline.** `src/styles.css` must **not** `@import "tailwindcss"` (the consumer owns that). It carries only token blocks, `@theme inline` mappings, `@utility` typography, layout vars, and `@source`. `@source` points at `src` (never the gitignored `dist`).

**Variants, not overrides — and spacing on the scale.** A component's look comes from its variants, never from override classes a caller (or another component) passes in, and its own padding moves with density. Gated by:

- `component-restyle` — `border*` / `bg-*` / `rounded*` / `ring-*` / `shadow-*` in a `Button`, `Pill` or `Badge` `className`. Use or add a variant (Button `floating` for a control over content). Layout classes are fine.
- `destructive-item-ink` — `text-destructive` (or a tone ink) on `MenuItem` / `ContextMenuItem`. Use `variant="destructive"`.
- `table-edge-padding` — `pl-*` / `pr-*` / `ps-*` / `pe-*` on `TableHead` / `TableCell`. Use `CardContent flush` (it sets `--table-edge-px`).
- `popup-separator-bleed` — a fixed `-mx-*` on a popup separator. Use `popup-bleed`.
- `fixed-spacing` (package only) — a `rem`/`px` padding, margin, gap or inset (`p-[1.5rem]`, `padding: "12px"`, `"--card-p": "1.5rem"`). Write a step or `--spacing(n)`; hairlines, em values and positional offsets are exempt.

## File structure

```
src/
  index.ts                 # public barrel — the only consumer entry
  styles.css               # CSS entry: theme import + @theme map + @utility typography + layout vars + @source
  lib/cn.ts                # cn() = clsx + tailwind-merge (with ds-typography paired-utility group)
  themes/
    _contract.ts           # SemanticTokens — the token names every theme MUST define
    registry.ts            # public theme manifests, ids, and attribute helpers
    theme-provider.tsx     # SableThemeProvider + useSableTheme for app theme switching
    <id>/                  # one folder per theme: <id>.css (:root/.dark vars) + index.ts (TS manifest) + art-direction.md
  foundations/             # the typed rules (typography, motion, spacing, shape, surfaces, a11y) → docs pages + llms/foundations/*.md
  layout/                  # fluid grid/layout primitives: Region, Grid, Columns, Stack, Row, Spacer, Center, AspectBox, Bleed, SplitPane, Page, SafeArea, GridOverlay
  icon/                    # Icon, IconProvider, IconRegistry — the semantic adapter and provider overrides
  motion/                  # owned zero-dep motion layer: MotionProvider, useMotion, useReducedMotion, Presence, Reveal, TextReveal, useInView, View Transitions
  components/<name>/        # <name>.tsx + <name>.variants.ts + <name>.meta.ts + index.ts
  patterns/<name>.tsx       # canonical page shells (+ <name>.meta.ts) — see "Patterns"
```

## How to add a component (the recipe)

The maintained agent workflow is `skills/sable/SKILL.md` in this package. Update
its task guides under `llms/tasks/` alongside library changes. Repository and
consumer agent directories contain entry files that resolve this canonical
source; do not fork the workflow into host-specific skills. `skills/entry/SKILL.md`
is the portable loader template; `scripts/agent-setup.mjs` installs and manages it.
Verify setup/update/local-edit protection and the packed consumer when changing
the installer. User-defined presets belong to apps, not the bundled theme registry.

1. If it needs non-trivial behavior (overlay, focus trap, keyboard nav), wrap the Base UI part inside the component folder — never re-implement focus management Base UI already owns.
2. Create `components/<name>/<name>.variants.ts` — a `cva()` over **semantic tokens**.
3. Create `components/<name>/<name>.tsx` — the themed component composing the primitive + variants + `cn()`.
4. Create `components/<name>/<name>.meta.ts` — machine-readable metadata (see "Component meta").
5. `components/<name>/index.ts` re-exports; add to the root `src/index.ts` barrel.
6. File it in `src/lib/taxonomy.ts` and add a docs page at `apps/docs/src/pages/components/<Name>Page.tsx` with live examples (the build fails without both).
7. Gate: `pnpm design-lint` clean, `pnpm registry:check` in sync (regenerate with `pnpm build:registry`), package `tsc` clean (`pnpm --filter @sableui/react typecheck`), `pnpm test` green, and the docs app renders it in light + dark. (Tooling runs on **Node 22** — the registry generator imports the `.meta.ts` files via Node's built-in type-stripping.)

## Registers & density

The optional `src/ios/` adapter is outside the core component catalog. It wraps
Konsta for iOS system chrome only (app frame, navigation bar, tab bar, sheet
presentation); it must never export a control Sable already has. Keep Konsta external and optional;
neither the root barrel nor the `ios/preview` entry may import it. Chrome reads
the preset through `ios/styles.css`; keep that mapping, and the geometry pins on
Konsta chrome, in CSS rather than per-app.
Native geometry follows the iOS target contract rather than web density. Both
docs examples must consume the published adapter instead of maintaining local
copies. Verify the packed web consumer without Konsta, then the opt-in native
consumer with it, alongside the two interactive demos.

Sable has **two registers** — the page register (default) and the workspace register for
tool chrome. Full doctrine, the measured numbers, and the two rules the workspace register
deliberately reverses: `DESIGN.md → Registers`. What a contributor needs to know:

1. **Never hardcode a control height.** Size variants read the ladder —
   `h-(--control-md)`, `h-(--control-xs)` — never `h-[40px]`. A `data-density` scope
   redefines the ladder, so one attribute retunes every control at once and nothing has to
   override a height after the fact. CI-enforced (`raw-control-height`); the rule only
   flags the ladder's own values, so a genuine non-control measure (a gauge diameter, the
   WCAG touch floor) is a real exception — disable it with a reason.
2. **`--control-*` values are set in `styles.css`, not per theme.** Density is a register
   concern, not a palette one. A theme *may* override them (same status as
   `MOTION_TOKENS`/`RADIUS_TOKENS`) but doesn't have to.
3. **Workspace surfaces are derived.** `canvas` / `panel` / `panel-raised` / `hairline`
   come from each theme's existing semantic tokens via `color-mix`, with a `--theme-*`
   override hook. Don't hand-author them per theme.
4. **Paired type tiers must be registered in `lib/cn.ts`.** Adding a `@utility text-foo`
   without adding `"foo"` to `dsTypographyTokens` means tailwind-merge treats it as a
   **colour** utility and silently drops the real colour class — a shipped bug once (white
   text on a white button) and invisible in review. `themes.test.ts` asserts every
   `text-ui-*` tier is registered.
5. **Tool chrome components go in the workspace family**, not into `AppShell`'s: `Workspace`,
   `PanelGroup`, `PanelSection`, `ScrubField`, `StatusBar`, `Tree`. `SplitPane` stays
   page-register (responsive, not resizable) — the two are deliberately separate. `Tree`
   is the one hierarchy, for a layers panel and a file listing alike.
6. **Never compute a tree inset.** Rows, section headers, add affordances and empty states
   all read `treeIndent(depth)` or `var(--tree-rail)`. And `--tree-indent` must always equal
   `--tree-column`: a smaller step puts a child's content left of its parent's and the
   nesting reads inverted. Asserted in `themes.test.ts` for both densities.
7. **A new component must be filed in `lib/taxonomy.ts` and have a docs page.** The
   taxonomy declares a **group** (role) and a **register** (`page` / `workspace` /
   `either`), and `build-registry` fails on a component missing from it, a stale entry
   naming a component that no longer exists, or a component with no
   `apps/docs/src/pages/components/<Name>Page.tsx`. The grouping used to live only in the
   docs nav array, which is exactly how `PanelGroup`, `PanelSection`, `ScrubField` and
   `StatusBar` shipped in 0.31.0 unfiled and undocumented and stayed that way for four
   releases. The docs nav is now generated from the contract, so the two cannot drift.
   **Group by KIND, not by co-occurrence** — see the note in `taxonomy.ts`: the
   `related.components` graph tracks composition as much as kinship, and grouping by it
   measurably made things worse when tried.

## Theme contract

A theme is a CSS file that defines every token in `themes/_contract.ts` for `:root` (light) and `.dark` (dark), plus an optional TS manifest. Components depend on the **semantic** layer; each theme supplies its own palette underneath. Alternate themes activate through the root `data-sable-theme` attribute; consuming apps should usually let `<SableThemeProvider>` own that wiring and read/update it through `useSableTheme()`. To make a new theme: copy `themes/sable/`, swap the palette + semantic values, keep the token names identical, add the manifest to `themes/registry.ts`, import its CSS from `src/themes.css`, add `./theme/<id>` + `./theme/<id>.css` to both `exports` and `publishConfig.exports`, and cover it in `themes.test.ts` — which holds every label on a brand or status fill (`primary`, `sidebar-primary`, `highlight`, `destructive`, `success`, `tone-warning`, `tone-info`) to 4.5:1 **and** APCA Lc 60 with no exceptions; apps and presets may record exceptions, Sable's own themes may not. Each status colour also has a `-text` token (the colour on a surface, read by `text-`/`border-`/`ring-<status>` through Tailwind's per-property namespaces in styles.css), gated as text on `background`, `card`, `popover` and `muted`. `build-registry` fails on a theme missing from any of those, and generates `registry.json → themes.available` from the manifests — never hand-edit that list. Re-skinning never touches component code.

**Themes are presets, not the unit of customization.** Every token a theme sets can also be set by an app (or by the docs customizer) on `:root` after the theme loads. A theme is the starting point a consumer picks; the customizer exports the deltas on top of it. Keep that working: a theme must not set a token with `!important` or under a selector more specific than `[data-sable-theme="<id>"]`, or a consumer override cannot win.

`_contract.ts` exports five token groups: `SEMANTIC_TOKENS` (colors — **light + dark**, e.g. `--background`, `--primary`, `--tone-1`), `MOTION_TOKENS` (duration/easing ladder), `RADIUS_TOKENS` (the 7 `--theme-radius-*` steps bridged to Tailwind's `radius-*` scale), `TYPE_SCALE_TOKENS` (display/heading/title size, weight, leading, and tracking vars consumed by the paired `text-*` typography utilities in styles.css), and `TYPE_OVERLINE_TOKENS` (the small, uppercase, letter-spaced eyebrow/overline/kicker tier — size/weight/leading/tracking/transform — consumed by the `text-overline` utility). `MOTION_TOKENS`, `RADIUS_TOKENS`, `TYPE_SCALE_TOKENS`, and `TYPE_OVERLINE_TOKENS` are **mode-independent** — declared once per theme (not duplicated under `.dark`), unlike `SEMANTIC_TOKENS`.

`TYPE_REFINEMENT_TOKENS` additionally exposes optional typography hooks for body,
label, caption, mono, title sizes, and the largest display size. Retrieve
`sable token typographyOverrides` for their intent. These preserve paired utilities
while allowing a consumer to tune the whole type system, rather than making only
headings reflect its art direction. Existing defaults remain the fallback; themes
do not need to declare every optional hook.

`SEMANTIC_TOKENS` includes `border-strong` alongside `border` — a visually-stronger structural divider (grid lines, table rules, section separators) distinct from `border`, which stays tuned for subtle chrome (badge/input outlines). Both need light + dark values, derived from the same neutral ramp as `border` but pulled from a higher-contrast step (e.g. the Sable theme: `border` = `--zinc-200` light / low-alpha `--zinc-700` dark → `border-strong` = `--zinc-300` light / higher-alpha `--zinc-500` dark). `styles.css`'s `@theme inline` block maps it to `--color-border-strong`, so components/consumers use it via the `border-strong` Tailwind color utility, same pattern as `border`.

`TYPE_OVERLINE_TOKENS` (`type-overline-size/weight/leading/tracking/transform`) back the `text-overline` utility — the eyebrow/badge-label/stat-caption text role with no home in `TYPE_SCALE_TOKENS`'s display/heading/title ramp. `type-overline-transform` is themeable rather than a hardcoded `uppercase`, so a quieter reference (e.g. Cove) can opt into sentence case. Like the other type tiers, every built-in theme declares explicit values rather than relying on styles.css's fallback defaults (`0.75rem` / weight `600` / leading `1.2` / tracking `0.08em` / `uppercase`).

The manifest's `fonts` field is `{ sans: string; mono: string; display?: string }` — `display` is **optional**, for a theme whose reference uses a distinct display/headline typeface separate from its body sans (e.g. a Chalet-style display face over an Instrument Sans body). When a theme sets `display`, its CSS also defines `--font-display` (alongside `--font-sans`/`--font-mono`) in the same `:root, [data-sable-theme="…"]` block. styles.css's `text-display-*` and `text-heading-*` utilities read `font-family: var(--font-display, var(--font-sans))` — a theme that omits `display`/`--font-display` falls through to `--font-sans` and renders identically to before this field existed. `text-title-*`/body-register utilities are unaffected and keep inheriting `--font-sans` only.

## Icon contract

Components reference semantic names through `<Icon name="…" />`. Reicon (MIT)
is the bundled set, installed as a runtime dependency and kept external to the
build. It is opt-in: `<Icon>` has no fallback, so an app that brings its own set
ships none of Reicon's artwork. Concrete icon imports belong only in
`src/icon-sets/`; components never import an icon package or duplicate its SVG
artwork, and nothing in the core graph imports `src/icon-sets/`.

- **Use Reicon:** `import { reiconIconSet } from "@sableui/react/icons/reicon"` and
  mount `<IconProvider set={reiconIconSet}>` once at the app root. Without a
  provider, icons render nothing and a development build warns once.
- **Replace the package:** pass your own `IconSet` to `<IconProvider set={mySet}>`.
  Map semantic names to that package's components; preserve className, variant,
  spin and accessible labels. Return `null` for unknown names.
- **Extend Reicon:** import `composeIconSets` from Sable and `reiconIconSet` from
  `@sableui/react/icons/reicon`, then use
  `<IconProvider set={composeIconSets(appExtras, reiconIconSet)}>`.
  The first set returning a non-null node wins.
- `@sableui/react/icons/reicon` is the only import path for the adapter; the root
  barrel does not re-export it. `fallbackIconSet` is a deprecated alias of Reicon
  on the same subpath, with no separate artwork.
- Brand marks are a separate additive set at `@sableui/react/icons/brands`.
  The 23 marks are generated from licensed `reicon-brands` npm artwork by
  `pnpm icons:brands`, normalized to the 24-unit grid, and inherit currentColor.
  Their MIT notice is shipped; trademark usage remains subject to each brand's rules.
- Coverage tests enforce that Reicon maps every contract name and no others.
  All interface glyphs, including tree controls and the color eyedropper, use Icon.
  Progress meters and animated loading indicators remain component visuals.

## Motion

Motion is a first-class layer — **crafted by default, calm on request, zero runtime dependency** (CSS tokens/recipes + tiny browser-native JS). When a component has any interaction, wire it to the system; don't leave it static or hand-roll a transition. When its selection, value or mark changes in place, move the one element that represents it (`motion-glide`, `NumberTicker`, `motion-tick`, `motion-icon-swap`) rather than switching two things on and off.

**Two levels.** Essential motion (feedback, press, overlay arrival, disclosure, loaders) runs on the plain tokens. Expressive motion (glides, rolling numbers, drawn ticks, shakes, staggers, arrival choreography, overshoot) multiplies its durations by `var(--motion-expressive, 1)` as well — the shipped expressive recipes already do — and JS-driven flourishes gate on `useMotionLevel(motion).expressive`. A component that owns a flourish takes `motion?: MotionLevel` (`full` | `subtle` | `off`) and spreads `data-motion={motionAttribute(motion)}` on its root; the prop only turns motion down.

**Four slots.** Every component answers all four — by filling the slot, or by declining it in `meta.motion` with `recipe: "none"` and a reason:

| slot | the question | typical fill |
|---|---|---|
| `arrival` | how does it enter? | `motion-fade` · `motion-slide-*` · `motion-pop` · `Reveal` |
| `response` | what happens under the pointer? | `motion-interactive` · `motion-press` |
| `transition` | how does it move between its own states? | `motion-disclosure`, or ease the transform |
| `activity` | how do you tell "working" from "frozen"? | `motion-spin` · `motion-pulse` · `motion-shimmer` |

This paragraph said "don't leave it static" for many releases while **nothing checked it**. The four motion rules below are all prohibitive — they fire on motion that is present and wrong, and none can fire on motion that is absent — so a component that snapped between every state passed the whole contract, and motion stayed a thing a human had to request by name. Two gates now close that: `static-interactive` (lint, fires on an element styled for pointer states with no recipe on it) and `meta.motion` — `build-registry` **fails** when a component that reacts to the pointer or carries state declares no `motion` array (`pnpm build:registry -- --motion-report` prints the slot-by-slot coverage).

1. **Reach for a recipe first** — apply one named class instead of a bespoke transition string: `motion-interactive` (default hover/focus/press chrome — **replaces** `transition-colors`), `motion-press` (tactile press; always pair with `motion-interactive`), `motion-fade`/`motion-pop`/`motion-slide-{up,down,left,right}` (overlay enter/exit, on Base UI `data-[starting-style]`/`data-[ending-style]`), `motion-disclosure` (height), `motion-icon-swap` (a glyph that changes with state), the expressive `motion-{glide,shake,tick,appear,arrive,size}`, and loaders `motion-{spin,shimmer,pulse,dot-bounce,ping}`.
2. **Drop to tokens only when a recipe doesn't fit.** Durations via `duration-(--motion-duration-{instant|fast|base|slow|slower})` — **never** a raw `duration-150` (it bypasses the kill-switch). Easings via `ease-{standard|decelerate|emphasized|spring|bounce}`. Spring/bounce overshoot is **enter-only**; exits stay clean.
3. **Never** use Tailwind's built-in `animate-spin`/`animate-pulse`/`animate-ping`/`animate-bounce` — they ignore `--motion-scale`, so the on/off policy can't freeze them. Use the scale-aware `motion-*` loader recipes.
4. **Compositor-first & subtle:** animate opacity + transform (scale/translate) only; short durations; no exit overshoot; no gaudy motion.
5. **Policy:** all token-driven motion collapses to static under `prefers-reduced-motion` or `<MotionProvider>` off (one `--motion-scale: 0`); `subtle` zeroes `--motion-expressive` only. JS primitives read `useMotion().enabled` and must no-op when motion is off; JS flourishes read `expressive`.
6. **JS motion lives in `src/motion/`** (zero-dep, browser-native: WAAPI / IntersectionObserver / View Transitions). Do **not** add the `motion` library to core — drag/gesture, FLIP layout, and velocity springs are the future optional `@sableui/motion` adapter (peer-dep `motion`).

Full token table + rationale: `DESIGN.md → Motion`. Live demo: docs → Foundations → Motion (also the on/off toggle).

## Patterns (canonical page shells)

`src/patterns/` holds full-page compositions for common routes. They ship two ways:
**importable previews** (`import { SettingsPage } from "@sableui/react/patterns"`)
and **copy-pasteable source** (`registry.json → patterns`, imports included).
Inspect them before choosing composition. Reuse and diverge when the information
architecture fits; compose an original route from layout primitives when it does
not. The brief determines the result, not resemblance to an existing shell.

The **source is the contract**: each pattern is real TSX (typechecked, design-linted, rendered live by the docs app), split as `<name>.meta.ts` (a `PatternMeta`: name/summary/intent/notes/a11y) + `<name>.tsx` whose code after the `// ---pattern-code---` marker is emitted verbatim into the registry by `build-registry.mjs` — so the shipped recipe can never drift from code that compiles. Keep patterns hook-free and self-contained (inline sample data, `<a href>` for links); the generator auto-derives the consumer import block. To add one: write the pair, export both from `src/patterns/index.ts`, regenerate the registry, and add it to the docs `PatternPreview` map.

## Blocks (section-sized compositions)

`src/blocks/` holds compositions smaller than a page — a sign-in card, a pricing card, an order tracker — built from components with sample content and no behaviour of their own. They ship exactly like patterns (`@sableui/react/blocks` previews + `registry.json → blocks` source, `sable block <Name>`), from the same `<name>.meta.ts` (a `BlockMeta`) + `<name>.tsx` pair split by a `// ---block-code---` marker. The docs canvas and the Blocks page render them, so the scenes a theme is judged on are the source a consumer copies.

**Component or block?** If it owns behaviour, state or an a11y contract that should arrive on upgrade, it is a component. If it is an arrangement of components plus copy, it is a block. A block that needs something the library lacks is a library gap: add the component first (`DateTile` and `SegmentedBar` arrived this way), then compose it.

**The block contract** (checked by `build-registry`): the name ends in `Block`; the meta declares a `family`, a `kind` (`card` | `section`) and, for cards, the designed `width` ({ min, max }); the root takes `className` and renders `w-full` capped at the designed max; a card block built on Card takes `framed` (Card `default` / `flat`); the only other props are the primary action's callbacks. Content is never a prop — it is the constant at the top of the file, edited after copying. Variants are separate blocks, not a `variant` prop. To add one: write the pair, export both from `src/blocks/index.ts`, and regenerate the registry; the Blocks docs page picks it up from the catalog.

## Promoting from an app (and the drift back down)

The system grows **out of the apps**, not ahead of them. A component earns its way in by being built in a consuming app first, measured in place, and only then lifted here — which is how the workspace register (v0.31.1, out of Glitch's tool chrome) and `Tree` (v0.32.0, out of Glitch's layers list) landed. Both deleted more app code than they added: Glitch's `globals.css` went 229 → 49 lines and its local `components/workspace/` disappeared. That deletion is the signal you're promoting something real rather than relocating it.

**The route up.** Build it in the app. Measure the actual numbers in the running product — control heights, radii, type sizes at their real weights (`DESIGN.md → Registers` is what measured numbers look like written down). Then promote with three things, none optional: **tokens** (so the geometry is retunable, never hardcoded), **a contract test** (so the invariant you discovered can't silently break — `Tree`'s is `--tree-indent` must equal `--tree-column`, because a smaller step renders nesting *inverted*), and **a docs page that reproduces the bug you hit**, so the next agent meets the failure before they meet the fix.

**The over-fit check.** One consumer proves a thing works; it does not prove the shape is general. Before promoting, write down which parts you expect a *second* consumer to need — those predictions are the point, and whichever fail are the over-fits to the first app. When only one consumer exists, say so and prefer the narrower API; widening later is cheap, and unwinding an abstraction shaped around one app's accident is not.

**The drift down is not automatic, and nothing detects it.** Components live in the package, so an upgrade delivers them. **Patterns are copy-in** — the moment an app adapts one it stops tracking, and no tooling notices. `sable-lint` is a lexical token linter (see "Consuming this package"); it has no idea a given file was ever meant to follow a pattern. So when a pattern changes here, the consuming app needs a deliberate read-and-diff: `CHANGELOG.md`, the pattern's `llms/patterns/<name>.md`, and the current implementation, side by side. Most of the work is usually small, because patterns are mostly *composition* over components the app already got on upgrade — what the app misses is the **wiring**, which component to reach for and how to connect it (0.56.1's ChatPanel is the example: the streaming behavior shipped in `StreamingText`; the pattern only showed how to drive it from one `pending` flag).

## Component meta (the AI-readable surface)

Each component ships `<name>.meta.ts` exporting a `ComponentMeta` object: `name`, `summary`, `keywords`, `usage` (intent, do/don't guidance, anatomy), `related`, `props` (name/type/default/description), `subcomponents`, `variants`, `tokensUsed` (semantic tokens it reads), `a11y` notes, and `examples` (label + code). Inline meta is the preferred **source of truth** and the contract other agents read; keep it in sync when you change a component. Existing guidance backfills may also live in `src/lib/component-guidance.ts`; the docs and registry generator merge that overlay so consumers read one resolved catalog.

`usage.bestPractices` is where design judgment lives. Include concrete "do" and "dont" items that teach agents when to reach for the component, when to choose a neighboring component instead, and which visual/interaction anti-patterns to avoid. When a dont points at a neighbour, name it in `instead: ["Banner"]` as well as in the prose: the build checks each name is a real component or subcomponent, and `sable component` prints those donts as a short **not for** list at compact detail. For composite components, include `usage.anatomy` so agents understand the required parts and slots before composing JSX.

Two rules that keep the contract unambiguous for consumers reading the registry:

- **Stable components ship guidance.** A stable component needs `keywords`, `usage.description`, at least one `usage.bestPractices` "do" item, at least one "dont" item, and `usage.anatomy` when it exposes `subcomponents`. `build-registry.mjs` enforces this against the resolved inline-plus-overlay metadata.
- **`props` holds the root's props only.** Composed child components (SelectItem, ProgressTrack, …) go in `subcomponents` — a capitalized entry in `props` reads as a prop-object API (`<Progress ProgressTrack={{…}}/>`) and misleads agents.
- **Every composite shows its composed form.** A meta with `subcomponents` must include at least one example whose code uses them as JSX children — the shape of the API must be visible in the examples, not only in prose.
- **Examples are complete, copy-pasteable code.** The generator **fails** on an example that elides its content (`>…<`) or references a component the package doesn't export (a phantom like `<NetworkBanner>`); components consumers genuinely supply (a router `<Link>`) live in the generator's `EXTERNAL_COMPONENTS` allowlist. Every emitted example carries an auto-derived `imports` block — don't hand-author imports in meta code.

`registry.json`'s `components[]` (with each component's full props/variants/examples) is **generated from the metas** by `scripts/build-registry.mjs` — do **not** hand-edit it. `pnpm build` regenerates it; CI runs `pnpm registry:check` (`build:registry:check`) and **fails** if the committed file is out of sync, so the catalog can't silently drift. Adding a component is therefore: write its `*.meta.ts`, run the build (or `pnpm build:registry`), commit the regenerated `registry.json`. (The static blocks — `consume`, `tokens`, `enforcement`, `iconContract`, `layoutPrimitives` — are hand-authored and preserved by the generator.)

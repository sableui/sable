# What's new

## Unreleased

- **Combobox chips are balanced.** The remove button was a full 28px icon
  button, which swelled each chip into a 34px pill and left more room after the
  label than before it. It is now drawn to the chip (20px, with a 14px X) and
  keeps a 28px pointer target, so the label and the X sit evenly in a 23px chip.

## 0.4.0

### The default theme is now called Sable

The default theme was called Base, which read too close to Base UI, the
library Sable's components are built on. It is now **Sable**. It looks the same.

- Theme id `base` → `sable` (`data-sable-theme="sable"`, `setThemeId("sable")`).
- `@sableui/react/theme/base` and `theme/base.css` → `theme/sable` and
  `theme/sable.css`. `styles.css` still includes it, so most apps import nothing new.
- `baseTheme` → `sableTheme`.
- A stored `base` choice is no longer a known id, so `SableThemeProvider`
  falls back to the default, which is Sable.

### Themes

- **Panel fields read in dark mode.** `panel-field` was the canvas tone, 3% ink
  off the panel, which measured 1.04:1 on a dark panel. It is now mixed from the
  panel at 9% ink (1.15:1 dark, 1.25:1 light), with hover a step further at 12%.
- **Ember's dark-mode primary button has white text.** The fill is now Ember's
  light-mode orange-red. On the old, brighter fill the dark label passed WCAG
  but read muddy (APCA Lc 42); white now clears both (4.8:1, Lc 76). The
  sidebar's active item follows.

### Agent tools

- `sable-lint` no longer reports `hand-derived-surface` on the value of a
  `--theme-*` hook, such as `--theme-panel-field: color-mix(…)`. Tuning a
  derived token is what the hooks are for.
- `sable grade --ignore <glob>` skips the same paths `sable-lint --ignore`
  does, so a data layer of document colours is not counted as contract
  violations. Ignored files are still fingerprinted.

## 0.3.2

### Workspace panels

- **`panel-field` and `panel-field-hover` tokens.** The fill of a compact
  control docked in a panel, and its hover step. They default to the canvas
  tone and the raised panel step, so nothing changes visually. The `xs` field
  rung (Input, SelectTrigger, Combobox, ScrubField) now wears them, and a panel
  control of your own can too, without a lint exception.
- **`<Button variant="field">`.** A button that sits among `xs` fields in a
  panel row, such as a font picker or an add action: the inset field fill and
  the field's corner instead of a pill. Use it with `size="xs"` or `"icon-xs"`.

### Agent tools

- `sable grade` checks props against each component's real type, so props a
  component forwards to Base UI (`Toggle`'s `pressed`, `Combobox`'s `filter`)
  are no longer reported as hallucinated. `registry.json` carries the result as
  `propSurface`.
- `sable grade` reads the icon names your app adds with `composeIconSets` from
  `.sable/icons.json` (`{ "names": [...] }`), or from `--icons <file>`, and stops
  counting them as off-contract.
- `sable setup --agent --root <dir>` writes the skill entries in an ancestor
  directory. In a monorepo, run it in the workspace package that depends on
  Sable with `--root` at the repository root. The entries resolve Sable through
  that package.

## 0.3.1

### Charts

- **Smoother hover.** The tooltip is anchored to the data instead of chasing
  the pointer, and glides between positions; the cursor and the active dots
  glide too. Moving within one data position no longer re-renders the chart.
  Hover feedback has its own quick timing — dimming the other bars no longer
  waits out the arrival stagger.
- Active dots on stacked areas draw above every series, so a later fill no
  longer covers the dot below it.

### Presets

- Presets may carry the chart palette (`chart-1` … `chart-8`). Optional — a
  preset without them inherits Base's validated set. On sableui.com,
  Customize now generates a chart palette from the brand and the Palette
  setting, held to the same colour-blind and normal-vision separation checks.

### iOS

- Layers portalled out of an iOS prototype (a toast stack, a menu) read the
  prototype's safe-area geometry, so a toast placed under the status bar shows
  there instead of below the screen.

## 0.3.0

Blocks, charts, and the components they needed.

### Breaking

- **`DotsMenu` is now `OverflowMenu`** (`overflowMenuMeta`, same props). The
  name says what it is for — the "more actions" menu — rather than how its
  trigger is drawn.

### New

- **Blocks** — section-sized compositions on a new `@sableui/react/blocks`
  subpath and in `registry.json → blocks`: 40 of them across Auth, Settings &
  team, Commerce, Dashboard, Marketing, Social & messaging, Media & files,
  Navigation and System (sign-in, pricing table, team members, invoice
  history, FAQ, 404, chart cards…). Copy one and edit its content constants;
  props are only `className`, `framed` and the primary action's callbacks.
  `sable block --list`, `--family`, `--skeleton` and `--code` retrieve them,
  and the docs have a Blocks page with live previews and copyable code.
- **Charts** — `AreaChart`, `BarChart`, `LineChart`, `PieChart`,
  `RadarChart`, `RadialChart` and `Sparkline`, in SVG with no dependency, for
  dashboards, landing pages and decks. Stacked and 100% stacked, grouped,
  horizontal and diverging bars, smooth/linear/step curves, gradients, dots and
  labels, donuts with a centre value, gauges, legends with icons, and tooltips
  with dot/line/dashed indicators, formatters and totals. Lines draw on, bars
  rise and slices sweep in as a chart scrolls into view, and new data eases
  from the old shape — all on the motion tokens. Every chart carries its data
  as a table for assistive tech and steps through it from the keyboard.
- **Chart palette** — `--chart-1` … `--chart-8`, eight series colours
  validated for colour-blind separation, a normal-vision floor, a lightness
  band and a chroma floor, in light and dark. Every theme inherits them; a
  theme may override the set. `chartColor(i)` hands the same colours to a
  charting library.
- **`DateTile`** — a calendar-page date (month band over the day), with
  lining figures so a display face never drops the day below centre.
- **`SegmentedBar`** — one bar split into the parts of a whole, read aloud as a
  single labelled image.
- `CardTitle` takes `render`, so a card's name can be a heading
  (`render={<h2 />}`).
- `Entity` takes `selected` for the current row of a selectable list.
- Icons: `stop`, `key`, `wallet`, `thumbs-up`, `thumbs-down`.
- `sable-lint` lints a single file as well as a folder.

### Components

- **Sidebar:** components placed in the rail ink with the rail's own tokens, so
  a dark rail on a light page keeps its account row legible.
- **Entity:** hover and selected fills step off whatever surface the row sits
  on.
- **ChatComposer:** the stop control is a filled square, not an ✕.
- **CommandMenu:** a long detail no longer squeezes the label.

### Fixes

- The registry's derived imports for patterns and blocks include hooks called
  with a type argument (`useRef<…>(`) — `ListDetailPage`'s copied source was
  missing its `useRef` import.

## 0.2.0

A design and polish pass across the library, its page patterns, and the site.

### Breaking

- **`Description` is removed.** Label/value lists are now typography on the
  native element: `<dl className="sable-list-dl">` with `<dt>`/`<dd>` children,
  and `sable-list-dl-2` for two pairs a row inside an `@container`. Colour a
  status value with a `text-*` utility on its `<dd>`. `DescriptionItem`,
  `DescriptionTerm`, `DescriptionDetail`, `descriptionVariants` and
  `descriptionMeta` go with it.

### New

- List utilities for semantic HTML: `sable-list` (bullets),
  `sable-list-numbered`, `sable-list-dl` and `sable-list-dl-2`, documented under
  Typography → Lists.
- `sable-frame-tool`: a frame for edge-to-edge tool chrome that keeps the
  theme's radius and passes concentric geometry to what's inside. PanelSection
  rows grow their inset with the corner and compact fields curve parallel to
  it; unframed, panels keep their 8px inset.
- `KbdGroup` for keyboard combinations.

### Components

- **Bubble:** the tail is a drawn ear on every corner style, flat through fully
  pilled, with a softened tip and a filleted inner corner; square themes keep it
  sharp. Bubbles reserve the tail's space so grouped runs line up.
- **Checkbox / CheckboxCard:** the check and dash read at a consistent ~1.6px
  weight on the filled box.
- **EmptyState:** the glyph stands on its own, with no disc, and can be an image
  or illustration.
- **Skeleton:** one eased sheen passes through every skeleton on screen as a
  single wave, a highlight in light and dark, and rests off-screen under reduced
  motion.
- **Stepper:** indicators no longer rise above sticky headers or navigation bars.
- **BottomNav / Button:** badge dots sit on the icon's corner.
- **Toast:** enters from the edge it is anchored to, and portals to `<body>` so a
  transformed ancestor can't trap it.
- Refinements to Card (concentric inner radius, footer seams), Table and
  DataTable, Avatar, Badge, Pill, Kbd, Combobox, Select, NumberField, SideNav,
  ThemeSelector, ChatComposer and more.

### Presets

- Verdant and Meridian lift cards and popovers above the page in light mode, so
  fields read as boxes to type in. A theme test now holds every preset to it.

### iOS

- `IosSheet` follows iOS 26: Liquid Glass at the medium detent, floating and
  concentric with the screen; opaque at the large detent; a glass close button
  and a centred title.

### Page patterns

- All eight rebuilt as fuller examples. Dashboard, Settings, Auth, List–detail
  and Feed now tell one product story; Landing shows the library working;
  Brand landing and Chat are polished.

## 0.1.1

- Published with npm trusted publishing: releases come from `sableui/sable`'s
  release workflow with provenance and no stored token. No library changes.

## 0.1.0 — first public release

Sable is on npm as `@sableui/react`: `pnpm add @sableui/react`. No registry setup
or token is needed. Follow the [installation guide](/getting-started) to wire
React, Tailwind CSS 4 and the stylesheet.

### Components and layout

- About 100 components on Base UI behavior: forms, selection, menus, dialogs and
  sheets, data display, tables, navigation, feedback, messaging, media and
  workspace tools. Every example on the site is built from Sable's own components.
- 13 layout primitives and 8 page patterns (auth, dashboard, feed, settings,
  list–detail, landing, brand landing, chat).
- Semantic tokens for color, type, spacing, shape, surfaces and motion; spacing
  follows the density control, and motion honors reduced-motion settings.
- `styles.css` paints the page ground on `<html>`, so dark mode is readable from
  the first render.

### Six presets

- **Base:** neutral surfaces, soft corners, and Figtree typography.
- **Meridian:** cream and ink, square panels and buttons, and flat surfaces.
- **Prism:** compact spacing, IBM Plex typography, crisp corners, and blue actions.
- **Verdant:** forest tones, warm paper, and serif headings.
- **Ember:** warm surfaces, light headings, and orange-red actions.
- **Poppy:** bold headings, cream and plum, rounded panels, and offset shadows.

Every preset supports light and dark modes. Try them on the homepage or tune them
in the canvas, then download a portable preset or copy its CSS.

### Build with your agent

- One package-owned skill for Codex, Claude Code, Cursor and compatible agents:
  build an idea, develop a preset from inspiration, audit existing work, and
  polish the result. Run `pnpm exec sable setup --agent` to install it.
- The `sable` CLI serves the catalog in pieces (components, patterns, tokens,
  utilities, guides), checks a project's wiring with `sable doctor`, and lints
  with `sable lint`, which catches restyled components, hand-built lookalikes,
  raw colors and fixed spacing.
- Presets are portable files the package validates and turns into scoped CSS.

### iOS prototypes

- Optional `@sableui/react/ios` for clickable iPhone prototypes: screens are Sable
  components in your preset, inside iOS chrome (status bar, navigation bar, tab
  bar, sheets) drawn by Konsta UI, an optional peer installed only for iOS.
- `sable target ios` gives each component's decision; `sable-lint` flags direct
  Konsta imports. `@sableui/react/ios/preview` frames a prototype at iPhone size.

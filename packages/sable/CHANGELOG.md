# What's new

## 0.6.0

### Art from the theme

- **`GradientArt`, placeholder artwork painted by a shader.** A static WebGL
  mesh gradient (Paper Shaders' static mesh gradient; `variant="grain"` for
  their grain gradient) painted from the theme, for covers, banners, tiles and
  avatars with no image yet. `seed` fixes each item's composition and leading
  colour, so a row of covers or avatars stays individually recognisable in
  every theme; children render above the art. It paints once on mount, on
  resize and when the theme changes, through one WebGL context shared by every
  instance, so a page of avatars costs one context. A CSS gradient stays
  underneath for prerendered pages and browsers without WebGL2.
- **Each preset has its own art direction.** New optional `--art-*` tokens
  (`art-1` … `art-6`, `art-ground`, `art-warp`, `art-softness`, `art-grain`;
  `ART_TOKENS` in the contract) set the art's palette and character, through
  `--theme-art-*` hooks like the workspace surfaces. Ember burns (fire falling
  off into warm black), Poppy is candy blobs, Prism airbrushed pastels, Verdant
  stained glass, Meridian grainy monochrome, Atelier a dark studio with one
  amber glow; Sable keeps its tones. The colours derive from each theme's own
  tokens where its art direction allows, so a brand change carries into the
  art. Presets may declare the hooks too.
- **`Avatar variant="art"`.** The fallback paints the initials over
  `GradientArt` seeded by the person (the initials, then `alt`, or `seed`), so
  everyone without a photo gets their own colour and keeps it wherever they
  appear. The default stays `neutral`.
- **Blocks and patterns use it.** The product card, media player and profile
  card blocks and the auth page paint their placeholder art with
  `GradientArt` instead of hand-written CSS gradients, and the avatars across
  the blocks and page patterns use `variant="art"`.
- **New dependency:** `@paper-design/shaders` 0.0.81 (Apache-2.0), pinned
  exactly while it is pre-1.0. Only the two fragment shaders and the noise
  texture are imported; the notice is in `THIRD_PARTY_NOTICES.md`.

### Labels on filled colours

- **Labels on brand and status fills now have to pass APCA as well as WCAG.** A
  filled control's label is held to 4.5:1 and APCA Lc 60 in both modes, for
  `primary`, `sidebar-primary`, `highlight`, `destructive`, `success`,
  `tone-warning` and `tone-info`. The ratio alone let dark ink on a bright red
  through at Lc 38–46, which reads muddy. Every shipped theme is tested against
  both floors, with no exceptions.
- **Status colours have a separate token for text.** `--destructive-text`,
  `--success-text`, `--tone-warning-text` and `--tone-info-text`.
  `text-destructive`, `border-destructive`, `ring-destructive`, `outline-`,
  `decoration-`, `fill-` and `stroke-` now read the `-text` token; only
  `bg-destructive` reads the fill. The class names are unchanged. A dark-mode
  fill can now sit low enough for a white label while error text stays light
  enough to read on a dark card. Badge's soft status tones and the destructive
  Menu item mix their ink from the `-text` token too: from the fill, Meridian's
  dark destructive menu item measured 3.8:1; every theme now clears 4.5:1.
  **Migration:** if your app retunes `--destructive` (or `--success`,
  `--tone-warning`, `--tone-info`), set its `-text` as well, or text, borders
  and rings keep the theme's colour. Presets saved on 0.5 keep working: a
  missing `-text` token takes its fill, which is what text read before.
- **Destructive buttons have white labels in dark mode.** In Sable, Atelier,
  Ember, Meridian and Verdant the dark destructive fill moved down (Sable
  68%→59%, Meridian 66%→55%, Atelier 66%→58.5%, Verdant 64%→57.5%, Ember
  62%→58%) and its label went from dark to white. Error text reads the lighter
  `-text` value, so it is no darker than before.
- **Dark highlights have white labels in Sable and Ember.** Sable's dark
  `--highlight` went from 70% to 57% and Ember's from 65.2% to 58%; dark ink on
  the brighter fill read at Lc 42–46.
- **Small status fixes.** In Ember, Atelier, Meridian and Verdant, dark
  `success` and `tone-info` are a little lighter so the dark label clears Lc
  60. In light mode, Sable's `text-tone-info` is one step darker and Verdant's
  `text-tone-warning` is 51%; both measured just under 4.5:1 on `muted`.

### Lint and CLI

- **New `sable lint` rule: `label-contrast`.** It finds an app's overrides of a
  brand or status fill or its `-foreground`, completes the pair from the
  installed theme and measures both modes. Findings carry file:line and the
  nearest pair that reads: the fill's lightness moves, the hue stays. Keep a
  deliberate brand pair with `/* design-lint-disable-next-line label-contrast
  -- <reason> */`. `sable grade` runs the same rule. Apps that passed lint on
  0.5 can fail it now.
- **`sable preset --check` measures labels on fills.** A failing pair stops the
  check with `ERR_PRESET_CONTRAST`, the suggested pair and a ready-to-paste
  `exceptions` entry. Presets accept an optional `exceptions` array (`rule`,
  `mode`, `token`, `reason`); an accepted pair is reported with its reason on
  every check instead of failing. `@sableui/react/presets` exports
  `presetLabelContrast()` and the measuring helpers (`checkLabelledFills`,
  `fitFillToInk`, `inkFor`, `inkPolarity`, `labelContrast`, `LABELLED_FILLS`,
  `BRAND_FILLS`, `STATUS_FILLS`).

### Sheets own their actions

- **A sheet lays out the actions inside it.** `CardFooter` has an `actions`
  prop for a footer that holds only buttons. Inside a bottom `SheetContent` or
  an `IosSheet`, that footer becomes a full-width stack pinned to the bottom:
  the primary on top, every button at the cta height. On a page nothing
  changes. `SheetFooter` stacks the same way in a bottom sheet, capped at
  `max-w-sm` and centred; side sheets keep the right-aligned row.
  DangerZoneBlock, FeedbackFormBlock and ProfileFormBlock mark their footers.
- **Only the sheet's own content.** A Dialog, Popover or side Sheet opened from
  inside a bottom sheet presents a page again, so its footer is a row. Only the
  outermost flat Card in a sheet bleeds into the sheet's padding (lining its
  content up with the sheet's title and close button), and only that card's
  footer stacks; a card nested inside it is left alone.
- **`PresentationProvider`, `usePresentation`** and the `Presentation` type let
  a custom container declare itself a sheet.
- **`IosSheet background="opaque"`** keeps the floating medium-detent shape but
  fills it solid, like SwiftUI's `.presentationBackground`, for forms whose
  fields would otherwise sit on whatever the glass blurs. In an iOS sheet, a
  form or grid between the content and its action bar keeps its own layout.
  The iOS target is marked beta, and `sable target ios` prints its layout rules.

### Components

- **Tab triggers space a badge or icon from the label.** Pill and underline
  `TabsTrigger` use `--control-gap`, as Button does; the label's trimmed span
  had dropped a typed space, so a badge touched the text.
- **NotificationListBlock puts the unread dot before the time**, so the times
  line up on one right edge.

### On sableui.com

- **Customize was redesigned.** Simple is gestures over previews: the character
  pad, one shape preview for corners and depth together, a live palette strip
  of what the page is painted with, single-line font rows. Advanced is a
  property grid in the workspace register (compact density, `PanelSection`,
  `PropertyRow`/`PropertyPair`, `ScrubField`, `Select`): one exact anchor per
  domain with the ladder it resolves to beneath it. Mode, Reset all and Export
  sit in a footer both views share, and every section resets on its own.
- **Status colours lean toward the brand within their meaning.** Destructive,
  warning and success each move toward the brand inside a hue range the
  presets already ship (destructive 5–30°, warning 50–90°, success 140–175°),
  warning keeps 30° from destructive, and saturation follows the brand at half
  strength with a floor. Advanced has a Status lean control.
- **Customize fits labels to brand and status fills**: the label ink is chosen
  once, from the brand as picked, and each mode's fill moves to meet it.
- The homepage now says what is true: Sable is open source under MIT and
  installs from npm.

## 0.5.0

- **Stacked toasts.** `<ToastProvider stacked>` stacks toasts like a deck of
  cards: the newest in front, older ones peeking out behind it a step smaller,
  so a burst of toasts no longer takes over the corner of the page. Hovering
  or focusing the stack fans it out into the list. It works at every
  `position`. `ToastContent` is the new part that holds a toast's row; in a
  stacked viewport it hides the cards behind the front one. Collapsed, the
  deck casts one shadow rather than one per card, so a theme with hard offset
  shadows (Poppy) stays clean.
- **Depth in Customize.** On sableui.com, Customize has a Depth control (Flat ↔
  Lifted) and a Shadow style (Preset, Soft, Crisp, Offset). They write the five
  `--theme-shadow-*` tokens for light and dark, so the CSS export and preset
  download carry them. Depth scales the reach and strength of every step
  together; lifting a flat preset such as Meridian brings in soft shadows. The
  shadow takes the preset's neutral hue. Advanced replaces the slider with
  exact numbers set on the largest step, which the others follow: light angle
  (90° is overhead), distance, blur and opacity. Blur takes one
  blur-to-distance ratio, so an Offset shadow can be softened; opacity is set
  in light mode and dark mode darkens in proportion.
- **Knob shadows stay on their track.** The Switch thumb, Slider thumb and
  ColorField handle used `shadow-sm`, the elevation step for raised surfaces.
  Where a theme or a Depth setting made that a long offset (Poppy's hard
  drops), the shadow fell outside the switch's track. Knobs now take
  `--knob-shadow`, one small contact shadow that themes can set through
  `--theme-knob-shadow`. In Sable it looks the same as before.
- **Pill tabs take the theme's button shape.** `TabsList variant="pill"`
  triggers used the small radius, so in Sable they were rounded rectangles
  beside pill buttons. They now read `--button-radius`
  as `Button` does: pills in Sable, 12px in Poppy, square in Meridian, and a
  theme's own button shape wherever it sets one.
- **CodeBlock no longer scrolls code under its copy button.** Without a
  filename header, the copy button floated over the code, so on a narrow
  screen a long line ran underneath it. It now has its own column beside the
  code. The code's edges fade while there is more to scroll, like `Scroller`'s.
- **Scroller's edge fades follow content and size changes.** They were measured
  on mount and on scroll only, so a list that grew, shrank or was resized kept
  the fade it started with until it was scrolled.
- **Icons no longer redraw on every render.** The default Reicon set and the
  brand set rewrote their SVG each time a parent re-rendered (React 19
  re-applies `dangerouslySetInnerHTML` when the object changes). Inside a
  toast that never settled and froze the page.
- **A card that is only a header keeps its bottom padding.** `CardHeader` leaves
  the bottom padding to the content that follows it; with nothing after it (a
  stat card: label, number, sparkline) the number sat on the card's edge.
- **Line and area sparklines span their own range.** They used to include zero,
  so a run from 12 to 26 used only the top half of the box: a flat squiggle over
  a solid block. Bar sparklines keep the zero baseline, since a bar's length is
  the value.
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

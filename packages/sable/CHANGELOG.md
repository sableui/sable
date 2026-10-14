# What's new

## 0.9.1

Fixes from a review of 0.9.0.

- **Stacked toasts stay on screen beside an open Sheet.** Moving a bottom stack
  to the top left stacked toasts hanging from the top edge, off the screen.
  They now re-anchor with the stack. A top Sheet also sends a top stack to the
  bottom.
- **Toasts clear a Sheet of any width.** A side Sheet publishes its real width
  (`--sable-sheet-right-w` / `--sable-sheet-left-w`) while open, so one widened
  with `className` is cleared too.
- **Form no longer takes focus back after a slow submit** if the person has
  moved to something outside the form. It also keeps looking for a few frames,
  for errors set in a transition or an action that render late.
- **A loading Button refuses Enter and Space in its own `onKeyDown`** as well
  as clicks, so a menu trigger rendered as a busy Button stays shut. Tab still
  moves on.
- **Stepper's phone layout follows each step's status.** A flow driven by
  `status`, or one that has finished, kept the wrong title or none.
- **`sable check` only warns about the whole-package `@source`.** A
  single-module `@source` or an `@source not` exclusion no longer reads as one.
- **CommandMenu's clear button is out of the tab order** and doesn't take
  focus from the field when pressed. Esc still clears from the field.
- **sableui.com** shows the 0.9 additions: plain Fieldset, RadioCard and Field
  `trailing`, the MediaTile product tile, CommandMenu `leading`, async Button,
  the Stepper on a phone, SkipLink, toasts beside a Sheet, and a note on each
  reference layout. Build with Sable, Blocks and Page shells say they are
  starting points.

## 0.9.0

A storefront built on 0.8.2 (and the same brief on shadcn) found the seams
below: focus lost after async actions, controls clipped in accordions, and
slots a shop needs that the parts did not have. It also built its own search
panel, and it was good. This release makes that the expected outcome rather
than a rule bent.

### Apps on Sable shouldn't all look alike

- **Behaviour is fixed; layout is yours.** The skill and `AGENTS.md` now sort
  the catalog three ways. Behaviour (controls, fields, overlays, anything with
  focus or keys) is always used. Parts (Card, Entity, AspectBox, Badge) are
  composed freely. References (patterns, blocks, and compositions such as
  MediaTile) are used when their layout fits the brief; otherwise the agent
  composes its own from parts, and that is not a gap.
- **Signature surfaces.** The brief names the one to three surfaces where a
  product's identity lives (a shop's product card and search). The agent
  designs those from the brief's direction, and takes Sable's defaults
  everywhere else.
- **`sable search` and `sable component` mark references** with ◇ and name
  the parts to compose your own from (`reference` and `parts` in JSON).
- **`sable check`'s surface list reads as notes.** "→ Sable has Card"
  replaces "→ consider Card", and the reuse inventory records "used it" or
  "kept ours, because…" with neither treated as a failure. A new note flags
  arrow keys handled by hand: list keyboard navigation is behaviour CommandMenu,
  Combobox, Menu and Toolbar already own.

### Upgrading from 0.8

- **Button `loading` no longer sets `disabled`.** A busy native button gets
  `aria-disabled` and refuses presses itself, so it keeps focus. Disabling the
  focused button sent focus to `<body>`, and a sheet the action opened had
  nowhere to return it. A test asserting `toBeDisabled()` on a loading button
  checks `aria-disabled="true"` now.
- **A horizontal Field is a few pixels taller.** Its row is padded to a
  Switch's height, so the control no longer overflows the Field's box.

### Fixes

- **Focus moves to the first invalid field after your own validation.** Form
  focused it only for its own checks. Errors your handler sets on Fields now get
  the same, once `onSubmit` (or the promise it returns) is done, with or
  without `noValidate`.
- **Controls in an AccordionPanel are no longer clipped.** The first checkbox
  or switch lost its top edge, and focus rings their left edge.
  `motion-disclosure` clips with a small margin, and horizontal Fields contain
  their control.
- **Toasts keep clear of an open Sheet.** A toast on the sheet's edge covered
  its footer (Check out) or its close button. With room, the stack moves beside
  the sheet; on a narrow screen, a bottom stack moves to the top.
- **Field forwards `data-*`, `id` and other props to its root.**
- **`sable grade` accepts native input attributes** (`inputMode`,
  `enterKeyHint`, `autoCapitalize`, `autoCorrect`, `pattern`, `list`, `accept`,
  `capture`). It flagged the ones the form contract asks for.
- **`sable check` warns when `sable sources` trims nothing.** With the
  whole-package `@source` still beside the generated file, Tailwind scans all
  of Sable anyway.

### New

- **Button `onClick` can return a promise.** The button shows `loading` until
  it settles and ignores presses meanwhile, from the first click on. A `busy`
  flag in state took effect a render late, so three fast clicks added three
  items.
- **Field `trailing`.** Vertically, it sits beside the control: a promo code's
  Apply button. Horizontally, it sits at the end of the label's line: a facet
  count.
- **RadioCard `trailing`,** end-aligned on the title's line: a delivery
  option's price.
- **MediaTile `meta`, `srcSet` and `sizes`.** `meta` holds the lines under the
  subtitle (price, sale price, finishes, a Badge), so a product tile is a
  MediaTile.
- **CommandMenu items take `leading`** (a thumbnail or Avatar in place of
  `icon`), and the field has a clear button once there is a query.
- **`Fieldset variant="plain"`:** the group and its legend without the card.
  It names a radio group inside a form that is already framed.
- **Stepper compacts on a phone.** A horizontal stepper narrower than 28rem
  keeps every disc and only the current step's title; the other titles stay
  for screen readers.
- **`SkipLink`,** AppShell's skip link on its own, for layouts that are not an
  AppShell.

## 0.8.2

- **A suggested stack for blank-slate apps.** Sable still depends on no router,
  data or form library, and an app keeps the ones it has. Starting from
  nothing, the skill, `AGENTS.md`, `sable docs getting-started` and the install
  recipe (`registry.json` → `consume.stack`) now suggest Vite + TypeScript with
  TanStack Router, TanStack Query, TanStack Form for forms with validation
  logic, and TanStack Table once a table outgrows `DataTable`.
- **`sable docs tables-with-tanstack`:** when to move from `DataTable` to
  TanStack Table (server-side data, column visibility or resizing, grouping,
  virtualised rows), and how to render it with Sable's `Table` parts,
  `Checkbox`, `Button` and `Pagination`, with server data through TanStack
  Query and bulk-action selection. `DataTable` stays dependency-free.

## 0.8.1

- **`sable check` shows doctor's notes.** Warnings and notes from `sable doctor`
  don't fail the check, so a passing check printed none of them. They now list
  under the doctor line, and when the app still scans all of Sable, the finish
  steps add one: trim the CSS with `sable sources` to the components the app
  imports. The skill says to act on check's notes, and the install recipe
  (`registry.json` → `consume.cssSources`) and `sable docs getting-started`
  mention `sable sources` beside the whole-package `@source`.

## 0.8.0

The same support-workspace app was built twice, on Sable and on shadcn, and this
release closes every gap the comparison found: two silent layout and form bugs,
the component defects, row selection, a sanctioned way to patch a component
while its fix ships, and CSS that only carries the components an app imports.

### Upgrading from 0.7

- **`<Form noValidate>` now means your code owns validation.** `onSubmit` always
  runs and each Field shows the `error` you set; nothing checks the Fields or
  the browser first. It used to skip only Sable's extra browser check, while
  Form still blocked an empty `required` Field. `validationMode`, `errors`,
  `onFormSubmit` and `actionsRef` do nothing with it. Drop `noValidate` to keep
  Sable's validation, and word its messages with Field's new `messages`.
- **A Switch's knob stays white when on.** It took the primary's label ink, so
  a mid-light brand colour gave a dark knob. It now turns dark only on a track
  lighter than L 0.9 (a dark mode's near-white primary). Set
  `--theme-switch-thumb-on` to choose your own.
- **PageHeader holds 20rem for its title** before actions may share its row, so
  on a phone the actions sit under the title instead of squeezing it to one
  word a line.

### Everything in this release

- **Nested `Grid`, `Col` and `SplitPane` no longer inherit their parent's
  breakpoints.** A breakpoint a nested one left unset read its ancestor's value,
  so a `cols={2}` Grid inside a 12-column `lg` Columns drew 12 tracks, and a
  nested `span={6}` Col spanned 9. Each now resets its own.
- **`Field messages`** words a failed native constraint:
  `messages={{ valueMissing: "Enter a subject." }}`, instead of the browser's
  "Please fill out this field."
- **Text around an expression stays one label.** `All ({count})` rendered as
  "All ( 12 )" in Button, Pill, Badge, NotificationBadge, Toolbar and pill Tabs:
  each text child was its own flex item, spaced by the gap. Adjacent text now
  joins into one.
- **Toggle spaces an icon from its label**, like Button.
- **SidebarHeader grows to hold a second row** (a search field under the brand)
  instead of clipping it at 64px. Give that row `basis-full`.
- **`BreadcrumbLink` takes `render`**, so a router link navigates in the app
  instead of reloading the page.
- **DataTable checkbox selection.** `selectedKeys` and `onSelectedKeysChange`
  add a checkbox column, each box named by `rowSelectionLabel`, and a
  select-all box that acts on the rows shown and goes mixed when some are
  checked. Checked rows take the selected fill; a box never opens the row. The
  docs show a bulk-action bar with a live status.
- **`sable patch`** fixes a component in place while the library fix ships.
  `sable patch Card --reason … --repro …` records why and how to check it, and
  prints your package manager's patch steps (`pnpm patch`, `yarn patch`, or
  patch-package). Every build now ships `dist/file-hashes.json`, and `sable
  doctor` re-checks each patch on upgrade: it fails when Sable changed a
  patched file, quoting the changelog for that component, until the repro says
  `--keep` or `--drop`. See `sable docs patching-a-component`.
- **`sable sources`** writes `@source` lines for just the Sable modules an app
  imports. The whole-package `@source` ships every component's classes (about
  32 KB gzipped); an app on Card, Button and DataTable measured 12 KB. `sable
  doctor` fails when the file goes stale, since an unlisted component renders
  unstyled.
- **New lint rule `form-required-error`:** a `required` Field with an `error`
  inside a validating Form, where that error can never show for an empty field.
- **Icons:** `tag`, `paperclip`, `chart`, `flag` and `at-sign`.
- **`CommandMenu` stacked rows:** `stacked` puts `detail` under the label, for
  results only their detail tells apart.
- **A one-setting `SettingsMenu`** opens straight to its options under the
  row's label: one click, not two.
- **`ChatComposer sendOn="mod-enter"`** for long-form replies: Enter breaks the
  line, Cmd/Ctrl+Enter sends.
- **Docs:** `sable learn --template` states its evidence rules (inside the
  project; different before and after files); MessageScroller names its scroll
  options (`{ animate }`, not `behavior`); Button explains `useCopy(text)`; and
  `reviewing-a-design` says to scroll through, or capture with reduced motion,
  before calling a below-the-fold chart empty.

## 0.7.1

Fixes from building a customer-support app on 0.7.0 with an app-owned preset,
plus guidance for choosing a page width. Nothing to migrate.

- **A table in a flush card keeps the card's corners.** `Card` now clips to its
  rounded corners when it holds a `CardContent flush`, as it already did for a
  `CardList`. The hover fill of an edge-to-edge `Table` or `DataTable` row and a
  `TableFooter`'s tint no longer poke square corners out past the card's.
- **Only body rows hover.** `TableRow` lifts on hover inside `TableBody`; header
  and footer rows stay still, since nothing there responds to a click.
- **SideNav and Sidebar icons stay level with their labels at any spacing
  step.** The icon box was sized in spacing steps around an icon sized in type,
  so a theme with a step other than 4px shrank the box and dropped every icon
  about 2px below its label. The box is now sized in the icon's own unit and
  centred with flex.
- **A donut's number holds the centre.** In `PieChart` and a full-ring
  `RadialChart`, `centerLabel`'s value sits on the centre and its caption hangs
  below, instead of the pair splitting the centre between them.
- **`centerLabel.value` takes a number.** It is written in full up to 9,999 and
  shortened from 10,000 on (`10.2K`, `102.1K`, `1.2M`), in the chart's
  `locale`. A string still shows as written, for units.
- **Presets can set page widths.** `page-inset` and the role caps
  (`region-form`, `-feed`, `-content`, `-wide`, `-full`) are preset tokens, so a
  product's widths live in its preset rather than app CSS. They are opt-in:
  `sable preset --template` and Canvas exports leave them out, so a preset never
  overrides widths an app already sets. `PAGE_WIDTH_TOKENS` lists them.
- **Guidance for choosing a page width.** `sable docs building-a-page` has a
  table of which `max` to use by what the person does on the page, and when to
  go fluid. The Region docs say `full` is the largest cap (edge to edge is
  `bleed`) and show a fluid workspace; the old "Fluid dashboard" example was
  capped and is retitled. `reviewing-a-design` asks for a 1920px capture of a
  capped or fluid route, where the choice shows, and the skill's brief records
  each route's width.
- **A pasted preset gets applied.** Canvas's "Copy for agent" message now asks
  the agent to apply the preset and build the app, not only save it. The skill
  treats a preset supplied for an existing app as a restyle, `sable docs
  using-presets` has an "Apply to an existing app" section, and a passing
  `sable preset --check` lists the steps that make an app use the preset.
- **`TrafficTrendBlock` fits a narrow card.** Below 24rem its range toggles
  move under the title instead of squeezing it.

## 0.7.0

A dogfooding release. An agent built a music streaming app on Sable with
Sable's own skill, and this release closes the gaps it hit:
- media tiles, an image fallback and a persistent player dock;
- section headers, portrait avatars and in-place pickers;
- labelled sliders and focusable text links.
The package is also much smaller per import, `sable check` runs the whole
finish check in one command, and lint now catches hand-assembled lookalikes of
Sable components.

### Upgrading from 0.6

- **Icons are opt-in.** Wrap the app once in `<IconProvider set={reiconIconSet}>`,
  with `reiconIconSet` from `@sableui/react/icons/reicon`. Without it, every
  `<Icon>` (including those inside Sable components) renders nothing, and
  `sable doctor` reports it.
- **`SableThemeProvider` defaults to `"system"`.** Pass
  `defaultPreference="dark"` to keep the old first-visit mode.
- **`Grid minItemWidth` keeps its empty columns (`auto-fill`).** Pass
  `track="fit"` where a fixed set should stretch across the row.
- **Button's side padding is a variable.** A `px-*` className on a Button no
  longer matches its optical alignment (`bleed`). Set `--button-px` instead.

### Everything in this release

- **`SableThemeProvider` follows the visitor's OS on a first visit.**
  `defaultPreference` now defaults to `"system"` instead of `"dark"`. A stored
  choice still wins. **Behaviour change:** an app that relied on the implicit
  dark default should pass `defaultPreference="dark"` (or its preset's
  `defaultMode`).
- **`Slider` names the slider, not its wrapper.** `aria-label` used to land on
  the Root's `role="group"`, so screen readers announced an unnamed slider. It
  now goes to each thumb's input. New `getAriaLabel` (per thumb, for ranges)
  and `getAriaValueText` (e.g. a seek bar's "1:23 of 3:45").
- **AppShell `dock` slot** for persistent chrome such as a now-playing or call
  bar. It is full width and sticky to the bottom, above `bottomNav` on mobile,
  and the app Sidebar shortens to clear it.
- **`link-underline` carries a focus-visible outline** in `--ring`, so plain
  text links meet the focus floor without app CSS.
- **Media icons:** `shuffle`, `repeat`, `repeat-one`, `volume`, `volume-low`,
  `volume-off`, `queue`, `music`.
- **`--theme-art-brand` hook.** Ember's and Prism's art (and the default art
  ground) key off it, falling back to `--primary`. Set it wherever the primary
  action stops being the brand, such as a neutral black/white primary, so the
  art keeps the brand colour.
- **`sable lint`'s `static-interactive` rule reads variants, not substrings.**
  A capability query like `[@media(hover:none)]:opacity-100` is no longer
  mistaken for a hover style.
- **Breaking: icons are opt-in.** `<Icon>` no longer falls back to Reicon, so
  an app that brings its own set ships none of Reicon's artwork (about 190 KB
  minified). Without an `IconProvider`, icons render nothing and a development
  build warns once. `reiconIconSet`, `reiconIconNames` and the deprecated
  `fallbackIconSet` moved off the root (and `/icons`) barrel to
  `@sableui/react/icons/reicon`. **Migrate:** wrap the app once in
  `<IconProvider set={reiconIconSet}>` with
  `import { reiconIconSet } from "@sableui/react/icons/reicon"`.
- **Smaller bundles: the package ships one module per source file.** `dist`
  keeps the `src` layout instead of a few large bundles, so a bundler drops
  every component an app does not import. Importing only `Button` used to pull
  in about 70% of the library under esbuild; the import paths and exports are
  unchanged. Each module also keeps its `"use client"` directive.
- **GradientArt loads its WebGL renderer on first paint.** The shader code
  (about 43 KB minified) is a separate chunk, so a plain `Avatar` no longer
  ships it, and art still shows its CSS stand-in until the shader fades in.
- **`OtpField` resolves Base UI's OTP parts when it first renders**, so apps
  that never use it no longer carry Base UI's OTP Field.
- **`sable check`: one command to run before calling a build done.** It runs
  `sable doctor`, `sable lint` and `sable grade` on the given paths (default
  `src`), prints one pass/fail summary, exits 1 if any fails, and then lists the
  review steps no tool can verify (rendered design, journey, motion, reduced
  motion, reuse inventory, lessons). `--json` returns `{ type: "check", data }`.
  The skill's finish checklist now opens the skill and starts with it.
- **`sable setup --agent` offers a Claude Code Stop hook** that runs
  `sable check --stop-hook` before Claude can end a task: on failure it exits 2
  with the findings on stderr, so Claude keeps working (once; a second
  consecutive block lets it stop). Setup prints the exact `.claude/settings.json`
  entry and writes it only with `--hook`, merging into existing settings. The
  command is one plain invocation with no `cd`, `&&` or `${…}`, so it runs under
  Git Bash and PowerShell 5.1 alike; `sable check --stop-hook` locates the
  project from `CLAUDE_PROJECT_DIR` (plus `--root <dir>` for a workspace
  package, reached with the package manager's workspace flag).
- **`sable grade` judges each import against the subpath it came from.** It
  checked every `@sableui/react/*` import against the root barrel, so correct
  imports from `/blocks`, `/presets` or `/icons/reicon` read as hallucinations
  (25 in Sable's own docs app). Each subpath's surface is now read from the
  package `exports`, an unpublished subpath is reported as such, and
  `reiconIconSet` imported from the root is caught. Props and icon names are
  judged only on components imported from Sable (aliases followed), not on an
  app's own `PageHeader` or `Icon`, and not on JSX inside template-literal code
  samples. Media attributes such as `autoPlay` are accepted.
- **`sable doctor` checks icons.** An app that imports Sable with no
  `<IconProvider>` fails with the fix, since every icon would render nothing.
- **Global flags work on every command.** `sable learn --search "…" --dense`
  failed with "Unknown flag: --dense"; `--dense` and `--detail` are now taken out
  before a command hands off to its script, and `--json --dense` prints that
  script's JSON on one line. A switch no longer swallows the next word
  (`sable component --dense Button`), and a bad `--detail` value is an error on
  every command.
- **Every utility in styles.css is retrievable.** `sable utility
  motion-icon-swap` answered ERR_UNKNOWN_UTILITY: the 24 `motion-*`/`animate-*`
  recipes were only names in `tokens.motion.recipes`. They now have full entries
  (family `motion`), and `sable utility text-heading-1` resolves the paired type
  tiers. A test asks the CLI for every `@utility` and `@custom-variant`, with an
  explicit `INTERNAL_UTILITIES` list for deliberate exceptions.
- **Providers are in the catalog.** New `sable provider [Name]` and
  `registry.json → providers` cover SableThemeProvider, IconProvider,
  MotionProvider, ToastProvider, TooltipProvider, CodeHighlightProvider,
  DensityProvider and PresentationProvider: whether each is required, where it
  goes, props and examples. `sable component SableThemeProvider` answers with the
  provider, and search finds them. The build fails on an exported `*Provider`
  documented nowhere.
- **`sable docs AGENTS` serves the package's AGENTS.md** (also README,
  CONTRIBUTING, DESIGN, CHANGELOG and llms), the file llms.txt points agents to
  first. An unknown doc now lists the package and task guide names.
- **`sable lint --json`** returns `{ type: "lint", data: { violations, … } }`.
  The skill already told agents to pass `--json`; it printed text.
- **`sable preset --check` warns when a preset is newer than the installed
  Sable.** A preset authored with a later `sableVersion` used to validate
  silently. It still validates, but now prints both versions and the upgrade
  command for the project's package manager; `--json` carries it as
  `warnings: [{ code: "WARN_PRESET_NEWER_SABLE", authoredWith, installed,
  suggestion }]`. `--css` reports the same warning.
- **`sable grade --template` shows what an artifact looks like.** It now starts
  with one example screenshot and one example report artifact (they fail
  validation until replaced with real captures), and `sable docs
  reviewing-a-design` lists every artifact field with its meaning.
- **`SheetList`**: edge-to-edge rows in a Sheet (a queue, notifications, a
  picker), the Sheet equivalent of `CardList`. Entity rows line up with
  `SheetHeader` instead of sitting 12px in, with no `--entity-px` override. The
  Sheet's padding is now the `--sheet-p` variable.
- **`SidebarBrand`**: the brand row on the same grid as `SidebarItem`, with the
  mark in the icon slot and the name on the label column. It collapses to the
  mark. The dashboard and settings patterns use it.
- **GradientArt gives each seed its own variant of the palette.** The palette
  turns by up to ±20° of hue and ±0.04 lightness, so presets whose art is one
  colour family (Ember, brand-derived palettes) still tell artists and covers
  apart. The same seed still paints the same art.
- **Selected table rows paint their fill on the cells**, each overlapping the
  next by 1px, to rule out hairline seams at fractional column widths.
- **`MediaPlayerBlock`'s seek bar runs in seconds.** The readouts follow the
  drag, and the slider announces "1:24 of 3:40".
- **`static-interactive` explains display-only hovers.** When a hover only
  flips `display`, visibility or an underline, the hint points at an opacity
  swap or `motion-icon-swap` instead of `motion-interactive`.
- **ThemeSelector draws each theme as a miniature of itself.** Each tile is
  the theme's background, "Aa" in its display face, a card, and a primary
  button whose corners scale from the theme's real radii, so it shows shape as
  well as colour. Four of six themes used to come out as the same
  white-and-black strip. Names sit in the app's face, so every option is the
  same height. The selected tile takes an outline in the app's own ink, and
  list rows carry a small tile. A light preview is now pinned with `.light`, so
  a dark page no longer paints it dark. The docs' Customize panel uses this
  component instead of its own preset tiles.
- **Segmented controls follow the theme's control shape.** ThemeSwitcher and
  ToggleGroup `appearance="segmented"` take `--button-radius`, the same corners
  as Button: square in Meridian, 12px in Poppy, a capsule in Sable.
- **`sable lint` catches assemblies, not just controls.** Four new
  consumer rules (new in 0.7.0, so `sable-lint --since 0.6.2` lists them) find
  pieces built from Sable's utilities and tokens, which every token rule passes:
  `lookalike-grid` (a raw `grid` over mapped or repeated items, or an
  auto-fill `minmax()` track → `Grid`, with the `cols` map spelled out),
  `lookalike-card` (an `<a>`, `<button>` or router `<Link>` with a card's
  radius, surface and padding → `Card render={…}`), `lookalike-avatar` (a
  round fixed-size box holding an image, GradientArt or initials → `Avatar`)
  and `lookalike-media-frame` (`aspect-*` + `overflow-hidden` around media →
  `AspectBox`). Each needs a signal beyond the classes, so a form grid, a text
  link, a status dot or an empty ratio box is left alone. The docs site's own
  item grids now compose `Grid`.
- **`sable grade` and `sable check` list app-owned surfaces.** Elements with a
  card fill, a bordered padded box, a media frame or a fixed-size circle are
  listed with the component to consider (`inventory` in `--json`). The list is
  never scored and never fails a check; it is the starting point for the reuse
  inventory.
- **`MediaTile`: a cover-first tile** for albums, videos, podcasts, galleries
  and shelves. Square, `video` or `poster` cover, a title and subtitle that
  can each be links (`href` / `render={<Link />}`, `subtitleHref` /
  `subtitleRender`), an `action` over the cover's corner and a `badge` on it.
  The whole tile follows the title's link without wrapping anything in an
  `<a>`, so the artist link and the play button stay separate controls; Tab
  goes title → subtitle → action.
- **`MediaImage`: an image with a fallback.** It fills its box, rests on a
  muted surface while loading, fades the image in, and paints GradientArt
  seeded by the item when there is no `src` or it fails to load. It uses
  Base UI's image-load tracking, the same Avatar uses, so a failure before
  hydration is still caught. `MediaPlayerBlock` and `ProductCardBlock` use it
  for their artwork; add the image URL to their content constant.
- **`reveal-on-hover` utility** for row and tile actions that wait for hover.
  It hides the action only on devices that can hover, shows it on hover or
  focus within the nearest `group` (or `data-reveal-scope`) and while its menu
  is open, and fades on the motion tokens. The action stays in the tab order
  and the accessibility tree, and touch devices always show it. `sable lint`'s
  `static-interactive` rule accepts it as a recipe and now suggests it for a
  hand-written `group-hover:opacity-*` reveal.
- **`stretched-link` utility.** One link covers its whole item while the
  item's other controls stay clickable, and its focus ring goes around the
  item (`--stretched-link-radius`).
- **`SectionHeader`** heads each section below the page title: an h2 by
  default (`titleAs` for h3/h4), an optional description, and actions on the
  title row, such as a "View all" link or two small buttons. The actions drop
  beneath the title only when the row runs out of room. `size` sets the look
  apart from the level (`md` text-heading-3, `sm` text-heading-4), and the
  title always carries an id (`titleId`, or a generated one) for
  `<section aria-labelledby>`. It shares PageHeader's title row and has no outer
  spacing, so the section's gap sets the rhythm. PageHeader's docs now point a
  second heading to it.
- **Avatar `xl` (96px) and `2xl` (160px)** for portraits: profile headers,
  artist heroes and roster tiles. The initials move to `text-heading-2` /
  `text-display-lg`, about a third of the circle as at row sizes. A `status`
  indicator and its cut-out ring scale with the portrait, and the photo fades
  in over the resting surface. AvatarGroup stays at `sm`–`lg`.
- **Breaking: `Grid minItemWidth` keeps empty columns (`auto-fill`).** With one
  or two items, `auto-fit` collapsed the empty tracks and stretched each item
  across the row, so a single search result rendered as a full-width cover.
  New `track` prop: `"fill"` (default) keeps items at their size whatever their
  count; `"fit"` restores the old stretch for a fixed set designed to span the
  row. **Migrate:** add `track="fit"` to a grid of a known, fixed number of
  cards that should share the row (a KPI row, plan tiers).
- **New `DisclosurePicker`:** a property row that names the current value and
  opens its list in place, beneath the row, instead of in a popup, for a tool
  panel where the choice is made while looking at what it changes. Parts:
  `DisclosurePickerTrigger` (optional `label` caption and `media`, the value,
  a chevron that flips), `DisclosurePickerPanel`, `DisclosurePickerList` (a
  listbox: arrows move, Enter/Space/click pick and close),
  `DisclosurePickerOption` (optional `media` and `note`) and
  `DisclosurePickerEmpty`, plus `useDisclosurePicker()` for a list it does not
  own, such as a Tree.
  Search is opt-in (`search` on the panel), for lists past about a dozen
  options. Keyboard opens move focus to the search field or the chosen option;
  Escape and picks return it to the row. `size="xs"` sits on the
  property-grid rung.
- **New `FontPicker`,** built on DisclosurePicker: the row names the family in
  its own face, and the list draws each family in itself. Fonts and loading
  come from the app (`fonts`, `loadFont(font, "preview" | "use")`); Sable
  bundles no catalog. Search is on by default; pass `searchable={false}` for a
  short list.
- **Button `bleed` — optical alignment for borderless buttons.** A ghost or
  link button carries padding you can't see, so at the start or end of a row
  its label sat ~12px inside the edge the row shares. `bleed="start" | "end" |
  "both"` pulls the box out by exactly its own padding (the size's new
  `--button-px`, which the padding now reads; the icon side's optical padding
  when an icon sits there; an icon-only size's inset to its glyph), so the
  label lands on the edge while the hit area and hover fill keep their full
  size. Logical sides, so RTL mirrors. A no-op on variants with a visible edge
  (primary, secondary, outline, destructive, floating, field, on-color,
  on-color-outline). SectionHeader and PageHeader actions, PageHeader's back
  control and CardAction now align their outermost ghost/link Button
  automatically (it renders `data-bleed="auto"`; `bleed="none"` opts out);
  when a header's actions wrap beneath the title, the first one aligns to the
  start edge. Applied in the dashboard, feed and list-detail patterns and the
  task-list and verify-code blocks (the feed's hand-set `-ms-3` is gone).
  **Migrate:** replace `-ms-3` / `-me-3` nudges on ghost buttons with `bleed`;
  to retune a button's padding set `[--button-px:…]` rather than `px-*`.
- **`DisclosurePicker` commits on Enter, not on every arrow key.** Its list
  was a radio group, whose checked state follows focus, so each arrow press
  called `onValueChange`: in the docs Customize panel the first ArrowDown on
  the preset row switched presets (or opened "discard changes?"), and on a font
  row loaded every family passed. The list is now a `role="listbox"` of
  `role="option"` rows: ArrowUp/ArrowDown, Home/End and type-ahead move focus
  (roving tabindex) and apply nothing; Enter, Space or a click picks, applies
  and closes; Escape closes with the value untouched. `aria-selected` marks the
  committed value. `onValueChange` fires once per pick, and not when the pick
  is the current value. ArrowUp from the first option returns to the search
  field. New on `DisclosurePickerOption`: `media` (a leading tile),
  `disabled`, `textValue` (what type-ahead matches). Changed from the
  unreleased radio version: the list takes div props instead of RadioGroup
  props, options are no longer
  `role="radio"`, and `DisclosurePickerEmpty` belongs in place of the list,
  not inside it. **FontPicker** inherits it: arrows walk the families, Enter
  picks and loads one. ThemeSelector's `layout="list"` stays a radio group
  (instant switching is standard there); its guidance now says to use a
  DisclosurePicker list with `ThemePreview` media when a switch has a cost.

## 0.6.2

- **`llms.txt` names the default theme correctly.** Its summary still called
  the default theme Base, which was renamed Sable in 0.4.0; the first line an
  agent reads now says Sable.
- **sableui.com is readable without JavaScript.** Every docs page now carries
  its content as plain HTML in the page itself, so an agent fetching a URL such
  as /getting-started gets the install steps rather than only the title (the
  app replaces that copy when it boots). Every page is also available as
  markdown at its own URL plus `.md`, for example /getting-started.md, and
  each page opens with links to that, /llms.txt and /llms-full.txt.

## 0.6.1

- **`sable lint` catches a status fill retuned without its text.** Since 0.6,
  `text-destructive`, `border-destructive`, `ring-destructive` and the rest read
  `--destructive-text`; only `bg-destructive` reads the fill. An app that set
  `--destructive` (or `--success`, `--tone-warning`, `--tone-info`) and stopped
  there painted its buttons in its own red and its error text, borders and rings
  in the theme's, and nothing said so. The new consumer rule `status-text-drift`
  reads the app's stylesheets for a status fill set without its `-text` in the
  same theme and mode, and names the mode that is missing. It needs only the
  stylesheet, so it reports even where `label-contrast` cannot measure. `sable
  grade` runs it too.

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

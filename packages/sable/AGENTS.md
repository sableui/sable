# AGENTS.md — @sableui/react

How to **build with** Sable. This is the whole consumer contract an agent needs; read it top to bottom once, then retrieve details through the CLI. Changing the package itself? Read [`CONTRIBUTING.md`](./CONTRIBUTING.md). Why the system is shaped this way: [`DESIGN.md`](./DESIGN.md).

## What this is

**Sable** is an owned, themeable React component system: components, layout primitives, page shells and blocks (`sable manifest` has the live counts), on [Base UI](https://base-ui.com) behavior with Tailwind v4 + semantic CSS-variable tokens. The default theme is **Sable**; the other featured presets are Meridian, Prism, Verdant, Ember, and Poppy.

In this file, `sable` means the CLI installed with the package, run through the project's package manager: `pnpm exec sable`, `npm exec sable` or `yarn sable`. Never run a bare `npx sable` before the package is installed: that fetches an unrelated package.

**Where things are**

| You need | Ask |
|---|---|
| Which component, and its props/examples | `sable search "<need>"` → `sable component <Name> --detail full` |
| A page composition to start from | `sable pattern --list` → `sable pattern <Name> --skeleton` |
| A card, form or list to start from (a block) | `sable block --list` → `sable block <Name> --code` |
| The rules for type, motion, spacing, shape, surfaces, a11y | `sable docs typography` (also `motion`, `spacing`, `shape`, `surfaces`, `accessibility`) |
| Which token to reach for | `sable token <name>` · `sable docs token-intent` |
| A task walkthrough | `sable docs --list --kind tasks` |
| Is my wiring right? Is my code on-contract? | `sable doctor` · `sable lint` |

## The rules for code you write

For an explicit iOS/iPhone app prototype, read `sable docs building-an-ios-prototype`
first. **Sable first: every screen is built from Sable components** — rows, inputs,
switches, sliders, search, buttons, forms, toasts, cards — exactly as on the web,
and every rule below applies. `@sableui/react/ios` supplies only the iOS system
chrome Sable has no equivalent for: `NativeApp`, `IosPage`, `IosNavbar`,
`IosBackLink`, `IosIconButton`, `IosTabbar`, `IosTab`, `IosSheet`,
`NavigationStack`. Never import from `konsta` (sable-lint `native-ui-import`);
install it only as the adapter's peer for an iOS prototype. A missing piece is a
library gap to report, not a reason for a native control.

These are short on purpose. Each links to a foundations doc with the full vocabulary, the reasoning, and before/after examples; `sable-lint` catches most violations.

0. **Compose from Sable components; never rebuild one.** Before writing any interactive or recognisable element — a button, a field, a toggle, tabs, a menu, a badge, a card, a search field, a dialog — run `sable search "<what you need>"` and use what it returns. If nothing fits, compose from the nearest component's parts; if it genuinely does not exist, say so in your summary: that is a library gap to report, not a license to invent.

   - This binds behaviour and parts, not layouts. Results marked ◇ (patterns, blocks, compositions such as MediaTile) are references: use one when its layout fits the brief, and otherwise compose your own from Sable's parts. A storefront's search panel can look like nothing in the catalog, as long as its field, list keyboard model and rows are Sable's.
   - A raw `<button>`, `<input>` or `<div>` dressed in a component's classes is a reinvention and a bug, even when every class is a semantic token: it misses the component's states, density, focus and keyboard contract, and drifts the moment the component changes. A link that looks like a button is `<Button render={<a href=… />}>`.
   - The rules below style what you compose *around* components; they are not for re-creating them.

   `sable lint` flags the common reinventions:

   | Hand-built | Use instead | Rule |
   |---|---|---|
   | a `<button>` or `<input>` styled as a control | the Sable control | `hand-rolled-control`, `lookalike-control` |
   | a raw `grid` of mapped items | `<Grid cols minItemWidth>` | `lookalike-grid` |
   | a link or button with a card's radius, surface and padding | `<Card render={<Link … />}>` | `lookalike-card` |
   | a round fixed-size box holding a picture, GradientArt or initials | `<Avatar>` | `lookalike-avatar` |
   | an `aspect-*` + `overflow-hidden` frame around media | `<AspectBox ratio>` | `lookalike-media-frame` |

   `sable check` also lists every app-owned surface (a card fill, a bordered padded box, a media frame, a fixed-size circle) for your reuse inventory: each one composes the component named beside it, or the inventory says why the app owns it.

   **The same goes for everything below a component. Resolve in this order, and stop at the first that fits:** (1) a **component** → (2) a Sable **utility or recipe** — relative surfaces (`sable-surface*`, `sable-well`, `sable-surface-interactive`), state variants (`sable-selected:`, `sable-highlighted:`…), geometry (`rounded-concentric-*`, `popup-inset`, `rounded-popup-item`, `popup-bleed`), scroll policies, `motion-*` recipes → (3) a **semantic token** → (4) hand-written CSS, last, and reported as a gap. `sable search "<what you need>"` searches all of these; `registry.json → utilities` lists the utilities with intent and what each replaces. Mixing ink into a surface by hand (`color-mix(… var(--foreground) …)`) is the tell that you skipped step 2 — that is what the relative-surface utilities compute, in every theme and mode.

   **Never restyle a component with override classes to get a look it lacks.** `className` on a Sable component is for layout (width, margin, flex and grid placement, position); its look — fill, edge, corner, ring, shadow, ink — comes from a variant. Use the one that exists, and if none fits, that is a library gap to report, not a `className`. The common cases: a control floating over content is `<Button variant="floating">`, one on a coloured band `variant="on-color"`; a quiet chip is `<Pill appearance="outline" size="sm">`; a status label is `<Badge appearance="plain" tone="…" dot>`; a destructive menu row is `<MenuItem variant="destructive">` (never `className="text-destructive"`); a list of `Entity` rows in a card is `<CardList>`, and a table that runs edge to edge in a card is `<CardContent flush>`, which insets the outer columns to the card's padding (never `pl-6`/`pr-6` on cells). `sable-lint` flags these (`component-restyle`, `destructive-item-ink`, `table-edge-padding`, `popup-separator-bleed`). A component that is *broken*, not just missing a look, is patched in place with `sable patch <Component> --reason … --repro …` while the fix ships: the record is re-checked on every upgrade (`sable docs patching-a-component`).
1. **Semantic tokens only.** `bg-card`, `text-muted-foreground`, `border-border`, `bg-primary` — never a theme's own palette step (`--zinc-500`), never inline hex/`oklch()`. For decorative or categorical colour beyond the tones (tags, avatars, labels, illustration), use the generated palette: `neutral`, `red`, `orange`, `yellow`, `green`, `teal`, `blue`, `purple` and `pink`, plus a scale under every tone (`bg-tone-1-100`). It is built from the active theme and follows the mode, so `bg-blue-100 text-blue-800` reads in light and dark with no `dark:`. On Badge, Pill and StatusDot the family is the tone (`<Badge tone="teal">Research</Badge>`), never a `className` recolour. Surfaces, text and actions still take roles. → `sable token palette`. Tone fills take their paired ink (`bg-tone-warning` + `text-tone-warning-foreground`); positive states use the flat `bg-success` + `text-success-foreground` pair, and there is no `tone-success`. → `sable docs token-intent`
2. **Type is a closed vocabulary.** One paired utility per text node (`text-heading-2`, `text-body-md`, `text-label-lg`, `text-mono-md`); never compose `text-* font-* tracking-*` by hand. Pick by **role**, not size. One `heading-1` per route. Two colors: `foreground` and `muted-foreground` — never opacity on text. → `sable docs typography`
3. **Space on the scale, by role.** Two units: Tailwind steps are 4px (use even steps, `gap-2` and up, between blocks), and a layout primitive's `gap` prop counts 8px rhythm units (`<Stack gap={1}>` is 8px). Inset, stack, inline; related things closer than unrelated things. No off-scale `p-[15px]`. Padding, gaps and insets stay on the scale (a step, or `--spacing(n)` inside an arbitrary value) so the density control moves them; fixed `rem`/`px` only for what must not scale, like a hairline. Single-column content in a card is a flex column, not a grid. → `sable docs spacing`
4. **Controls read the ladder.** Heights come from `--control-*`, so `<Density>` can retune a region at once. Never `h-[40px]`. → `sable docs spacing`
5. **Shape and depth are roles.** Radii from the `rounded-*` ladder, concentric when nested (inner = outer − inset; `rounded-concentric-*`, `sable-frame-inner`); elevation by transience (resting → raised → overlay → modal → toast), one shadow per surface. → `sable docs shape` · `sable docs surfaces`
6. **Motion has a reason and a recipe.** Apply a named `motion-*` recipe; drop to `duration-(--motion-duration-*)` + `ease-*` tokens only when none fits. Never Tailwind's `animate-*`, never a raw `duration-150`. Exits are faster than entrances and never overshoot. Components ship their craft (gliding indicators, rolling numbers, drawn ticks) on by default; to calm a dense view use `motion="subtle"` on the component or `<MotionScope level="subtle">` around a region, never a CSS override. → `sable docs motion`
7. **Icons by semantic name.** `<Icon name="check" />`; size with `text-{size}`, never type utilities. A mark attached to a line of type (dot, bullet, leading icon) sits in an `h-[1lh] items-center` box and is sized in em, never nudged with px. → `sable docs typography`
8. **Every scroll container declares a policy:** `scrollbar-quiet` (vertical) or `scrollbar-hidden` (horizontal, with an edge fade carrying the affordance).
9. **Accessible by construction.** WCAG AA contrast (and a label on a brand or status fill also clears APCA Lc 60 — `label-contrast`), 44px hit areas, visible focus, logical properties, live regions that exist before they speak. → `sable docs accessibility`

## Customizing: themes are presets

Pick a theme as a starting point, then override tokens on top of it. Every token a theme sets can be reset by the app on `:root` (or any subtree) after the theme CSS loads — radius, density, type scale, motion scale, accent — and components follow, because they only read tokens. The docs site's **Customize** panel does exactly this live and exports the result as CSS; paste it after your Sable imports. Retrieve the overridable set with `sable token --list`. When you retune a filled role (`--primary`, `--sidebar-primary`, `--highlight`, `--destructive`, `--success`, `--tone-warning`, `--tone-info`), check the label on it: `sable lint` measures the pair against the installed theme and suggests one that reads. If the pair is a deliberate brand choice, keep it with `/* design-lint-disable-next-line label-contrast -- <reason> */`. Status colours have a second token for the colour drawn on a surface — `--destructive-text`, `--success-text`, `--tone-warning-text`, `--tone-info-text` — which `text-`, `border-` and `ring-<status>` read; only `bg-<status>` reads the fill. Retune both.

When a component doesn't do something you need — be a link, carry a control, take a key, offer @mentions or /commands — read `sable docs extending-a-component` before restyling or copying it: `render`, slots, controlled state and refs, `useCaretTrigger` + `CaretMenu`, and how to tell a library gap from app-owned work.

## Wire it up

The machine-readable version of this section is the `consume` block in `registry.json`.

**Start with `sable init`.** After `pnpm add @sableui/react`, run `pnpm exec sable init --dry-run` from the app root to preview every change, then `pnpm exec sable init`. It installs whatever is missing (React, React DOM, Tailwind and Tailwind's build plugin) with the project's package manager, writes the CSS imports in order into the global stylesheet, and installs the agent skill (in a terminal it also offers the Claude Code Stop hook), then runs `sable doctor`. On Vite it also adds the Tailwind plugin and React dedupe to the Vite config, adds the font links to `index.html`, and wraps a starter's `<App />` in `IconProvider`. On Next.js it writes a `postcss.config.mjs` when there is none, and prints a `"use client"` providers file and the font tags for you to paste (`sable docs nextjs`). It does not add antialiasing, alternate theme CSS, or the optional providers. Whatever it cannot change safely it prints as a snippet with the file it belongs in; apply those, then run `sable doctor` again. In an app that is already wired, `sable doctor --fix` applies the same fixes to whatever doctor flags.

The numbered steps are the manual route and what `init` and `doctor` check against. Each one says what `init` does for it.

1. **Install** from npm: `pnpm add @sableui/react` (or the project's package manager). No registry configuration or token is needed. By hand, also install Tailwind and its build plugin: `pnpm add -D tailwindcss @tailwindcss/vite` for Vite, or `pnpm add -D tailwindcss @tailwindcss/postcss` for Next.js. *init installs whichever of these is missing.* Sable depends on no router, data or form library, and keeps whatever the project already uses: links, menus and nav items take any router's link through `render` (`render={<Link to="/inbox" />}` is TanStack Router's or React Router's `Link` alike). For a blank-slate app, the suggested stack is Vite + TypeScript with TanStack Router, TanStack Query, TanStack Form for forms with validation logic, and TanStack Table once a table outgrows `DataTable` (`sable docs tables-with-tanstack`).
2. **Dedupe React** in the bundler (`resolve.dedupe: ["react","react-dom"]`) — Base UI must not resolve a second React, or you get an "invalid hook call" blank page. *init adds it to a Vite config. Next.js resolves its own copy of React and needs none.*
3. **CSS, in order:** `@import "tailwindcss";` → `@import "@sableui/react/styles.css";` → `@source "<path from this stylesheet to node_modules>/@sableui/react/dist/**/*.{js,mjs}";` so Tailwind scans the package's classes (`../node_modules/…` from `src/index.css` or `app/globals.css` when `node_modules` is at the project root). *init writes all three and computes the path.* That `@source` ships every component's classes (about 49 KB minified and gzipped); before shipping, `sable sources --write src/sable-sources.css` lists just the modules the app imports, imported in place of that `@source`, and `sable check` fails when it goes stale.

   `styles.css` carries **Sable only**: the default theme, and the layout floor every other theme inherits (`--page-inset`, `--region-*`, `--rhythm-unit` on a bare `:root`). The bundled **alternates are opt-in** and scoped to `[data-sable-theme]`. Using one? `@import "@sableui/react/theme/prism.css";`. Offering the whole set through a `<ThemeSelector>`? `@import "@sableui/react/themes.css";`. *init imports neither.* **Symptom of forgetting:** `data-sable-theme` is set, nothing matches, and the page silently renders as the Sable theme — no error, just the wrong theme. `sable docs color-mode` has the full colour-mode and theme setup.
4. **Fonts:** load Figtree (sans) + DM Mono (mono); the theme declares the stacks, the host provides the files. *init adds the Google Fonts links to a Vite `index.html` and prints them for a Next.js root layout.* Apply `antialiased` (`-webkit-font-smoothing: antialiased` / `-moz-osx-font-smoothing: grayscale`) **once on the app root**: without it macOS renders every weight heavier than designed. *init does not add it*; the package deliberately leaves the host's page alone.
5. **Providers:** *init wraps a Vite starter's `<App />` in `IconProvider` and prints a providers file for Next.js; the optional providers are yours to add.* `<IconProvider>` is **required** — wrap the app once in `<IconProvider set={reiconIconSet}>` with `import { reiconIconSet } from "@sableui/react/icons/reicon"` (without it every `<Icon>` renders nothing; development builds warn once). Pass another icon package's set instead to replace Reicon, or extend it using `composeIconSets(appExtras, reiconIconSet)` (list the added names in `.sable/icons.json` as `{ "names": [...] }` so `sable grade` accepts them); `<MotionProvider>` is optional too (`policy="subtle"` keeps feedback and drops flourishes app-wide). Use `<SableThemeProvider>` + `useSableTheme()` when the app should expose user-selectable themes; pair `themeId` / `setThemeId` with `<ThemeSelector>` and `preference` / `setPreference` with `<ThemeSwitcher>`. The provider stores `light` / `dark` / `system`, toggles the `dark` class on `<html>`, stores the active design theme, and writes `data-sable-theme` for non-default themes. Apps with their own state layer can call `applySableColorMode()` / `applySableTheme()` instead. You only need a Tailwind `@custom-variant dark` if **your** app code uses `dark:` utilities (Sable ships none).
6. Import from the root barrel: `import { Button } from "@sableui/react"`. Page shells live on the `patterns` subpath (`import { SettingsPage } from "@sableui/react/patterns"`) — preview one, then copy its source from `registry.json → patterns` when the route needs to diverge. Blocks — section-sized compositions such as a sign-in card or a pricing card — live on the `blocks` subpath (`import { SignInBlock } from "@sableui/react/blocks"`) and ship the same way (`registry.json → blocks`); copy one and edit its content constants. A block's props are `className`, `framed` (card blocks) and one callback per outcome it produces, named for the verb the person performed (`onSend`, `onReserve({ date, guests })`; `onApprove` / `onDeny` rather than one callback with a flag; `on<State>Change(next)` for a two-state control; `on<Item>Action(id, action)` for a row). Content is never a prop: it is the constant at the top of the file, edited after copying. The one exception is media the block exists to work on (PhotoAdjustBlock's `image`).

7. **Check the wiring:** `sable doctor`. *init runs it last.* Every check it runs corresponds to a way Sable fails *silently* — a second React (blank page, "invalid hook call"), a missing `@source` (Tailwind emits none of the package's classes, everything renders unstyled), no `IconProvider` (every icon renders nothing), or `data-sable-theme` set with no theme CSS imported (every theme renders as the Sable theme and the switcher looks broken). Exits 1 on any failure; `--json` for the structured report. `sable docs troubleshooting` maps each symptom to its fix.

8. **Read the catalog through the CLI, not the file.** `registry.json` and `llms-full.txt` each run to well over a megabyte: complete, and too large for a working context. `sable` serves the same generated contract in pieces, offline, at your installed version:

   ```bash
   pnpm exec sable pattern --list                      # the canonical page shells
   pnpm exec sable pattern SettingsPage --skeleton     # composition tree, fixtures stripped
   pnpm exec sable block --list                        # section-sized blocks: cards, forms, lists
   pnpm exec sable component DataTable --props
   pnpm exec sable search "empty state"                # across components, examples, patterns, blocks, layout, tokens, docs
   pnpm exec sable component Form --example "Server errors"   # one example a search hit names, imports included
   pnpm exec sable docs converting-an-app              # the task walkthroughs
   pnpm exec sable manifest --json                     # the whole command surface, machine-readable
   ```

   `--json` wraps output as `{ type, data }` with a stable discriminator; `--detail brief|compact|full` picks a size; `--dense` drops prose. Errors carry a stable `code` and `suggestions` (`ERR_UNKNOWN_COMPONENT` for `Buton` suggests `Button`), so a wrong name costs one call, not a guess.

   **Choose composition before components.** `--skeleton` prints a pattern's element tree with demo data removed, making comparison cheap. Reuse a shell when its information architecture fits. Compose an original surface from layout primitives when the brief needs a different structure; a shell resemblance score is not a quality score.

9. **Audit the app against the contract:** `sable lint` (lints `./src`; `--rules` lists the rules, `--ignore <glob>` skips paths; the same linter ships as the `sable-lint` binary). It reads the token vocabulary from the **installed** package's `registry.json`, so upgrading Sable moves the linter with it. Exits 1 on any violation — put it in the build script. Scope: a lexical pass over class strings, catching the drift Tailwind silently no-ops and `tsc` cannot see. It is not a type checker, and it does **not** know whether your code still matches a pattern you copied.

10. **Build with a brief and a learning loop.** `sable docs designing-a-surface` covers purpose, story, visual direction, interaction, and adaptation. `sable learn --search "editorial hierarchy"` retrieves conditional precedents from the installed package and project-owned `.sable/lessons/`. `sable grade --template` supplies an evidence review record; `sable docs reviewing-a-design` explains the rendered checks. Record a useful discovery with `sable learn --template` and `--record <file.json>`. Local records survive package upgrades and remain provisional observations. Neither source conformance nor a complete evidence record independently proves taste.

For a substantial new visual direction, read `sable docs developing-taste`. If the project keeps a
visual atlas (`.sable/atlas/`), use `sable atlas --search "<context>" --contrast
--limit 3 --json`, then `--show <id>`, and actually view the returned capture paths. When meaningful alternatives need comparison, use bounded rendered
directions with `sable explore`. Keep the factual brief and primary flow fixed.
Retrieve `sable prefer --search "<decision>" --scope project:<id> --json` only in
the applicable context. Record an actual user's judgment as human; agent choices
remain agent observations. These tools improve context and process, not model
weights, and no structural validator can certify taste.

Full walkthrough: the package `README.md`.

## Copy

Sable ships a lot of canonical copy — pattern fixtures, meta examples, docs samples — and agents copy it verbatim into real products. That makes interface copy part of the contract, not decoration. These rules apply to every user-facing string the package ships.

- **Sentence case everywhere** — buttons, headings, labels, menu items. Not title case. It is calmer, has no per-word case rules to get wrong, and localizes cleanly. "Save Changes" sitting beside "Discard changes" reads as sloppiness, and mixed casing is how that happens.
- **Buttons name the verb, not the answer.** "Delete this project?" offers `Delete project` and `Cancel` — never `Yes`/`No`. A confirmation repeats the consequence so the button still makes sense to someone who skipped the sentence. (`DestructiveActionModal` already defaults this way; it is the pattern, not an exception.)
- **Toggles describe the ON state.** "Send read receipts", never "Don't send read receipts" — a negated label plus an off switch is a double negative the reader has to solve.
- **Links name their destination.** Never "Click here". Never five bare "Learn more" links on one page: suffix each — "Learn more about exports". This is also an accessibility rule, because screen readers can list links out of context.
- **Errors say how to fix it, next to what broke.** "Use only letters for your name", not "Invalid name". "Unable to save. Check your connection and try again.", not "Oops! Something went wrong." No blame, no "oops", no exclamation marks, and phrase the hint as the thing to do rather than the thing that failed.
- **Never concatenate fragments around a variable.** `"You have " + n + " messages"` cannot be translated — word order and pluralization differ per language. Ship one templated string per plural form.
- **One vocabulary per flow.** Pick "Continue" or "Next" and use it for every step; two words for one action reads as two different actions.
- **Tone flexes with stakes.** Warm for success and onboarding; neutral for routine work; calm, plain and entirely unplayful for errors and destructive confirmations; serious for anything touching data loss, billing, or security. A joke in a delete dialog is a bug.

## Conventions

- **`cn()`** is the single class merger; it knows the paired typography group, so `cn("text-heading-1", "text-body-md")` dedupes correctly.
- **Designed dark-first, rendered light until told otherwise.** Build and review dark first; light is the counterpart. The page renders light until `.dark` is on `<html>`: for a dark default, set `class="dark"` on `<html>` or use `<SableThemeProvider defaultPreference="dark">` (its own default is `system`). Ship both modes unless the brief rules one out.
- **Accessibility floor:** WCAG AA. Base UI provides behavior; don't strip its ARIA/roles.
- **Never** introduce a new external font or a hard icon dep. Never write `oklch()`/hex inline.
- **Logical properties for direction-dependent position.** `ms-*`/`me-*`/`ps-*`/`pe-*`/`text-start`/`inset-inline-*`, not `ml-*`/`pr-*`/`text-left`/`left-*`. Flex and grid mirror for free under `dir="rtl"`; hand-positioned elements do not. Reserve physical properties for genuinely physical geometry — `SafeArea`'s notch edges are physical and stay that way. `sable-lint` flags it. **Sable does not support RTL yet**: layout mirrors, but directional icons (chevrons, arrows) do not flip and Carousel's arrow keys stay physical, so don't ship an RTL locale on it without checking those by hand.
- **Text containers size to the text, not to English.** No fixed width sized to an English label and no fixed height on a text container — `max-width` plus wrapping, and `min-height` as a floor. Buttons take their width from `padding-inline`, never a hardcoded `w-[…]`. German and Finnish routinely run 30–50% longer than English, and a translated string that doesn't fit is a layout bug shipped to everyone but the language it was designed in.
- **A decorative layer over interactive content takes `pointer-events-none` and `aria-hidden`.** Scrims, glows, gradient films and edge fades paint over live controls; without it the control looks live and does nothing, which is invisible in review and obvious to a user. A scrim the user *clicks to dismiss* is a control, not decoration, and keeps its events.
- **Text inputs never render below 16px on mobile.** iOS Safari zooms the page on focus under that threshold, which yanks the viewport mid-form. The field components handle this themselves; a consumer building a custom field must too.
- **Prefer the CSS property over the raw font axis tag.** `font-weight`, `font-variant-numeric: tabular-nums`, `font-variant-numeric: slashed-zero` — never `font-variation-settings: "wght"` or `font-feature-settings: "tnum"`. Raw tags silently do nothing on a fallback font, and every Sable theme declares a fallback stack.
- **Pair `text-wrap` to the job.** `balance` for headings (short, few lines), `pretty` for ledes and descriptions (kills the orphan), neither for long-form prose — browsers stop balancing past a few lines anyway. `text-body-lg` carries `pretty` already.

### The form submit contract

Base UI wires `aria-invalid`/`aria-describedby` when you use `Field`; the behavior around it is ours and is easy to get wrong:

- Keep submit **enabled** until the request actually starts. A disabled submit button hides *why* it's disabled; validate on submit and say what's wrong instead.
- On submit failure, move focus to the first invalid field. A user who can't see the page has no other way to find it.
- While the request is in flight, disable and show the spinner but **keep the label** — a button that becomes a bare spinner loses what it was doing.
- Never block paste, on any field. Blocking paste on a password or code field breaks password managers and helps nobody.
- Get the keyboard right: `autocomplete="one-time-code"` for OTP, `new-password` vs `current-password` (never both as `password`), `type="text" inputmode="numeric"` for codes and card numbers (never `type="number"`, whose spinners and scroll-to-change are wrong for an identifier), and `spellcheck="false"` on emails and codes.

### Announcing and focusing

- **A live region must exist before it has anything to say.** Render `role="status"` empty from the start and swap its text; a polite region inserted *together with* its content is announced inconsistently or not at all. In order of preference: move focus > `aria-describedby` on the control > `role="status"` > `role="alert"` (which interrupts, so reserve it).
- **Client-side navigation is a11y-invisible unless you make it visible.** On route change, update `document.title` most-specific-first, move focus to the new view's `h1[tabindex="-1"]` (or `#main-content`), and restore scroll on back/forward. Base UI can't own this and `AppShell` only supplies the skip link and landmark — the app has to do the rest.
- **Verify focus rings and disabled states under `forced-colors: active`.** Windows High Contrast overrides `ring-ring` and erases opacity-based disabled styling, which is exactly how Sable expresses both. Never reach for `forced-color-adjust: none` to "fix" it.

## The Sable agent skill

This section is the one full description of agent setup; the README, the
getting-started guide and sableui.com link here.

`sable init` installs the skill. In an app wired by hand, run
`pnpm exec sable setup --agent` (`--dry-run` previews) in the target project. It
installs discoverable entry files in `.agents/skills/sable` for Codex/Cursor and
`.claude/skills/sable` for Claude Code; `--target` selects a host.
In a monorepo where Sable belongs to one workspace package, run setup in that
package with `--root` naming the repository root (for example
`pnpm --filter web exec sable setup --agent --root ../..`); the entries go
there and resolve Sable through the package.
Setup also adds a short managed block to the project's `AGENTS.md` and
`CLAUDE.md`, the instructions an agent reads on every task, so a UI request
goes through the skill even when it doesn't mention Sable. Only the text between
its `<!-- sable:begin -->` and `<!-- sable:end -->` markers is Sable's;
`--no-instructions` skips it. `--hook` adds a Claude Code Stop hook that runs
`sable check` before a task can end; `sable init` offers it when run in a terminal.
Each entry resolves `skills/sable/SKILL.md` from the installed package, so package
upgrades also update the workflow. Other agents can read that file directly.
Use `$sable build <idea>`, `inspire <references>`, `audit <target>`,
`polish <target>`, or `fix <target>` in Codex; use `/sable` with the same modes in
Claude Code or Cursor. `create` is a build alias. `fix` takes the short path for
one scoped defect and escalates to `polish` when the change grows. These are agent modes, not shell commands.

Upgrade with `pnpm exec sable upgrade`: it updates the package, then runs the
new version's `init`, which refreshes the skill entries and the instructions
block and checks the wiring. From 0.17 or earlier, which has no `upgrade`, run
`pnpm update @sableui/react --latest` and then `pnpm exec sable init` once. If
you updated the package some other way and skipped `init`,
`pnpm exec sable setup --agent --update` refreshes the entries and the block.
Setup only replaces managed files that have not been locally edited; `--dry-run` checks without writing. Keep
project preferences in project instructions. Package installation alone does not
change agent settings. See [building-with-sable.md](./llms/tasks/building-with-sable.md),
[creating-a-preset.md](./llms/tasks/creating-a-preset.md), and
[using-presets.md](./llms/tasks/using-presets.md).

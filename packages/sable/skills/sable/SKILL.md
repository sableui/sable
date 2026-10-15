---
name: sable
description: Build original websites and apps with Sable, turn inspiration into reusable presets, audit existing interfaces, polish a selected design, and fix a scoped defect on a short path. Use for Sable design and UI work, not unrelated backend tasks.
---

# Sable

Build the user's idea with the installed Sable library. The product brief determines
content, structure, and behavior; a preset supplies theme values and design guidance.
References inform an original direction. A reference or preset is optional.

## Fix: the short path

A `fix` is a scoped change to UI that already uses Sable: a wrong prop or variant,
a lint or doctor finding, a broken state, one control swapped for the right one.
It needs this section and the CLI from "Resolve and set up the installed library";
skip the manifest, the design guides, and the finish checklist below.

1. Read only what the change touches: `sable component <Name> --props`, the
   example you need (`sable search "<need>"` finds it), `sable token <group>` or
   `sable utility <name>` for a styling question, and `sable docs <foundation>`
   only when the fix is about type, spacing, motion, or accessibility.
2. Change the smallest amount of code that fixes it. A defect inside a Sable
   component is patched, not restyled (see the end of this file).
3. Run `sable check <changed paths>` and the project's own build and type checks,
   then look at the affected state rendered, in every colour mode the app ships.

Escalate to `polish` and its finish checklist when the change moves layout or
hierarchy, touches a signature surface, spans more than one screen or flow, or
the check turns up more than the fix. Say that you escalated, and why.

## Finish checklist — before you call any build or polish done

1. Run `sable check <source paths>` (default `src`). It runs `sable doctor`,
   `sable lint`, and `sable grade` and exits 1 if any fails. Repair the findings
   instead of suppressing them, then run it again until it passes. Act on its
   notes too: they don't fail the check but name real work, such as trimming the
   CSS to the components the app imports (`sable sources`). Also run the
   project's own build and type checks.
2. Review the rendered design: `sable docs reviewing-a-design`. Capture desktop and
   mobile in every promised colour mode, and judge brief fit, composition,
   hierarchy, rhythm, and imagery.
3. Walk the journey: `sable docs reviewing-a-journey`. Operate the primary task and
   its recovery path with keyboard and touch through loading, empty, error, and
   success states.
4. Review the motion: `sable docs reviewing-motion`. Observe playback and
   interruption for anything that moves.
5. Check reduced motion: with `prefers-reduced-motion` (or MotionProvider
   `"reduced"`), state still changes and nothing keeps moving.
6. Write the reuse inventory: the Sable components, parts, utilities, and token
   groups used, and every app-owned UI or CSS addition with the catalog search
   that justified it. Start from the app-owned surfaces `sable check` lists,
   which are notes, not failures: for each, write one line saying you used the
   Sable part named beside it or kept your own, and why ("composed our own
   product tile from AspectBox + Badge: the brief wants the price over the
   photo"). Keeping your own layout is fine. Behaviour still comes from Sable.
7. Record what you learned: `sable docs learning-from-builds`. Keep conditional
   lessons with evidence; never fabricate human approval or preference records.

Steps 2–7 are what no tool can verify; `sable check` prints them after its
results, plus any step its notes call for. A passing check is a contract result, not design approval.

## Route the request

These are agent skill modes, not shell commands. Use `$sable` in Codex and
`/sable` in Claude Code or Cursor; natural requests work in compatible agents.

| Mode | Outcome |
| --- | --- |
| `build <idea> [using <preset or path>]` | Develop the brief, implement the requested product with Sable, inspect and operate it, repair observed issues, and deliver the working result. |
| `inspire <references or description>` | Study the inspiration, develop a direction, and save a previewable, editable preset. Stop before a full product build. |
| `audit <existing interface>` | Inspect existing work and report prioritized design, behavior, accessibility, and Sable-contract findings. Apply repairs only when requested. |
| `polish <target or instruction>` | Improve the current product or preset while preserving its selected direction, then verify affected states. |
| `fix <target or finding>` | Repair one scoped defect in existing Sable UI on the short path at the top of this file, escalating to `polish` when it grows. |

`create` is an alias for `build`. A bare new-product brief means `build`; an editing
follow-up means `polish`, unless it names one defect, which is a `fix`. A request for direction only stops before implementation.
“Show alternatives” produces bounded rendered studies and stops at comparison when
the user reserves the choice. Explore only when requested or when competing choices
materially affect the brief; do not require three designs for every build.

An explicit iOS/iPhone **app prototype** request selects the optional iOS target.
Read `sable docs building-an-ios-prototype` before composing. The rule is **Sable
first**: every screen is Sable components in the chosen preset — settings rows are
Card + CardList + Entity with Switch, forms are Form + Field + Input, search is
SearchInput, feedback is toast. `@sableui/react/ios` supplies only system chrome
(NativeApp, IosPage, IosNavbar, IosBackLink, IosIconButton, IosTabbar, IosTab,
IosSheet, NavigationStack). Never import from `konsta`; sable-lint flags it
(`native-ui-import`). `sable target ios --component <Name>` confirms a decision;
almost every component is `preserve`. Every rule below applies to the prototype.

For inspiration, extract useful visual relationships into a preset. For an audit,
evaluate the target product. A URL does not automatically mean copying its page.
An explicit reconstruction request fixes reference fidelity; preserve that scope
and document necessary departures. Current user instructions override older presets
and preferences. Infer the target from the project and conversation; ask only for
missing information that materially changes the work.

## Resolve and set up the installed library

Start in the target app, not this skill's folder. Read project instructions. Resolve
`@sableui/react/registry.json` from that project's dependency context:

```sh
node -p "require.resolve('@sableui/react/registry.json')"
```

The registry's parent is the package root; read its `AGENTS.md` (`sable docs AGENTS`) and use its
`bin/sable.mjs`. In the Sable repository use `packages/sable/bin/sable.mjs` and
`packages/sable/registry.json`. Below, `sable` means this resolved CLI invoked with
the target project as its working directory. Never fetch an unrelated public
package with bare `npx sable`, or invent shell `build`, `inspire`, or `audit` commands.

If Sable is absent, read the trusted repository or package README's install recipe
and registry `consume` block. Install from npm with the project's package
manager, for example `pnpm add @sableui/react`; no registry setup or token is
needed. Do not substitute an unrelated package with a similar name.

A project that already has a router, data layer or form library keeps it: Sable
depends on none, and its links, menus and nav take any router's link through
`render`. For a blank-slate app, start from Sable's suggested stack: React with
TypeScript on Vite, **TanStack Router** for routes and links, **TanStack Query**
for server data, **TanStack Form** when a form needs validation logic, and
**TanStack Table** once a table outgrows `DataTable` (`sable docs
tables-with-tanstack`). Say so in the brief, and use something else only when the
user or the product asks for it.

Complete setup before implementing UI:

- Match the installed package's React, React DOM, Tailwind, and Node requirements.
- Dedupe React in the bundler. Import Tailwind, then Sable's stylesheet; add the
  package `dist` glob to Tailwind `@source`, relative to the consumer stylesheet.
- Load the selected fonts through the project's font setup. Presets declare stacks;
  they do not load files.
- Icons are opt-in: wrap the app once in `<IconProvider set={reiconIconSet}>` with
  `reiconIconSet` from `@sableui/react/icons/reicon`, or pass another set. Without a
  provider every `<Icon>`, including those inside Sable components, renders nothing.
  `sable provider IconProvider` has the props and examples; `sable provider --list`
  covers the other providers (SableThemeProvider, MotionProvider, ToastProvider).
- Run `sable doctor`, repair wiring issues, and verify the app renders a real
  Sable component. Reuse an existing app server; never start duplicate instances.

Run `sable setup --agent` once from the project root to install discoverable entry
files for Codex/Cursor and Claude Code. `--target codex|claude|cursor|all` selects
hosts. For Claude Code, setup also prints a Stop hook that runs `sable check`
before a task can end; it writes that hook to `.claude/settings.json` only with
`--hook`, so add it only when the user wants it. The hook is one plain command
(for example `pnpm exec sable check --stop-hook`) with no `cd` or `&&`, so it runs
under Git Bash and PowerShell alike; `sable check --stop-hook` finds the project
through Claude Code's `CLAUDE_PROJECT_DIR`, plus `--root` for a workspace package.
The entry files read this installed package's instructions on each task;
upgrading the package updates the workflow. After an upgrade, use
`sable setup --agent --update` to refresh managed entry metadata when needed.
Keep project-specific preferences in project instructions rather than editing
package files. Agents without skill discovery can read this file directly.

## Build with the actual Sable resources

Before UI code, run `sable manifest --json`, read `sable docs building-with-sable`,
`sable docs designing-a-surface`, and `sable docs choosing-a-component`. Read relevant
foundations through `sable docs typography|spacing|shape|surfaces|motion|scrolling|accessibility`.
The installed catalog and guides are authoritative for API and token names.

**Required for every build and polish:**

1. Search the installed catalog for every recognizable element or behavior:
   `sable search "<need>" --json`. Inspect the matching
   `sable component <Name> --props` and `--examples` before using it. What a
   result asks of you depends on what it is:
   - **Behaviour** (controls, fields, overlays, menus, tabs, anything with focus,
     keyboard or ARIA): always use it, never rebuild it. A native element wearing
     a component's classes, or arrow keys handled by hand, is a reinvention even
     if it uses valid tokens.
   - **Parts** (Card, Entity, AspectBox, Badge, Avatar, MediaImage, layout
     primitives): compose them freely, in whatever arrangement the design needs.
   - **References** (patterns, blocks, and compositions marked ◇ such as
     MediaTile): use one when its layout fits the brief. When it doesn't, compose
     your own from parts; that is not a gap and needs no apology. Apps on Sable
     should not all look alike.
2. Resolve styling in this order: Sable component/variant, Sable utility or recipe,
   semantic token, then app-owned CSS for a genuinely uncovered need. Colour
   beyond the roles (tags, avatars, labels, legends) comes from the generated
   palette, which follows the theme: a family as a component's tone
   (`<Badge tone="teal">`) or the pairs `bg-blue-100 text-blue-800`; never hex or
   a theme's own ramp (`sable token palette`). Retrieve
   `sable utility <name>` and `sable token <group>` rather than guessing names.
   Use paired typography, spacing steps, density/control ladders, relative surfaces,
   concentric geometry, scroll policies, and supported motion recipes.
3. Inspect a relevant `sable pattern <Name> --skeleton` and layout contracts when
   composing a page. Reuse a pattern when its information architecture fits;
   otherwise compose an original layout from Sable primitives. Do not force a
   dashboard or marketing shell onto a different product brief. Structure: one
   direction is `Stack`/`Row` (flex); content that lines up across rows and
   columns is `Grid`/`Columns`; width is a `Region`. Measure vertical space in
   baseline steps (`sable docs spacing`): `Stack`/`Row`/`Grid` gap numbers, even
   Tailwind steps between blocks, paired type tiers. It is a rhythm to keep, not
   a grid to force: never pad or nudge components to pin text to lines.
4. Put identity in app-owned theme tokens, composition, and assets. Component
   `className` is for layout; fill, edges, corners, ink, and interaction appearance
   come from supported variants. Do not override controls to imitate a reference.
   Entity rows use `CardList`; edge-to-edge tables use `CardContent flush`.
5. When the catalog has no fit, document the search, missing capability, and owner.
   In the Sable monorepo, follow `CONTRIBUTING.md`, add the library capability, then
   consume it. In another app, implement only genuinely app-specific structure;
   report a missing library hook. Do not modify installed package files or build
   parallel controls as a shortcut. Preserve existing non-Sable work unless a
   migration was requested.

## Develop or use a preset

Save a short brief in the project's existing design location: audience, primary
task, content, constraints, selected identity, and meaningful states, plus each
route's width (a Region `max`, or fluid) and why, chosen by what the person does
there (`sable docs building-a-page`), and its column structure: which content
spans which of the 12 columns at which breakpoint, or "one measure, no columns".
A grid is a choice per route, not a requirement; stating it is. Name the product's signature surfaces: the
one to three places its identity lives (a shop's product card and search, a music
app's player and album tile). Design those from the brief's direction first,
composing Sable's parts and behaviour; take a Sable reference for one only when
it already matches that direction. Everything else (forms, settings, menus,
tables) takes Sable's defaults. Label invented sample content. A supplied preset is an explicit input: read its exact record and
revision, validate it through `sable preset --check <path> --json`, and read
`sable docs using-presets`. Preserve its tokens and guidance unless the user requests
a change or the new task requires a documented adaptation.

A preset pasted or supplied for a project that already has an app (for example
from Canvas's “Copy for agent”) is a request to restyle that app, so it is
`polish`: save and check it, then apply it. Generate its CSS, load its fonts,
make it SableThemeProvider's default theme and mode in place of the old one, run
the build and the finish checklist, and look at it rendered. Don't stop at a saved
file plus a list of wiring steps for the user. Stop after saving only when the
user says so or the project has no app yet.

Without a preset, develop an appropriate direction from the brief. Use the bundled
presets as starting points or create original app-owned tokens. When the project has
its own visual atlas, retrieve references with `sable atlas --search "<problem>"
--contrast --limit 3 --json` and `--show <id>`, and actually view returned images;
the package ships none, so otherwise work from the user's references. Retrieve applicable lessons with
`sable learn --search "<problem>" --json`. Optional preference retrieval uses an
explicit scope and distinguishes human choices from agent observations. Empty
memory is valid; opening tools or completing a build does not supply human taste.

For `inspire`, read `sable docs creating-a-preset`. Inspect supplied references with
available browser/image/design tools. Distinguish measured, estimated, derived,
and user-edited decisions; do not claim a screenshot proves animation timing or
hidden behavior. Record transferable typography, surfaces, spacing, imagery, and
motion principles. The user's future product determines its own layout and content.
Save a versioned preset in `.sable/presets/<id>.json`, validate it, and provide a
Sable-component preview or import it into Canvas. Stop at the preset.

Canvas can import and download the same preset format. A downloaded file must be
placed in the target project before the agent can read it; a browser export does
not itself write into that project. Use `sable preset --css <path>` to generate
scoped CSS, load fonts, and apply the preset ID with Sable's theme APIs. Never
register a personal preset as a bundled library theme just to build one app.

When alternatives matter, keep content and primary behavior fixed, vary meaningful
composition and another relevant dimension, and inspect desktop/mobile/interaction
states. `sable explore` supports three to six evidence-bound directions; a smaller
comparison can be delivered directly. Respect a reserved user choice; otherwise
make and identify an agent selection and continue the authorized build.

When imagery or fonts carry the direction, read `sable docs creating-design-assets`.
Produce or obtain actual assets within authorization, verify loading and responsive
crops, and retain source/readiness notes. Atlas images are reference evidence, not
product assets. A palette alone does not establish a finished design.

## Verify and deliver

For `audit`, read `sable docs auditing-an-app`; report by default and distinguish
contract violations, design judgments, intentional choices, and verified library
gaps. A visual-only review leaves code and unobserved behavior untested. For
`polish`, reuse the existing direction and inspect the affected product or preset.

Every build and polish ends with the finish checklist near the top of this skill. Notes on it:

- `sable check` gives one combined result; while iterating, `sable lint <paths> --json`,
  `sable doctor`, and `sable grade <paths>` run the parts separately.
- `label-contrast` is Sable's opinion on a user's colour: offer its suggested pair,
  and when the user chose the pair deliberately, keep it with a reasoned disable or
  preset `exceptions` entry.
- Besides the review guides, check font loading and focus in the rendered app.
- In the reuse inventory, ordinary semantic content and domain logic are
  app-owned; a recognizable control or surface must use its library
  implementation. Explain any uncovered capability with the catalog search and
  the smallest necessary addition, and include the inventory with the build's
  evidence so conformance is reviewable.

Iterate on observed defects and recapture changed states. A defect inside a Sable
component is patched, not restyled: `sable patch <Component> --reason … --repro …`,
then the package manager's patch (`sable docs patching-a-component`). When `sable
doctor` fails on a patch after an upgrade, re-run its repro on Sable's own files
and keep or drop it. Contract checks cannot judge beauty. Deliver the result, the preset/revision used, the checks performed,
and material limitations.

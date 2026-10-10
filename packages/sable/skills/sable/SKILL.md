---
name: sable
description: Build original websites and apps with Sable, turn inspiration into reusable presets, audit existing interfaces, and polish a selected design. Use for Sable design and UI work, not unrelated backend tasks.
---

# Sable

Build the user's idea with the installed Sable library. The product brief determines
content, structure, and behavior; a preset supplies theme values and design guidance.
References inform an original direction. A reference or preset is optional.

## Route the request

These are agent skill modes, not shell commands. Use `$sable` in Codex and
`/sable` in Claude Code or Cursor; natural requests work in compatible agents.

| Mode | Outcome |
| --- | --- |
| `build <idea> [using <preset or path>]` | Develop the brief, implement the requested product with Sable, inspect and operate it, repair observed issues, and deliver the working result. |
| `inspire <references or description>` | Study the inspiration, develop a direction, and save a previewable, editable preset. Stop before a full product build. |
| `audit <existing interface>` | Inspect existing work and report prioritized design, behavior, accessibility, and Sable-contract findings. Apply repairs only when requested. |
| `polish <target or instruction>` | Improve the current product or preset while preserving its selected direction, then verify affected states. |

`create` is an alias for `build`. A bare new-product brief means `build`; an editing
follow-up means `polish`. A request for direction only stops before implementation.
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

The registry's parent is the package root; read its `AGENTS.md` and use its
`bin/sable.mjs`. In the Sable repository use `packages/sable/bin/sable.mjs` and
`packages/sable/registry.json`. Below, `sable` means this resolved CLI invoked with
the target project as its working directory. Never fetch an unrelated public
package with bare `npx sable`, or invent shell `build`, `inspire`, or `audit` commands.

If Sable is absent, read the trusted repository or package README's install recipe
and registry `consume` block. Install from npm with the project's package
manager, for example `pnpm add @sableui/react`; no registry setup or token is
needed. Do not substitute an unrelated package with a similar name.

Complete setup before implementing UI:

- Match the installed package's React, React DOM, Tailwind, and Node requirements.
- Dedupe React in the bundler. Import Tailwind, then Sable's stylesheet; add the
  package `dist` glob to Tailwind `@source`, relative to the consumer stylesheet.
- Load the selected fonts through the project's font setup. Presets declare stacks;
  they do not load files. Reicon works by default; IconProvider can replace or extend the set.
- Run `sable doctor`, repair wiring issues, and verify the app renders a real
  Sable component. Reuse an existing app server; never start duplicate instances.

Run `sable setup --agent` once from the project root to install discoverable entry
files for Codex/Cursor and Claude Code. `--target codex|claude|cursor|all` selects
hosts. The entry files read this installed package's instructions on each task;
upgrading the package updates the workflow. After an upgrade, use
`sable setup --agent --update` to refresh managed entry metadata when needed.
Keep project-specific preferences in project instructions rather than editing
package files. Agents without skill discovery can read this file directly.

## Build with the actual Sable resources

Before UI code, run `sable manifest --json`, read `sable docs building-with-sable`,
`sable docs designing-a-surface`, and `sable docs choosing-a-component`. Read relevant
foundations through `sable docs typography|spacing|shape|surfaces|motion|scrolling|accessibility`.
The installed catalog and guides are authoritative for API and token names.

**Required for every build and UI repair:**

1. Search the installed catalog for every recognizable element or behavior:
   `sable search "<need>" --json`. Inspect the matching
   `sable component <Name> --props` and `--examples` before using it. Use its public
   component and composed anatomy. A native element wearing a component's classes
   is a reinvention, even if it uses valid tokens.
2. Resolve styling in this order: Sable component/variant, Sable utility or recipe,
   semantic token, then app-owned CSS for a genuinely uncovered need. Retrieve
   `sable utility <name>` and `sable token <group>` rather than guessing names.
   Use paired typography, spacing steps, density/control ladders, relative surfaces,
   concentric geometry, scroll policies, and supported motion recipes.
3. Inspect a relevant `sable pattern <Name> --skeleton` and layout contracts when
   composing a page. Reuse a pattern when its information architecture fits;
   otherwise compose an original layout from Sable primitives. Do not force a
   dashboard or marketing shell onto a different product brief.
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
task, content, constraints, selected identity, and meaningful states. Label invented
sample content. A supplied preset is an explicit input: read its exact record and
revision, validate it through `sable preset --check <path> --json`, and read
`sable docs using-presets`. Preserve its tokens and guidance unless the user requests
a change or the new task requires a documented adaptation.

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

Every build includes `sable docs reviewing-a-design`, `sable doctor`,
`sable lint <source paths> --json`, and the project's build/type checks. Repair
findings instead of suppressing them to finish. Inspect real desktop/mobile
layouts, operate the primary task and recovery path, check keyboard/touch and
loading/empty/error/success states, font loading, focus, and reduced motion.
Audit source ownership as well as lint: identify the Sable components and composed
parts actually imported, the utilities/token groups used, and every app-owned UI
or CSS addition. Ordinary semantic content and domain logic are app-owned; a
recognizable control or surface must use its library implementation. Explain any
uncovered capability with the catalog search and the smallest necessary addition.
Include this reuse inventory with the build's evidence so conformance is reviewable.
For connected flows read `reviewing-a-journey`; for meaningful temporal behavior
read `reviewing-motion` and observe interruption as well as playback.

Iterate on observed defects and recapture changed states. Contract checks cannot
judge beauty: assess brief fit, composition, hierarchy, rhythm, imagery, and
interaction in the rendered product. Deliver the result, preset/revision used,
checks performed, and material limitations. Preserve useful conditional lessons
through `learning-from-builds`; never fabricate human approval or preference records.

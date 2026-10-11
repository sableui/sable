# Sable

**Sable** — a themeable React component system with layout patterns, semantic tokens and tools for coding agents. Default theme: **Base**. On npm as `@sableui/react`; docs and the live catalog at [sableui.com](https://www.sableui.com).

For a clickable iOS prototype (demos and presentations, not production), ask the
Sable skill to build with the iOS target. Every screen is Sable components in your
preset; the optional `@sableui/react/ios` adapter adds only the iOS system chrome
(status bar, navigation bar, tab bar, sheet presentation), drawn by the optional
`konsta` peer that the agent installs for that target. The prototype's document
imports Tailwind, Sable's styles, a preset, then `@sableui/react/ios/styles.css`.
Frame it with `PhoneFrame` from `@sableui/react/ios/preview`. See
[building an iOS prototype](llms/tasks/building-an-ios-prototype.md).

Original Sable code is [MIT licensed](./LICENSE).

The featured presets are Base (neutral), Meridian (square), Prism (compact technical),
Verdant (serif), Ember (warm), and Poppy (playful). Every preset supports light and
dark modes. Load its declared fonts and use `ThemeSelector` to offer preset choices.
[Third-party notices](./THIRD_PARTY_NOTICES.md) list the software and fonts used
in Sable.

- **Behavior:** [Base UI](https://base-ui.com) (`@base-ui/react`) — accessible primitives, isolated behind our own component APIs.
- **Styling:** Tailwind CSS v4 + semantic CSS-variable tokens; variants via `class-variance-authority`.
- **Icons:** Reicon by default, with a pluggable adapter for any icon package.
- **Motion:** a token-driven, zero-dependency motion layer (recipes, policy, browser-native primitives).
- **Themeable:** components reference semantic tokens only; a theme is a CSS variable set.

A broad product component catalog, a fluid layout foundation, and a pluggable icon adapter — see [`registry.json`](./registry.json).

## Taste, style, and variety

A project can keep its own visual atlas at `.sable/atlas/atlas.json`: annotated
desktop, mobile and interaction captures with conditional transfer principles and
cautions. `sable atlas --search` retrieves contextual examples from it and `--show`
returns verified local image paths, which an agent must actually view. The package
ships no atlas; without one, work from the brief and the user's references.

When alternatives materially affect the brief, keep content and behavior fixed while
rendering bounded directions with meaningful differences in composition, typography,
density, imagery, story, or purposeful motion. `sable explore --check design/directions.json`
checks the specification and capture hashes; `--compare` creates an offline
comparison with anonymous labels and an explicit choice or tie. It exports a
review record for `sable prefer --record`. Preferences live in the consuming
project's `.sable/preferences/`, are scoped to a project, brand, person, or task,
and distinguish an actual human judgment from an agent observation. Human-only
retrieval is the default. These tools do not update model weights. See
`sable docs developing-taste` for the complete workflow.

## Install & setup

> **Agents:** the machine-readable version of these steps is the `consume` block in [`registry.json`](./registry.json).

**1. Install:**

```bash
pnpm add @sableui/react
```

**2. Dedupe React**, or Base UI resolves a second copy → "invalid hook call". Vite:

```ts
// vite.config.ts
export default defineConfig({ resolve: { dedupe: ["react", "react-dom"] } })
```

**3. CSS** (order matters), in your root stylesheet:

```css
@import "tailwindcss";
@import "@sableui/react/styles.css";
/* let Tailwind scan the package for the classes its components use */
@source "../node_modules/@sableui/react/dist/**/*.{js,mjs}";
```

**4. Fonts** — the default theme expects **Figtree** (sans) + **DM Mono** (mono). Each alternate preset declares its own families in its manifest (`registry.json → themes.available[].fonts`). Load whichever stacks you plan to use via `<link>` or `@font-face`; the theme manifests declare the stacks but ship no font files.

**5. Providers + color mode / theme selection:**

```tsx
import {
  IconProvider,
  MotionProvider,
  SableThemeProvider,
  ThemeSelector,
  ThemeSwitcher,
  useSableTheme,
} from "@sableui/react"
import { reiconIconSet } from "@sableui/react/icons/reicon"

function ThemeControls() {
  const { preference, setPreference, themeId, themes, setThemeId, mode } = useSableTheme()

  return (
    <>
      <ThemeSelector value={themeId} onValueChange={setThemeId} themes={themes} mode={mode} />
      <ThemeSwitcher value={preference} onValueChange={setPreference} />
    </>
  )
}

<IconProvider set={reiconIconSet}>       {/* optional — omit for Reicon, or pass another icon set */}
  <MotionProvider>                    {/* optional — enables the motion on/off toggle */}
    <SableThemeProvider>              {/* optional, recommended when users can switch themes */}
      <App />
    </SableThemeProvider>
  </MotionProvider>
</IconProvider>
```

Components render Reicon icons out of the box. To replace Reicon, mount `<IconProvider set={yourIconSet}>`; to add domain icons, use `composeIconSets(appExtras, reiconIconSet)`. Both helpers and the `IconSet` type are exported from Sable. A set returns `null` for names it does not handle. `fallbackIconSet` remains a deprecated alias of Reicon for compatibility. `SableThemeProvider` is the preferred route for user-facing theme switching: it stores the user's color preference (`light` / `dark` / `system`), toggles the **`.dark` class**, stores the active design theme, and writes **`data-sable-theme`** for non-default themes. If your app already owns this state, use `applySableColorMode()` / `applySableTheme()` or the exported `SABLE_THEME_ATTRIBUTE` constant directly. You do **not** need a Tailwind `@custom-variant dark` for Sable itself — add one (`@custom-variant dark (&:where(.dark, .dark *));`) only if **your own** app code uses `dark:` utilities (Sable ships none).

**6. Use it:**

```tsx
import { Button, Card, Carousel, Dialog } from "@sableui/react"
```

## The CLI

Two binaries ship with the package, both zero-dependency and both reading the contract from the version you actually installed:

```bash
npx sable pattern --list                     # the eight canonical page shells
npx sable pattern DashboardPage --skeleton   # its composition tree — 127 lines of source, 45 of structure
npx sable block PricingCardBlock --code      # a section-sized block's source, imports included
npx sable component Button --props
npx sable search "date range"                # one ranked set across components, patterns, layout, tokens, docs
npx sable doctor                             # is this project wired correctly? exits 1 if not
npx sable docs designing-a-surface           # brief, direction, composition, interaction, adaptation
npx sable docs developing-taste             # references, rendered directions, scoped judgment
npx sable atlas --search "editorial culture" --contrast --limit 3 --json  # a project's own atlas, if it has one
npx sable explore --template                # specification for three rendered alternatives
npx sable prefer --search "reading" --scope project:my-app --json
npx sable learn --search "editorial hierarchy" --json
npx sable grade src --json                   # code conformance; pattern similarity is descriptive
npx sable grade --template                   # evidence record for a rendered design review
npx sable-lint                               # run the design contract over ./src
```

`registry.json` is about 1 MB and `llms-full.txt` about 800 KB — complete, and larger than any working context. `sable` serves the same generated content a piece at a time: `--detail brief|compact|full` picks a size, `--dense` drops prose, and `--json` wraps everything in a `{ type, data }` envelope with a stable discriminator. Errors carry a stable `code` plus concrete `suggestions`, so a misspelled name costs one call instead of a guess. `npx sable manifest --json` describes the whole surface, generated from the same table that drives `--help`.

Design quality needs a rendered review. Start from the surface brief, reuse a
canonical composition when it fits, or build an original one from layout
primitives. Inspect desktop/mobile, the primary flow, keyboard behavior, and
reduced motion; `sable docs reviewing-a-design` explains the evidence format.
`sable grade src --review design/review.json --strict` validates conformance and
recorded review completeness. It does not independently judge the images.

`sable learn` reads packaged precedents and project-owned `.sable/lessons/` without
a plugin or network. Each lesson states when to apply it, when to avoid it, and
where its evidence came from. Use `sable learn --template`, fill observed
before/after evidence, and `sable learn --record design/lesson.json` to preserve a
provisional local lesson. Package upgrades never overwrite project memory. See
`sable docs learning-from-builds` for the full loop.

## Documentation

- **[AGENTS.md](./AGENTS.md)** — how to build with Sable: wiring, the rules for code you write, customizing (read first).
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** — changing the package: hard rules, adding a component, theme/icon/motion contracts.
- **[DESIGN.md](./DESIGN.md)** — the design-system spec (tokens, type, grid, motion).
- **[registry.json](./registry.json)** / **[llms.txt](./llms.txt)** — machine-readable catalog + the `consume` recipe. Component entries include props, variants, tokens, a11y notes, copy-pasteable examples, and AI-readable usage guidance with do/don'ts, anatomy, keywords, and related components.

## Build & publish

In the workspace the package is consumed as **source** (`exports` point at `./src`) for instant HMR — no build needed for local dev. To produce the publishable artifact:

```bash
pnpm --filter @sableui/react build   # regenerates registry.json from the metas → tsup → dist/ (ESM + .d.ts) → copies the token CSS
```

> Requires **Node 22+** (the registry generator imports the `.meta.ts` files via Node's built-in TypeScript type-stripping). `registry.json` is generated from each component's `*.meta.ts`; CI's `pnpm registry:check` fails the build if it drifts.

`publishConfig.exports` repoints consumers at `./dist` on publish (workspace dev keeps `./src`). Publishing is automated — push a `v*` tag and the repo's **Release** GitHub Action publishes to npm with provenance (see the repo-root README).

## Requirements

- React 19 (peer), React DOM 19 (peer), Tailwind CSS v4 in the consuming app.

## Build with an agent

After installing Sable, run `pnpm exec sable setup --agent` in the target
project. It installs discoverable entry files in `.agents/skills/sable` for
Codex/Cursor and `.claude/skills/sable` for Claude Code; `--target` selects a host.
Each entry resolves `skills/sable/SKILL.md` from the installed package, so package
upgrades also update the workflow. Other agents can read that file directly.
Use `$sable build <idea>`, `inspire <references>`, `audit <target>`, or
`polish <target>` in Codex; use `/sable` with the same modes in Claude Code or
Cursor. `create` is a build alias. These are agent modes, not shell commands.

Upgrade with `pnpm update @sableui/react --latest`, then
`pnpm exec sable setup --agent --update`. Setup only replaces managed files
that have not been locally edited; `--dry-run` checks without writing. Keep
project preferences in project instructions. Package installation alone does not
change agent settings. See [building-with-sable.md](./llms/tasks/building-with-sable.md),
[creating-a-preset.md](./llms/tasks/creating-a-preset.md), and
[using-presets.md](./llms/tasks/using-presets.md).

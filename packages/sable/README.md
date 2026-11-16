# Sable

**Sable** — a themeable React component system with layout patterns, semantic tokens and tools for coding agents. Default theme: **Sable**. On npm as `@sableui/react`; docs and the live catalog at [sableui.com](https://www.sableui.com).

- **Behavior:** [Base UI](https://base-ui.com) (`@base-ui/react`) — accessible primitives, isolated behind our own component APIs.
- **Styling:** Tailwind CSS v4 + semantic CSS-variable tokens; variants via `class-variance-authority`.
- **Icons:** opt-in through `IconProvider` — Reicon's set ships ready to mount, or plug in any icon package. Apps pay only for the set they choose.
- **Motion:** a token-driven, zero-dependency motion layer (recipes, policy, browser-native primitives).
- **Themeable:** components reference semantic tokens only; a theme is a CSS variable set.

The featured presets are Sable (neutral), Meridian (square), Prism (compact technical),
Verdant (serif), Ember (warm), and Poppy (playful). Every preset supports light and
dark modes. Original Sable code is [MIT licensed](./LICENSE);
[third-party notices](./THIRD_PARTY_NOTICES.md) list the software and fonts used
in Sable.

## Install & setup

> **Agents:** the machine-readable version of these steps is the `consume` block in [`registry.json`](./registry.json); the full contract is [`AGENTS.md`](./AGENTS.md).

**Quick start:**

```bash
pnpm add @sableui/react
pnpm exec sable init --dry-run   # every change it would make
pnpm exec sable init
```

Run `sable init` from the app root once the package is installed; before that,
`npx sable` fetches an unrelated package. It reads your package manager from the
lockfile and your framework from the project. It installs what is missing
(React, Tailwind and its build plugin), writes the CSS imports below in order,
installs the agent skill and its block in `AGENTS.md` / `CLAUDE.md`, offers the
Claude Code Stop hook when you run it in a terminal, then runs `sable doctor`.
On Vite it also adds the Tailwind plugin and React dedupe to the Vite config,
adds the font links to `index.html`, and wraps a starter's `<App />` in
`IconProvider`. On Next.js it writes a `postcss.config.mjs` and prints a
`"use client"` providers file and the font tags for you to paste
([Next.js guide](llms/tasks/nextjs.md)). It does not add antialiasing, alternate
theme CSS, or the optional providers. Anything it cannot change safely it prints
as the exact snippet and the file it belongs in. `--no-agent` skips the skill.
Already set up? `sable doctor --fix` applies the same fixes to whatever doctor
flags.

The steps below are what `init` does, for doing it by hand or checking its work.

**1. Install** the package, plus Tailwind and its Vite plugin if the app lacks them:

```bash
pnpm add @sableui/react
pnpm add -D tailwindcss @tailwindcss/vite
```

**2. Dedupe React**, or Base UI resolves a second copy → "invalid hook call". Vite:

```ts
// vite.config.ts
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { dedupe: ["react", "react-dom"] },
})
```

**3. CSS** (order matters), in your root stylesheet. The `@source` path is
relative to the stylesheet; this one assumes `src/index.css` with
`node_modules` at the project root:

```css
@import "tailwindcss";
@import "@sableui/react/styles.css";
/* let Tailwind scan the package for the classes its components use */
@source "../node_modules/@sableui/react/dist/**/*.{js,mjs}";
```

That `@source` generates the classes of every Sable component: about 49 KB of CSS, minified and gzipped. Once the app is built, `pnpm exec sable sources --write src/sable-sources.css` writes `@source` lines for just the modules it imports (about 26 KB for an app using Card, Button and DataTable; Sable's own stylesheet with nothing scanned is about 20 KB, 13 KB of it the generated palette); `@import "./sable-sources.css";` in place of the line above. Re-run it after importing something new: `sable check` fails while the file is stale, since an unlisted component renders unstyled.

Alternate presets are separate stylesheets: `@import "@sableui/react/theme/prism.css";` for one, or `@import "@sableui/react/themes.css";` for all of them, after Sable's. Without it, a selected theme silently renders as the Sable theme.

**4. Fonts** — the default theme expects **Figtree** (sans) + **DM Mono** (mono). Each alternate preset declares its own families in its manifest (`registry.json → themes.available[].fonts`). Load whichever stacks you plan to use via `<link>` or `@font-face`; the theme manifests declare the stacks but ship no font files. Apply Tailwind's `antialiased` once on the app root.

**5. Providers** — mount them once, at the root:

```tsx
// src/main.tsx
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { IconProvider, MotionProvider, SableThemeProvider } from "@sableui/react"
import { reiconIconSet } from "@sableui/react/icons/reicon"
import App from "./App"
import "./index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <IconProvider set={reiconIconSet}>   {/* required — Reicon, or pass another icon set */}
      <MotionProvider>                  {/* optional — enables the motion on/off toggle */}
        <SableThemeProvider>            {/* optional — light/dark/system and theme choice */}
          <App />
        </SableThemeProvider>
      </MotionProvider>
    </IconProvider>
  </StrictMode>,
)
```

Icons are opt-in: mount `<IconProvider set={reiconIconSet}>` once at the app root, with `reiconIconSet` from `@sableui/react/icons/reicon` (its only import path). Without a provider every `<Icon>` renders nothing, and a development build warns once. An app that passes its own set ships none of Reicon's artwork. To add domain icons, use `composeIconSets(appExtras, reiconIconSet)`; `composeIconSets` and the `IconSet` type are exported from the root. A set returns `null` for names it does not handle. List the names your extras add in `.sable/icons.json` (`{ "names": [...] }`) so `sable grade` counts them as icons the app supplies, not off-contract ones. `fallbackIconSet` remains a deprecated alias of Reicon, exported from `@sableui/react/icons/reicon`. The set draws the outline weight, and solid only for the few glyphs Sable's components fill (a pressed like, the media controls); for `variant="solid"` on any other icon, compose `reiconSolidIconSet` from `@sableui/react/icons/reicon-solid` in front: `composeIconSets(reiconSolidIconSet, reiconIconSet)`.

`SableThemeProvider` stores the user's color preference (`light` / `dark` / `system`, default `system`), toggles the **`.dark` class** on `<html>`, stores the active design theme, and writes **`data-sable-theme`** for non-default themes. Read and set them with `useSableTheme()`, and offer them with `ThemeSwitcher` (`value={preference} onValueChange={setPreference}`) and `ThemeSelector`. The theme is designed dark-first but renders light until `.dark` is set: pass `defaultPreference="dark"`, or put `class="dark"` on `<html>`, for a dark default. If your app already owns this state, use `applySableColorMode()` / `applySableTheme()` or the exported `SABLE_THEME_ATTRIBUTE` constant directly. You do **not** need a Tailwind `@custom-variant dark` for Sable itself — add one (`@custom-variant dark (&:where(.dark, .dark *));`) only if **your own** app code uses `dark:` utilities (Sable ships none). The [colour mode guide](llms/tasks/color-mode.md) has the details.

```tsx
import { ThemeSelector, ThemeSwitcher, useSableTheme } from "@sableui/react"

function ThemeControls() {
  const { preference, setPreference, themeId, setThemeId, themes, mode } = useSableTheme()
  return (
    <>
      <ThemeSelector value={themeId} onValueChange={setThemeId} themes={themes} mode={mode} />
      <ThemeSwitcher value={preference} onValueChange={setPreference} />
    </>
  )
}
```

**6. Check the wiring:** `pnpm exec sable doctor`. The [troubleshooting guide](llms/tasks/troubleshooting.md) maps each failure to its symptom.

## Use it

```tsx
import { Button, Card, Carousel, Dialog } from "@sableui/react"
import { SettingsPage } from "@sableui/react/patterns"
import { SignInBlock } from "@sableui/react/blocks"
```

## The CLI

Two binaries ship with the package, both zero-dependency and both reading the contract from the version you actually installed. Run them through your package manager (`pnpm exec sable`, `npm exec sable`, `yarn sable`):

```bash
pnpm exec sable pattern --list                     # the canonical page shells
pnpm exec sable pattern DashboardPage --skeleton   # its composition tree, demo data stripped
pnpm exec sable block PricingCardBlock --code      # a section-sized block's source, imports included
pnpm exec sable component Button --props
pnpm exec sable search "date range"                # one ranked set across components, examples, patterns, layout, tokens, docs
pnpm exec sable component Form --example "Server errors"   # just the example a search hit names
pnpm exec sable init                               # wire a new app, then doctor
pnpm exec sable doctor                             # is this project wired correctly? exits 1 if not
pnpm exec sable doctor --fix                       # apply the fixes doctor can make safely; print the rest
pnpm exec sable upgrade                            # update the package, then rerun init
pnpm exec sable check src                          # doctor, lint and grade in one pass
pnpm exec sable docs designing-a-surface           # brief, direction, composition, interaction, adaptation
pnpm exec sable docs developing-taste              # references, rendered directions, scoped judgment
pnpm exec sable atlas --search "editorial culture" --contrast --limit 3 --json  # a project's own atlas, if it has one
pnpm exec sable explore --template                 # specification for three rendered alternatives
pnpm exec sable prefer --search "reading" --scope project:my-app --json
pnpm exec sable learn --search "editorial hierarchy" --json
pnpm exec sable grade src --json                   # code conformance; pattern similarity is descriptive
pnpm exec sable grade --template                   # evidence record for a rendered design review
pnpm exec sable lint                               # run the design contract over ./src (also the sable-lint binary)
```

`registry.json` and `llms-full.txt` each run to well over a megabyte — complete, and larger than any working context. `sable` serves the same generated content a piece at a time: `--detail brief|compact|full` picks a size, `--dense` drops prose, and `--json` wraps everything in a `{ type, data }` envelope with a stable discriminator. Errors carry a stable `code` plus concrete `suggestions`, so a misspelled name costs one call instead of a guess. `pnpm exec sable manifest --json` describes the whole surface, generated from the same table that drives `--help`.

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

## Build with an agent

`sable init` connects Codex, Claude Code and Cursor to the package's Sable skill:
ask for what you want in plain words, or name a mode with `$sable` (Codex) or
`/sable` (Claude Code, Cursor) — `build <idea>`, `inspire <references>`,
`audit <target>`, `polish <target>`, or `fix <target>`. Upgrade with
`pnpm exec sable upgrade`, which updates the package and refreshes the skill
together. What setup writes, monorepo setup with `--root`, the Stop hook and
how upgrades preserve local edits are in
[AGENTS.md → The Sable agent skill](./AGENTS.md#the-sable-agent-skill); the
workflow is [building-with-sable.md](./llms/tasks/building-with-sable.md).

To look Sable up before installing it, or if you prefer MCP, add the hosted
server: `claude mcp add --transport http sable https://www.sableui.com/api/mcp`
(Cursor, VS Code and Codex take the same URL). Its three tools, `search`, `get`
and `docs`, give the CLI's answers from the published package, at the version
the agent passes or the latest. Once Sable is installed, the CLI is the default.

## Documentation

- **[AGENTS.md](./AGENTS.md)** — how to build with Sable: wiring, the rules for code you write, customizing, agent setup (read first).
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** — changing the package: hard rules, adding a component, theme/icon/motion contracts.
- **[DESIGN.md](./DESIGN.md)** — the design-system spec (tokens, type, grid, motion).
- **[registry.json](./registry.json)** / **[llms.txt](./llms.txt)** — machine-readable catalog + the `consume` recipe. Component entries include props, variants, tokens, a11y notes, copy-pasteable examples, and AI-readable usage guidance with do/don'ts, anatomy, keywords, and related components.
- **Guides** — [Next.js](llms/tasks/nextjs.md), [colour mode and themes](llms/tasks/color-mode.md), [troubleshooting](llms/tasks/troubleshooting.md), [converting an app](llms/tasks/converting-an-app.md), [migrating from shadcn/ui](llms/tasks/migrating-from-shadcn.md); `sable docs --list` lists every one.

## Going further

### Colour

Components paint roles (`bg-card`, `bg-primary`, `text-muted-foreground`), so a
theme restyles everything at once. For colour beyond the roles, every theme also
generates a palette: `neutral`, `red`, `orange`, `yellow`, `green`, `teal`,
`blue`, `purple` and `pink` (50–950), plus a scale under every tone. The
families lean toward the theme's brand, neutral is the theme's own page-to-ink
ramp, and steps follow the mode, so `bg-blue-100 text-blue-800` reads in light and
dark. Use it for tags, avatars, labels and illustration; Badge, Pill and StatusDot
take a family as their tone (`<Badge tone="teal">`). Tailwind's other colour
families are switched off. See DESIGN.md → Generated palette.

### Taste, style, and variety

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

### iOS prototypes

For a clickable iOS prototype (demos and presentations, not production), ask the
Sable skill to build with the iOS target. Every screen is Sable components in your
preset; the optional `@sableui/react/ios` adapter adds only the iOS system chrome
(status bar, navigation bar, tab bar, sheet presentation), drawn by the optional
`konsta` peer that the agent installs for that target. The prototype's document
imports Tailwind, Sable's styles, a preset, then `@sableui/react/ios/styles.css`.
Frame it with `PhoneFrame` from `@sableui/react/ios/preview`. See
[building an iOS prototype](llms/tasks/building-an-ios-prototype.md).

## Requirements

- React 19 (peer), React DOM 19 (peer), Tailwind CSS v4 in the consuming app. `sable init` installs whichever is missing.

## Build & publish

In the workspace the package is consumed as **source** (`exports` point at `./src`) for instant HMR — no build needed for local dev. To produce the publishable artifact:

```bash
pnpm --filter @sableui/react build   # regenerates registry.json from the metas → tsup → dist/ (ESM + .d.ts) → copies the token CSS
```

> Requires **Node 22+** (the registry generator imports the `.meta.ts` files via Node's built-in TypeScript type-stripping). `registry.json` is generated from each component's `*.meta.ts`; CI's `pnpm registry:check` fails the build if it drifts.

`publishConfig.exports` repoints consumers at `./dist` on publish (workspace dev keeps `./src`). Publishing is automated — push a `v*` tag and the repo's **Release** GitHub Action publishes to npm with provenance (see the repo-root README).

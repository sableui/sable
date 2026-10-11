# Sable

**Sable** is a themeable React component system with layout patterns, semantic
tokens, and tools for coding agents. Original Sable code is MIT licensed.

Install it from npm as `@sableui/react`. Docs and the live catalog are at
[sableui.com](https://www.sableui.com); third-party credits are in
[THIRD_PARTY_NOTICES.md](packages/sable/THIRD_PARTY_NOTICES.md).

> **AI agents / quick start:** the install recipe is in [`AGENTS.md`](./AGENTS.md), and machine-readable in the `consume` block of [`packages/sable/registry.json`](./packages/sable/registry.json). To install: `pnpm add @sableui/react`.

This repo is a small pnpm workspace:

- **`packages/sable`** → the published library (`@sableui/react`). Tailwind v4 + semantic CSS-variable tokens, behaviour from Base UI, a pluggable icon adapter, and a token-driven motion layer. Default theme: **Sable**.
- **`apps/docs`** → the living catalog (`@sableui/docs`), a Vite SPA that renders every component, token, and pattern. Not published.

## Local development

Use the [package-owned Sable skill](./packages/sable/skills/sable/SKILL.md):

```text
$sable build a portfolio for a furniture designer
$sable inspire these references into a ceramics shop preset
$sable build a ceramics shop using .sable/presets/clay.json
$sable audit our checkout and report prioritized findings
$sable polish our checkout and fix the reported issues
```

An idea can go straight to a build. A preset supplies theme values and design
guidance; the product brief determines content and behavior. Canvas imports and
downloads the same portable preset format.
[The workflow guide](./packages/sable/llms/tasks/building-with-sable.md) connects
inspiration, presets, the component library, and rendered review.

In another project, install Sable and run `pnpm exec sable setup --agent`.
Codex and Cursor share a small `.agents` entry; Claude Code uses a `.claude` entry
and `/sable`. All entries load the installed package's skill. Package upgrades
update the workflow; `setup --agent --update` refreshes unchanged managed entries.
Keep personal presets and preferences in the consuming project.

```bash
pnpm install
pnpm docs:dev        # the catalog on http://localhost:4000
pnpm build           # build packages/sable → dist (tsup ESM + .d.ts + CSS)
pnpm typecheck       # type-check every workspace
pnpm package:check   # validate the built tarball in a fresh external consumer
```

## Publishing a new version

The package publishes to **npm** as `@sableui/react`, with provenance.

1. Bump `packages/sable/package.json` and `SABLE_UI_VERSION` in `packages/sable/src/index.ts`, update the changelog, and run `pnpm build` to regenerate the catalog.
2. Run the checks and merge the release PR into `main`.
3. From a clean checkout at `origin/main`, run `pnpm release`. It validates the checkout, creates the version tag, and pushes it.
4. The **Release** GitHub Action checks the tag matches the version, builds, tests the packed consumer, and publishes to npm with provenance. Confirm the action succeeds before asking apps to upgrade.

## Consuming it in another project

1. Install:

   ```bash
   pnpm add @sableui/react
   ```

2. **Bundler:** dedupe React or Base UI resolves a second copy → "invalid hook call". For Vite:

   ```ts
   // vite.config.ts
   export default defineConfig({ resolve: { dedupe: ["react", "react-dom"] } })
   ```

3. **CSS** (order matters):

   ```css
   @import "tailwindcss";
   @import "@sableui/react/styles.css";
   /* let Tailwind scan the package for the classes its components use */
   @source "../node_modules/@sableui/react/dist/**/*.{js,mjs}";
   ```

4. **Fonts:** the default theme expects **Figtree** (sans) + **DM Mono** (mono) — load them via `<link>` or `@font-face` (the theme declares the stacks, it doesn't ship the files).

5. **Providers + dark mode:**

   ```tsx
   import { IconProvider, MotionProvider } from "@sableui/react"

   // <html class="dark"> for dark-by-default; toggle the class to switch.
   <IconProvider set={myIconAdapter}>   {/* you supply the concrete icon set */}
     <MotionProvider>                    {/* optional — motion on/off toggle  */}
       <App />
     </MotionProvider>
   </IconProvider>
   ```

6. Use it:

   ```tsx
   import { Button, Card, Carousel } from "@sableui/react"
   ```

## Public release preparation

`pnpm public:check` lists open release blockers; `pnpm public:export` dry-runs the
public repository export (what would be published, and its identity, path and
credential scans).

Building with Sable: [`packages/sable/AGENTS.md`](packages/sable/AGENTS.md).
Contributing: [`packages/sable/CONTRIBUTING.md`](packages/sable/CONTRIBUTING.md).

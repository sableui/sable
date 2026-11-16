# Sable

**Sable** is a themeable React component system with layout patterns, semantic
tokens, and tools for coding agents. Original Sable code is MIT licensed.

Install it from npm as `@sableui/react`. Docs and the live catalog are at
[sableui.com](https://www.sableui.com); third-party credits are in
[THIRD_PARTY_NOTICES.md](packages/sable/THIRD_PARTY_NOTICES.md).

This repo is a small pnpm workspace:

- **`packages/sable`** → the published library (`@sableui/react`). Tailwind v4 + semantic CSS-variable tokens, behaviour from Base UI, a pluggable icon adapter, and a token-driven motion layer. Default theme: **Sable**.
- **`apps/docs`** → the living catalog (`@sableui/docs`), a Vite SPA that renders every component, token, and pattern. Not published.

## Use Sable in your project

From your app's root:

```bash
pnpm add @sableui/react
pnpm exec sable init --dry-run   # every change it would make
pnpm exec sable init
```

`sable init` installs what is missing, wires the stylesheet and Tailwind, sets up
the agent skill, and runs `sable doctor`; whatever it cannot change safely it
prints with the file it belongs in. The package README has
[the full setup, and the manual route](packages/sable/README.md#install--setup);
agents read [`packages/sable/AGENTS.md`](packages/sable/AGENTS.md) and the
`consume` block of [`packages/sable/registry.json`](packages/sable/registry.json).

Then ask your coding agent for what you want. The
[package-owned Sable skill](packages/sable/skills/sable/SKILL.md) handles plain
requests, or name a mode:

```text
$sable build a portfolio for a furniture designer
$sable inspire these references into a ceramics shop preset
$sable build a ceramics shop using .sable/presets/clay.json
$sable audit our checkout and report prioritized findings
$sable polish our checkout and fix the reported issues
$sable fix the settings dialog's footer buttons
```

Codex uses `$sable`; Claude Code and Cursor use `/sable`. A preset supplies theme
values and design guidance; the product brief determines content and behavior.
Canvas imports and downloads the same portable preset format.
[The workflow guide](packages/sable/llms/tasks/building-with-sable.md) connects
inspiration, presets, the component library, and rendered review. Upgrade with
`pnpm exec sable upgrade`, which updates the package and refreshes the skill.

## Develop this repo

```bash
pnpm install
pnpm docs:dev        # the catalog on http://localhost:4000
pnpm build           # build packages/sable → dist (tsup ESM + .d.ts + CSS)
pnpm typecheck       # type-check every workspace
pnpm package:check   # validate the built tarball in a fresh external consumer
```

Building with Sable: [`packages/sable/AGENTS.md`](packages/sable/AGENTS.md).
Contributing: [`packages/sable/CONTRIBUTING.md`](packages/sable/CONTRIBUTING.md).

## Release

The package publishes to **npm** as `@sableui/react`, with provenance.

1. Bump `packages/sable/package.json` and `SABLE_UI_VERSION` in `packages/sable/src/index.ts`, rename the changelog's `## Unreleased` heading to the new version, and run `pnpm build` to regenerate the catalog.
2. Run the checks and merge the release PR into `main`.
3. From a clean checkout at `origin/main`, run `pnpm release`. It validates the checkout, creates the version tag, and pushes it.
4. The **Release** GitHub Action checks the tag matches the version, builds, tests the packed consumer, and publishes to npm with provenance. Confirm the action succeeds before asking apps to upgrade.

Maintainers preparing the public repository export: see "Public release" in
[CONTRIBUTING.md](packages/sable/CONTRIBUTING.md).

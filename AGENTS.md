# AGENTS.md

This is the **Sable** workspace. The published library is `packages/sable` → **`@sableui/react`** on npm. `apps/docs` is the living catalog.

## To DESIGN with Sable

Use the package-owned [Sable skill](./packages/sable/skills/sable/SKILL.md) for
`$sable build <idea>`, `inspire <references>`, `audit <target>`, `polish <target>`,
and `fix <target>`. `create` is a build alias; `fix` is the short path for one scoped defect. Build starts from the user's product brief and an
optional preset; inspiration develops a reusable preset; audit reviews existing
work. All builds must retrieve and compose the installed Sable components,
utilities, patterns, and semantic tokens, then lint and inspect the real result.
Codex/Cursor discover the shared entry in `.agents/skills/sable`; Claude Code
uses `.claude/skills/sable`. Entries load the same package instructions.
See [building with Sable](./packages/sable/llms/tasks/building-with-sable.md).

## To CONSUME `@sableui/react` in another project

The structured, machine-readable install recipe is the **`consume` block in [`packages/sable/registry.json`](./packages/sable/registry.json)** — read that first.

Quick version:

1. **Install:** `pnpm add @sableui/react`.
2. **Wire it up:** `pnpm exec sable init` from the app root (never bare `npx sable` before the install — that fetches an unrelated package). It installs what is missing (React, Tailwind and its build plugin), puts the CSS imports in order, adds React dedupe and the Tailwind plugin, loads Figtree + DM Mono, mounts `IconProvider` in a Vite starter, installs the agent skill, then runs `sable doctor`. What it can't change safely — a Next.js layout, an unfamiliar config — it prints as a snippet with the file it belongs in. `--dry-run` previews every change; an app that is already wired uses `sable doctor --fix`.

What `init` does, for doing it by hand or checking its work: dedupe React in the bundler; `@import "tailwindcss";` then `@import "@sableui/react/styles.css";` then an `@source` glob over the package's `dist`; load Figtree + DM Mono; wrap the app once in `<IconProvider set={reiconIconSet}>` (`reiconIconSet` from `@sableui/react/icons/reicon`, or your own set — required: without a provider icons render nothing), optionally in `<MotionProvider>`; toggle the `dark` class on `<html>` for dark-by-default.

Full walkthrough: [`packages/sable/README.md`](./packages/sable/README.md). The installed package's own `AGENTS.md` / `registry.json` describe the same steps.

## To CONTRIBUTE to the library

Read **[`packages/sable/CONTRIBUTING.md`](./packages/sable/CONTRIBUTING.md)** — the six hard rules, how to add a component, and the theme / icon / motion contracts. Building *with* Sable is [`packages/sable/AGENTS.md`](./packages/sable/AGENTS.md). The design rationale is [`packages/sable/DESIGN.md`](./packages/sable/DESIGN.md).

**The docs site is a consumer, and it dogfoods.** `apps/docs` (sableui.com) follows the consumer rules in `packages/sable/AGENTS.md` — rule 0 above all: compose from Sable components, never rebuild one. `pnpm design-lint` lints it with `sable-lint` exactly as a consumer app is linted. If the docs need something Sable doesn't ship, that is a library gap: add the component to the package, then use it — don't hand-build it in the app.

It consumes Sable two ways (logic in `scripts/sable-consumer.mjs`, wired by `apps/docs/scripts/sable-mode.mjs`): **`dev` runs on the package's `src`** for the edit loop, and **`build` (`pnpm docs:build`) consumes the built `dist` exactly as a user does** — imports resolved through `publishConfig.exports` (an unpublished subpath fails the build), types checked against the shipped `.d.ts`, CSS and `@source` wired as the README says. Build the package first (`pnpm build`); CI and release already do.

# Task: build an idea with Sable

Start with the product the user wants: a portfolio, shop, booking service, app,
or another concrete task. A preset supplies visual decisions; the brief supplies
content, information architecture, and behavior. Inspiration is optional.

## One workflow

1. Install and wire Sable using [getting-started.md](./getting-started.md).
   `sable init` connects the package-owned skill; in an app wired by hand, run
   `pnpm exec sable setup --agent`.
2. Choose a bundled preset, customize one in Canvas, or use `inspire` to develop
   an original preset from references. See [creating-a-preset.md](./creating-a-preset.md).
   Starting directly from an idea is equally valid.
3. Put a downloaded preset in `.sable/presets/<id>.json` in the target project.
   Ask the agent to build your idea using that exact file. Read
   [using-presets.md](./using-presets.md) for validation, CSS, and fonts.
4. Build from Sable's installed components, patterns, utilities, and tokens.
   Inspect and operate the real result, then repair observed problems.

Examples in Codex:

```text
$sable build a portfolio for a furniture designer
$sable inspire these references into a warm, compact shop preset
$sable build a ceramics shop using .sable/presets/clay.json
$sable audit our checkout and report prioritized findings
$sable polish our checkout and repair the reported issues
$sable fix the settings dialog's footer buttons
```

Claude Code and Cursor use `/sable` with the same modes. `create` is a `build`
alias. These are agent instructions; the shell CLI serves catalog resources and
validates records. Other agents can read the package's `skills/sable/SKILL.md`.

`inspire` produces a preset and component preview. `audit` evaluates an existing
interface and reports by default. `fix` repairs one scoped defect: it reads only the
contracts the change touches and finishes with `sable check` on the changed files
and a look at the affected state, escalating to `polish` when the change grows. A reference URL does not request a cloned site.
Develop alternative rendered directions when requested or when a consequential
choice needs comparison. A three-design comparison is not a mandatory build step.

## Required library use

Read the installed package's `AGENTS.md` and `registry.json` consume block. Search
for each recognizable element with `sable search "<need>" --json`; inspect the
matching `component <Name> --props` and `--examples` before implementation.
Use Sable's composed anatomy and supported variants. A hand-built button, field,
menu, dialog, table, or card that imitates a shipped component violates the contract.
That binds behaviour and parts, not layouts. Search a part by its plain name and
its role before writing a class or component for it (`sable search breadcrumb`,
`sable search "top bar"`); exported parts such as `PropertyRow` and `WorkspaceBar`
are listed by name, and `sable component <Part>` answers with their entry. When a
part's look or size disagrees with the design, use its variant or prop, or report
the missing variant; never rebuild it. `sable icon <name>` says whether an icon
exists. Results marked ◇ (patterns, blocks,
and compositions such as MediaTile) are references: use one when its layout fits
the brief, otherwise compose your own from Sable's parts. The brief's signature
surfaces, where the product's identity lives, are designed from its direction.

Resolve styling through component variants, documented utilities/recipes, then
semantic tokens. App-owned CSS handles uncovered content and composition; it
does not replace component appearance or behavior. Inspect a relevant pattern's
skeleton; compose an original layout if its structure does not fit the brief.
Read [choosing-a-component.md](./choosing-a-component.md) and
[designing-a-surface.md](./designing-a-surface.md).

For a real library gap, record the unsuccessful search and missing capability.
In the Sable repository, add the capability to the package under `CONTRIBUTING.md`
before consuming it. In another project, report the gap and preserve the package;
implement genuinely app-specific structure without creating parallel controls.

## Finish the working product

Run `sable check <source paths>` (doctor, lint and grade) and the project's
build/type checks. Answer each Rebuilt parts note in the reuse inventory, and fix
a colour-modes warning: app colours live in a preset with both modes, and a
`ThemeSwitcher` under `SableThemeProvider` lets the user review each. Inspect desktop/mobile layouts, operate the primary task and recovery
path, and check keyboard focus, fonts, reduced motion, and meaningful states.
Use [reviewing-a-design.md](./reviewing-a-design.md),
[reviewing-a-journey.md](./reviewing-a-journey.md), and
[reviewing-motion.md](./reviewing-motion.md) as applicable.

Passing static checks does not establish visual quality. Review composition,
hierarchy, rhythm, imagery, and brief fit in the actual product. Deliver the
working result, preset/revision used, checks, and any material limitations.
Include a reuse inventory: imported Sable components and parts, retrieved token
groups/utilities, and the reason for each app-owned UI/CSS addition. Inspect source
ownership; valid classes on a hand-built control still violate the contract.

## When nobody types /sable

A skill loads only when a request names it or the agent decides it fits. Setup
therefore writes a short managed block into `AGENTS.md` (Codex, Cursor) and
`CLAUDE.md` (Claude Code), the files an agent reads on every task, so a plain
"add a pricing page" still goes through the skill. Only the text between its
`<!-- sable:begin -->` and `<!-- sable:end -->` markers is Sable's.

## Move an existing app onto Sable

`sable check` reports adoption: how many UI files compose Sable, and which
app-built components do by hand what a Sable component already does. It is never
a failure. When adoption is low, show the user the swaps and what each gains,
ask once, then move them a screen at a time with `polish`. "Move this app onto
Sable" is never a `build`. [auditing-an-app.md](./auditing-an-app.md) has the
full guide.

## Commands, the Stop hook and MCP

- The CLI that ships with the package answers every lookup offline at the
  installed version: `pnpm exec sable manifest` lists the commands; `init`,
  `upgrade`, `doctor`, `check`, `lint`, `grade`, `search`, `component`, `docs`,
  `sources`, `patch`, `preset` and `setup` are the ones a project meets first.
- In Claude Code, `pnpm exec sable setup --agent --hook` adds a Stop hook that
  runs `sable check` before a task can end; `sable init` offers it in a terminal.
- `pnpm exec sable upgrade` updates the package and refreshes the skill entries
  and the instructions block together.
- Before the package is installed, the hosted MCP server at
  `https://www.sableui.com/api/mcp` answers the same lookups through `search`,
  `get` and `docs`. Once Sable is installed, use the CLI.

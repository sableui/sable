# Task: building a page (page register)

Marketing, docs, settings, a feed, a dashboard — anything whose primary
interaction is reading and navigating. This is the default register; if you are
building an editor or a canvas app, see
[building-a-tool.md](./building-a-tool.md).

## Start from the brief, then choose composition

Read [designing-a-surface.md](./designing-a-surface.md) for the user's outcome,
content, visual direction, story, interaction, and adaptation. Retrieve relevant
lessons with `sable learn --search "<context>"`.

`sable pattern --list` offers complete canonical compositions with imports.
Inspect a matching skeleton and reuse it when its information architecture fits.
For an original page, compose layout primitives and semantic HTML around the
brief. Patterns encode useful defaults; they do not define the space of good
designs. Record the reason for the chosen composition.

## Layout, in the order it matters

```tsx
<AppShell header={<AppHeader title="…" />} sidebar={<Sidebar>…</Sidebar>}>
  <Region max="content">          {/* width capped BY ROLE, never globally */}
    <PageHeader title="Invoices" description="…" actions={<Button>Export</Button>} />
    <Stack gap={3}>                {/* gap counts 8px rhythm units, not pixels */}
      …
    </Stack>
  </Region>
</AppShell>
```

- **Never a global `max-width`.** Width is capped per region by role:
  `prose` / `form` / `feed` / `content` / `wide` / `full`. A form region is narrow
  because a 700px text input is harder to use, not more generous.
- **Measure ≠ width.** Cap prose line length in `ch` (`--measure-prose`)
  independently of the region's layout width.
- **The 12-column grid lives *inside* a region**, for genuinely multi-column
  content. A column span is not a page width.
- **Chrome is off the grid.** `Sidebar` and rails are fixed-width, outside the
  content grid.

## Typography: pick the tier by ROLE, not by size

| tier | for | not |
|---|---|---|
| `text-display-*` | a hero, one per view at most | page titles — that is `heading-1` |
| `text-heading-1..4` | the document outline; pick by depth | size — if it belongs in a table of contents it is a heading |
| `text-title-*` | a *component's* title: card, dialog, panel section | a heading tier — a card title is not part of the page outline |
| `text-body-*` | prose you read a sentence of | labels |
| `text-label-*` | field labels, column headers, button text | body at the same size |
| `text-caption` | metadata *beneath* something | `text-overline`, which sits *above* and categorises |

Always the paired utility. Never `text-sm font-medium` — CI rejects it.

## Colour: role, not appearance

`accent`, `secondary` and `muted` are near-identical in most themes and are
chosen by what the surface *does*:

- `muted` — recessed and inert (a well, a disabled field, a zebra stripe)
- `secondary` — a control fill (something you can press)
- `accent` — a transient state (hover, selected, current)

Pick by appearance and it works in the Sable theme and breaks in Meridian. Every token's
intent, and what it gets confused with, is in
`llms/reference/token-intent.md`.

Ink is never chosen independently of its surface: `bg-card text-card-foreground`,
as a pair.

## The traps

- **A `Card` is a container, not a heading or a landmark.** If its title is the
  only heading in the region, render a real heading element.
- **One `h1` per route** — `PageHeader` renders it. A second breaks the outline a
  screen-reader user navigates by.
- **`AppHeader` is app chrome; `PageHeader` is content.** Route-specific actions
  in `AppHeader` persist onto routes where they mean nothing.
- **Tone is never the only signal.** Pair a tone with an icon or text; colour
  alone fails for colour-blind users.

## Verify

```bash
npx sable-lint            # lints ./src; pass dirs to change (npx sable-lint app components)
```

`sable-lint` ships with the package and reads the token vocabulary from the
`registry.json` of the version you installed, so it checks your app against your
exact tokens. It exits 1 on any violation. `--rules` explains each one; `--ignore
'<glob>'` skips a data/fixture layer, where a hex value is content rather than a
style. A rare, genuine exception takes an auditable
`// design-lint-disable-next-line <ruleId> -- <reason>`.

Then your own `tsc` and tests. (`pnpm design-lint && pnpm build:registry &&
pnpm test:run` are the *in-repo* gates — they only run inside the Sable repo.)

Then inspect the rendered page on desktop and mobile, operate its primary flow,
use the keyboard, and check reduced motion. Follow
[reviewing-a-design.md](./reviewing-a-design.md) for evidence and repair. Passing
source checks alone says nothing about hierarchy, story, or the resulting polish.

## Read next

- `sable pattern --list` — the current compositions
- `registry.json → layoutPrimitives` — full contracts plus the layout doctrine
- `DESIGN.md` — spacing, dimensions, shape, elevation, layering, motion
- `llms/reference/token-intent.md`

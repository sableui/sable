# Task: adding a component to Sable

Contributing *to the library*, not consuming it. Every step below is enforced by
`pnpm build:registry` or `pnpm design-lint` — the checks are the specification,
so run them early rather than at the end.

## The files

```
src/components/<kebab-name>/
  <kebab-name>.tsx        the component
  <kebab-name>.meta.ts    the machine-readable contract  ← the important one
  <kebab-name>.test.tsx   behaviour, not snapshots
  index.ts                named exports + the meta
```

Then: export from `src/index.ts` (the single public barrel), file it in
`src/lib/taxonomy.ts`, and add `apps/docs/src/pages/components/<Name>Page.tsx`
plus its route in `apps/docs/src/App.tsx`.

## The meta is the deliverable

`registry.json` is generated from it, and that catalog is what every agent reads.
A component whose meta is thin is a component nobody can use correctly.

Enforced minima — the build fails below them:

- `usage.description` — why it exists and when to reach for it
- **≥1 `do`, ≥2 `dont`, ≥2 examples, ≥2 a11y notes, ≥1 related component**
- every prop described; `props` holds the ROOT's props only (a capitalised entry
  that is not the root is a subcomponent hiding in `props`)
- a component with `subcomponents` must show the composed JSX in an example
- examples must be **complete and copy-pasteable** — no `…` elisions, no phantom
  components, only on-contract `<Icon name>` values
- `tokensUsed` entries must exist in the token contract

A second `dont` must name a **different** failure, not restate the first. The
highest-value guidance answers *which of these near-identical components do I
actually want* — AppHeader vs PageHeader, Code vs CodeBlock (`prompt` for a
command), Meter vs Progress.

## Declare how it moves

`meta.motion` answers four questions, one entry per slot. Fill the ones that
apply and **decline the rest explicitly** — `recipe: "none"` with a `why`. Use
`recipe: "custom"` when a rAF loop or canvas fills the slot and no CSS utility
could (ThinkingOrb draws a point cloud per frame).

| slot | the question |
|---|---|
| `arrival` | how does it enter, or does it belong to a layout that already staged it? |
| `response` | what happens under the pointer? |
| `transition` | how does it move between its own states? |
| `activity` | what does it do while working, indeterminately? |

The `why` states what the motion is *for* — what a reader would misread without
it. `"motion-pop on the panel"` restates the recipe and teaches nothing; *"the
transform-origin follows the anchor, so on a form with several selects in a
column the origin is the only thing identifying which field the open list belongs
to"* is the sentence worth writing, because it also tells the next person when
**not** to copy it.

This exists because every other motion rule is prohibitive — `raw-duration`,
`builtin-animate`, `unknown-motion` all fire on motion that is present and wrong,
and none of them can fire on motion that is absent. A component with no motion at
all used to clear the entire contract, which is exactly what gets written when
nobody is asked for it by name. `pnpm build:registry -- --motion-report` shows
current coverage; `static-interactive` catches the element-level half in lint.

## Taxonomy: two orthogonal axes

`src/lib/taxonomy.ts` declares a **group** (role) and a **register**
(`page` / `workspace` / `either`). Keep them separate: a register-based *group*
was tried and made every workspace form control have two valid homes. Group by
KIND, not by co-occurrence — the `related` graph tracks composition as much as
kinship, and grouping by it measurably made cohesion worse.

Guidance lives in the component's own meta. `lib/component-guidance.ts` is for
the 13 layout primitives only; a component in both places fails the build,
because the meta wins *whole* and silently discards the other.

## The hard rules

1. **Semantic tokens only** — never hex/oklch, never a raw palette step.
2. **Paired typography utilities** — never `text-{size}` + `font-{weight}`.
3. **`primitives/` is behaviour, `components/` is the public API.** Base UI is
   wrapped and re-exported; consumers import only from the root barrel.
4. **No icon library in the package.** `<Icon name>` resolves through the
   injected provider. Two narrow amendments exist (`src/icon-sets/`, and
   size-matched structural marks) — read them before assuming you qualify.
5. **Tailwind v4 packaging discipline** — `src/styles.css` must not
   `@import "tailwindcss"`.

## Two failure modes that do not announce themselves

- **A custom `text-*` utility unregistered in `lib/cn.ts`** lands in
  tailwind-merge's *colour* group and silently evicts the real colour class. This
  shipped white text on a white button. Register the tier, or do not name it
  `text-*`. The same applies to `bg-*`.
- **An unmapped icon name renders nothing** — no error, no warning.

## Verify

```bash
pnpm typecheck && pnpm design-lint && pnpm build:registry && pnpm test:run
pnpm build:registry -- --doc-report      # guidance depth, weakest entries first
pnpm build:registry -- --motion-report   # motion slots: filled, declined, absent
```

## Read next

- `CONTRIBUTING.md` — the hard rules, the recipe, theme + icon + motion contracts
- `DESIGN.md` — the system spec, with intent and do/don't per layer

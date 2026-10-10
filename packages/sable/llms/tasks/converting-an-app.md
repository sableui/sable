# Task: converting an existing app to Sable

Migrating a React app that has its own styles. The order below front-loads the
decisions that invalidate later work if you get them wrong.

## 0. Classify every surface first

Before touching a component, **list the routes and assign a register to each** —
see fork 1 in `llms.txt`. Do not decide once for the app. Every conversion so far
has applied a single register throughout and been wrong somewhere: the tell is a
route with arrow-key or bracket-key bindings (triage), or one that never scrolls,
sitting in a page-register app.

Converting a tool with page-register instincts produces something that passes
every lint and still looks wrong. The measurable tells that a surface was built
with page instincts but is actually a tool:

| tell | page register | you are probably a tool |
|---|---|---|
| dominant control height | 40–44px | should be 32 (24 in dense chrome) |
| dominant radius | 8–16px, some pills | ~5px, **no pills in chrome** |
| dominant UI type | 14px / 600 | 10–12px at 450–550 |
| panel grouping | `Card` | `PanelSection` + hairlines |

Measure these in the running app before deciding — `getComputedStyle` over every
button and text node takes a minute and settles the argument.

## 1. Wire the package

Follow **Consuming** in `llms.txt`: `.npmrc`, `pnpm add`, React dedupe, the CSS
import order, `@source`, fonts, providers. React dedupe is the one that fails
loudest and least clearly ("invalid hook call").

## 2. Delete your own tokens

The most reliable signal that a conversion is real: the app's own CSS variable
block shrinks to almost nothing. Anything that remains should be *domain* colour,
not UI colour.

Grep for orphaned references afterwards. A CSS variable that no longer exists
resolves to nothing and the declaration is dropped — **silently**. A checkerboard
built on two renamed variables rendered as blank for four releases before anyone
noticed.

## 3. Replace the shell, then the chrome, then the leaves

Shell first (`AppShell` or `Workspace`), because it establishes the density scope
and the landmarks. Then panels/headers. Leaf components last — they are the
easiest and the least consequential.

Expect the shell swap to delete more code than it adds. If it does not, you are
probably keeping a layout that Sable would have given you.

## 4. Icons

**Reicon works by default.** No icon provider is needed. To use another icon
package, map Sable's semantic names in an app-owned IconSet and mount it through
IconProvider. To add domain-specific names while retaining Reicon:

```tsx
import { IconProvider, composeIconSets, reiconIconSet } from "@sableui/react"
<IconProvider set={composeIconSets(appExtras, reiconIconSet)} />
```

Keep only the names Sable's contract does not carry and let everything else fall
through. First set to return non-null wins.

**A set must return `null` to fall through — not a placeholder.** This is the trap
both hand-copied adapters fell into, and it is silent in the worst way: ending
your renderer with `{node ?? <circle cx="12" cy="12" r="9" />}` means an unknown
name draws a grey dot, so a typo, an off-contract name and a real icon all look
like something rendered. Return `null` and the next set gets a turn; miss every
set and you see nothing, which is at least visibly wrong.

Verify the adapter rather than trusting it — nothing in Sable can see it, and
`sable-lint` does not check it:

```tsx
// Every contract name resolves, and an unknown one returns null.
const names = registry.iconContract.names   // registry.json
names.filter((n) => !mySet.render({ name: n }))          // → must be []
mySet.render({ name: "definitely-not-an-icon" })         // → must be null
```

Do not hand-copy a name→component mapping. Every app that did ended up with a
drifted copy.

## 5. Verify by measuring, not by looking

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

Then in the browser, check the things a screenshot cannot show:

- every left edge in a hierarchy panel resolves to the rail or an exact multiple
- control heights match the ladder for the register you chose
- `--panel`, `--canvas` etc. resolve to real values, not empty
- **the fonts actually loaded.** `--font-*` resolving is not evidence: the token
  names a family, and if the host never fetched it the browser silently falls back
  to `system-ui` while every token check passes. One app rendered in the wrong
  typeface for its entire life this way, and the documented checks all passed on
  it. The theme names the family; **the host loads it.** Ask the font system, not
  the cascade:

  ```js
  // In the browser console. Both must be true.
  document.fonts.check("1em Figtree")     // the theme's sans
  document.fonts.check("1em DM Mono")     // the theme's mono
  ```

  If either is false, add the `@font-face`/link the theme expects — see the theme's
  entry in `registry.json → themes` for the families it assumes.
- a converted colour renders the same bytes as before — compare notations through
  one canvas readback, never against a constant, because the readback itself has
  an offset

## Known-good example

Glitch (an image-compositing tool) converted in one pass: `globals.css` went
229 → 49 lines, its local `components/workspace/` was deleted entirely, and the
layers panel lost 174 lines by adopting `Tree`.

## Read next

- [building-a-tool.md](./building-a-tool.md) or
  [building-a-page.md](./building-a-page.md)
- `DESIGN.md → Registers`
- `llms/reference/token-intent.md`

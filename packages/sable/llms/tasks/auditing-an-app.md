# Task: auditing existing work against Sable

This is Sable's native contract-and-taste audit, used by `$sable audit <target>`.
`$sable critique <target>` emphasizes design judgment. These are agent skill
modes, not shell subcommands. No other design skill is required.

## Establish the comparison basis

Identify source paths, rendered routes, installed Sable version, audience, primary
task, selected identity and supported device/color modes. Reuse the existing brief;
label assumptions. For a whole app, inventory routes and shared controls, inspect
each distinct layout and critical journey, and state which routes were sampled.
Audit the installed version using its registry, AGENTS.md and DESIGN.md. Library
contribution rules do not all apply to consumers: original themes, fonts, layouts
and native elements are not automatically violations.

An audit reports findings by default. An explicit "audit and fix" request already
authorizes scoped repairs and verification. Do not automatically upgrade packages,
migrate the app, change its identity, generate variants or alter CI for a review.
Resolve the project's installed CLI before using `npx`; in this repository use
`node packages/sable/bin/sable.mjs`. Below, `sable` means that resolved CLI.

Inspect the interface before reading previous verdicts. Follow
[reviewing-a-design.md](./reviewing-a-design.md) for desktop/mobile, full-route,
keyboard, interaction and motion evidence. A screenshot-only critique leaves code
and live behavior untested. Compare three layers explicitly:

| Layer | Evidence and judgment |
|---|---|
| System contract | Component props/anatomy/states, semantic tokens, layout primitives, pattern intent, icons, motion and accessibility behavior. |
| Taste and craft | Brief fit, hierarchy, typography, spacing/rhythm, color/material, imagery, story, interaction, motion and mobile composition. |
| Learned context | Applicable human preferences, separately identified agent observations, conditional lessons and comparable previous builds. |

If the project keeps a visual atlas, retrieve a close analogue and a useful
contrast through `sable atlas --search "<audience and design problem>" --contrast
--limit 3 --json`. Open useful entries
with `sable atlas --show <id> --json` and actually inspect their images. Explain
which relationships transfer; resemblance to Sable's default theme is not the goal.
Use `sable prefer --search "<decision>" --scope project:<project-id> --json` in an
applicable scope and `sable learn --search "<problem>" --json`. Agent preferences
require explicit `--reviewer agent` retrieval and agent attribution. Empty memory
is valid. When prior builds matter, inspect their actual captures for repeated
compositions and range; state when comparison evidence is absent.

Inventory imported Sable components, locally recreated controls, native elements,
consumer tokens and repeated overrides. Query the installed catalog before
recommending a replacement. Check the API, composed anatomy, supported states,
keyboard/focus behavior, semantic token roles and motion policy. Explain which
behavior a replacement gains and what must remain. An unused page pattern is not
drift; repeated overrides can indicate a missing system hook rather than app misuse.
Run relevant `sable doctor`, `sable lint <paths> --json` and `sable grade <paths>
--json` checks. Lint is lexical; source grades and pattern similarity do not judge
taste. Deliberately static motion slots remain valid with appropriate feedback.
Lint's `label-contrast` measures an app's overrides of the brand fills (`--primary`,
`--sidebar-primary`, `--highlight`) and status fills (`--destructive`, `--success`,
`--tone-warning`, `--tone-info`) against their labels on top of the installed theme, and
names the nearest pair that reads. Report it with that pair as a recommendation.
A reasoned `design-lint-disable-next-line label-contrast` is the app's recorded
choice: list it as intentional, not as a defect.

## Adoption: an app wired for Sable that barely uses it

The commonest drift is not a wrong prop. It is an app where an agent never
loaded this skill: the stylesheet and tokens are wired, and every control is the
app's own (a `Modal`, a `PrimaryButton`, a `Tabs` written from scratch). Wiring
checks pass, and lint only sees the raw elements. `sable check` (and `sable
grade --json` → `adoption`) measures it: how many UI files compose Sable, which
app-defined components are named for something Sable ships and do the behaviour
by hand, and what the app's foundation is. `sable doctor` warns when adoption is
`none` or `low`. It is never a failure: whether working screens move is the
user's call.

Put the choice to the user before changing anything. Ask, don't migrate silently
and don't leave it unmentioned. Show the swaps, behaviour first (overlays,
controls, tabs, menus, anything with focus or keyboard handling), with what each
one gains ("your Modal has no focus trap or Esc; Sable's Dialog has both").
Layout and look stay the app's. How strongly to recommend it depends on the
`foundation` the report names:

| Foundation | What to say |
|---|---|
| `ad-hoc`: no system besides Sable | Recommend the move plainly. There is nothing to preserve but one-off components, and every one is a behaviour bug waiting. Offer to do it a screen at a time. |
| `own`: a folder of the app's own primitives | Offer the swaps and say what each gains. Keep the app's own where the user prefers them; suggest building them on Sable's behaviour (a `Button` wrapper around Sable's `Button`) instead. |
| `library`: another component library (MUI, Radix, shadcn-style `components/ui`) | Ask whether Sable should replace it or only cover new work. Don't mix two control libraries on one screen. |
| `sable`: Sable already carries the UI | Mention the few swaps listed when those screens are next touched. |

Use the question tool the host offers when there is one. Record the answer in
the project's instructions, so the next task doesn't ask again. On a yes, move
one screen or component at a time with `fix`/`polish`, running `sable check` and
looking at the rendered states after each.

## Deliver evidence-backed findings

Save the audit under `design/<surface>/audit/` or the existing review location.
Record source/version, routes/states inspected, commands, reference/memory IDs and
untested areas. Use the source/artifact binding and review template described in
[reviewing-a-design.md](./reviewing-a-design.md) for structured review records.

For each finding, record location, observed consequence, severity, evidence,
comparison basis, concrete repair, owner (app or Sable) and verification method.
Distinguish **contract violation**, **taste/craft issue**, **intentional choice**
and **Sable system gap**. Separate objective failures from agent judgments and
suspected gaps from verified library defects. Keep component/token findings
separate from visual quality; report the eight review dimensions as `pass`,
`revise` or `untested`, never a fabricated premium score. Retain what already works.

For authorized fixes, repair observed issues, run relevant checks and recapture
affected states. Preserve before/after evidence and resolved/remaining findings.
Use [reviewing-a-journey.md](./reviewing-a-journey.md) for connected flows and
[reviewing-motion.md](./reviewing-motion.md) for temporal behavior. Save useful
conditional lessons through [learning-from-builds.md](./learning-from-builds.md).
Completing an audit supplies no human preference and does not authorize inventing
or automatically saving one.

## Additional checks after an upgrade

An app converted to Sable is correct against the contract *as it stood on the day
it was converted*. The contract keeps moving — new rules, new components,
deprecations, new doctrine — and none of that reaches an app that merely has the
package installed. This is the pass that closes the gap.

Use the following drift checks after an actual upgrade, or when the user asks to
compare versions. For an audit-only request, report suggested changes rather than
performing the fixes or CI edits illustrated below.

## The failure this prevents

Enforcement travels with the package: `sable-lint` reads the token vocabulary and
rule table out of the `registry.json` of the version you installed, so upgrading
Sable silently widens what counts as a violation. That is the design — it means a
new rule reaches every app without anyone republishing a checklist — but it has a
predictable failure mode. An app upgrades, CI goes red, the findings are a mix of
brand-new requirements and drift that has been sitting there for months, nobody
can tell which is which, and the team pins the version. A pinned version is a
contract that stopped applying.

So audit in the order below: **find out what changed, then measure, then fix.**

## 0. Know what moved before you look at your code

```bash
npx sable-lint --since 0.54.2      # the version you were on
```

`--since` lists only the rules added after that version, with the reason each
exists. Everything else `sable-lint` reports is pre-existing drift — still worth
fixing, but it is not what the upgrade did to you, and separating the two is what
keeps the upgrade reviewable.

For changes that are not lint rules, diff the catalog:

```bash
# Components that gained a deprecation, and what replaced them.
node -e "const r=require('@sableui/react/registry.json');
  r.components.filter(c=>c.status==='deprecated')
   .forEach(c=>console.log(c.name,'→',c.supersededBy))"
```

Deprecation is structured, not prose — `status: "deprecated"` always carries
`supersededBy`, and the build refuses a deprecation without a forward path. Grep
your app for each name on the left.

## 1. Run the linter, and read the new rules first

```bash
npx sable-lint                      # ./src by default
npx sable-lint app components       # or pass your dirs
```

Fix the `--since` rules first: those are the ones your reviewers have not seen
before, and they are the ones with a fresh rationale worth reading. A genuine
exception takes an auditable
`// design-lint-disable-next-line <ruleId> -- <reason>`; a reasonless disable is
itself a violation.

## 2. Motion — the part the linter can only half-see

`static-interactive` (new in 0.55.0) is the first **prescriptive** rule in the
system. Every other motion rule fires on motion that is present and wrong;
none of them could ever fire on motion that is *absent*, so an app that simply
snaps between every state passed the entire contract. Most apps converted before
0.55.0 will have findings here, and they are real: they are the places the
interface has no reaction.

The linter catches static interactive **elements**. It cannot see the three
motion slots that are about a component's behaviour over time, so check those by
hand, per surface:

| slot | ask | usual fix |
|---|---|---|
| arrival | does new content appear, or cut in? | `motion-fade`, `motion-slide-*`, `motion-pop`, `Reveal` |
| response | does anything happen under the pointer? | `motion-interactive`, `motion-press` |
| transition | does it move between its own states, or teleport? | `motion-disclosure`, or ease the transform |
| activity | can you tell "working" from "frozen"? | `motion-spin`, `motion-pulse`, `motion-shimmer` |

Sable's own components declare their slots — the `## Motion` section of each
entry in `llms/components/` says which slots are filled, which were *declined*,
and why. Read the declined ones too: "this does not animate, and here is the
reason" is what stops you adding motion somewhere it was ruled out.

Anything you compose by hand owns its own slots. The question is not "should this
animate" but "which of the four does this need, and what fills them".

## 3. Hand-rolled components that Sable now ships

The most valuable finding in an audit is usually a deletion. Search for the
shapes that tend to get built locally before the library has them, then check the
catalog:

```bash
grep -rEl "role=\"(dialog|listbox|tablist|menu)\"|aria-expanded" src/ | head -40
```

Every conversion so far has deleted more than it added at this step. One tool's
layers panel lost 174 lines by adopting `Tree`; its whole local
`components/workspace/` directory went away.

## 4. Review the rendered product

Contract drift is only one part of an audit. A valid token can still be used in
the wrong hierarchy; a page full of correct cards can still obscure the task.
Follow [reviewing-a-design.md](./reviewing-a-design.md) across purpose/story,
typography, spacing, color/material, interaction, motion, responsive behavior,
and accessibility. Compare against the surface brief, not the default theme.
Inspect actual desktop/mobile states and record repairs with before/after evidence.
Capture a reusable finding through [learning-from-builds.md](./learning-from-builds.md).

## 5. Make the contract audit a gate

An audit you have to remember to run is an audit that happens once. Two lines:

```jsonc
// package.json
"scripts": { "lint:design": "sable-lint src" }
```

```yaml
# CI, alongside tsc and tests
- run: pnpm lint:design
```

With that in place the loop closes itself: the dependency bot opens the Sable
upgrade PR, the new rules ship inside it, CI fails on that PR rather than three
weeks later, and the diff that introduced the requirement is the diff that has to
satisfy it. That is the only arrangement where "we should audit the apps" stops
being a thing anyone has to say.

## Read next

- [converting-an-app.md](./converting-an-app.md) — the first-pass migration
- [building-a-page.md](./building-a-page.md) ·
  [building-a-tool.md](./building-a-tool.md)
- `DESIGN.md → Motion`

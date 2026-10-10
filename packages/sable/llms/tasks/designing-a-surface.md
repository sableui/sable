# Task: designing a surface with Sable

Tokens make decisions consistent; they do not decide what deserves attention.
Start with the user's task and content, then choose a visual direction. Sable's
default Base identity is a starting point. A consumer can be light-first,
photographic, editorial, playful, or quiet while retaining semantic tokens,
accessible behavior, and a coherent interaction policy.

## 1. Write a short surface brief

Save the brief in the app, for example `design/<surface>/brief.md`. Record:

| Decision | Make it concrete |
|---|---|
| User and outcome | Who is here, what they need to understand or do, and the primary action. |
| Mode | Persuade, operate, read, or experience. This describes the job, not density. |
| Register | Page or workspace, with a reason based on scrolling and task behavior. |
| Content truth | Real or clearly labeled fictional data; required copy; available assets; unverified claims excluded. |
| Direction | Two or three properties expressed as visible choices: e.g. broad image fields, compact captions, low chroma surfaces. |
| Story | For each section: the user's question, the evidence or task it supplies, and what follows. |
| Hierarchy and rhythm | Focal element, type contrast, prose measure, alignment anchors, and section spacing relationships. |
| Color and material | Surface/ink pairs, where accent carries meaning, imagery treatment, supported color modes. |
| Interaction | Primary flow plus loading, empty, error, success, disabled, keyboard, and touch behavior. |
| Motion | Purpose, trigger, driver, timing, interruption, and reduced-motion result; include deliberate static decisions. |
| Adaptation | What stacks, moves, hides with an equivalent route, or becomes scrollable on narrow screens. |
| Review | Target routes, states, widths, and the uncertainty the proof build must resolve. |

For small changes, record only decisions that change. When the user requests
alternatives or competing directions materially affect the brief, compare bounded
rendered studies using [developing-taste.md](./developing-taste.md).
Keep a user-pinned identity fixed. Do not create decorative variation just to
satisfy a checklist.

## 2. Retrieve applicable lessons and contracts

```bash
npx sable atlas --search "editorial hierarchy" --contrast --limit 3 --json   # the project's atlas, if any
npx sable prefer --search "hierarchy" --scope project:<project-id> --json
npx sable learn --search "editorial hierarchy" --json
npx sable pattern --list
npx sable pattern LandingPage --skeleton
npx sable component Button --props
```

Read each lesson's `appliesWhen`, `avoidWhen`, and provenance. State what transfers
and what does not. A precedent is evidence for a decision in a context, not an
instruction to reproduce an entire aesthetic. If no lesson fits, proceed from the
brief and gather fresh evidence.

Use `sable atlas --show <id> --json` to retrieve full annotations and absolute
capture paths, then view the images. Retrieve only preferences matching the
project, brand, person, or task context. Scope and the present brief take priority
over how often a reference or preference was used in the past.

## 3. Choose composition before components

Patterns are useful starting points when their information architecture matches.
An original composition is equally valid. Use layout primitives and semantic HTML
for bespoke pages; record why a shell does or does not fit. The closest pattern's
similarity score describes reuse and cannot establish quality.

Establish the major regions with real text and assets before decorating details.

Record the ownership boundary: Sable behavior components and semantic tokens,
app-owned composition and assets, and any native controls or custom behavior.
Using Sable does not require every element to be a library component. Prefer its
public component APIs and token hooks for repeated control styling. If repeated
`!important` rules are necessary to change a control's type, spacing or shape,
identify the missing hook rather than claiming the app is fully system-driven.
Keep one-off editorial layout decisions local; propose a shared API only when
multiple real consumers need the same capability.

Use uniform rows for equivalent records, readable measure for prose, larger space
for the primary artifact, and deliberate density changes where the story changes.
A palette swap on a canonical landing page does not test a new composition.

Choose type size, weight, line-height, container width, and copy together. Select
HTML heading levels by document structure and visual tiers by hierarchy. A large
heading does not become semantically deeper because it needs smaller type.

When images, illustration, video, or fonts carry the message, use
[creating-design-assets.md](./creating-design-assets.md). Plan concrete subjects,
treatments, sources, responsive crops, and delivery budgets, then produce and
inspect the assets in the layout. A mood label or generation prompt alone is not
a finished asset; keep unresolved placeholders explicit in the review record.

## 4. Make the intended behavior real

Use Sable for behavior that it already owns. Custom interactive elements need
clear feedback, accessible names, focus visibility, and a complete action. A
successful demo must show a real result, such as changed data or a confirmation
with context. Do not leave visible primary actions inert.

Use motion to explain change or establish a deliberate reading cadence. Keep
frequent actions quick. Initial content may remain static. Avoid adding a reveal
to every section by habit. Any bespoke animation must honor reduced motion and
Sable's policy; core primitives cannot control an unrelated animation driver.

For connected routes, use [reviewing-a-journey.md](./reviewing-a-journey.md) to
plan carried state, shared visual decisions, and recovery. For meaningful motion,
use [reviewing-motion.md](./reviewing-motion.md) to define and capture temporal
behavior. These extend the work when relevant; a small static surface does not
need a manufactured journey or animation.

## 5. Inspect, repair, and record

Run the consumer's typecheck, tests relevant to behavior, and `sable-lint`. Then
follow [reviewing-a-design.md](./reviewing-a-design.md): inspect desktop and mobile,
exercise the primary flow and keyboard behavior, and test reduced motion. Fix
observed failures and recapture affected states. End only when the agreed work is
complete or the remaining limitation is explicitly recorded.

Distill a useful discovery through
[learning-from-builds.md](./learning-from-builds.md). Good builds may teach no new
rule. Do not claim timelessness or premium quality from a passing lexical score.

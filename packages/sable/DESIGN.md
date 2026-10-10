# Sable — Design System Spec

The system-level design spec for **Sable**, an owned, themeable component system. This document is **theme-agnostic**: it describes the structure, tokens, and rules that every theme inherits. The **default theme is "Base"** (a dark-by-default, content-first, fluid product aesthetic); its concrete values live in `src/themes/base/`. Other themes supply their own values for the same token contract.

For building with Sable see `AGENTS.md`; for changing the package see `CONTRIBUTING.md`. For the machine-readable catalog see `registry.json` / `llms.txt`.

## Principles

1. **Own the surface, theme the values.** Components reference semantic roles, not colors. Swapping a theme re-skins everything without touching a component.
2. **Content over chrome.** The UI recedes so content advances. Restraint over decoration.
3. **Constraint is generative.** A small set of tokens, tiers, and primitives yields a large space of good UIs. Reach for what exists before inventing.
4. **A deliberate visual world.** Base starts dark. A consuming product chooses its modes, typography, shape, and art direction from its brief; the token contract travels across those choices.
5. **Accessible by construction.** Base UI carries behavior/ARIA; semantic token pairs are pre-checked to WCAG AA.
6. **AI-native.** The system is documented for machines as well as people (`registry.json`, per-component `*.meta.ts`).

## Guardrails and design judgment

An inspected visual atlas supplies contextual examples; it does not prescribe a
house style. `sable atlas` retrieves attributed captures and transfer principles.
For substantial new work, `sable explore` makes three rendered directions
reviewable with their factual brief and primary flow held constant. `sable prefer`
stores an explicit human or agent judgment in an applicable scope; it never
silently promotes one preference into a universal rule. A validator checks the
evidence contract. A reviewer still has to see and operate the result. Read
`sable docs developing-taste` for the linked workflow.

The semantic contract protects meaning, behavior, and consistency. It does not
choose the story, visual hierarchy, imagery, or composition for every product.
Statements about Base's accent, shape, and dark-first identity describe the
default theme; consumers can choose a different art direction while preserving
semantic roles and accessibility. A palette change alone is not a new design.

Before a new surface, write a brief for the user's outcome, content, mode, register,
hierarchy, rhythm, color/material, behavior, motion, and narrow-screen adaptation.
Use a canonical pattern when it fits the information architecture. Original
composition from layout primitives is equally valid. Select the semantic heading
level by document structure and its paired typography utility by visual role.

Judge rendered results against the brief. Inspect desktop and mobile, complete
the primary flow, use the keyboard, and test reduced motion and supported color
modes. Record specific defects with before/after artifacts. Source lint and
pattern similarity cannot establish whether hierarchy, timing, story, or polish
works. `sable grade --review` validates review evidence; it does not replace eyes.

`sable learn` retrieves curated precedents and project-owned lessons with explicit
applicability, avoidance, and provenance. Keep a new observation provisional until
it transfers to another context. Read `sable docs designing-a-surface`,
`reviewing-a-design`, and `learning-from-builds` for the complete workflow.

## The token layers

Three layers, outermost is what components use:

| Layer | Example | Who uses it |
|---|---|---|
| **Palette** (theme-internal) | `--purple-heart-700`, `--zinc-950` | Only the theme CSS. Never components. |
| **Semantic** (the contract) | `--primary`, `--card`, `--muted-foreground`, `--tone-edition`, `--ring` | **Components** (via `bg-*`/`text-*` utilities). |
| **Component** (local) | a cva variant string | Inside one component. |

`themes/_contract.ts` enumerates the semantic tokens every theme must define. The default (Base) palette is authored in **OKLCH** for perceptually-uniform ramps, locked hue, gamut-safe chroma, and dark-mode vibrancy.

### Semantic tokens (the contract)

Surfaces & text: `background`, `foreground`, `card`, `card-foreground`, `popover`, `popover-foreground`, `muted`, `muted-foreground`, `border`, `input`, `ring`.
Actions: `primary`, `primary-foreground`, `secondary`, `secondary-foreground`, `accent`, `accent-foreground`, `destructive`, `destructive-foreground`, `success`, `success-foreground`. (`success` is the positive-state counterpart to `destructive` — a **flat** semantic token backed by caribbean-green; it is deliberately separate from the `tone-standard` post-type, and there is no `tone-success`.)
Tones (semantic, carry meaning): `tone-standard`, `tone-collectible`, `tone-edition`, `tone-info`, `tone-warning`, `highlight`.
Tone ink (legible text/icon on a tone fill, theme-adaptive): `tone-standard-foreground`, `tone-collectible-foreground`, `tone-edition-foreground`, `tone-info-foreground`, `tone-warning-foreground`, `highlight-foreground`.
Overlay (fixed dark surface over content — scrims, media letterbox, pills on imagery): `overlay`, `overlay-foreground`.
Sidebar set: `sidebar`, `sidebar-foreground`, `sidebar-primary(-foreground)`, `sidebar-accent(-foreground)`, `sidebar-border`, `sidebar-ring`.

**Base inversion rule:** in dark mode `primary` is light (a near-white pill); in light mode it is near-black. Other themes may use a different action palette. Never call `primary` "black" or `primary-foreground` "white" — use the semantic pair, whose values belong to the theme.

### Tone system

Tones encode meaning, not decoration. Choose item categories for your product:
- `tone-standard` — the default item category.
- `tone-collectible` — a distinct item or collection category.
- `tone-edition` — a limited edition or premium category.
Plus `tone-info`, `tone-warning`, and `highlight` (selection). Dark mode uses dedicated, higher-chroma values so tones stay vivid on a near-black canvas. Text/icons ON a tone fill use the matching `tone-*-foreground` ink — a theme-adaptive intent token that flips lightness with the fill (light ink over the dark 600/700 fills in light mode; dark ink over the lighter dark-tuned fills in dark mode). A component never names a palette step for this; there is no longer a "media-overlay palette exception."

**Status-tone vocabulary.** Every status-signaling component (StatusDot, Badge with `dot`, Note, Banner, InlineStatus, EmptyState) takes one canonical severity set on its `tone` prop: **`neutral` · `info` · `success` · `warning` · `destructive`** — exported as `STATUS_TONES` / `StatusTone`, with one icon per tone in `STATUS_TONE_ICON`. There is no `error` alias anywhere: use `destructive`. A state label (live, failed, draft) is `<Badge appearance="plain" tone="…" dot>`; map domain states (`ready`, `building`, `failed`, …) to tones once in the app. Consumers can therefore feed one app-level tone straight into any of these components without a translation shim; new status-flavored components must accept the canonical five (`tone-vocabulary.test.ts` holds this).

## Registers

Sable has **two registers**. Almost everything above and below is shared — the token
layer, the semantic vocabulary, the accessibility floor, the motion policy — but a
handful of values and two outright rules differ, and picking the wrong register is the
single most common way a surface comes out looking wrong while passing every lint.

**Classify the surface before you build it.**

| | **Page register** (default) | **Workspace register** |
|---|---|---|
| The unit | a document | a fixed viewport |
| Viewport | the document scrolls | the shell owns `100dvh`; only regions scroll |
| Width | opt-in `Region` cap | edge-to-edge; panels are fixed-width chrome outside the grid |
| Controls | `md` = 40px | 24 / 28 / 32 / 36, default **32** |
| Type | 14–16px, weights 400/600 | **10–12px, weights 450–550** (`text-ui-*`) |
| Spacing | 4 base / 8 rhythm | 2 base, 6 is a real step |
| Grouping | `Card` | `PanelSection` + hairlines |
| Shell | `AppShell` | `Workspace` |

Reach for the workspace register when the primary interaction is *operating on something*
— an editor, a canvas app, a console. Reach for the page register when it's *reading and
navigating*. A dashboard that scrolls is a page with dense content, not a workspace.

### The mechanism: one density ladder

Nothing in a component hardcodes a height. Every sized control reads `--control-*`, and a
density scope redefines the ladder:

```
                    comfortable    compact
--control-xs           28px          24px   ← icon buttons, numeric fields
--control-sm           32px          28px
--control-md           40px          32px   ← the default control
--control-cta          44px          36px
--control-lg           48px          40px
```

**Type retunes with it — including in your own markup.** The ladder above only covers
heights, because `--control-*` is a custom property. Typography is a set of *paired
utilities*, so `text-body-md` and `text-ui-md` are different classes and nothing about a
density scope changed which one was rendered. That asymmetry is the single most common
way a workspace comes out looking wrong: the box shrinks to 32px and the text stays at
15px, and every form reads oversized. It was reported exactly that way from a consuming
app, after being fixed locally three times (menus 0.44.2, the conversation set 0.48.0)
without ever being generalised.

So inside `[data-density="compact"]` the page-register type utilities are **redefined**
onto the workspace scale — the same idea as the control ladder, applied to the half that
was never automatic. Two properties make it safe:

- **It only ever compresses.** Every value is `min(page, workspace)`. The page tiers are
  `rem` and the workspace tiers are absolute px, so on a 14px-root app `text-label-md`
  is 10.5px and would otherwise *grow* to 12px inside a tool panel — a denser register
  rendering larger text than the page beside it.
- **Weight moves onto the workspace scale too**, not just size. Otherwise a compact panel
  carries 600 labels from raw utilities beside 500 labels from components using
  `useTypeTier()` — one nominal tier rendering two weights in one panel.

This is also the only half of the problem a component sweep can reach: `<p
class="text-body-md">` written in a consuming app is the same bug in code this package
does not own. Sable's own components still ask for a tier explicitly via `useTypeTier()`
where intent matters — a chat bubble is prose (400), an input is a control (500), and
both are `text-body-md` on a page. `lib/register-type.test.ts` fails the build if a new
paired tier ships without its compact counterpart.

`<Workspace>` sets `data-density="compact"` for its whole subtree; a `Dialog` opened from
inside it resets to comfortable, because a modal is a page-register surface even when it
was launched from a tool. This is why the register is a *scope* rather than a set of
variants — it composes, and it needs no selector overriding a height after the fact.
`design-lint`'s `raw-control-height` rule keeps it honest.

**Which portaled surfaces follow the register.** CSS cannot cross a portal, so every
popup opts in through React context (`useAnchoredDensity` / `useTypeTier`, see
`lib/density.tsx`). The split is by *what the surface is for*, not by how it is built:

| Follows the register | Always page register |
|---|---|
| Menu, ContextMenu, Popover, Tooltip, Select, Combobox, **CommandMenu** | Dialog (including fullscreen), Sheet |

Chrome is summoned *from* a surface, acts *on* it, and is read at a glance while the work
stays visible — so it belongs to the register that summoned it. A task surface takes the
screen for one job, usually holds prose, and gains nothing from density because nothing is
competing for the space.

**`CommandMenu` is the exception that proves the rule needed writing down.** It is *built
on* Dialog, so until 0.44.2 it inherited "modal ⇒ page register" by construction — and a
command palette is the opposite of a task surface: it is the fastest way to do anything in
the tool, and it was the one surface in a tool that did not look like the tool. Being built
on Dialog is an implementation detail; what a surface is *for* decides its register. A
consumer who wants a compact dialog can wrap its content in `<Density value="compact">`.

### Tree geometry, and the invariant

The ladder also carries the geometry of a hierarchy panel, because a layer list is the
other shape (with the property grid) that every tool has, and its **left edges** are the
part that most visibly goes wrong:

```
                    comfortable    compact
--tree-rail            12px           8px   ← headers and depth-0 rows
--tree-column          20px          18px   ← the disclosure and type columns
--tree-indent          20px          18px   ← one level of nesting
```

A row is `[rail][disclosure][type][name ……][actions]`, and there is exactly one rule:

> **`--tree-indent` must equal `--tree-column`.**

When the step is *smaller* than the column, a child's content lands to the **left** of
where its parent's content starts, so the nesting reads **inverted** — the tree appears to
outdent as it descends. That shipped (a 14px step against a 16px column) and read as
"the effects are indented the other way", which is a precise description of the symptom
and gives no hint of the cause. `themes.test.ts` now asserts the equality in both
densities, and the `Tree` docs page ships a switch that reproduces the broken state,
because seeing it is more convincing than reading this paragraph.

Everything that needs a tree inset — rows, section headers, add affordances, empty states —
reads `treeIndent(depth)`, which returns a `calc()` over these tokens rather than a number.
Nothing computes pixels. The original defect was four different left edges in one panel
(rows at 4, headers at 8, a 14px step, affordances at 18) precisely because four different
places each picked their own.

**Tree owns its disclosure and add marks**, which is a narrow exception to keeping glyphs
out of components — see rule #4 in `CONTRIBUTING.md`. The reason is arithmetic, not taste:
general icon sets author on a 24-unit grid, and Reicon's documented 12/18/24/32 are *render
sizes*, not per-size geometry (`createIcon` hardcodes `viewBox="0 0 24 24"`; `size` only
sets width/height). At the ~18px a tree row wants, those strokes land off the device-pixel
grid and the mark goes soft. Because that is a property of the **size**, no icon set and no
choice of name can fix it — so the component carries geometry cut for the size it renders
at. Both marks are overridable per row. The *type* icon is still the consumer's, and the
same warning applies to it.

### Where the numbers came from

Measured in-page from the **Figma** and **Paper** editors (2026-07-26), then cross-checked
against Framer 3.0 — not estimated:

| | Figma | Paper |
|---|---|---|
| Panel width | 241 / 241 | 240 / 281 |
| Control heights | **32** (34×), 24 (18×) | **24** (30×), 36 (10×) |
| Radius | **5px** (42×) | **5px** (30×) |
| Chrome type | 11/400 lh16 · 11/550 · 9/450 | 12/500 lh16 · 12/400 · 12/465 |
| Gaps | 8, 4, **1px** (11×), 2 | 8, **6**, 12, 4, 2 |
| Surfaces | 255 → 245 | 249 → 242 → 238 |
| Borders | 1px, #E6E6E6 | 1px, #E2E2E2 |

### Two rules this register deliberately reverses

These are the interesting part, and the reason the register needs writing down rather than
being left to taste. Both are stated elsewhere in this document as rules; in the workspace
register they are inverted, on purpose:

1. **"Actions are always `full` (pill)."** Neither reference tool has a single pill in its
   chrome — both use one ~5px radius on essentially everything. The "tight container /
   round action" contrast that signals *this is a control* in the page register is carried
   here by surface and hairline instead. A theme flattens buttons via `--button-radius`
   without changing what `rounded-full` means for avatars, dots and badges.
2. **"Prefer a tonal step or space over a divider line."** Paper's entire panel ladder
   spans 249 → 242 → 238 — three to seven RGB units — and delegates *all* structural
   separation to a 1px low-contrast hairline. Tool chrome lives in a compressed tonal band
   where hairlines carry structure. Reaching for a bigger tonal jump to separate two
   regions is the wrong instinct here.

### Surfaces

`canvas` is the work surface — **not** `background`, because the thing being edited is not
the page behind the UI. `panel` / `panel-raised` are docked chrome in that compressed band;
`hairline` / `hairline-strong` are the structural edge. All of them are *derived* from each
theme's own semantic tokens (see `styles.css`), so a theme inherits a coherent workspace
band for free and only declares a `--theme-*` override where it wants to tune.

### Components

`Workspace` (+ `WorkspaceBar`, `WorkspaceCanvas`) · `PanelGroup` (+ `Panel`,
`PanelResizer`, `usePanelWidth`) · `PanelSection` (+ `PropertyRow`, `PropertyPair`) ·
`ScrubField` · `StatusBar`. `SplitPane` stays a page-register primitive: it switches
between side-by-side and stacked at a breakpoint and cannot be resized, which is a
different job from a docked panel.

### Anti-patterns specific to this register

- A `Card` inside a panel. In a 240px panel a card spends its border and inset on nothing
  and pushes every row inward — the strongest single tell that a panel was built with
  page-register instincts.
- A `Region` cap or page `py` rhythm inside a `Workspace`.
- A slider **and** a scrub glyph on the same property row: the slider already *is* the drag
  affordance, so that's the same gesture offered twice.
- Missing `min-h-0` on a panel's ancestors. A grid/flex child refuses to shrink below its
  content, so `overflow-y-auto` never activates and panels grow instead of scrolling —
  the reason a tool shell ends up with no scroll containers at all.
- A custom `text-*` utility. Anything not registered in `lib/cn.ts`'s `ds-typography` group
  lands in tailwind-merge's **colour** group and silently evicts the real colour class.

## Typography

Typography belongs to the whole surface. In addition to the display/heading
contract, optional `TYPE_REFINEMENT_TOKENS` let a theme tune body, label, caption,
mono, title sizes, and the largest display size while components keep using paired
utilities. Retrieve their names and intent with `sable token typographyOverrides`.
Review the loaded font, measure, and wrapping together with those values.

Six tiers; every utility bundles size + weight + line-height + tracking — **compose with color/margin only**, never decompose.

Pick a tier by **role + intent**, not by eyeballing a size. The six families and *when to reach for each* (this is the part agents get wrong — the semantic name isn't enough):

| Family | Role & intent | Reach for it | Avoid it for |
|---|---|---|---|
| **Display** `display-lg…4xl` | Type as **image** — oversized, very tight leading/tracking. A marketing voice, not a UI one. | Landing/hero headlines, splash screens, big campaign numbers. Weight 700–800. | Anything inside product UI or app chrome; more than one per view. |
| **Heading** `heading-1…4` | The **document outline** — semantic `h1`–`h4`. Hierarchy *and* accessibility ride here. | `heading-1` = the page title (**exactly one per route**); `-2` major section; `-3` subsection; `-4` card-group / sub-subsection. Weight 600. | Repeating component titles (use **Title**); jumping a level to get a size — keep the order, restyle with a tier. |
| **Title** `title-lg` · `title-sm` | Names a **UI primitive** without claiming a document heading. Weight 600. | Card / dialog / sheet titles, popover headers, list-row titles (`-lg`); dense rows, compact cards, table-section titles (`-sm`). | Page/section structure (use **Heading**); reading copy. |
| **Body** `body-lg/md/sm/xs` | **Reading** text — weight 400, open leading, near-zero tracking. | Lede / intro paragraph (`-lg`); the default paragraph + descriptions + help text (`-md`); secondary copy, dense table cells (`-sm`); the dense floor — operator consoles, dense data cells, wrapping metadata (`-xs`, same size as `caption` but with body leading for multi-line text). | Buttons / labels / chips (use **Label**); long lines past the `--measure-prose` cap; long-form reading at `-xs`. |
| **Label** `label-lg/md/sm` · `caption` | **Functional, scannable** UI text — weight 600 (caption 400), tracked for short strings. | Button text, field labels, tabs (`-lg`); badges, chips, table headers, compact buttons (`-md`); fine meta (`-sm`); timestamps / footnotes / image captions (`caption`). | Sentences and paragraphs — it's tuned for 1–3 words, not prose. |
| **Eyebrow** `label-xs` | An **auto-uppercase, letter-spaced kicker** (a Label variant). Editorial only. | A marketing section kicker, at most one per view. | Anything in product chrome: nav and menu group labels, table headers, page headers, form sections — those are sentence-case `caption` or `label-md`. Tracked capitals spread across a UI read as shouting. |
| **Mono** `mono-xl` · `mono-lg` · `mono-md` · `mono-caption` · `mono-sm` | **Technical / tabular** — the theme mono family, always tabular figures. | KPI/metric values where the number IS the content — stat cards, prominent counts (`-xl`); secondary metrics (`-lg`); code, IDs, hashes, wallet addresses, on-chain data, and numbers that must align in tables/ledgers (`-md`); the same at caption size for dense data surfaces (`mono-caption` — never recompose `font-mono text-caption`); tiny tracked mono chrome like kbd hints (`-sm`). | Prose or labels. Never a heading tier for a big number — metrics are mono, headings are semantic. |

Every utility bundles **size + weight + line-height + tracking** — compose with color/margin only, **never decompose** into `text-* + font-* + tracking-*`.

Default theme families: **Figtree** (sans) + **DM Mono** (mono). Two weights per screen max (400 body / 600 heading; mono 400 the rare third). Sizes are rem against the browser's 16px root — the package never sets `html { font-size }`, so a user's browser text-size preference scales the whole ramp. The ramp is roughly a 1.2 minor third.

**The rules as data:** `src/foundations/typography.ts` → `sable docs typography`. It holds the everyday set of eight tiers, the rules, and the no-gos, and the docs page renders the same object.

**Scale & intent.** The ramp is a ~1.2 (minor-third) ratio, tuned tight: as size grows, line-height *shrinks* and negative tracking *grows* (display sits at 0.9–1.05 leading with −0.05…−0.03em tracking; body opens to 1.5–1.6 with near-zero tracking) — big type reads as **shape**, body as **texture**. Pick a tier by **role, not pixel size**: a card title is `title-*` even when it renders at the same size as a `body-lg`, because role fixes weight (600 vs 400) and rhythm. Hierarchy is carried by **tier + weight + space**, not size alone — two adjacent sizes a step apart read as one level, so separate levels by a clear jump (heading → title → body), and lean on weight and spacing before reaching for a bigger size.

**Usage.** One `heading-1` per route (the page h1); never skip heading *levels* to get a size — keep the semantic order and restyle with a tier. Cap reading text at `--measure-prose` (≈65ch); past ~75ch the eye loses the line return. Set type color with a semantic token (`text-foreground` / `text-muted-foreground`) — `muted-foreground` for secondary/supporting copy, full `foreground` for primary. Numerals that must align (tables, data, money) use the mono tiers (tabular figures). **Don't** decompose a tier into `text-* + font-* + tracking-*`, stack two display sizes, set reading paragraphs below `body-sm` (12px `body-xs` is a dense-UI floor, not a prose size), justify text, or use a heading tier for non-heading emphasis (use weight/color).

## Spacing

One scale, built on a **4px base** with an **8px rhythm**. Every margin, padding, and gap is a step on it — never a hand-picked px value — so vertical and horizontal rhythm stay locked together system-wide. Spacing, not borders, is the primary tool for grouping: **related things sit closer than unrelated things** (proximity does the work a divider line otherwise would).

**The scale** (Tailwind's spacing utilities; the steps Sable actually leans on):
`0` · `0.5` 2 (hairline / optical nudge) · `1` 4 · `1.5` 6 · `2` 8 (**the base rhythm unit**) · `3` 12 · `4` 16 (default control padding / gap) · `5` 20 · `6` 24 (group separation) · `8` 32 · `10` 40 · `12` 48 (sub-sections) · `16` 64 · `24` 96 (major sections). Steps below `2` are for optical correction only.

**Space by role, not by eye:**
- **Inset** — padding *inside* a surface; `p-4` (16) is the default card inset, `px-3 py-2`–`py-2.5` a dense row.
- **Stack** — vertical gap *between* blocks, the dominant rhythm: tight within a group (`gap-1.5`–`gap-2`), looser between groups (`gap-4`–`gap-6`), generous between sections (`gap-12`+).
- **Inline** — horizontal gap between siblings (icon↔label, label↔control): `gap-2`–`gap-3`.
- **Density** — a compact surface drops one step (inset `p-3`, stack `gap-1.5`); a spacious one adds one. Move in whole steps, never a custom px.
- **On the scale, so density follows.** The docs' density ("Character") control and a consumer's override retune `--spacing`; every step and every `--spacing(n)` moves with it. A component's padding, gap or inset written as a literal (`p-[1.5rem]`, `padding: "12px"`) is the one measure that stays put. Even derived geometry sits on the scale: `popup-inset` floors at `--spacing(1)`, `sable-frame` pads `--spacing(4)`, Card's `--card-p` is `--spacing(6)` / `--spacing(4)`. Fixed units are for what must not scale (a 1px hairline, a ring width). *(CI-enforced in the package: `fixed-spacing`.)* Layout primitives follow too: `--rhythm-unit` is two spacing steps, so a `Stack`/`Row`/`Grid`/`Page` gap number moves with density like everything else.

**Don't** invent off-scale values (`p-[15px]`), simulate a `gap` with per-child margins, or hang layout spacing on a text node (put it on the container).

## Dimensions (sizing)

The same 4px scale governs **sizes**, so controls, icons, and avatars all land on one grid. Sizes are named by **role**; the canonical set:

- **Controls** — `sm` h-8 (32, compact / chips) · **`md` h-10 (40) — the default** (Input, Button, Select, the field row) · `lg` h-12 (48, prominent / touch-first) · `xl` h-14 (56, hero / mobile CTA).
- **Icons** — `xs` 14 · `sm` 16 · **`md` 20 — default UI glyph** · `lg` 24 · `xl` 32. Icons are em-sized with `text-{size}` (never type utilities) and inherit text color.
- **Avatars / media** — `sm` 24 · `md` 32 · `lg` 40 · `xl` 48, then up the scale (`size-16`, `size-24`).
- **Touch targets** — interactive elements clear **44×44px** (`size-11`, WCAG 2.5.5). A visually smaller control (a 32px icon button) keeps the 44px *hit* area via padding or hit-slop, not a bigger glyph. The `hit-target` utility is the sanctioned implementation: a centered 44px `::after`, so the hit area grows without the layout moving. Never on an `<input>` — replaced elements don't render pseudo-elements reliably; wrap it in a label instead.

**Borderless controls need roughly twice the clearance of bordered ones.** A bordered control declares where it ends; a borderless one has nothing but the gap to say so, and two ghost buttons 12px apart read as one wide target. Budget around 24px between adjacent borderless controls where 12px would be right for bordered ones.

**Align optically when geometric centering looks wrong.** A trailing icon makes symmetric padding look lopsided — take about 2px off the icon side (`padding-inline-end: 14px` against a `16px` start). A play triangle needs roughly `translateX(2px)` to sit centered in a circle, because its visual mass is left of its bounding box. Where the glyph itself is the problem, fix it in the SVG rather than papering over it with wrapper margin, or every consumer inherits the correction.

**Widths** are fluid (see Grid & layout); the only fixed caps are opt-in — `--measure-prose` (65ch reading column) and the named region caps. Control/field max-widths are set per context, never page-global.

**Don't** hardcode an off-scale height (`h-[37px]`), size icons with type utilities, or ship a sub-44px touch target without a padded hit area.

## Grid & layout (fluid-first, no global max-width)

Sable's layout foundation is deliberately fluid: **edge-to-edge, with a fluid page inset** rather than a centered fixed-width column. It keeps the surviving grid discipline — register every element to a column edge and an 8px (two spacing steps) vertical rhythm, cap the reading measure — while letting the canvas breathe across viewports and native shells.

**The doctrine — two roles, never conflated:**
1. **A page's width is a `Region`** — a centered, opt-in, purpose-named cap. Pick by ROLE, not size.
2. **The 12-column grid is used *within* a region** — for genuinely multi-column content (card grids, paired form fields, list-detail). Never use a column *span* as the page's reading width; that leaves the page uncapped and stretching on wide displays.
3. **Chrome is not on the grid.** The app `Sidebar` and any secondary rail are fixed-width chrome *outside* the content grid; the grid covers content, not rails. `GridOverlay` covers the content area, not the rails.
4. **Measure ≠ width.** Cap text line-length (`prose`, in `ch`) independently of a region's layout width — a 1280px dashboard can still hold a 65ch reading column.

**Layout tokens:**
- `--rhythm-unit: 8px` — the relaxed baseline; every vertical measure is a multiple.
- `--grid-columns: 12` — the proportioning resource; folds 12 → 6 → 4 → 2 → 1.
- `--grid-gutter: clamp(1rem, …, 1.5rem)` — column gap, fluid 16 → 24px.
- `--page-inset: clamp(16px, 4vw, 32px)` — fluid page margin; honors `env(safe-area-inset-*)`.

**Content-width scale** — opt-in per `Region` (`max="…"`), named by purpose (**not** page-global):

| `max` | Token | Width | Use |
|---|---|---|---|
| `prose` | `--measure-prose` | 65ch | long-form reading text (post body, descriptions, articles) |
| `form` | `--region-form` | 480px | narrow single-column forms, auth, dialogs |
| `feed` | `--region-feed` | 640px | single-column timeline / reading feed |
| `content` | `--region-content` | 896px | general content + settings/admin panes (some 2-up fields) |
| `wide` | `--region-wide` | 1280px | dashboards, tables, multi-column grids |
| `full` | `--region-full` | 1536px | full-bleed safety ceiling |

(`--region-ultrawide` 1800 is legacy; prefer `full`.)

**Primitives** (in `src/layout/`): `Region` (fluid page region: `inset`, opt-in `max` as a named region *or any CSS length*, per-edge `safeArea`) · `Page` (route shell — `Region` + a vertically-rhythmic `Stack`) · `Grid` (CSS Grid; explicit `cols` or `auto-fit minmax` so cells breathe) · `Columns`/`Col` (track + spans) · `Bleed` (escapes a capped/inset ancestor to the **content-area** edge, via container-query units, so it stops at a fixed sidebar) · `SplitPane` (responsive two-pane, side-by-side above a breakpoint, stacked below) · `Stack` (vertical rhythm) · `Row` (horizontal flex) · `Spacer` · `Center` (optional prose cap) · `AspectBox` (reserves space, no layout shift) · `SafeArea` · `GridOverlay` (structure visualizer for docs/dev).

`Columns count`, `Col span`/`start`, and `Grid cols` accept either a number **or a responsive breakpoint map** (`{ base, sm, md, lg, xl, "2xl" }`) — resolved mobile-first by the stylesheet, so a grid can thin to fewer columns on small screens without the consumer's Tailwind scanning a class.

Breakpoints are content-driven: sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536. Keep reading + focus order logical; survive 400% zoom.

## Shape & borders

**Radii.** Tight radii, pill actions, soft-square containers. `none` (media) · `xs` 4 · `sm` 8 (inputs) · `md` 12 (popovers/toasts) · `lg` 16 (cards/dialogs/sheets) · `xl` 20 (hero) · `full` (buttons, avatars, pills). Never mix radii within one component; actions are always `full` by default. Radius reads as **tone**: tighter corners feel precise/technical, fuller corners feel soft/friendly — Sable stays tight on containers and full on actions, so the contrast itself signals "this is a control." `Button`'s corner radius is theme-driven through a dedicated `--button-radius` var (falls back to full pill; see `button.variants.ts`) — a reference with a rectilinear shape language can flatten buttons without touching every other `rounded-full` use (avatars, pills, badges, dots) that should stay round.

**Concentric nesting.** When a rounded element sits inside another, keep the corners concentric: `inner = outer − inset` (the padding/gap between them), snapped to the ladder. A `md` (12) popup with a 4px inset → `sm` (8) items; Sable writes that pair as `popup-inset` + `rounded-popup-item` (and `popup-bleed` for a separator), so it stays concentric when the radius ladder or the density changes. The outer radius is always **≥** the inner. If the inset is ≥ the outer radius, the inner reads better squared, or step the container up a notch. The 4px ladder is built for this — every step differs by 4px, so common insets land on a real token. Prefer flattening over nesting (see "No nested cards"); a thin-bordered frame around a card with the *same* radius is the tell that the corners aren't concentric.

**Relative CSS primitives.** Sable's own `styles.css` defines `sable-*` custom variants for stable component states (`sable-highlighted`, `sable-selected`, `sable-open`, `sable-disabled`, `sable-invalid`), semantic surface helpers (`sable-surface`, `sable-surface-muted`, `sable-surface-popover`, `sable-surface-interactive`), and frame/radius helpers (`sable-frame`, `sable-frame-inner`, `rounded-concentric-*`). Use these when a component would otherwise repeat low-level data selectors or hand-calculate `outer radius - inset`. These recipes stay inside Sable's semantic token contract and do not introduce an external styling vocabulary. What each state variant matches: `sable-highlighted` = `[data-highlighted]`, `[data-active]`, `[data-active-item]`; `sable-selected` = `[data-selected]`, `[data-checked]`, `[aria-selected=true]`, `[aria-checked=true]`; `sable-open` = `[data-open]`, `[data-popup-open]`, `[data-panel-open]`, `[aria-expanded=true]`; `sable-disabled` = `:disabled`, `[disabled]`, `[data-disabled]`, `[aria-disabled=true]`; `sable-invalid` = `[aria-invalid=true]`, `[data-invalid]`. `sable-surface` sets background, text, edge and the derived hover/active colors from one semantic role, so a component picks the role and the nearby states are computed. Size a frame with `sable-frame-r-<radius>` and `sable-frame-p-<step>` (or `sable-frame-popover` for the popup recipe); `sable-frame-inner` then takes outer radius minus inset, clamped at zero. One-off nesting uses `rounded-concentric-md/1` = radius-md minus spacing-1.

**Borders.** The default edge is a hairline `border` (1px) in `--border`; reserve `border-2` for genuine emphasis (focus is a `ring-2`, not a thick border). A border marks an edge where a tonal step isn't enough — but prefer a tonal surface step or space over a divider line where you can; the flattest thing that reads is best. Floating surfaces (popover, menu, dropdown) use `--border-floating`, a translucent, slightly-brighter edge that holds against any background. One edge treatment per element — don't stack a border, a ring, and a shadow on the same boundary.

## Elevation

Sable is **flat by default** — depth is a step up the neutral surface ladder (`background` → `card` / `muted` → `popover`) plus a hairline border, *not* a drop shadow. Shadows are a **light-mode reinforcement** and a **transient-surface** cue, never decoration.

**Two mechanisms, split by mode:**
- **Dark mode** (the default) carries elevation with **tonal contrast + translucent borders** — a raised surface is a lighter zinc step with a faintly brighter edge. Shadows do little on a near-black canvas, so they barely register here.
- **Light mode** adds a **whisper-soft shadow** (3–5% opacity, `--shadow-sm`…`--shadow-xl`) to lift transient surfaces off the page where a tonal step alone is too quiet.

**The ladder maps to elevation roles, by *layer and transience* — not importance:**
- **0 — Resting:** page content, flat cards. No shadow; a hairline border if it needs an edge.
- **`shadow-sm` / `shadow`:** subtly raised — a hoverable/draggable card, a sticky header over scrolled content.
- **`shadow-md`:** surfaces that open *over* content — dropdowns, popovers, menus, selects.
- **`shadow-lg`:** focus-stealing surfaces with a scrim — dialogs, sheets, command menu.
- **`shadow-xl`:** the rare top-most floater — a toast stack, a hero card.

**Guidance.** Raise on **transience**: the more an element floats over content, the higher it sits. Don't elevate a *static* section to make it "stand out" — use a tonal surface step or space instead. **One shadow per surface** — never stack shadows or pair a heavy shadow with a heavy border. For modals the **scrim** (`overlay`) is the primary depth cue; the shadow is secondary. Elevation is a system of ~five steps, not a free dimension — pick the role, don't dial in a custom `box-shadow`.

## Layering (z-index)

A single ordered z-index scale, named so stacking is intentional rather than a bidding war of `z-[9999]`:
- `--z-sticky` (30) — sticky in-content chrome: table headers, sticky banners.
- `--z-nav` (40) — app chrome: `AppHeader`, `Sidebar`, `BottomNav`, status banners.
- `--z-overlay` (50) — portaled transient surfaces: dialog, sheet, popover, menu, select, tooltip.
- `--z-toast` (60) — toasts, above modals so a confirmation is never hidden.
- `--z-skip-link` (100) — the skip-to-content link, above everything.

Reference via `z-(--z-overlay)`, never a raw `z-[9999]`. Base UI overlays portal to the end of `<body>`, so **among themselves** they stack by DOM/open order — but they still carry `--z-overlay` so the whole layer clears the in-flow chrome (a popover must cover the sticky header). Don't give each overlay a bespoke z-index; the *layer* is what's ordered, not the individual surface.

**The scale is declared in `src/styles.css`, not in a theme.** Every preset inherits it. A theme may override an individual step; it may not be the only place a step exists. Portaled surfaces use `z-(--z-overlay)` to stay above page content.

## Scrolling

**A scrollbar is the affordance of last resort.** It is platform chrome that no theme controls, it costs a permanent gutter, and its default rendering is worse than anything else on the surface — on Windows it draws stepper arrows hard against the padding edge, which inside a rounded container poke out of the corner. Sable's position: prefer an affordance that carries information, and where a bar is genuinely the best answer, keep it quiet.

**Every scroll container declares a policy.** There is no third option, and CI enforces it in both places it can leak:

| | |
|---|---|
| `scrollbar-quiet` | A 4px thumb floating 2px off the edge in a 10px gutter, **invisible at rest**. Appears at 12% while the region is scrolling, hovered, or holds focus; 16% and 6px wide under the pointer; 20% while dragging. Fades out a beat after. The default for vertical scrolling. |
| `scrollbar-hidden` | No bar at all. Only when something else carries the affordance — and you should be able to name it. |

`design-lint`'s `unmanaged-overflow` rule fails the build on an `overflow-*-auto|scroll` utility with neither, and `build-registry` runs the same check over every example in `registry.json`. That second gate is the one that matters: the catalog is what agents copy, and it shipped `<Tree className="min-h-0 flex-1 overflow-y-auto">` for several releases — a contract teaching the exact thing the linter forbade in our own source.

**Vertical gets a bar; horizontal gets a carousel.** A vertical list needs position feedback — how far through a long transcript am I — and a thin bar is the only thing that gives it. A horizontal strip does not: what a reader needs there is "there is more this way", which an **edge fade says better than a 4px rail**, and which the rail obscures by adding chrome under the content. So `Scroller` draws a bar on its vertical axis and none on its horizontal one, where its alpha-masked edges already do the work. Reach for the same split in anything strip-shaped: media rows, chip rows, tab overflow.

**A horizontal region must be operable without a horizontal input.** Hiding the bar removed the last non-drag affordance on that axis, and most mice have no horizontal wheel — so `Scroller` maps a vertical wheel to sideways movement, and is focusable with arrow / Home / End / PageUp / PageDown handling. Both are on by default; the wheel mapping is `wheelScroll`, the name is `label`. The four things that make a naive wheel mapping feel broken, all handled in `useWheelToHorizontal`: it **releases at both ends** so it never traps a reader scrolling the page, it **ignores trackpad `deltaX` gestures** (`|deltaX| > |deltaY|` means the browser is already doing it, and handling `deltaY` too double-scrolls a diagonal swipe), it **ignores `shift+wheel`** (already native), and it **normalises `deltaMode`** (mice report *lines*, so the raw value moves ~3px per notch). Keyboard focus is declared rather than inherited: Chrome 128+ and Firefox make scroll regions focusable on their own, Safari does not.

**Reveal is driven by scrolling, not by hover.** Hover is a decent proxy and a bad one for the cases that matter: a touch drag hovers nothing, and neither does a programmatic scroll — a chat auto-following a streamed reply, a jump-to-message, a restored read position — which are exactly the moments a reader needs to see where they now are. `useScrollActivity` sets `data-scrolling` on the element for ~600ms after each scroll event and `scrollbar-quiet` keys off it. Hover and `:focus-within` remain in the CSS as the no-JS baseline, so the bare utility still behaves for a consumer who never reaches for the hook. The fade honours `--motion-scale`, so reduced motion collapses it to an instant swap.

**Do not hide a bar to tidy something up.** `scrollbar-hidden` on a vertical region with no fade and no paging control leaves a reader with no sense of position and nothing to discover. If you cannot name the affordance replacing it, you want `scrollbar-quiet`.

## Motion

Motion is a first-class token layer, not an afterthought. **Subtle by default, with room for tasteful delight** — quick, deliberate, skippable, and never gaudy. The feel is restrained but alive, built compositor-first (opacity + transform only).

**Three parts:**

1. **Tokens** (`themes/base/base.css` → Motion tokens; contract in `themes/_contract.ts` → `MOTION_TOKENS`).
   - **Durations:** `instant` 75 · `fast` 150 · `base` 200 · `slow` 300 · `slower` 500, plus semantic `enter`/`exit`. Every duration is multiplied by `--motion-scale`.
   - **Easings:** `standard` (≈ease-in-out, default) · `decelerate` (≈ease-out, entrances) · `emphasized` (large surfaces) · `linear` (indeterminate loaders) · **`spring`** (gentle ~+4% single overshoot — the default for delightful pops) · **`bounce`** (~+10%, opt-in playful accents). Springs apply on **enter only**; exits stay overshoot-free.
   - Consume easings via the `ease-*` utilities; durations via `duration-(--motion-duration-*)` (so the kill-switch always applies).

2. **Recipes** (`styles.css`) — named, reusable behaviours a component opts into with one class instead of a bespoke transition string:
   - `motion-interactive` (hover/focus colour + transform transitions) · `motion-press` (tactile press settle) · `motion-fade` (scrims) · `motion-pop` (anchored/centred surfaces — gentle spring on open) · `motion-slide-{up,down,left,right}` (directional fade-slide) · `motion-disclosure` (height) · `motion-draw` (SVG line-art draw-on — a `pathLength="1"` path inside a `<Reveal>` draws in when scrolled into view; stagger siblings via `--motion-draw-delay`) · loaders `motion-spin`/`motion-pulse`/`motion-shimmer`/`motion-dot-bounce`. Enter/exit recipes drive off Base UI's `data-[starting-style]`/`data-[ending-style]`.

3. **Policy** — `prefers-reduced-motion` and `<MotionProvider>` collapse `--motion-scale` to 0 in one place: transitions resolve instantly, loaders hold their first frame. Motion is fully **toggleable on/off** in-app via `useMotion()`.

Richer physics (interruptible velocity-springs, FLIP layout, drag/gesture) is intentionally **out of core** — it's the future optional `@sableui/motion` adapter (peer-dep `motion`), reached for only when CSS genuinely can't express a surface.

## Icons

Pluggable adapter (see `CONTRIBUTING.md` → Icon contract). Components reference **semantic names**; the app injects a concrete set via `<IconProvider>`. Icons inherit text color (except post-type action buttons where tone is the point) and are sized with `text-{size}` scales, never type utilities.

## Components

Behavior comes from Base UI (`@base-ui/react`), wrapped inside each component's own folder in `components/`, which is the themed, public API. The catalog is about 100 components (`sable manifest` has the live count): the core set (Button, Badge, Card, Input, Select, Checkbox, Switch, Tabs, Tooltip, Popover, Menu, Dialog, Sheet, Table, Skeleton, Avatar, Toast, …), an **app-shell / navigation** family (`AppShell`, `Sidebar` — collapsible icon-rail via `collapsed` + `icons` + `useSidebar()` — `SideNav`, `BottomNav`, `AppHeader`, `PageHeader`), and a **form-and-data** tier (`Form` + `Field` for auto-wired, validation-library-agnostic forms; `DataTable` for sortable/selectable tables over `Table`; `NumberField`).

Each component's full prop/variant/token/a11y/example contract is in its `*.meta.ts` — the **source of truth**. `registry.json`'s `components[]` is **generated** from the metas by `scripts/build-registry.mjs` (carrying the full contract, not one-line summaries); `pnpm build` regenerates it and CI's `registry:check` fails on drift. Edit the meta, not the registry.

## Enforcement (docs are a suggestion; CI is a contract)

The rules above are not honor-system. **`design-lint`** (`scripts/design-lint.mjs`, run by `pnpm design-lint` and in CI) is a zero-dependency lexical linter over the package's own `src/` (minus `themes/`, where literal OKLCH lives, and `*.meta.ts`) that **fails the build** on the drift the rules forbid:

| Rule id | Catches |
|---|---|
| `inline-color` | inline `oklch()` / hex literals |
| `palette-ref` | raw palette-step refs (`--zinc-950`, `text-(--purple-heart-700)`) — **zero sanctioned exceptions** since the tone-foreground + overlay tokens landed |
| `raw-black-white` | `bg-black` / `text-white` etc. (use `overlay` / `overlay-foreground` or a semantic token) |
| `transition-colors` | bare `transition-colors` (use the `motion-interactive` recipe) |
| `transition-all` | `transition-all` / `transition: all` — it animates every property, including ones you never meant to move, and blocks the browser from optimizing. Name the properties, or use the recipe |
| `physical-direction` | physical direction utilities (`ml-*`, `pr-*`, `text-left`, `left-*`) where a logical property belongs, so RTL mirrors for free. **A ratchet**, not a gate: the grandfathered occurrences (seeded at 58, falling) are recorded per-file in `scripts/lint-baseline.json` and only an *increase* fails. Exempts genuinely physical geometry — safe-area/notch edges, transform-centering idioms, and `data-[side=…]` utilities the positioner already resolved. Package-scoped until the baseline reaches zero, so consumers never meet it |
| `builtin-animate` | Tailwind `animate-{spin,pulse,bounce,ping}` (bypass `--motion-scale`) |
| `raw-duration` | raw `duration-150` (use `duration-(--motion-duration-*)`) |
| `raw-control-height` | a control-ladder value hardcoded as a height (`h-[40px]`) instead of read from the ladder (`h-(--control-md)`) — deliberately narrow, so only the ladder's own values fire |
| `decomposed-type` | a bare `text-{size}` + `font-{weight}` (use a paired type utility) |
| `raw-z-index` | `z-50` / `z-[9999]` — name a step on the layering scale instead. Ignores `z-0`…`z-20`, which is local stacking inside one component's box; the scale starts at 30 so the two never overlap |
| `unmanaged-overflow` | an `overflow-*-auto\|scroll` utility with neither `scrollbar-quiet` nor `scrollbar-hidden` — a scroll container with no policy gets the platform's, arrows and all. Checked against the comment-stripped line, so doc comments discussing overflow don't fire. `build-registry` runs the same check over registry examples, which is where it actually leaked |
| `unknown-token` / `unknown-motion` | typo'd tone/overlay/motion tokens — validated against `themes/_contract.ts` (Tailwind silently no-ops a typo) |
| `self-import` | importing the package's own `@sableui/react` barrel from inside `src/` — deep-import the relative module instead |
| `icon-contract` | a hard-coded `<Icon name>` not declared in `registry.json → iconContract.names` (keeps the consumer-buildable icon set complete) |
| `version-sync` | `SABLE_UI_VERSION` (`src/index.ts`) **or** `registry.json`'s version ≠ `package.json` |
| `unknown-meta-token` | a `*.meta.ts` `tokensUsed` entry that isn't a real semantic token (component meta can't advertise a token that doesn't exist) |
| `component-restyle` | a look-changing class (`border*`, `bg-*`, `rounded*`, `ring-*`, `shadow-*`) on a `Button`, `Pill` or `Badge` — use a variant (Button `floating` / `on-color`, Pill `appearance`, Badge `appearance`/`tone`) or add one. Layout classes stay allowed |
| `destructive-item-ink` | `text-destructive` (or another tone ink) in a `MenuItem` / `ContextMenuItem` `className` — use `variant="destructive"`, which keeps the ink while highlighted |
| `table-edge-padding` | `pl-*` / `pr-*` / `ps-*` / `pe-*` on a `TableHead` / `TableCell` — use `<CardContent flush>`, which sets `--table-edge-px` to the card's padding |
| `popup-separator-bleed` | a fixed `-mx-*` on a separator (a `*Separator` part, or a `h-px` rule) — use `popup-bleed`, which bleeds by exactly `popup-inset` |
| `fixed-spacing` | (package only) a fixed `rem`/`px` padding, margin, gap or inset in a component (`p-[1.5rem]`, `px-[12px]`, `padding: "12px"`, `"--card-p": "1.5rem"`) — put it on the spacing scale so density moves it. Ignores hairlines (≤2px), em values and positional offsets |

A genuine, rare exception is allowed only through an **auditable** comment that *requires* a reason: `// design-lint-disable-next-line <ruleId> -- <why>` (also `-line` and block `disable`/`enable`). A disable with no reason is itself an error.

This is a deliberately scoped contract: `design-lint` enforces the package's own
source. Consumers opt into the shipped `sable-lint` command, which applies the
consumer rule subset and installed token vocabulary to their app. Both checks
protect implementation consistency; neither determines the consumer's art direction.

### Reviewing a change: read the deleted side

Every rule above fires on code that is *present and wrong*. None of them can fire on something a change **removed** — and the removals are where regressions live, because the after-state looks clean. A diff is not a surface: read the `-` lines.

```bash
git diff -U0 BASE...HEAD | grep -E '^-[^-]' | grep -E 'aria-|role=|alt=|focus|tabindex|prefers-'
```

| Removed | Why it matters |
|---|---|
| `aria-*`, `role=`, `alt=` | an accessible name or role disappeared; nothing renders differently |
| a semantic element replaced by `div` | keyboard behavior and landmark structure went with it |
| `:focus-visible`, `outline`, `tabindex` | the control is still reachable and no longer *looks* reachable |
| `prefers-reduced-motion` / a motion token | the kill-switch stopped reaching this animation |
| a color token swapped for a literal | the contrast gate can no longer see this value, and the theme can no longer retheme it |
| a user-facing string shortened or deleted | copy is contract too — an error that stopped saying how to fix it is a regression |

Not every removal is a regression; check for an **equivalent replacement** before flagging one. `aria-label` → `aria-labelledby` pointing at visible text is an upgrade. `role="button"` dropped because the element became a real `<button>` is the fix, not the bug.

**Blast radius: one hop by default, two for shared things.** Review the changed file plus its direct importers and callers. Expand to a second hop only for design tokens, theme values, and shared primitives — `_contract.ts`, `styles.css`, a layout primitive — where one line reaches the entire product.

## Anti-patterns

- Inline `oklch()`/hex or raw palette steps in components. *(CI-enforced: `inline-color`, `palette-ref`.)*
- Decomposing paired typography utilities. *(CI-enforced: `decomposed-type`.)*
- Pure `#000`/`#fff` (use `zinc-950`/`zinc-50`, or `overlay`/`overlay-foreground` for scrims). *(CI-enforced: `raw-black-white`.)*
- In Base, purple/brand for primary CTAs (brand = editions + selection only). A different theme chooses its action palette through the semantic pair.
- Gradient text, side-stripe borders, nested cards, mixed radii.
- Concrete icon-package imports scattered through components. Reicon supplies the default through the shared adapter; IconProvider allows replacement.
- A global page max-width (use opt-in region caps).
- Off-scale spacing or sizing (`p-[15px]`, `h-[37px]`) — snap to the 4px scale. In a component, a fixed `rem`/`px` padding or gap also escapes the density control. *(CI-enforced in the package: `fixed-spacing`.)*
- Restyling a library component with override classes to get a look it lacks (`<Button className="rounded-full bg-…">`, `<MenuItem className="text-destructive">`, `pl-6` on a table cell). Use or add a real variant. *(CI-enforced: `component-restyle`, `destructive-item-ink`, `table-edge-padding`.)*
- Single-column card content laid out with CSS grid — a grid track sizes to its widest min-content child, so one long string blows the card out. Use `flex flex-col` with a gap.
- A dot, bullet or icon attached to a line of type nudged into place with px (`mt-[3px]`). Put it in an `h-[1lh] items-center` box and size it in em.
- Raw `z-[9999]` or `z-50` — use the layering scale (`z-(--z-nav)`, `z-(--z-overlay)`). *(CI-enforced since 0.44.0: `raw-z-index`.)*
- Stacking shadows, pairing a heavy shadow with a heavy border, or elevating static content to "stand out" (use a tonal step or space).
- A sub-44px touch target without a padded hit area — including in the compact register, which retunes control *heights* and never the hit-area floor.
- Hardcoding a control height instead of reading the density ladder. *(CI-enforced: `raw-control-height`.)*
- `transition-all` — it watches every property, animates padding and shadows you never meant to move, and blocks the browser from optimizing. Name the properties, or use `motion-interactive`. *(CI-enforced: `transition-all`.)*
- Physical direction utilities (`ml-*`, `pr-*`, `text-left`) for direction-dependent position — use logical properties so RTL mirrors for free. *(CI-ratcheted: `physical-direction`.)*
- A decorative overlay painted across interactive content without `pointer-events-none` — the control looks live and does nothing.
- A fixed width sized to an English label, or a fixed height on a text container — translated strings run 30–50% longer and overflow it.
- A scroll container with no scrollbar policy — the platform then draws its own, arrows included. *(CI-enforced: `unmanaged-overflow`, in source **and** in registry examples.)* Related: putting a scrollbar under a horizontal strip, where an edge fade says the same thing without adding chrome; and hiding a vertical bar with `scrollbar-hidden` when nothing else carries the affordance, which leaves a reader no sense of position. See **Scrolling**.
- Building tool chrome with page-register instincts, or a reading surface with workspace ones — see **Registers** for the full split and the two rules it deliberately reverses.
- Hand-writing a left inset in a hierarchy panel instead of `treeIndent(depth)` — the fastest way to end up with several different left edges in one column. And an indent step that differs from `--tree-column` makes nesting read *inverted*. *(Test-enforced; see **Registers → Tree geometry**.)*
- Reaching for a general icon set below ~20px and expecting Figma-grade crispness. General sets author on a 24-unit grid and only scale — Reicon's 12/18/24/32 are render sizes, not per-size geometry — so their strokes land off the device-pixel grid at chrome sizes. Author the mark at the size it renders (rule #4, amendment 2).

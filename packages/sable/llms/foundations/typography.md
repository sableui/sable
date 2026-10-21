# Typography

Type is a closed vocabulary of paired utilities. Each one bundles size, weight, line-height and tracking, and is picked by role rather than by size.

**6 families · 8 everyday tiers · 2 text colors · 1 utility per text node**

## The everyday set

Product UI is built almost entirely from these eight. Reach outside them on purpose.

| Name | Value | Use |
|---|---|---|
| `text-heading-1` | 36px · 600 | The page title. Exactly one per route. |
| `text-heading-2` | 28px · 600 | A major section of the page. |
| `text-title-lg` | 16px · 600 | Names a component: card, dialog, sheet, list row. |
| `text-title-sm` | 14px · 600 | Names a dense component: compact card, table section. |
| `text-body-md` | 15px · 400 | The default paragraph, description and help text. |
| `text-body-sm` | 13px · 400 | Secondary copy and table cells. |
| `text-label-lg` | 14px · 600 | Buttons, field labels, tabs. |
| `text-caption` | 12px · 400 | Timestamps, footnotes, meta rows. |

## The six families

Every tier belongs to one family, and the family is the decision. Size follows from it.

| Name | Value | Use |
|---|---|---|
| `Display  display-lg…4xl` | 48–120px · 700–800 | Type as image: landing heroes, campaign numbers. Never in product chrome; never two per view. |
| `Heading  heading-1…4` | 36 / 28 / 22 / 18px · 600 | The document outline (h1–h4). Keep the order; never skip a level to get a size. |
| `Title  title-lg · title-sm` | 16 / 14px · 600 | Names a UI part without claiming a document heading. |
| `Body  body-lg/md/sm/xs` | 17 / 15 / 13 / 12px · 400 | Reading text. -lg is the lede (carries text-wrap: pretty); -xs is a dense-UI floor, not a prose size. |
| `Label  label-lg/md/sm · caption` | 14 / 12 / 11px · 600; caption 12 · 400 | Functional, scannable text of one to three words. Caption is also the group-label tier: nav sections, menu groups. |
| `Mono  mono-xl/lg/md/caption/sm` | 28 / 20 / 13 / 12 / 11px · tabular | Numbers that are the content, IDs, hashes, code, aligned figures. |

## Text color

| Name | Value | Use |
|---|---|---|
| `text-foreground` | full contrast | Primary text: headings, body, values. |
| `text-muted-foreground` | secondary contrast (AA on every surface) | Supporting text: descriptions, captions, meta, placeholders. |

## Rules

1. **One paired utility per text node. Compose it with a color and margin only.** Each utility is a tuned set of size, weight, leading and tracking. Splitting it into text-* + font-* + tracking-* breaks the tuning and every theme override of it. *Enforced by sable-lint: decomposed-type.*
2. **Pick the tier by role, not by the size it renders at.** A card title is title-lg even when body-lg is the same size: role fixes the weight (600 vs 400) and the rhythm around it.
3. **Two text colors: foreground and muted-foreground.** Both are contrast-tested against every surface in every theme. A third grey, or an opacity step, is untested contrast.
4. **One heading-1 per route; headings descend without skipping levels.** The heading outline is how screen-reader users navigate a page. Restyle with a tier rather than jumping a level for its size.
5. **Hierarchy comes from a clear jump (heading → title → body), then weight and space, before size.** Two sizes one step apart read as the same level. Space and weight separate levels more cheaply than another size.
6. **Cap reading text at --measure-prose (65ch).** Past roughly 75 characters the eye loses the line return. A wide region can still hold a 65ch column.
7. **Numbers that must align use a mono tier (tabular figures).** Proportional digits change width as values update, so totals and columns shimmy.
8. **text-wrap: balance on headings, pretty on ledes, neither on long prose.** balance evens short headlines; pretty only refuses a one-word last line. Both cost layout work that long prose does not repay.
9. **To make all the type smaller or larger, set the base: --type-base: 14 (a unitless px number; 16 is the default). Never retune tiers one by one for it.** Every tier is authored on a 16px base and keeps its ratio to it, so one number rebuilds the whole scale, headings to captions, and the baseline step and spacing follow the body. Shrinking tiers individually breaks the ratios between them. Set it on :root, a theme scope or a preset (tokens.shared["type-base"]) so the rhythm follows too.
10. **Inside a Workspace, a panel's title is text-ui-title (14px · 600); compact text-title-lg resolves to it. A reading view inside the tool (an overview, a document, a long form) is wrapped in <Density value="comfortable"> and gets the page tiers back.** The compact register remaps page tiers onto the 10-12px chrome ramp, which is right for chrome and wrong for prose: an issue overview set in a tool rendered its paragraphs at 11px. The remap stops at a comfortable boundary, so the wrapper is the whole fix.
11. **A mark attached to a line of type (a dot, a bullet, a timeline marker, a leading icon) sits in a box one line tall (h-[1lh] items-center) and is sized in em.** 1lh is the line-height of the text beside it, so the mark centres on that line in every tier, density and theme. A px size with a mt-[3px] nudge is right for one font at one size and wrong everywhere else.

## Never

- **Never:** Opacity on text (text-foreground/60, opacity-70 on a paragraph). **Instead:** text-muted-foreground. An alpha step over an unknown surface has unknown contrast, and it shifts per theme. *Enforced by sable-lint: text-opacity.*
- **Never:** A hand-picked size, weight or tracking (text-[15px], font-medium, tracking-wide). **Instead:** The paired utility for the role. Off-vocabulary type cannot be retuned by a theme or the customizer, so it drifts the moment either changes. *Enforced by sable-lint: decomposed-type.*
- **Never:** Uppercase in product chrome: nav and menu group labels, page eyebrows, table headers, section titles. **Instead:** Sentence-case text-caption or text-label-md in muted-foreground; hierarchy from size, weight and space. Tracked capitals spread across a UI read as shouting and slow word recognition. The eyebrow tier (label-xs / overline) is an editorial accent: at most one per marketing view.
- **Never:** Display tiers inside product UI, or two display sizes in one view. **Instead:** heading-1 for a page title; mono-xl for a metric. Display is type as image. In chrome it competes with the content it is supposed to frame.
- **Never:** Justified text, or reading copy below body-sm. **Instead:** Ragged-right at body-md; body-xs only for dense data. Justification opens rivers on the web, which has no hyphenation control; 12px prose fails people with low vision.
- **Never:** Changing the root font-size (html { font-size: 14px }) to make a product denser. **Instead:** --type-base: 14, with Workspace or <Density value="compact"> for denser controls. The root also sizes every rem the app wrote: widths, insets, media queries. --type-base moves only the type and the rhythm built on it, and density moves the controls, so each can be chosen on its own.
- **Never:** A new font family, or raw font-feature-settings / font-variation-settings. **Instead:** The theme's sans, mono and optional display; font-variant-numeric and font-weight. Raw axis tags silently do nothing on a fallback font, and every theme declares a fallback stack.

## Details

### Steady numbers

```tsx
// before
<span className="text-body-md">{price}</span>
// after
<span className="text-mono-md">{price}</span>
```

Mono tiers set tabular-nums, so a ticking value stops nudging its neighbors sideways.

### Optically centred labels

```tsx
// before
<button className="h-(--control-md) px-4 items-center">Save</button>
// after
<Button>Save</Button>  {/* label wrapped in .sable-label-trim */}
```

text-box: trim-both cap alphabetic centres the cap-height band the eye reads, not the line box. Measured: Helvetica otherwise sits a full 1px high on a 40px control.

### A marker centred on its line

```tsx
// before
<span className="mt-[5px] size-2 rounded-full bg-primary" />
// after
<span className="flex h-[1lh] items-center"><span className="size-[0.5em] rounded-full bg-primary" /></span>
```

The wrapper is exactly one line of the adjacent text tall, so the dot centres on the first line whatever the tier; em sizing keeps it in proportion when the type scales. Stepper indicator="dot" is built this way.

### Balanced headings

```tsx
// before
<h2 className="text-heading-2">Ship faster with fewer review rounds</h2>
// after
<h2 className="text-heading-2 text-balance">Ship faster with fewer review rounds</h2>
```

Evens line lengths so a two-line heading does not end on a single orphaned word.

### Secondary text without opacity

```tsx
// before
<p className="text-foreground/60">Updated 2m ago</p>
// after
<p className="text-caption text-muted-foreground">Updated 2m ago</p>
```

muted-foreground is contrast-tested on every surface; a 60% alpha is not.

**Related:** `sable docs spacing` · `sable docs accessibility` · `sable token typography` · `sable token typographyOverrides`

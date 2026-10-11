## Utilities

The `@utility` and `@custom-variant` layer in `styles.css`: what each one is, when to reach for it, and what you would hand-write without it. Generated from `src/utilities/utility-docs.ts`; the full data is `registry.json → utilities`; one entry at a time with `sable utility <name>`.

- **Typography:** The paired `text-*` page tiers (`text-heading-1`, `text-body-md`, `text-label-sm`, `text-mono-md`, …) are documented as `registry.json → tokens.typography` (named without the `text-` prefix). `sable token typography`.
- **Motion:** The `motion-*` and `animate-*` recipes are listed in `registry.json → tokens.motion.recipes`, with the slot model in `registry.json → motionLayer`. `sable docs motion`.

### relative surface (6)

- **`sable-surface`** — Paints an element as a semantic surface (card by default) and DERIVES its hover and active fills from it — background, ink, edge and both state colours from one role. *Use for:* A bespoke container whose rows or buttons need hover/selected fills that sit the right step off the container in every theme. Pick the role with a modifier (`sable-surface-muted`, `-popover`, `-accent`); descendants using `sable-surface-interactive` or `sable-well` then compute against it.
    - **Instead of** `bg-card text-card-foreground border-border` plus a hand-mixed hover like `hover:bg-[color-mix(in_oklab,var(--foreground)_8%,var(--card))]`. The utility computes the same mix from whatever role you pick, so it stays one visible step in every preset and mode. Use a component (`Card`, `Panel`) first when one fits.
    - `<div className="sable-surface sable-frame sable-frame-r-lg sable-frame-p-4">…</div>`
- **`sable-surface-muted`** — Switches a `sable-surface` to the `muted` role: recessed background, `foreground` ink, `border` edge. Sets the surface variables only; it does not paint on its own. *Use for:* With `sable-surface`, for a quiet, recessed container whose interactive rows still need derived hover/selected fills.
    - **Instead of** `bg-muted` alone, which leaves descendants' hover fills computed against the wrong surface. For a small recessed area INSIDE another surface (a track, a pad) use `sable-well` instead.
    - `<div className="sable-surface sable-surface-muted sable-frame sable-frame-r-lg sable-frame-p-4">…</div>`
- **`sable-surface-popover`** — Switches the surface context to the `popover` role (popover fill and ink, `border-floating` edge). Sets the variables only, so it can also be used ALONE to declare 'descendants sit on a popover'. *Use for:* On a hand-composed floating panel (an inspector, a toolbar over a canvas) so `sable-well` and `sable-surface-interactive` inside it derive from the popover rather than the page. Alone, alongside `bg-popover text-popover-foreground`, it is purely that context hint; with `sable-surface` it also paints.
    - **Instead of** leaving the context unset. Then `sable-well` falls back to `--background`, which inside a popover in some dark modes lands within a step of the panel: the bug that tempts an outline on every well.
    - `<aside className="sable-surface-popover bg-popover text-popover-foreground rounded-lg ring-1 ring-border-floating shadow-lg">…</aside>`
- **`sable-surface-accent`** — Switches a `sable-surface` to the `accent` role: the transient-state fill with its paired ink. Sets the variables only. *Use for:* With `sable-surface`, for a container that is itself in a highlighted/current state and still hosts interactive rows whose hover must step off it.
    - **Instead of** `bg-accent text-accent-foreground` on a container whose children then hover against the page colour. Accent is a STATE, not a decoration — don't use it to make a static section stand out.
    - `<div className="sable-surface sable-surface-accent sable-frame sable-frame-r-md sable-frame-p-2">…</div>`
- **`sable-surface-interactive`** — Hover / highlighted and pressed / selected fills for a row or button, derived from the surface it sits on. Hover = the surface's hover step (8% ink); active, selected or checked = its active step (12% ink inside a `sable-surface`, `accent` outside one). *Use for:* A clickable row, list item or bespoke button inside a surface, where the hover colour must be one consistent step off THAT surface. Matches `:hover`, `[data-highlighted]` / `[data-active]` and `:active`, `[data-selected]` / `[data-checked]` / `aria-selected` / `aria-checked`, so Base UI items work without extra variants. Pair with `motion-interactive` for the transition.
    - **Instead of** `hover:bg-accent`, `hover:bg-muted` or a hand-written `color-mix(in oklab, var(--foreground) 8%, …)` hover. A fixed hover token is right on one surface and invisible or loud on the next; this one is computed from where the row actually is. Reach for `ListItem`, `Menu` or `Button variant="ghost"` first when they fit.
    - `<button className="sable-surface-interactive sable-frame-inner motion-interactive px-3 py-2 text-start text-body-sm">Rename</button>`
- **`sable-well`** — A recessed area ON whatever surface it sits in: 7% ink mixed into the inherited surface (`--sable-surface-bg`, the page background by default), so it is the same visible step on the page, in a card or in a popover. *Use for:* A segmented-control track, a colour or XY pad, a preview well, a readout block inside a panel. Sable's Card (default), Popover, Dialog and Sheet declare their surface, so a well inside them derives from them automatically; on a hand-composed panel, put `sable-surface-popover` (or set `--sable-surface-bg`) on the panel yourself. Whatever sits ON the well takes the surface's own colour back (`bg-popover` inside a popover). A well takes no outline.
    - **Instead of** `bg-muted`, which is fixed: inside a popover it can sit within a step of the panel in some dark modes. And never a hand-mixed `color-mix(… var(--foreground) …)` or an outline on every well to compensate — that turns a panel into a stack of boxes. For a segmented control itself, use `ToggleGroup`; the well is for what no component draws.
    - `<div className="sable-well rounded-md p-1">…</div>`

### frame (7)

- **`sable-frame`** — A bordered, padded, rounded container that computes the radius its children need: `--sable-frame-inner-radius` = radius − padding − border width, floored at `radius-sm`. *Use for:* A container whose children have their own rounded backgrounds (rows, tiles, a nested preview), so the corners nest concentrically and keep doing so when the radius ladder is rescaled. Defaults: `radius-lg`, `--spacing(4)` padding (1rem at the default scale, and it follows the density control), a 1px edge from the surface (`--sable-surface-edge`, else `border`). Size it with `sable-frame-r-*` / `sable-frame-p-*`; children take `sable-frame-inner`.
    - **Instead of** `rounded-lg p-4 border` on the parent plus a guessed `rounded-sm` on each child — the guess is concentric only at the default ladder. For a one-off nested corner without a frame, `rounded-concentric-*`.
    - `<div className="sable-frame sable-surface sable-frame-r-lg sable-frame-p-4"><div className="sable-frame-inner sable-well p-3">…</div></div>`
- **`sable-frame-popover`** — The popup frame recipe: `radius-md`, `--spacing(1)` padding, the `border-floating` edge and `shadow-lg`, applied over `sable-frame`. *Use for:* A hand-composed floating list or panel that must match Sable's menus (with `sable-frame sable-surface sable-surface-popover`); rows inside take `sable-frame-inner`.
    - **Instead of** Copying a Menu's class string. And use `Menu`, `Select`, `Popover` or `Combobox` first — they own focus and dismissal; this is only for floating chrome no component covers.
    - `<div className="sable-frame sable-surface sable-surface-popover sable-frame-popover">…</div>`
- **`sable-frame-tool`** — The frame for edge-to-edge tool chrome at the theme's radius, with no padding. It publishes concentric geometry for what's inside: `--panel-inset` (row side padding, grown so rows clear the corner), `--panel-field-radius` (compact fields curve parallel to the frame) and `--panel-edge` (the first and last section's extra top and bottom). PanelSection and the xs field shell read them. Applied over `sable-frame`. *Use for:* Framing PanelSections, ScrubFields, a Tree, a StatusBar or a PanelGroup outside a Workspace (a docs demo, a floating inspector). Add `overflow-hidden` to clip to the corners.
    - **Instead of** `rounded-lg border overflow-hidden` by hand: the panel keeps its square-column 8px inset and small field radius, so a rounded preset crowds the first label and last field into the curve.
    - `<div className="sable-frame sable-frame-tool overflow-hidden bg-panel" data-density="compact"><PanelSection title="Layer">…</PanelSection></div>`
- **`sable-frame-borderless`** — Sets a `sable-frame`'s border width to 0 while keeping the inner-radius math correct. *Use for:* A frame that separates by fill or space rather than an edge (a well, a tinted group) but still needs concentric children.
    - **Instead of** `border-0` on a `sable-frame`, which removes the border but leaves 1px in the inner-radius calculation.
    - `<div className="sable-frame sable-frame-borderless sable-well sable-frame-r-md sable-frame-p-1">…</div>`
- **`sable-frame-r-*`** — Sets a `sable-frame`'s outer radius from the radius ladder (`sable-frame-r-lg`) or an arbitrary value (`sable-frame-r-[14px]`). *Use for:* Whenever a frame should not be the default `radius-lg`. The inner radius follows automatically.
    - **Instead of** `rounded-*` on a `sable-frame` — that changes the painted corner but not `--sable-frame-inner-radius`, so the children stop nesting.
    - `<div className="sable-frame sable-frame-r-md sable-frame-p-2">…</div>`
- **`sable-frame-p-*`** — Sets a `sable-frame`'s padding on the spacing scale (`sable-frame-p-2` = `--spacing(2)`), feeding the inner-radius math. On the scale, so the density control moves it. *Use for:* Whenever a frame's inset is not the default `--spacing(4)`.
    - **Instead of** `p-*` on a `sable-frame` — the padding changes but the inner radius is still computed from the default `--spacing(4)`, so the children's corners are wrong.
    - `<div className="sable-frame sable-frame-r-lg sable-frame-p-2">…</div>`
- **`sable-frame-inner`** — Takes the radius its `sable-frame` ancestor computed (outer − inset − border), never below `radius-sm`: concentric when the child sits near the frame edge (a popover row), the theme's small radius when it sits deep inside a padded card (where the subtraction would leave a near-square row). Falls back to `radius-sm` outside a frame. *Use for:* On every rounded child of a `sable-frame`: rows, tiles, an inner well, a nested image.
    - **Instead of** A hardcoded `rounded-sm` on the child, which drifts the moment a theme or the customizer rescales radii.
    - `<div className="sable-frame sable-frame-r-lg sable-frame-p-2"><button className="sable-frame-inner sable-surface-interactive px-3 py-2">…</button></div>`

### geometry (4)

- **`rounded-concentric-*`** — A border radius computed as an outer radius minus an inset: `rounded-concentric-<radius>/<spacing>`, floored at `radius-xs` so a deep inset never leaves a 1-2px sliver. `rounded-concentric-md/1` = `radius-md` − `spacing-1`. *Use for:* A one-off rounded element nested inside another — a tab trigger inside a tab list, a thumb inside a track, a row inside a well — where a `sable-frame` would be overkill. The outer radius and the inset are the parent's.
    - **Instead of** Picking the next ladder step down by eye (`rounded-sm` inside `rounded-md p-1`). That is concentric only at the default ladder; the utility recomputes from live tokens. Registered in `cn()` as a radius, so it correctly overrides a component's own `rounded-*`.
    - `<div className="sable-well rounded-md p-1"><button className="rounded-concentric-md/1 px-2 py-1">…</button></div>`
- **`popup-inset`** — The padding of a popup list, derived from the popup's radius: a third of `radius-md`, at least `--spacing(1)`. A rounder popup gets more room, and the floor is on the spacing scale, so the density control moves it. *Use for:* On a hand-composed rounded-md popup that holds a list of rows. Sable's Menu, Select, Combobox and ContextMenu already use it.
    - **Instead of** `p-1`. A fixed inset at a larger radius preset leaves the rows' corners approaching half their height, so every row turns into a pill.
    - `<div className="rounded-md bg-popover popup-inset shadow-md">…</div>`
- **`rounded-popup-item`** — The row radius that nests inside a `popup-inset` popup: `radius-md` minus the popup inset, clamped at zero. *Use for:* On every row inside a `popup-inset` container.
    - **Instead of** `rounded-sm` on menu rows, which matches no ladder exactly (a 12px popup with a 4px inset and 1px border wants 7px rows).
    - `<div role="option" className="rounded-popup-item px-2 py-1.5 sable-highlighted:bg-accent">…</div>`
- **`popup-bleed`** — A negative inline margin of exactly one `popup-inset`, so a separator inside a padded popup runs edge to edge at every radius and density. *Use for:* On a hand-composed separator (a 1px rule) inside a `popup-inset` popup. Sable's MenuSeparator, ContextMenuSeparator and SelectSeparator already use it.
    - **Instead of** `-mx-1`, which matches the inset only at the default ladder and stops short of both edges once a rounder preset or a roomier density grows it. design-lint flags it (`popup-separator-bleed`).
    - `<div role="separator" className="popup-bleed my-1 h-px bg-border" />`

### state variant (5)

- **`sable-highlighted:`** — A variant (`sable-highlighted:`) matching the keyboard/pointer-highlighted item: `[data-highlighted]`, `[data-active]`, `[data-active-item]`. *Use for:* Styling the current item in a list, menu, combobox or listbox — Base UI and ARIA-style composites mark it differently, this matches all of them.
    - **Instead of** `data-[highlighted]:bg-accent data-[active]:bg-accent …` repeated per attribute, or `hover:` alone (which misses keyboard navigation).
    - `<div role="option" className="sable-highlighted:bg-accent sable-highlighted:text-accent-foreground">…</div>`
- **`sable-selected:`** — A variant (`sable-selected:`) matching a selected or checked element: `[data-selected]`, `[data-checked]`, `[aria-selected=true]`, `[aria-checked=true]`. *Use for:* The chosen row, the pressed segment, the checked option — whichever attribute the primitive happens to set.
    - **Instead of** Separate `data-[selected]:` / `data-[checked]:` / `aria-selected:` classes, one of which is always forgotten.
    - `<div role="option" className="sable-selected:bg-accent sable-selected:text-accent-foreground">…</div>`
- **`sable-open:`** — A variant (`sable-open:`) matching an open trigger or disclosure: `[data-open]`, `[data-popup-open]`, `[data-panel-open]`, `[aria-expanded=true]`. *Use for:* Rotating a chevron, holding a trigger's pressed look while its menu or panel is open.
    - **Instead of** `data-[popup-open]:` on one trigger and `aria-expanded:` on the next.
    - `<button className="motion-interactive sable-open:bg-accent sable-open:text-accent-foreground">…</button>`
- **`sable-disabled:`** — A variant (`sable-disabled:`) matching a disabled element: `:disabled`, `[disabled]`, `[data-disabled]`, `[aria-disabled=true]`. *Use for:* Dimming or locking a bespoke element regardless of whether it is natively or ARIA-disabled.
    - **Instead of** `disabled:` alone, which misses `aria-disabled` and Base UI's `data-disabled` — the cases that stay focusable.
    - `<div className="sable-disabled:pointer-events-none sable-disabled:opacity-50">…</div>`
- **`sable-invalid:`** — A variant (`sable-invalid:`) matching an invalid field: `[aria-invalid=true]`, `[data-invalid]`. *Use for:* The error edge or ink on a bespoke field wrapper. Use `Field` / `Input` first; they already style it.
    - **Instead of** `aria-invalid:` or `data-[invalid]:` alone — Base UI's Field sets one, native validation wiring the other.
    - `<div className="ring-1 ring-border sable-invalid:ring-destructive">…</div>`

### scroll (2)

- **`scrollbar-quiet`** — A thin floating scrollbar: no stepper arrows, a 4px thumb inset from the edges, invisible at rest and fading in while the region is scrolled, hovered or focused. *Use for:* Every VERTICAL scroll container (anything with `overflow-y: auto` or `scroll`). Add `useScrollActivity` so the thumb also appears on touch drags and programmatic scrolls. Required by design-lint's `unmanaged-overflow`.
    - **Instead of** A scroll container with no policy, which on Windows draws stepper arrows hard against the padding edge and out of any rounded corner. Never set `scrollbar-width` yourself — in Chromium it disables this utility.
    - `<div className="max-h-80 overflow-y-auto scrollbar-quiet">…</div>`
- **`scrollbar-hidden`** — Scrolls without ever drawing a bar. *Use for:* HORIZONTAL strips whose edge fade or paging controls carry the 'there is more' affordance (it is `Scroller`'s horizontal default), a canvas panned by drag. You should be able to name what carries the affordance instead.
    - **Instead of** `scrollbar-quiet` on a vertical list. A vertical region with no bar and no fade tells a reader nothing about how far through they are.
    - `<div className="flex gap-3 overflow-x-auto scrollbar-hidden">…</div>`

### text (12)

- **`sable-list`** — A bulleted list as typography: body type, a hanging muted marker, and item rhythm. Put it on a native `<ul>`. *Use for:* Running content with bullets: release notes, a feature list, steps that are not ordered.
    - **Instead of** A stack of `<div>`s with a hand-drawn dot, or an unstyled `<ul>` that inherits the reset (no markers, no indent).
    - `<ul className="sable-list"><li>Faster sync</li><li>Offline drafts</li></ul>`
- **`sable-list-numbered`** — A numbered list as typography: `sable-list` with decimal markers in tabular figures. Put it on a native `<ol>`. *Use for:* Ordered content in running text: setup steps, a ranked list. For a stepped flow with state, use Stepper.
    - **Instead of** Numbers typed into the text, which neither renumber nor read as a list to assistive tech.
    - `<ol className="sable-list-numbered"><li>Install</li><li>Import the styles</li></ol>`
- **`sable-list-dl`** — Label/value pairs on a native `<dl>`: muted label-tier `<dt>`s and body-tier `<dd>`s on a baseline-aligned two-column grid; long values wrap inside their column. Colour a status value with a `text-*` utility on its `<dd>`. *Use for:* Read-only details: an order summary, a record's metadata, a settings summary, profile stats.
    - **Instead of** A grid of `<div>`s (screen readers lose the term/value pairing), or Table for a single record. For editable values use Form and Field.
    - `<dl className="sable-list-dl"><dt>Network</dt><dd>Solana</dd><dt>Status</dt><dd className="text-success">Active</dd></dl>`
- **`sable-list-dl-2`** — Two label/value pairs a row once the nearest `@container` ancestor is at least 28rem wide. Add to `sable-list-dl`. *Use for:* A compact metadata block in a wide card or panel. Put `@container` on a parent so it measures the room it actually has.
    - **Instead of** A viewport breakpoint, which gives a narrow card on a wide screen four columns it cannot fit.
    - `<div className="@container"><dl className="sable-list-dl sable-list-dl-2">…</dl></div>`
- **`text-overline`** — The eyebrow / overline / kicker tier: small, letter-spaced, uppercase by default (a theme may set sentence case via `--type-overline-transform`). *Use for:* A section eyebrow above a heading, a stat's label, a badge-style category line. Sits ABOVE and categorises.
    - **Instead of** `text-label-xs uppercase tracking-wider` assembled by hand, or `text-caption`, which sits BELOW and explains. In tool chrome, panel headers use `text-ui-section` instead.
    - `<p className="text-overline text-muted-foreground">Latest news</p>`
- **`text-ui-md`** — Workspace-register chrome text, the default tier: ~12px at weight ~500 on 16px leading. *Use for:* Labels and values in tool chrome — panels, inspectors, toolbars, trees — inside the workspace register.
    - **Instead of** `text-label-sm` or `text-body-sm` in a dense panel (the page register's weights read as shouting at this size), or a size class plus a weight class composed by hand.
    - `<span className="text-ui-md text-panel-foreground">Opacity</span>`
- **`text-ui-sm`** — Workspace chrome text, the compact tier: ~11px at weight ~500. *Use for:* Secondary chrome: property names in a grid, status-bar items, tree rows in a compact density.
    - **Instead of** `text-label-xs`, a page-register tier tuned for different weights and leading.
    - `<span className="text-ui-sm text-muted-foreground">W</span>`
- **`text-ui-body`** — The reading tier inside chrome: `text-ui-md`'s size at regular weight. *Use for:* Descriptions, help text and empty-state copy inside a panel or inspector.
    - **Instead of** `text-ui-md`, whose medium weight makes a sentence read as a label; or `text-body-sm`, which is page-register.
    - `<p className="text-ui-body text-muted-foreground">Select a layer to edit its properties.</p>`
- **`text-ui-section`** — Panel section headers in tool chrome: `text-ui-sm`'s size, a little heavier and tracked — not uppercase. *Use for:* A `PanelSection` header or any group title inside a dense panel.
    - **Instead of** `text-overline`, whose all-caps reads louder than the content it labels at this density.
    - `<h3 className="text-ui-section text-panel-foreground">Layout</h3>`
- **`text-ui-micro`** — The smallest chrome tier: ~10px at weight ~450. Use sparingly. *Use for:* Chrome annotations — a unit suffix, a shortcut hint, a ruler tick label.
    - **Instead of** `text-[10px]`, which bypasses the theme and density hooks.
    - `<kbd className="text-ui-micro text-muted-foreground">⌘K</kbd>`
- **`text-ui-num`** — Numeric values in chrome: mono, tabular figures, at the `text-ui-sm` size. *Use for:* Values in a property grid, a scrub field's readout, coordinates — any number that changes while you watch.
    - **Instead of** `text-ui-sm` (proportional digits make a column jitter while a slider drags) or `text-mono-sm`, which is page-register.
    - `<span className="text-ui-num">128</span>`
- **`stream-tail`** — The soft trailing edge of a live text stream: a slight blur plus a fading mask, so the newest token reads as 'more is coming' rather than a sentence that has ended. Static. *Use for:* On the last run of text while a model or source is still streaming; remove it when the stream finishes. `StreamingText` applies it for you.
    - **Instead of** An animated fade or a hand-written `mask-image` gradient. Use `StreamingText` first; this is for a stream rendered without it.
    - `<span className="stream-tail">{latestChunk}</span>`

### helper (3)

- **`hit-target`** — Grows an element's tap target to 44px with a transparent `::after`, without moving its layout by a pixel. `--hit-target-size` overrides the size. *Use for:* A deliberately small mark — a tag's remove ×, a tiny disclosure, a toast close — that must still meet the WCAG touch floor. Shrink it (`[--hit-target-size:32px]`) where targets sit side by side, or the later one steals the taps.
    - **Instead of** Padding the glyph up (moves it off the row's grid and pushes siblings) or a bigger icon. Never on an `<input>` or other replaced element — pseudo-elements silently do nothing there; wrap it in a label.
    - `<button className="hit-target text-muted-foreground" aria-label="Remove"><Icon name="xmark" /></button>`
- **`link-underline`** — An underline drawn from the font's own metrics (position and thickness `from-font`) with ink skipping descenders, so it retunes when a theme swaps typeface. *Use for:* Inline links in running text. Pair with `motion-interactive` for a colour change on hover.
    - **Instead of** `underline underline-offset-4 decoration-2` — tuned to one face and wrong for the next theme's. Animating thickness or offset is not supported; a growing underline is a separate pseudo-element.
    - `<a href="/terms" className="link-underline motion-interactive text-primary">terms</a>`
- **`checkerboard`** — The transparency checkerboard, painted from `--panel` and a derived darker step so it reads in both modes. `--checkerboard-size` (default 16px) and `--checkerboard-alt` tune it. *Use for:* Behind anything that can be translucent: a colour swatch with alpha, an image or artboard preview, an alpha slider track.
    - **Instead of** A hand-rolled `repeating-conic-gradient` with two hardcoded greys. Deliberately not named `bg-checkerboard`, so `cn()` never merges it away against a real `bg-*` colour — you can layer a colour over it.
    - `<div className="checkerboard [--checkerboard-size:8px] size-6 rounded-sm" />`
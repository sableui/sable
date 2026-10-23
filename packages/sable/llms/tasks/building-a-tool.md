# Task: building a tool (workspace register)

An editor, a canvas app, a console, or a records workspace (an issue tracker, a
support queue, a pipeline): anything whose primary interaction is *operating on
something* rather than reading and navigating.

If the primary interaction is reading down a page, stop: you want
[building-a-page.md](./building-a-page.md). A dashboard that scrolls is a page
with dense content, not a workspace. A tracker or inbox where people work
through records one at a time, with the selected one open beside the list, is a
workspace. Start that one from the `TrackerPage` pattern
(`sable pattern TrackerPage --skeleton`) and read "A records workspace" below.

## The shell

First read [designing-a-surface.md](./designing-a-surface.md). Define the operator's
primary task, selection/navigation model, most frequent actions, and narrower
viewport behavior before choosing panel furniture. Retrieve applicable precedents
with `sable learn --search "workspace interaction"`; editorial motion and display
hierarchy do not automatically transfer to dense operating surfaces.

```tsx
<Workspace                                   {/* h-dvh, sets data-density="compact" */}
  toolbar={<WorkspaceBar>…</WorkspaceBar>}
  statusBar={<StatusBar>…</StatusBar>}
>
  <PanelGroup>
    <Panel label="Layers" width={leftWidth}>…</Panel>
    <PanelResizer side="left" width={leftWidth} onWidthChange={setLeftWidth}
                  label="Resize layers panel" />
    <WorkspaceCanvas>{/* the work surface — clips, never scrolls */}</WorkspaceCanvas>
  </PanelGroup>
</Workspace>
```

Every slot is optional; the body is always the one growing row. A bar that
belongs to one column (a list's breadcrumbs and view switch, with the inspector
running the full height beside it, as in Linear) is a `WorkspaceBar` placed first
inside that column, not the `toolbar` slot.

`Workspace` sets the compact density scope for its whole subtree. Nothing
hardcodes a height: every control reads `--control-*`, so the same
`<Button size="md">` is 40px on a page and 32px here. A `Dialog` opened from
inside resets to comfortable, because a modal is a page-register surface even
when a tool launched it.

## A records workspace

The shape of an issue tracker, a support queue or a CRM pipeline. Every piece
below exists, so the build is composition; `sable pattern TrackerPage
--skeleton` has the whole tree.

```tsx
<Workspace statusBar={<StatusBar>…</StatusBar>} bottomNav={<BottomNav>…</BottomNav>}>
  <PanelGroup>
    <Panel label="Navigation" width={220} narrow="sheet" side="left"
           open={narrow ? navOpen : true} onOpenChange={setNavOpen} scroll={false}>
      <Sidebar variant="inline">
        <SidebarHeader><SidebarBrand mark={…} label="Studio" />{search}</SidebarHeader>
        <SidebarNav>
          <SidebarItem icon={…} label="Inbox" badge={…} />
          <SidebarGroup label="Workspace">{items}</SidebarGroup>
        </SidebarNav>
        <SidebarFooter>
          <Menu>
            <MenuTrigger render={<SidebarAccount avatar={<Avatar size="2xs" … />} label="Emma Lee" detail="Studio" />} />
            <MenuContent side="top" align="start">{settings, appearance, sign out}</MenuContent>
          </Menu>
        </SidebarFooter>
      </Sidebar>
    </Panel>
    <WorkspaceCanvas className="flex flex-col">
      <WorkspaceBar><Breadcrumbs>…</Breadcrumbs></WorkspaceBar>
      <WorkspaceBar><Tabs><TabsList variant="pill">…</TabsList></Tabs></WorkspaceBar>
      {filters}
      <DataTable groupBy={(r) => r.status} groups={…} isRowSelected={…} onRowClick={…} />
    </WorkspaceCanvas>
    <Panel label="Details" width={320} narrow="sheet" open={selected != null}
           onOpenChange={(o) => !o && setSelected(null)} scroll={false}>
      <PanelSection title="Properties"><PropertyRow label="Status">…</PropertyRow></PanelSection>
    </Panel>
  </PanelGroup>
</Workspace>
```

The decisions that keep it one system:

- **One grid down the rail.** SidebarBrand, SidebarItem, SidebarGroup and
  SidebarAccount share the icon and label columns, and inside the compact scope
  they take 32px rows on their own. Do not drop SideNav, an Entity or a stack of
  ghost Buttons into the rail: each brings its own insets.
- **The account is one row and a menu.** Settings, appearance (light, dark,
  system) and sign-out go in the SidebarAccount's menu, not in a Settings button
  above it or a badge beside it. Its detail line ("Studio · Demo") carries what a
  badge would.
- **One table, grouped.** Rows grouped by state are one `DataTable` with
  `groupBy`: one header, columns that line up, a count and an add action per
  group. Not one table per group inside Collapsibles.
- **The inspector renders once.** `Panel narrow="sheet"` docks it on a desktop
  and makes it a Sheet below `lg`. Not a media-query hook plus a second copy in a
  Sheet. The nav rail does the same from the left, and fills its sheet.
- **Reading inside the tool is page-sized.** An overview, a description, notes or
  a docs tab goes in `<Density value="comfortable">`, or its prose renders at the
  11px chrome tier.
- **A view switch in chrome is a pill.** `TabsList variant="pill"`: its fill takes
  the compact `--button-radius`, about 5px, so it reads as a segment. Underline
  tabs are the page-section idiom.
- **Ship both modes, and a way to switch.** The look is a preset with light and
  dark; SableThemeProvider applies it, and the account menu or a Settings dialog
  holds the mode switch. A tool asked to be compact and technical takes
  `type-base` (13 or 14) in the preset, which rebuilds the whole type scale,
  instead of per-tier overrides.
- **State has a shape.** A status with more than on and off (partly done, in
  review) can be an app-owned glyph, but give it a label (`role="img"`,
  `aria-label`) and colour it from the palette (`var(--yellow-500)`) so it
  follows the mode.

## What you will need, and what to avoid reaching for

| you want | use | NOT |
|---|---|---|
| a property grid | `PanelSection` + `PropertyRow` / `PropertyPair` | `Card` — in 240px it spends its border and inset on nothing |
| a numeric property | `ScrubField` | `NumberField` — its two steppers put a ~112px floor on a ~44px slot |
| a layers / object list | `Tree`, with `selectionFollowsFocus` when the arrows should select | a hand-nested list — no selection model or keyboard; ArrowUp/Down handled on each row |
| the app's menus (File, Edit, View) | `Menubar` + `MenubarTrigger`, items with `shortcut` | one `Menu` per title side by side — ←/→ never leave the open menu |
| an empty panel section | `TreeEmpty` | `EmptyState` — `px-6 py-12` around a `size-12` disc |
| a colour property | `ColorField` | `<input type="color">` — OS dialog, ignores the theme, wrong size |
| ambient document facts | `StatusBar` | a toolbar — status is glanced at, not operated |
| chrome typography | `text-ui-md` / `-sm` / `-body` / `-section` / `-micro` / `-num` | `text-body-*` — page tiers, ~1/3 too large here |
| a title in a panel | `text-title-lg` (14px `text-ui-title` in compact) | a heading tier, or a page-tier override on `:root` |
| a top bar over one column | `WorkspaceBar` first in the column, with `Breadcrumbs` | a hand-built `<header>` with `/` spans |
| nav groups in a rail | `SidebarGroup` | `SideNav` + `SideNavGroup` — another set of columns |
| the account at the foot of a rail | `SidebarAccount` as a `MenuTrigger` | an Entity + a Settings Button + a Badge |
| a view switch in a bar | `TabsList variant="pill"` | underline tabs (page idiom), a hand-built segmented row |
| rows grouped by state | `DataTable groupBy` + `groups` | a DataTable per group in Collapsibles |
| a date property | `DatePicker size="xs"` | `<input type="date">` — OS format, wrong size |
| a person in a row | `Avatar size="2xs"` / `"xs"`, `AvatarGroup` for several | a class on Avatar to shrink it |
| a project or workspace mark | `Avatar shape="square" tone="…"` | a tinted `<span>` |
| an inspector on a phone | `Panel narrow="sheet"` | a media-query hook and a second render in a Sheet |
| a reading tab | `<Density value="comfortable">` | prose in chrome tiers |

## Menus, selects and popovers adapt on their own

`Menu`, `Select`, `Popover`, `Tooltip` and `ContextMenu` pick up the workspace's
density automatically — including **across the portal**. Their popups mount at
the document root, so CSS could never reach them; they re-apply `data-density`
from React context instead.

**Do not size them per call site.** That was necessary before v0.41 — Glitch
carried 14 such overrides and had them inconsistent — and it is now drift.

A **modal** is deliberately different: `Dialog`, `Sheet` and
`DestructiveActionModal` stay page-register even when a tool opens them, because
a modal is its own surface rather than part of the control that opened it.

## The traps, all of which have shipped

- **A portaled surface still fires your canvas's pointer handlers.** Every Sable
  popup — `Dialog`, `Menu`, `Select`, `Popover`, `Tooltip`, `ContextMenu` —
  portals to `document.body`. But React propagates events through the **component
  tree, not the DOM tree**, so if the component that renders your canvas also
  renders the dialog, every press inside that dialog re-enters your pan/drag/
  marquee handler.

  The symptom is specific and misleading: **pointerdown-driven controls work while
  click-driven ones do not.** A combobox opens (pointerdown) but you cannot pick
  an option (click); buttons, switches and Cancel are dead; typing and Escape are
  fine. That is a global handler calling `setPointerCapture` on pointerdown, which
  retargets `pointerup` away from the button, so the browser never synthesises a
  `click`. Nothing is prevented and nothing errors — it reads exactly like a
  broken component.

  Guard by **containment in your own surface**, not by a marker on ancestors:

  ```tsx
  // ✗ walks DOM ancestors — a portaled popup's ancestors are <body>/<html>,
  //   so the marker is never found and the guard passes everything through
  if ((e.target as Element).closest("[data-no-pan]")) return

  // ✓ a pan is a press inside the thing being panned. Portals fail this by
  //   construction, and so does every future popup you have not written yet
  if (!viewportRef.current?.contains(e.target as Node)) return
  ```

  Test it with a popup **open over a live document**, not on an empty canvas — a
  disabled pan cannot exhibit the bug, so a green run there proves nothing.

- **`min-h-0` is the precondition for scrolling.** `overflow-y-auto` only
  activates if every flex ancestor can shrink. One missing `min-h-0` up the chain
  and the panel grows instead of scrolling — silently.
- **Never override a control height with a selector.** `[data-density] button {
  height: … }` loses to any equal-specificity utility. Redefine `--control-*` in a
  density scope instead. CI-enforced (`raw-control-height`).
- **Tree geometry has one invariant:** `--tree-indent` must equal
  `--tree-column`. A smaller step puts a child's content LEFT of its parent's and
  the nesting reads inverted. Use `treeIndent(depth)`; never hand-write an inset.
- **No pills in chrome.** The compact scope flattens `--button-radius` to ~5px —
  one of two page-register rules the workspace register deliberately reverses.
  `TabsList variant="pill"` takes that radius too, so in a bar it is a segment.
- **Drag with window listeners, not `setPointerCapture`.** Capture throws for an
  inactive pointer id and the throw aborts the handler mid-gesture, silently.
- **An unmapped `<Icon name>` renders nothing.** A development build warns and
  names the nearest names, and Lucide or Heroicons spellings resolve, but check
  with `sable icon <name>` before you write one, through a wrapper too.

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

Then measure in the browser. Every number in the workspace register came from
measuring Figma and Paper in-page, and every register bug found so far was found
by reading computed values, not by looking at a screenshot.

Also inspect the rendered hierarchy and complete a real flow with a live document,
keyboard navigation, a narrow viewport, and reduced motion. Use
[reviewing-a-design.md](./reviewing-a-design.md) to record evidence, repair defects,
and distinguish observed behavior from untested claims.

## Read next

- `DESIGN.md → Registers` — doctrine, measured numbers, the two reversals
- `sable pattern TrackerPage --skeleton` — the records workspace, whole
- `llms/components/workspace.md`, `panel-group.md`, `panel-section.md`,
  `sidebar.md`, `data-table.md`, `tree.md`, `scrub-field.md`, `status-bar.md`,
  `color-field.md`
- `llms/reference/token-intent.md` — which token to reach for

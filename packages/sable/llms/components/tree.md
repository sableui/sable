# Tree

**Status:** stable

The object list a tool is built around — layers, scene graph, outline — on one shared grid, so every left edge in the panel resolves to the rail or an exact multiple of the indent step.

**Keywords:** tree, layers, outline, scene graph, hierarchy, nesting, indent, disclosure, workspace, panel, file tree, files, folders, explorer, treeview

## Usage

Use Tree for the hierarchy panel in a workspace: layers, objects, an inspector outline. It owns the geometry that makes nesting legible — the rail, the disclosure and type columns, and the indent step — via the density ladder (scope the panel with data-density, e.g. data-density="compact"), so nothing in the panel computes its own inset. It is also the file tree: nest rows with `subtree`, let folders manage their own open state with `defaultExpanded`, and mark kind with the `icon` convention (folder for a row with a subtree, file for a leaf). Reach for Accordion when the content is prose sections rather than nodes in a hierarchy.

### Best practices

- Do: Give Tree an aria-label naming the hierarchy ("Layers", "Files"). It is a role="tree", and an unnamed tree is announced as just "tree".
- Do: For a file tree, nest with `subtree` and use the icon convention: `icon={<Icon name="folder" />}` on a row with a subtree, `icon={<Icon name="file" />}` on a leaf. There are no folder/file presets — they would only bind those two props.
- Do: Give TreeAddRow the same depth as the rows it adds to, so its mark lands in their type column: one deeper than the parent for a child list, the parent's own depth for a sibling list.
- Do: Put mutable per-row state (visibility, solo, a row menu) in `actions`, on the right rail. Show it on hover with `reveal-on-hover` (the row is its `group`), and at rest only when its value is the non-default one.
- Do: Let section headers sit on the rail at the same height as a depth-0 row. Space and a hairline separate sections; TreeSection handles both, including dropping the divider on the first.
- Don't: Hardcode a left inset anywhere in the panel. Use treeIndent(depth) or var(--tree-rail); a hand-written px value is how a tree ends up with four different left edges.
- Don't: Redefine --tree-indent to anything other than --tree-column. A step smaller than the column puts a child's content left of its parent's and the nesting reads inverted.
- Don't: Put the visibility toggle before the name. A leading toggle makes each row's visual start depend on its depth, so no two rows share an edge.
- Don't: Hand-copy icon paths into a tree row. Use Icon and the shared semantic set, or provide an app-specific icon through the supported slot.
- Don't: Use EmptyState inside a panel. It is page-register furniture (px-6 py-12 around a size-12 disc) and in 240px it spends 24px of inset and ~96px of height on nothing. Use TreeEmpty.
- Don't: Show explanatory prose AND an add row in an empty section. That is two things to read where one carries the affordance; give TreeEmpty a one-line message and pass the add row as its action.
- Don't: Leave a section actionable when its action cannot do anything yet — a document-level effect list with no content to apply to, for instance. Hide the section or its affordance until the thing it operates on exists.

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| Tree | yes | The container. Does not scroll itself — put it in a scrolling Panel, or make it the scrolling region with className. |
| TreeSection | no | A titled group. Header on the rail, hairline above, divider suppressed on the first section. |
| TreeRow | yes | One node: rail, disclosure column, type column, name, right-rail actions. |
| TreeAddRow | no | The affordance that ends a branch. Mark in the type column, label in the name column. |
| TreeEmpty | no | A section's empty state at panel scale: one line, one action, optionally a dashed drop region. |

## Subcomponents

| Name | Type | Description |
| --- | --- | --- |
| TreeSection | { title: ReactNode; hint?: string; action?: ReactNode } | A titled group of rows, with the header on the rail. |
| TreeRow | { depth?: number; selected?: boolean; accent?: boolean; dimmed?: boolean; expandable?: boolean; expanded?: boolean; defaultExpanded?: boolean; onExpandedChange?: (expanded: boolean) => void; subtree?: ReactNode; toggleLabel?: string; disclosureIcon?: ReactNode; icon?: ReactNode; actions?: ReactNode } | One node in the hierarchy (role=treeitem inside a Tree). Controlled via expanded/onExpandedChange or uncontrolled via defaultExpanded; nest children with subtree. Always reserves both leading columns (disclosure and type), so a leaf's name lines up with its expandable siblings. |
| TreeAddRow | { depth?: number; label: ReactNode; icon?: ReactNode } | The add affordance, shaped as a row and aligned to the branch it adds to. Its mark sits in the type column (level with the siblings' kind markers), not the name column. `icon` replaces the built-in add mark. |
| TreeEmpty | { message: ReactNode; action?: ReactNode; dropTarget?: boolean; depth?: number } | A section's or a branch's empty state, at panel scale rather than page scale. One-line message, one action slot; dropTarget renders it as a dashed drop region and sets data-drop-target for styling. `depth` (inherited inside a subtree) starts the line on the edge of the rows that branch would hold. |
| treeIndent | (depth: number) => string | The left inset for a depth, as a calc() expression reading the density ladder. Use this rather than computing pixels. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| depth | number | 0 | Nesting level, on TreeRow and TreeAddRow. 0 sits on the rail; each level adds one --tree-indent. |
| expandable | boolean | true with subtree, else false | Whether TreeRow renders a disclosure control. The column is reserved either way, so leaf and parent names stay aligned. |
| expanded | boolean | — | Controlled open state for a TreeRow. Pair with onExpandedChange; omit both for an uncontrolled row. |
| defaultExpanded | boolean | true | Uncontrolled initial open state, used when `expanded` is not passed. Pass false for a file tree's closed folders. |
| onExpandedChange | (expanded: boolean) => void | — | Called when a TreeRow opens or closes — from the disclosure, ArrowRight/ArrowLeft, or activating a row that has no onClick. Fires in both controlled and uncontrolled use. |
| subtree | ReactNode | — | The rows nested under a TreeRow, rendered after it while it is expanded. Nested rows inherit depth + 1 unless they pass their own `depth`, so a file tree never computes depth by hand. |
| selected | boolean | false | Selection fill and accent bar on a TreeRow. Inside a Tree it is exposed as aria-selected on the treeitem; a row rendered outside a Tree is a plain div and exposes aria-current instead. |
| toggleLabel | string | — | Names the thing being disclosed, for the toggle's accessible label — "Expand Background" rather than "Expand group". Every example passes it; a screen-reader user hearing twenty identical "Expand group" buttons has no way to tell them apart. |
| icon | ReactNode | — | The kind marker for a TreeRow, rendered in the type column at 1em. Use a semantic Icon so it follows the app icon set. |
| disclosureIcon | ReactNode | — | Replaces TreeRow's semantic chevron-down icon. Omit to use the chevron-down from the app's IconProvider set. |
| actions | ReactNode | — | Right-rail controls for a TreeRow: visibility, solo, a row menu. |
| label | ReactNode | — | TreeAddRow's visible label. Name what gets added — 'Add effect', not 'Add'. |

## Tokens used

`panel-raised`, `hairline`, `foreground`, `muted-foreground`, `primary`, `ring`

## Accessibility

- Tree implements the ARIA tree view pattern: Tree is role="tree", each TreeRow and TreeAddRow is role="treeitem" with aria-level, expandable rows carry aria-expanded, and a TreeSection is a role="group" labelled by its heading. Rows stay flat in the DOM — hierarchy is aria-level — so the fills span the panel's full width.
- Keyboard: exactly one row is in the tab order (roving tabindex, seeded on the selected row, else the first). ArrowUp/Down move between visible rows; ArrowRight expands a collapsed row, then steps to its first child; ArrowLeft collapses an expanded row, else steps to its parent; Home/End jump to the ends; Enter/Space activate the row — its onClick, or toggling it when it has none. Keys pressed inside a row's own controls (an action button, a rename field) are left to that control.
- Selection has one mapping: inside a Tree, `selected` is aria-selected on the treeitem; outside a Tree the row is a plain div, where aria-selected is invalid, so it falls back to aria-current. A navigation tree that wants aria-current="page" passes it through props.
- Each treeitem is named by its own label (aria-labelledby the name), never by the text of its icon or action buttons.
- The disclosure is a real button with aria-expanded and a label naming what it discloses, and it stops propagation so collapsing a group never changes the selection. Inside a Tree the treeitem carries aria-expanded and the arrow keys, so the button becomes a pointer target only: aria-hidden, out of the tab order, and it leaves focus where it was when clicked.
- The disclosure's POINTER TARGET is bigger than the mark it draws. `--tree-column` is 20px comfortable and 18px compact, both under WCAG 2.5.8's 24x24 floor, so a centred pseudo-element takes the hit at `--control-xs` (28/24) instead. The drawn box stays on the column, because that column is also the indent step — growing the button would push every name in the tree one column right.
- Right-rail actions stay in the tab order, so a row with actions costs extra Tab stops. Keep actions few and reveal them with `reveal-on-hover`, which also shows them on focus and always on touch.
- `dimmed` is presentation only. A row switched off must also say so in its actions' aria-pressed or its accessible name; opacity alone is invisible to a screen reader and fails contrast.
- Right-rail controls that appear on hover must also appear on focus-visible, or they are unreachable by keyboard.

## Related

- Components: Panel, PanelSection, Workspace, Accordion, SideNav

## Examples

### File tree

```tsx
import { Icon, Tree, TreeRow } from "@sableui/react"

// Nest with subtree; folders own their open state via defaultExpanded.
// A row with no onClick toggles when clicked or activated, like a folder in
// a file explorer. Depth is inherited — never computed by hand.
<Tree aria-label="Files" className="max-w-xs">
  <TreeRow
    icon={<Icon name="folder" />}
    toggleLabel="src"
    subtree={
      <>
        <TreeRow icon={<Icon name="file" />} onClick={() => open("index.ts")}>index.ts</TreeRow>
        <TreeRow
          icon={<Icon name="folder" />}
          toggleLabel="components"
          defaultExpanded={false}
          subtree={
            <TreeRow icon={<Icon name="file" />} selected onClick={() => open("button.tsx")}>
              button.tsx
            </TreeRow>
          }
        >
          components
        </TreeRow>
      </>
    }
  >
    src
  </TreeRow>
  <TreeRow icon={<Icon name="file" />} onClick={() => open("README.md")}>README.md</TreeRow>
</Tree>
```

### Layer tree with per-node effects

```tsx
import { Button, Icon, Tree, TreeAddRow, TreeRow, TreeSection } from "@sableui/react"

<Tree aria-label="Layers" className="min-h-0 flex-1 overflow-y-auto scrollbar-quiet">
  <TreeSection title="Document effects" hint="Applied to the flattened composite">
    <TreeRow depth={0} icon={<Icon name="sparkles" />}>Channel shift</TreeRow>
    <TreeAddRow depth={0} label="Add effect" />
  </TreeSection>

  <TreeSection title="Layers" action={<span className="text-ui-num text-muted-foreground">2</span>}>
    <TreeRow
      depth={0}
      expandable
      expanded
      toggleLabel="Backdrop"
      icon={<Icon name="image-stack" />}
      actions={<Button size="icon-xs" variant="ghost" aria-label="Hide Backdrop"><Icon name="eye" /></Button>}
    >
      Backdrop
    </TreeRow>
    <TreeRow depth={1} icon={<Icon name="sparkles" />}>Block displacement</TreeRow>
    <TreeAddRow depth={1} label="Add effect" />

    <TreeRow depth={0} icon={<Icon name="image-stack" />} dimmed>Overlay</TreeRow>
    <TreeAddRow depth={0} label="Add image" />
  </TreeSection>
</Tree>
```

### Empty state — one line, one action

```tsx
import { TreeAddRow, TreeEmpty, TreeSection } from "@sableui/react"

// A section with nothing in it offers exactly ONE way forward. Not EmptyState:
// that is page-register (px-6 py-12 around a size-12 disc) and in a 240px panel
// it spends 24px of inset and ~96px of height on nothing.
<TreeSection title="Layers">
  <TreeEmpty message="No images yet" action={<TreeAddRow depth={0} label="Add image" />} />
</TreeSection>

// As a drop region — the app owns the drag handlers; TreeEmpty owns the frame
// and sets data-drop-target so a data-[drop-active] style can respond.
<TreeEmpty
  dropTarget
  message="Drop an image"
  data-drop-active={dragging || undefined}
  onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
  onDragLeave={() => setDragging(false)}
  onDrop={handleDrop}
  className="data-[drop-active]:border-primary"
/>
```

### Selection and disclosure

```tsx
import { Icon, Tree, TreeRow } from "@sableui/react"

<Tree aria-label="Layers">
  <TreeRow
    depth={0}
    expandable
    expanded={open}
    onExpandedChange={setOpen}
    toggleLabel="Group 1"
    icon={<Icon name="folder" />}
    selected
    onClick={() => select("group-1")}
  >
    Group 1
  </TreeRow>
  {open ? <TreeRow depth={1} icon={<Icon name="file" />}>Child</TreeRow> : null}
</Tree>
```

### An empty branch

```tsx
import { Icon, TreeAddRow, TreeEmpty, TreeRow } from "@sableui/react"

// A layer with no effects: TreeEmpty at the branch's depth lands on the
// same edge its effect rows would — no hand-computed inset.
<TreeRow depth={0} icon={<Icon name="image-stack" />} toggleLabel="Overlay" subtree={
  <>
    <TreeEmpty message="No effects yet" />
    <TreeAddRow label="Add effect" />
  </>
}>
  Overlay
</TreeRow>
```

### Aligning a custom affordance

```tsx
import { treeIndent } from "@sableui/react"

// Anything else that needs a tree inset reads it from the same place the rows do.
<div style={{ paddingInlineStart: treeIndent(1) }} className="flex h-(--control-xs) items-center">
  <span className="text-ui-body text-muted-foreground">Drag a layer here</span>
</div>
```

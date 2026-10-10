# StatusBar

**Status:** stable

The bottom chrome strip of a Workspace: ambient document facts — dimensions, counts, sync state — in the micro type tier.

**Keywords:** status bar, status, footer, chrome, workspace, tool, ambient, counts, document

## Usage

Use StatusBar for the persistent facts about a document that otherwise have nowhere to live: size, counts, selection state, sync or connection status. Everything in it is ambient — it reports, it does not command. Pair it with Workspace's statusBar slot.

### Best practices

- Do: Put document-scoped facts here — dimensions, layer or record counts, saved/sync state — so panels stop competing for that space.
- Do: Use StatusBarGroup with align="end" for the trailing cluster, and StatusBarSeparator between related facts.
- Do: Render numeric facts in the UI num tier so a changing value doesn't shift the strip's layout.
- Don't: Make it the only route to an action. It's ambient chrome at the micro tier — anything essential needs a real control elsewhere too.
- Don't: Put zoom here. Anchor zoom to the canvas it acts on, which is where every reference tool puts it.
- Don't: Use it for transient feedback like a save confirmation — that's Toast. A status bar states what is true, not what just happened.
- Don't: Derive a fact here separately from the surface that shows it, or from something expensive to recompute. The strip re-renders with the document, so read the same value the canvas or panel uses: a status bar that reports max(asset sizes) while the canvas reports something else is a bug types cannot catch, because both are numbers.

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| StatusBarGroup | no | A cluster of items; align="end" pins it to the trailing edge. |
| StatusBarSeparator | no | A decorative dot between related facts; aria-hidden. |

## Subcomponents

| Name | Type | Description |
| --- | --- | --- |
| StatusBarGroup | { align?: 'start' \| 'end' } | A cluster of status items; `end` pushes it to the trailing edge. |
| StatusBarSeparator | ComponentProps<'span'> | A decorative middle dot between facts. aria-hidden, since order conveys grouping. |

## Tokens used

`muted-foreground`, `panel`, `hairline`, `hairline-strong`

## Accessibility

- Renders a <footer>, so the strip is a discoverable region rather than an anonymous row of text.
- Separators are aria-hidden — a screen reader announcing 'middle dot' between every fact is noise.
- Micro-tier text is small by design; never put information here that exists nowhere else.

## Related

- Components: Workspace, PanelGroup, InlineStatus, Toast, Banner

## Examples

### Document facts with a trailing cluster

```tsx
import { StatusBar, StatusBarGroup, StatusBarSeparator } from "@sableui/react"

<StatusBar>
  <span className="text-ui-num">1024 × 768</span>
  <StatusBarSeparator />
  <span>3 layers</span>
  <StatusBarGroup align="end">
    <span>Saved</span>
  </StatusBarGroup>
</StatusBar>
```

### With a warning tone

```tsx
import { StatusBar, StatusBarGroup } from "@sableui/react"

<StatusBar>
  <span>Offline — edits are queued</span>
  <StatusBarGroup align="end">
    <span className="text-tone-warning">2 unsynced</span>
  </StatusBarGroup>
</StatusBar>
```

### In a Workspace

```tsx
import { PanelGroup, StatusBar, Workspace, WorkspaceCanvas } from "@sableui/react"

<Workspace statusBar={<StatusBar><span>Connected</span></StatusBar>}>
  <PanelGroup>
    <WorkspaceCanvas />
  </PanelGroup>
</Workspace>
```

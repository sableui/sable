# Workspace

**Status:** stable

The shell for a tool: a fixed viewport partitioned into independently scrolling regions, with a compact density scope, a skip link, and a canvas landmark.

**Keywords:** workspace, tool, editor, shell, frame, canvas, chrome, panels, density, viewport, issue tracker, tracker, inspector, reading view, mobile, responsive, bottom nav, media query, breakpoint, top bar, topbar

## Usage

Use Workspace as the outer frame for a tool — an editor, a console, a canvas app. It owns the viewport, scopes the compact control density, and guarantees a skip link plus a main landmark on the canvas. Reach for AppShell instead for page-register products: it is built around a scrolling document, where a workspace is built around a fixed one. Workspace fills the viewport (h-dvh) by design; to embed one in a page (a docs preview, a modal-sized demo), wrap it in a bounded container and pass className="h-full".

### Best practices

- Do: Put a PanelGroup in the body and a WorkspaceCanvas inside it, so panels are aside chrome and the work surface is the main landmark.
- Do: Let each panel own its scrolling. The shell never scrolls, and the canvas clips rather than scrolls — panning is the viewport's job.
- Do: Keep the density scope at compact unless you have a specific reason; the workspace register's measured control ladder is what makes tool chrome read as tool chrome.
- Do: Put a WorkspaceBar inside a column when the bar belongs to that column only. An issue tracker's bar (breadcrumb, view tabs, filters) sits above the list, while the sidebar and the inspector beside it run the full height: put the WorkspaceBar first inside the WorkspaceCanvas, not in the `toolbar` slot, which spans every panel. Don't hand-build a fixed-height header for it.
- Do: Wrap a reading view inside the workspace (a project overview, an update, a doc, release notes) in <Density value="comfortable">. The compact scope maps body text to the 11–12px UI tiers, which is right for chrome and too small for paragraphs; the comfortable scope gives prose its page size again while the chrome around it stays compact.
- Do: Plan the phone layout with the shell rather than around it: pass a BottomNav to `bottomNav`, and give docked Panels `narrow="sheet"` (an inspector, a navigation rail) or `narrow="hidden"`. Don't measure the viewport with a resize listener, render the inspector twice, or subtract the nav's height from 100dvh.
- Don't: Nest a Region or Page inside it to set a width. Region caps are a page-register idea; a workspace is edge-to-edge and its panels are fixed-width chrome outside the content grid.
- Don't: Hardcode a control height (h-[32px]). CI rejects it (raw-control-height); read the ladder instead, e.g. h-(--control-sm), so the density scope can size it.
- Don't: Put a Card in the chrome. Use PanelSection — a card inside a narrow panel spends its border and inset on nothing.
- Don't: Use it for a dashboard that scrolls. If the primary interaction is reading down a page, that's AppShell plus a Region, not a workspace.

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| WorkspaceBar | no | Top chrome at --chrome-bar-height with a hairline beneath: toolbar, document tabs, menubar row. |
| Body | yes | The flexible middle row, normally a PanelGroup. Constrained so its children can shrink and scroll. |
| WorkspaceCanvas | no | The work surface and the main#main-content landmark the skip link targets. Clips rather than scrolls. |
| StatusBar | no | Bottom chrome for ambient document facts. |
| BottomNav | no | Phone navigation in the `bottomNav` slot. Its row is reserved below lg and gone above it, so the body ends where the nav begins. |

## Subcomponents

| Name | Type | Description |
| --- | --- | --- |
| WorkspaceBar | ComponentProps<'header'> | The top chrome strip, sized to --chrome-bar-height with a hairline beneath. |
| WorkspaceCanvas | ComponentProps<'main'> | The work surface: renders main#main-content, fills the body, clips its overflow. |
| useMediaQuery | (query: string, options?: { serverValue?: boolean }) => boolean | True while a media query matches, read through useSyncExternalStore: no resize listener, no setState in an effect, no hydration mismatch (the server reports serverValue, default false). Use it to branch structure a class cannot express; style-only changes stay as lg: classes. |
| useBelowBreakpoint | (breakpoint?: "sm" \| "md" \| "lg" \| "xl" \| "2xl", options?: { serverValue?: boolean }) => boolean | True below a named breakpoint (default lg), flipping at the width where that breakpoint's classes start to apply (Tailwind's sm 40 / md 48 / lg 64 / xl 80 / 2xl 96rem). Panel's `narrow` uses it; reach for it instead of a hand-rolled window.innerWidth check. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| toolbar | ReactNode | — | Top chrome, normally a WorkspaceBar. |
| statusBar | ReactNode | — | Bottom chrome, normally a StatusBar. |
| bottomNav | ReactNode | — | Phone navigation, normally a BottomNav. Below lg (BottomNav's own breakpoint) the shell reserves the nav's height as its last row, so the body and the status bar end above the nav instead of under it; above lg the row is gone. Every slot is optional: the body is the shell's one growing row whichever of toolbar, statusBar and bottomNav are present. |
| density | "compact" \| "comfortable" | "compact" | Density scope for everything inside. Sets the --control-* ladder via data-density; compact is the workspace register. Nothing hardcodes a height, so the same size="md" Button is 40px on a page and 32px inside a compact Workspace. A Dialog opened from inside resets to comfortable, because a modal is a page-register surface even when a tool launched it. |
| skipLinkLabel | string | "Skip to canvas" | Text for the skip link that targets the canvas landmark. |

## Tokens used

`canvas`, `canvas-foreground`, `panel`, `hairline`, `popover`, `popover-foreground`, `ring`

## Accessibility

- Renders a skip link to #main-content as the first focusable element, even though there is no scrolling document.
- WorkspaceCanvas is the <main id="main-content"> landmark; Panels are <aside> chrome with their own names.
- Density only changes control sizes, never hit-target rules — an icon button at the 24px floor still needs a padded 44px hit area.

## Related

- Components: PanelGroup, PanelSection, StatusBar, ScrubField, AppShell

## Examples

### Editor shell

```tsx
import { Button, Panel, PanelGroup, PanelSection, PropertyPair, PropertyRow, ScrubField, Separator, StatusBar, StatusBarGroup, StatusBarSeparator, Switch, Workspace, WorkspaceBar, WorkspaceCanvas } from "@sableui/react"

<Workspace
  toolbar={
    <WorkspaceBar>
      <span className="px-1 text-ui-md text-foreground">Studio</span>
      <Separator orientation="vertical" className="mx-1 h-4" />
      <Button size="xs" variant="ghost">Open</Button>
    </WorkspaceBar>
  }
  statusBar={
    <StatusBar>
      <span className="text-ui-num">1024 × 768</span>
      <StatusBarSeparator />
      <span>3 layers</span>
      <StatusBarGroup align="end"><span>Saved</span></StatusBarGroup>
    </StatusBar>
  }
>
  <PanelGroup>
    <Panel label="Layers" width={240}>
      <PanelSection title="Layers">
        <PropertyRow label="Background"><Switch defaultChecked /></PropertyRow>
      </PanelSection>
    </Panel>
    <WorkspaceCanvas>
      <div className="grid h-full place-items-center text-ui-body text-muted-foreground">Canvas</div>
    </WorkspaceCanvas>
    <Panel label="Properties" width={256}>
      <PanelSection title="Blending">
        <PropertyPair>
          <ScrubField label="Opacity" icon="grid" suffix="%" value={100} min={0} max={100} />
          <ScrubField label="Blur" value={0} min={0} max={64} suffix="px" />
        </PropertyPair>
      </PanelSection>
    </Panel>
  </PanelGroup>
</Workspace>
```

### Console shell (no canvas)

```tsx
import { Input, Panel, PanelGroup, PanelSection, PropertyRow, StatusBar, Workspace, WorkspaceCanvas } from "@sableui/react"

<Workspace statusBar={<StatusBar><span>Connected</span></StatusBar>}>
  <PanelGroup>
    <Panel label="Sources" width={240}>
      <PanelSection title="Sources">
        <PropertyRow label="Filter"><Input placeholder="Search" /></PropertyRow>
      </PanelSection>
    </Panel>
    <WorkspaceCanvas className="overflow-y-auto scrollbar-quiet">
      <div className="p-3 text-ui-num text-muted-foreground">log output…</div>
    </WorkspaceCanvas>
  </PanelGroup>
</Workspace>
```

### Issue tracker: column bar, docked inspector, phone sheet

```tsx
import { BottomNav, BottomNavItem, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, Breadcrumbs, BreadcrumbSeparator, Button, Icon, Input, Panel, PanelGroup, PanelSection, PropertyRow, StatusBar, Workspace, WorkspaceBar, WorkspaceCanvas } from "@sableui/react"

function Tracker() {
  const [selected, setSelected] = useState<string | null>("AES-104")
  return (
    <Workspace
      bottomNav={
        <BottomNav>
          <BottomNavItem showLabel label="Issues" icon={<Icon name="list" />} active />
          <BottomNavItem showLabel label="Inbox" icon={<Icon name="inbox" />} />
        </BottomNav>
      }
      statusBar={<StatusBar><span>12 issues</span></StatusBar>}
    >
      <PanelGroup>
        <Panel label="Navigation" width={220} narrow="hidden">
          <PanelSection title="Workspace">
            <PropertyRow label="Team"><Input defaultValue="Studio" /></PropertyRow>
          </PanelSection>
        </Panel>
        <WorkspaceCanvas className="flex flex-col">
          <WorkspaceBar>
            <Breadcrumbs>
              <BreadcrumbItem><BreadcrumbLink href="#">Studio</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage>Digital flagship</BreadcrumbPage></BreadcrumbItem>
            </Breadcrumbs>
          </WorkspaceBar>
          <div className="min-h-0 flex-1 overflow-y-auto scrollbar-quiet">
            <Button size="xs" variant="ghost" onClick={() => setSelected("AES-104")}>AES-104 Refine product page</Button>
          </div>
        </WorkspaceCanvas>
        <Panel
          label="Issue details"
          width={320}
          narrow="sheet"
          open={selected !== null}
          onOpenChange={(open) => !open && setSelected(null)}
        >
          <PanelSection title={selected ?? ""}>
            <PropertyRow label="Status"><Input defaultValue="In progress" /></PropertyRow>
          </PanelSection>
        </Panel>
      </PanelGroup>
    </Workspace>
  )
}
```

### Reading view inside a workspace

```tsx
import { Density, PanelGroup, Workspace, WorkspaceCanvas } from "@sableui/react"

<Workspace>
  <PanelGroup>
    <WorkspaceCanvas className="overflow-y-auto scrollbar-quiet">
      <Density value="comfortable">
        <article className="max-w-prose p-6">
          <h2 className="text-heading-3">Project overview</h2>
          <p className="mt-3 text-body-md text-muted-foreground">
            Paragraphs keep their page size here, while the chrome around the canvas stays compact.
          </p>
        </article>
      </Density>
    </WorkspaceCanvas>
  </PanelGroup>
</Workspace>
```

### Comfortable density

```tsx
import { PanelGroup, Workspace, WorkspaceBar, WorkspaceCanvas } from "@sableui/react"

<Workspace density="comfortable" toolbar={<WorkspaceBar><span className="text-ui-md">Review</span></WorkspaceBar>}>
  <PanelGroup>
    <WorkspaceCanvas>
      <div className="grid h-full place-items-center text-body-md text-muted-foreground">Touch-friendly review mode</div>
    </WorkspaceCanvas>
  </PanelGroup>
</Workspace>
```

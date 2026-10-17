# Tabs

**Status:** stable

Tabs over Base UI Tabs (roving focus, arrow-key nav, ARIA tablist wiring) in two styles: underline (page sections) or pill (compact switchers), with one indicator that glides to the active tab. Tabs (Root) + TabsList + TabsTrigger + TabsPanel.

**Keywords:** tabs, tablist, panels, segmented content

## Usage

Use Tabs to switch between related panels within the same page context.

### Best practices

- Do: Use tabs when each panel is peer content and users may compare or switch often.
- Do: Keep tab labels short and make the active tab unmistakable.
- Do: Use variant="pill" for a short switcher inside a card or toolbar (Preview / Code, List / Grid); keep the default underline for sections of a page.
- Don't: Do not use Tabs for unrelated pages or primary navigation that needs distinct URLs. → use **SideNav**, **NavigationMenu**
- Don't: Do not use tabs for sequential steps. Tabs are peer views the user returns to in any order; a process with an order needs a stepper, or the user will skip ahead. → use **Stepper**

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| TabsList | yes | The list of tab triggers. |
| TabsTrigger | yes | One selectable tab. |
| TabsPanel | yes | The content associated with a trigger. |
| TabsContent | no | Compatibility alias for panel content. |

## Subcomponents

| Name | Type | Description |
| --- | --- | --- |
| TabsList | Base UI Tabs.List props (activateOnFocus, loopFocus) + variant?: "underline" \| "pill" + className | The tablist row. variant="underline" (default) draws a divider rule beneath the triggers; variant="pill" drops the rule and fills the active trigger, which takes the theme's button shape (--button-radius). Triggers inherit the variant. It renders the gliding indicator (Base UI Tabs.Indicator) itself, so do not add one. |
| TabsTrigger | Base UI Tabs.Tab props (value, disabled) + className | A single tab button. value pairs it with the panel of the same value. |
| TabsPanel | Base UI Tabs.Panel props (value, keepMounted) + className | The content shown when the matching trigger is active. |
| TabsContent | Alias of TabsPanel | Re-export of TabsPanel for consumers that prefer this name. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| Tabs (Root) | Base UI Tabs.Root props (value, defaultValue, onValueChange, orientation) | defaultValue: 0 | Controls the active tab. Uncontrolled via defaultValue; controlled via value + onValueChange. |
| motion | "full" \| "subtle" \| "off" | "full" | On Tabs: how much motion this component uses: `full` (default) inherits the app's policy, `subtle` keeps feedback and drops the glide, `off` stills it. It can only turn motion down — it never overrides a reader's reduce-motion setting. |

## Tokens used

`border`, `muted`, `muted-foreground`, `foreground`, `ring`

## Motion

- **arrival** · Root · _no motion_ — Tabs arrive with the section they organise. An entrance of their own would announce navigation chrome louder than the content it navigates.
- **response** · TabsTrigger · `motion-interactive` — The label steps from muted to foreground under the pointer; the ease is what makes that read as an answer rather than a repaint.
- **transition** · Indicator · `motion-glide` — One underline (or pill) travels to the new tab and stretches to its width. A mark that teleports makes the reader re-find the selection on every click; one that moves is tracked without looking. Expressive: motion="subtle" lands it in place. Each tab's own mark is the fallback until the indicator has measured, so the server render is already right.
- **transition** · TabsPanel · `animate-fade-in` — The incoming panel fades in, opacity only, so a switch between two similar panels still registers. Skipped on first render (activation direction "none") so a page of tabs does not fade in on load, and the outgoing panel leaves layout at once so a quick second click never stacks both.
- **activity** · Root · _no motion_ — Switching tabs is synchronous. A panel that loads data shows its own Skeleton or Spinner inside the panel, where the wait is.

## Accessibility

- Base UI provides the tablist/tab/tabpanel roles, aria-selected, and roving tabindex.
- Arrow keys move between tabs; Home/End jump to first/last; panels are linked via aria-controls.
- Active tab styling reads from the data-active attribute; disabled tabs from data-disabled. Disabled tabs are skipped by arrow-key navigation.
- Keyboard focus shows a ring on the focused trigger in both variants; the panel remains focusable.
- The gliding indicator is role="presentation" decoration; aria-selected on the tab carries the state.

## Related

- Components: Accordion, BottomNav, SideNav

## Examples

### Basic

```tsx
import { Tabs, TabsList, TabsPanel, TabsTrigger } from "@sableui/react"

<Tabs defaultValue="overview"><TabsList><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="activity">Activity</TabsTrigger></TabsList><TabsPanel value="overview">Overview content</TabsPanel><TabsPanel value="activity">Activity content</TabsPanel></Tabs>
```

### Pill switcher

```tsx
import { Tabs, TabsList, TabsPanel, TabsTrigger } from "@sableui/react"

<Tabs defaultValue="preview"><TabsList variant="pill"><TabsTrigger value="preview">Preview</TabsTrigger><TabsTrigger value="code">Code</TabsTrigger></TabsList><TabsPanel value="preview">Rendered example</TabsPanel><TabsPanel value="code">Source</TabsPanel></Tabs>
```

### With a disabled tab

```tsx
import { Tabs, TabsList, TabsPanel, TabsTrigger } from "@sableui/react"

<Tabs defaultValue="overview"><TabsList><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="billing" disabled>Billing</TabsTrigger></TabsList><TabsPanel value="overview">Overview content</TabsPanel></Tabs>
```

### Subtle motion

```tsx
import { Tabs, TabsList, TabsPanel, TabsTrigger } from "@sableui/react"

<Tabs defaultValue="table" motion="subtle"><TabsList><TabsTrigger value="table">Table</TabsTrigger><TabsTrigger value="chart">Chart</TabsTrigger></TabsList><TabsPanel value="table">Rows</TabsPanel><TabsPanel value="chart">Trend</TabsPanel></Tabs>
```

# Tabs

**Status:** stable

Tabs over Base UI Tabs (roving focus, arrow-key nav, ARIA tablist wiring) in two styles: underline (page sections) or pill (compact switchers). Tabs (Root) + TabsList + TabsTrigger + TabsPanel.

**Keywords:** tabs, tablist, panels, segmented content

## Usage

Use Tabs to switch between related panels within the same page context.

### Best practices

- Do: Use tabs when each panel is peer content and users may compare or switch often.
- Do: Keep tab labels short and make the active tab unmistakable.
- Do: Use variant="pill" for a short switcher inside a card or toolbar (Preview / Code, List / Grid); keep the default underline for sections of a page.
- Don't: Do not use Tabs for unrelated pages or primary navigation that needs distinct URLs.
- Don't: Do not use tabs for sequential steps. Tabs are peer views the user returns to in any order; a process with an order needs a stepper, or the user will skip ahead.

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
| TabsList | Base UI Tabs.List props (activateOnFocus, loopFocus) + variant?: "underline" \| "pill" + className | The tablist row. variant="underline" (default) draws a divider rule beneath the triggers; variant="pill" drops the rule and fills the active trigger, which takes the theme's button shape (--button-radius). Triggers inherit the variant. |
| TabsTrigger | Base UI Tabs.Tab props (value, disabled) + className | A single tab button. value pairs it with the panel of the same value. |
| TabsPanel | Base UI Tabs.Panel props (value, keepMounted) + className | The content shown when the matching trigger is active. |
| TabsContent | Alias of TabsPanel | Re-export of TabsPanel for consumers that prefer this name. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| Tabs (Root) | Base UI Tabs.Root props (value, defaultValue, onValueChange, orientation) | defaultValue: 0 | Controls the active tab. Uncontrolled via defaultValue; controlled via value + onValueChange. |

## Tokens used

`border`, `muted`, `muted-foreground`, `foreground`, `ring`

## Accessibility

- Base UI provides the tablist/tab/tabpanel roles, aria-selected, and roving tabindex.
- Arrow keys move between tabs; Home/End jump to first/last; panels are linked via aria-controls.
- Active tab styling reads from the data-active attribute; disabled tabs from data-disabled. Disabled tabs are skipped by arrow-key navigation.
- Keyboard focus shows a ring on the focused trigger in both variants; the panel remains focusable.

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

<Tabs defaultValue="overview"><TabsList><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="holders" disabled>Holders</TabsTrigger></TabsList><TabsPanel value="overview">Overview content</TabsPanel></Tabs>
```

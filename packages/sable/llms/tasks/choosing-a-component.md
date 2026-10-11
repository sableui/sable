# Task: choosing between similar components

Sable has several components that look alike and do different jobs. Choosing
the wrong one usually still renders, so nothing fails. It shows up later as
a focus trap where none belonged, a menu that cannot hold a form, or a status
that a screen reader never announces. Use the tables below before you compose.
For each component, `npx sable component <Name> --detail full` has the full
contract.

The question to ask is always **what the user is doing**, not what it looks like.

## Surfaces that open over the page

| The user is… | Use | Not |
|---|---|---|
| Making a focused decision or filling a short form, and the page should wait | `Dialog` | `Sheet` (too much room), `Popover` (no focus trap) |
| Confirming something irreversible | `DestructiveActionModal` | a `Dialog` you style red: it already handles the async confirm, the spinner and the verb-first labels |
| Working through a long or secondary task beside the page context (filters, details, an edit form) | `Sheet` | `Dialog` (cramps long content) |
| Viewing media full-bleed | `Dialog` with `DialogContent size="fullscreen"` | `Dialog` at its default size (500px cap) |
| Adjusting a few controls anchored to a trigger, without leaving the flow | `Popover` | `Menu` (cannot hold inputs) |
| Reading a rich preview of a link or a name on hover or focus | `ContextCard` | `Tooltip` (plain text only), `Popover` (needs a click) |
| Reading a short label for an icon or control | `Tooltip` | anything that holds interactive content: tooltips are not reachable by touch |
| Jumping anywhere or running a command by name | `CommandMenu` | `Combobox` (one field's value, not app-wide actions) |
| Sending a quick rating and message | `Feedback` | a hand-built `Popover` + `Textarea` |

## Lists of actions

| The user is… | Use | Not |
|---|---|---|
| Choosing one action from a list under a button | `Menu` | `Select` (that picks a *value*) |
| Reaching secondary actions for a row or card | `OverflowMenu` | a bare `Menu` with a hand-made icon trigger |
| Acting on the thing under the pointer (right-click or long press) | `ContextMenu`, always mirrored in a visible `OverflowMenu` | `ContextMenu` alone: it is undiscoverable |
| Changing a few settings that each show their current value | `SettingsMenu` | a `Menu` of toggles that hides each current state |
| Running a main action that has close variations | a `Button` beside an icon `Button` that opens a `Menu` | a hand-fused split control |

## Picking a value

| The user is… | Use | Not |
|---|---|---|
| Picking one of 2–5 visible options | `Radio` (`RadioGroup`) | `Select`: hiding five options behind a click costs a click |
| Picking one option that needs a title and description | `RadioCard` (in a `RadioGroup`) | `Radio` with hand-styled cards |
| Picking several options that need a title and description | `CheckboxCard` | `Checkbox` with hand-styled cards |
| Picking one of many known options | `Select` | `Combobox`, unless the list is long enough to need typing |
| Picking one of a long or searchable list | `Combobox` | `Select` (no filtering) |
| Picking several from a long list | `Combobox multiple` with `ComboboxChips` | a column of `Checkbox`es past about eight items |
| Turning a setting on or off with an immediate effect | `Switch` | `Checkbox` (that is a form value applied on submit) |
| Agreeing to something, or ticking a form value submitted later | `Checkbox` | `Switch` |
| Switching a view mode, or pressing a formatting toggle | `Toggle` / `ToggleGroup` | `Tabs` (those swap content panels) |
| Entering a one-time code | `OtpField` | `Input type="number"` |
| Entering a number, nudging with keys or steppers | `NumberField` | `Input type="number"` |
| Scrubbing a number by dragging, in tool chrome | `ScrubField` | `Slider` (page register) |
| Choosing a value along a range | `Slider` | `NumberField` when the exact value matters more than position |
| Adding files | `FileDropzone`, with accepted files listed as `Attachment` rows | a bare `<input type="file">` |

## Showing more or less

| The user is… | Use | Not |
|---|---|---|
| Switching between peer views of one object | `Tabs` | `Accordion` (stacked, not peer) |
| Scanning several sections and opening one or more | `Accordion` | a column of `Collapsible`s you coordinate by hand |
| Opening one optional block | `Collapsible` | `Accordion` with one item |
| Reading a long block that starts clipped | `ShowMore` | a fixed-height box with `overflow-auto` |

## Status, progress and feedback

| What you are communicating | Use | Not |
|---|---|---|
| Work happening, with a known percentage | `Progress` | `Meter` (not task progress) |
| How full something is within a known range (storage, quota, strength) | `Meter`, or `Meter shape="ring"` in a stat card | `Progress` |
| Where the user is in a multi-step flow | `Stepper` | `Progress` (loses which step) |
| Content loading in place, with a known shape | `Skeleton` | `Spinner` (makes the layout jump when content lands) |
| A short wait with no known shape | `Spinner` | `Skeleton` |
| Someone typing, or a reply composing | `Spinner appearance="dots"` / `StreamingText` | the ring `Spinner` |
| The whole app booting | `PageLoader` | a centred `Spinner` |
| The result of an action, transient | `Toast` | `Banner` (persistent) |
| A one-line status beside the thing it describes | `InlineStatus` | `Toast` (detached from the cause) |
| Guidance or a caveat inside content | `Note` | `Banner` |
| A page-wide announcement | `Banner` | `Note` |
| Which scope or environment the user is in (preview, staging) | `Banner` with a `label` chip | a hand-built strip |
| Nothing here yet, with a next step | `EmptyState` | an empty `Table` |
| A failure with a recovery action, in a region | `EmptyState tone="destructive"` (`surface="card"` among cards, `size="lg"` for a page) | `Note tone="destructive"` |
| A state label (live, failed, draft) | `Badge appearance="plain" tone=… dot` (dot plus label) | `StatusDot` alone: it is decorative and silent |
| Metadata or a category | `Badge`; `Pill` when it can be selected | `Badge appearance="plain" dot` (that is a status) |

## Tables and trees

| The data is… | Use | Not |
|---|---|---|
| Static rows you lay out by hand | `Table` | `DataTable` |
| Rows from an array that need sorting or selection | `DataTable` | `Table` plus hand-written sort state |
| Files, folders, layers or an outline | `Tree` (`TreeRow icon`) | a nested list built by hand |

## Navigation

| The user is… | Use | Not |
|---|---|---|
| Moving between the app's top-level areas on desktop | `Sidebar` inside `AppShell` | `SideNav` |
| Moving between sub-pages of a section (settings, docs) | `SideNav` | `Sidebar` (that is app chrome) |
| Moving between top-level areas on mobile | `BottomNav` | a hamburger-only `Sheet` |
| Paging through results with known counts | `Pagination` | `Button variant="secondary" loading` |
| Continuing a feed | `<Button variant="secondary" loading loadingLabel="Loading…">` | `Pagination` |

## When nothing fits

Compose from layout primitives (`Stack`, `Row`, `Grid`, `Region`) and the
closest component. Do not restyle a component into a different one. If you
find yourself fighting a component's role, you are holding the wrong one.
Retrieve its `usage.bestPractices`, which name the neighbouring component to
use instead.

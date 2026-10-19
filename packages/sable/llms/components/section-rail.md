# SectionRail

**Status:** stable

A slim vertical rail of dots, one per section of a long page, that shows where the reader is and jumps to any section. The current section's bar glides as the page scrolls; a shared tooltip names each dot.

**Keywords:** section rail, scroll spy, scrollspy, dot navigation, page navigation, table of contents, on this page, chapter nav, scroll progress, case study nav

## Usage

Use SectionRail beside a long, single-column read — a case study, an essay, a long landing page — so the reader can see which section they are in and jump to another without leaving the text. It follows the scroll by itself (useActiveSection); pass value when the parent already knows the current section.

### Best practices

- Do: Give every section an id that matches its entry, and keep the list to the page's top-level sections — about ten at most, so the rail stays shorter than the viewport.
- Do: Place it with layout classes — usually `fixed top-1/2 left-6 z-(--z-nav) -translate-y-1/2` — and hide it below the width where it would overlap the text (`max-lg:hidden`). Offer the same links another way on narrow screens, such as a Collapsible list at the top of the page.
- Do: Pass `root` when the content scrolls inside an element (a Scroller, an inset AppShell main) rather than the window, and give sections `scroll-mt-*` when a sticky header would cover their tops after a jump.
- Do: Set `side="right"` when the rail sits on the right edge, so labels open toward the content.
- Don't: Use it for app navigation between pages; that is SideNav or Sidebar. A SectionRail only moves within one page. → use **SideNav**, **Sidebar**
- Don't: Use it to show the steps of a task or a flow; that is Stepper, which shows progress through steps rather than position in a read. → use **Stepper**
- Don't: Use it for a handful of switchable views in one place; that is Tabs. → use **Tabs**

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| Rail | yes | The `<nav>` landmark: a rounded muted track holding one link per section. |
| Dot | yes | A link to `#id`, drawn as a small dot that grows under the pointer or focus. |
| Marker | yes | One primary bar that sits on the current section's dot and glides to the next. |
| Label | yes | A shared tooltip that names the hovered or focused dot and travels between dots. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| sections | readonly { id: string; label: string }[] | — | The sections, in document order. `id` is the section element's id (the link goes to `#id`); `label` is the tooltip and the link's accessible name. |
| value | string | — | The current section's id, when the parent decides it. Leave it unset and the rail follows the scroll itself. |
| onValueChange | (id: string) => void | — | Called with the new id when the reader scrolls into a section or picks one. |
| offset | number | 0.35 | Where the reading line sits, as a fraction of the viewport from its top. A section becomes current once its top crosses it. |
| root | RefObject<HTMLElement \| null> | — | The element that scrolls, when it is not the window. |
| side | "left" \| "right" | "left" | Which edge of the page the rail sits on. The labels open on the other side, toward the content. |
| motion | "full" \| "subtle" \| "off" | "full" | How much motion this component uses: `full` inherits the app's policy, `subtle` keeps feedback and drops the marker's glide, `off` stills it. It can only turn motion down — it never overrides a reader's reduce-motion setting. |
| aria-label | string | "Sections" | The nav landmark's name. Name it for the page ("Case study sections") when it has other navs. |

## Tokens used

`muted`, `muted-foreground`, `foreground`, `primary`, `ring`, `popover`, `popover-foreground`, `border-floating`

## Motion

- **arrival** · Root · _no motion_ — Page chrome arrives with the page; the marker lands on the current section with no transition, because a bar sliding in on load narrates a move nobody made.
- **response** · Dot · `motion-interactive` — The dot darkens and grows under the pointer or focus, and the label travels between dots as one tooltip (TooltipGroup) rather than closing and reopening at each.
- **transition** · Marker · `motion-glide` — One bar travels to the new section as the page scrolls, so the change reads as movement down the page. A picked section holds the bar until the reader scrolls by hand, so it goes straight there instead of stepping through every section in between, and stays on the pick even when the page ends before that section can reach the reading line. Expressive: `subtle` moves it at once.
- **activity** · Root · _no motion_ — Navigation chrome has no working state.

## Accessibility

- Renders a <nav> landmark (default name "Sections") of real links to `#id`, so it works with no script, middle-click and copy-link.
- Each link is named by its section's label; the current one carries aria-current="location".
- Activating a link from the keyboard moves focus into the section, as following an anchor does, so the next Tab continues from there.
- The tooltip opens on focus as well as hover; the dots are 44×32 targets.
- Under reduced motion the jump is instant and the marker moves without travel.

## Related

- Components: SideNav, Tooltip, Stepper, Tabs, GlidingHighlight

## Examples

### Fixed beside a long read

```tsx
import { SectionRail } from "@sableui/react"

<SectionRail
  aria-label="Case study sections"
  sections={[
    { id: "overview", label: "Overview" },
    { id: "problem", label: "The problem" },
    { id: "process", label: "Process" },
    { id: "outcome", label: "Outcome" },
  ]}
  className="fixed top-1/2 left-6 z-(--z-nav) -translate-y-1/2 max-lg:hidden"
/>
```

### On the right edge

```tsx
import { SectionRail } from "@sableui/react"

<SectionRail
  side="right"
  sections={[
    { id: "intro", label: "Introduction" },
    { id: "usage", label: "Usage" },
    { id: "api", label: "API" },
  ]}
  className="fixed top-1/2 right-6 z-(--z-nav) -translate-y-1/2 max-lg:hidden"
/>
```

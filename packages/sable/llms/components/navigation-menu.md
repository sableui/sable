# NavigationMenu

**Status:** stable

A site header's primary nav over Base UI NavigationMenu: a bar of links and triggers, where a trigger opens a panel of links on hover, click or Enter. One shared panel glides between triggers and resizes to each one's content. Links take any router's link through `render` and mark the current page with `active`.

**Keywords:** navigation, nav, header nav, site nav, mega menu, top nav, navbar, dropdown nav

## Usage

Use NavigationMenu for a marketing or docs site's header: a few top-level destinations, some of which open a panel of related pages. Use Menu for actions rather than destinations, Tabs to switch views inside a page, Sidebar or SideNav for an app's persistent navigation, and AppHeader for an app's mobile top bar.

### Best practices

- Do: Keep the bar to a handful of entries. A trigger groups related pages; a destination with nothing beneath it is a plain NavigationMenuLink in its own item.
- Do: Give panel links a `description` when titles alone are ambiguous ("Sync" → "Offline first, conflict free"), and lay the Content out with layout classes (`grid w-[30rem] grid-cols-2`); the shared panel sizes itself to it.
- Do: Pass your router's link through `render` (`<NavigationMenuLink render={<Link to="/pricing" />}>`) and set `active` on the current page's link, so the bar shows where the reader is and announces it as `aria-current="page"`.
- Do: Below `md`, hide the bar and offer the same destinations in a Sheet opened from a menu Button: SheetContent side="left" holding a SideNav, its groups mirroring the panels. A hover panel has nothing to hover on a phone, and a bar of five entries does not fit one.
- Don't: Do not put actions in it (Sign in, New project). Those are Buttons beside the nav; the nav holds places to go.
- Don't: Do not assemble the panel yourself. The root renders the one Portal, Positioner, Popup and Viewport every trigger shares; a second one breaks the glide between triggers.

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| NavigationMenu | yes | The `<nav>` root; also renders the shared floating panel. |
| NavigationMenuList | yes | The bar: a `<ul>` the arrow keys rove across. |
| NavigationMenuItem | yes | One `<li>`: a link, or a trigger with its content. |
| NavigationMenuTrigger | no | Opens its item's content; carries a chevron. |
| NavigationMenuContent | no | The links a trigger reveals, rendered into the shared panel. |
| NavigationMenuLink | yes | A destination: a bar entry in an item, a two-line row in content. |

## Subcomponents

| Name | Type | Description |
| --- | --- | --- |
| NavigationMenuList | Base UI NavigationMenu.List props + className | The bar of items, a `<ul>`. Arrow keys move between entries. |
| NavigationMenuItem | Base UI NavigationMenu.Item props + className + value?: string | One `<li>` holding either a NavigationMenuLink or a NavigationMenuTrigger with its NavigationMenuContent. |
| NavigationMenuTrigger | Base UI NavigationMenu.Trigger props + className | Opens its item's content on hover, click or Enter, with a chevron that turns while open. Styled like the bar's links: muted at rest, full ink when hovered or open. |
| NavigationMenuContent | Base UI NavigationMenu.Content props + className + keepMounted?: boolean | The item's panel content. Size and lay it out with layout classes; the shared panel follows its size and slides it in from the side it was reached from. |
| NavigationMenuLink | Base UI NavigationMenu.Link props + className + href?: string + active?: boolean + closeOnClick?: boolean + render?: ReactElement + description?: ReactNode | A destination. In an item it is a bar entry; in content it is a row with an optional `description` line. `active` sets `aria-current="page"`; `render={<Link to="…" />}` keeps the roving focus on your router's link. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| NavigationMenu (Root) | Base UI NavigationMenu.Root props (value, defaultValue, onValueChange, delay, closeDelay, orientation) + className | — | The `<nav>`. `value` is the open item's value (null when closed); `delay` / `closeDelay` tune hover-to-open. |
| align | "start" \| "center" \| "end" | "start" | Alignment of the shared panel along its trigger. |
| sideOffset | number | 8 | Gap between the bar and the panel, in px. The pointer crosses it on a bridge, so the panel does not close on the way in. |

## Tokens used

`popover`, `popover-foreground`, `border-floating`, `accent`, `accent-foreground`, `muted-foreground`, `foreground`, `ring`

## Motion

- **arrival** · Panel · _custom (outside the recipe layer)_ — The panel fades and scales in from its trigger like a popover, but it also resizes as the reader moves between triggers, which motion-pop cannot express: Base UI measures each content into --popup-width/--popup-height and the popup transitions to them on the motion tokens.
- **response** · Trigger, Link · `motion-interactive` — Bar entries and panel rows fill on hover and focus like the other interactive surfaces, so the bar reads as live before anything opens.
- **transition** · Panel · _custom (outside the recipe layer)_ — Moving from one trigger to the next keeps one panel open: it glides along the bar and the new content slides in from the direction of travel, so the reader sees one surface changing rather than two popups swapping. Snaps on first open and on resize (data-instant), where a glide would mean nothing.
- **activity** · root · _no motion_ — Nothing in a nav moves on its own.

## Accessibility

- The root is a <nav>; give it an aria-label when the page has more than one nav ("Main").
- Arrow keys move across the bar; Enter, Space or ArrowDown opens a trigger's content and moves focus into it; Esc closes and returns focus to the trigger.
- A trigger is a button with aria-expanded; its content is reachable by Tab in reading order once open.
- `active` on a link sets aria-current="page" and gives it full ink, so the current page is announced as well as shown.
- Panel motion runs on the motion tokens, so reduced motion (or MotionProvider "reduced") collapses the glide and resize to instant.

## Related

- Components: Menu, SideNav, Sheet, AppHeader, Tabs

## Examples

### Bar with a panel

```tsx
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@sableui/react"

<NavigationMenu aria-label="Main">
	<NavigationMenuList>
		<NavigationMenuItem>
			<NavigationMenuTrigger>Product</NavigationMenuTrigger>
			<NavigationMenuContent className="grid w-[30rem] grid-cols-2">
				<NavigationMenuLink href="/editor" description="Write and review together.">Editor</NavigationMenuLink>
				<NavigationMenuLink href="/sync" description="Offline first, conflict free.">Sync</NavigationMenuLink>
			</NavigationMenuContent>
		</NavigationMenuItem>
		<NavigationMenuItem>
			<NavigationMenuLink href="/pricing">Pricing</NavigationMenuLink>
		</NavigationMenuItem>
	</NavigationMenuList>
</NavigationMenu>
```

### With a router, marking the current page

```tsx
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@sableui/react"
// <Link> = your router's link (react-router, next/link, @tanstack/router, …)

<NavigationMenu aria-label="Main">
	<NavigationMenuList>
		<NavigationMenuItem>
			<NavigationMenuLink active={path === "/docs"} render={<Link to="/docs" />}>Docs</NavigationMenuLink>
		</NavigationMenuItem>
		<NavigationMenuItem>
			<NavigationMenuLink active={path === "/blog"} render={<Link to="/blog" />}>Blog</NavigationMenuLink>
		</NavigationMenuItem>
	</NavigationMenuList>
</NavigationMenu>
```

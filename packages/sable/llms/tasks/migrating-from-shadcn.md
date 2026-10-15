# Task: migrating from shadcn/ui (and Radix) to Sable

An app built on shadcn/ui owns a `components/ui/` folder of copied Radix
wrappers. Sable replaces that folder with one installed package. The visible
API is close: Sable's semantic tokens share shadcn's names, and most
components keep their part names. The behaviour layer is different. Sable is
built on **Base UI**, not Radix, so composition, values and events follow Base
UI. This guide maps one to the other. Every Sable name below is in the
installed contract: confirm any of them with `sable component <Name>`.

Do the app-level work in [converting-an-app.md](./converting-an-app.md) first
(registers, wiring, deleting your tokens). This guide covers the component
swap that follows.

## 0. What goes away

- **`components/ui/*` and `components.json`.** Delete the folder once nothing
  imports it. Every component comes from `@sableui/react` (layout primitives
  too; blocks and patterns from `@sableui/react/blocks` and `/patterns`).
  Don't copy a Sable component into the app to edit it. Use a variant, a
  preset, or [patching-a-component.md](./patching-a-component.md).
- **`@radix-ui/*`, `cmdk`, `vaul`, `sonner`, `input-otp`, `next-themes`,
  `tw-animate-css`, `class-variance-authority` (unless the app's own code uses
  it) and `lucide-react`.** Each has a Sable counterpart below.
- **Your `globals.css` token block.** Sable's tokens carry the same names
  (`--background`, `--card`, `--primary`…) and are defined by the theme. A
  copied shadcn `:root { … }` block overrides them with values the theme
  never tested. Delete it, and move brand colour into a preset
  (`sable docs using-presets`).

`cn()` survives: Sable exports it (`import { cn } from "@sableui/react"`), with
the paired typography utilities registered in its merge groups.

## 1. The patterns that change everywhere

### `asChild` → `render`

Radix composes by cloning a child. Base UI takes the element as a prop:

```tsx
// shadcn
<DialogTrigger asChild><Button variant="outline">Edit</Button></DialogTrigger>

// Sable
<DialogTrigger render={<Button variant="outline">Edit</Button>} />
```

It applies to every trigger and close part (`DialogTrigger`, `DialogClose`,
`SheetTrigger`, `MenuTrigger`, `PopoverTrigger`, `TooltipTrigger`,
`CollapsibleTrigger`, `ContextCardTrigger`…). The same goes for links: a
`Button` that navigates is `<Button render={<Link to="/x" />}>Open</Button>`.
`SidebarItem`, `SidebarBrand`, `Card` and `Separator` take `render` too.

### Part names

| shadcn / Radix | Sable |
|---|---|
| `DropdownMenu*` | `Menu*`: `Menu`, `MenuTrigger`, `MenuContent`, `MenuItem` |
| `DropdownMenuLabel` | `MenuGroupLabel`, **inside a `MenuGroup`** (Base UI requires the group) |
| `DropdownMenuSub` / `SubTrigger` / `SubContent` | `MenuSubmenu` / `MenuSubmenuTrigger` / a nested `MenuContent side="inline-end"` |
| `*Content` on Accordion, Collapsible | `AccordionPanel`, `CollapsiblePanel` |
| `TabsContent` | `TabsPanel` (`TabsContent` is exported as an alias) |
| `HoverCard*` | `ContextCard*` |
| `Drawer*` (vaul) | `Sheet*` with `side="bottom"` |

Dialog, AlertDialog, Popover, Tooltip, Select, ContextMenu, Sheet and Combobox
keep `*Content`.

### Values are arrays where Base UI allows several

| shadcn / Radix | Sable |
|---|---|
| `<Accordion type="single" collapsible defaultValue="a">` | `<Accordion defaultValue={["a"]}>`. Single is the default, and an open item always closes on its trigger, so there is no `collapsible` |
| `<Accordion type="multiple">` | `<Accordion multiple>` |
| `<ToggleGroup type="single" value="a">` | `<ToggleGroup value={["a"]}>`. Always an array; `multiple` allows several |
| `<Slider defaultValue={[50]}>` | `<Slider defaultValue={50}>`. A single thumb is a number, a range is `[20, 80]` |
| `<Checkbox checked="indeterminate">` | `<Checkbox indeterminate>`. `checked` is only ever a boolean |

### Events

- **Menu rows:** `onSelect` → `onClick`. To keep the menu open after a click
  (Radix: `event.preventDefault()` in `onSelect`), set `closeOnClick={false}`.
- **Change handlers take a second argument.** `onValueChange`,
  `onCheckedChange` and `onOpenChange` receive `(value, eventDetails)`. The
  first argument is what Radix passed, so most handlers work unchanged.
- **Dismissal hooks:** `onEscapeKeyDown` / `onPointerDownOutside` /
  `onInteractOutside` → one `onOpenChange` on the root. Read
  `eventDetails.reason` (`"escape-key"`, `"outside-press"`…) and call
  `eventDetails.cancel()` to keep it open.
- **`forceMount`** → `keepMounted` (on `AccordionPanel`, `CollapsiblePanel` and
  portals).
- **State styling:** `data-[state=open]:` → Sable's state variants:
  `sable-open:`, `sable-selected:`, `sable-highlighted:`, `sable-disabled:`
  and `sable-invalid:` (`sable utility sable-open:`). Base UI writes
  `data-open`, `data-checked`, `data-highlighted` and `data-pressed`, not
  `data-state`.

### Variants, not overrides

shadcn invites restyling through `className`. Sable does not: a
`bg-*`/`border*`/`rounded*`/`ring-*`/`shadow-*` class on `Button`, `Pill` or
`Badge` fails `component-restyle`. Layout classes (`w-full`, `ms-auto`, grid
placement) are fine. If no variant gives you the look, the component
needs one, and that is a library change; `extending-a-component.md` has the
ways that don't need one (`render`, slots, refs, tokens). Map the variants instead:

| shadcn `Button` | Sable `Button` |
|---|---|
| `variant="default"` | `variant="primary"` (the default) |
| `secondary` / `outline` / `ghost` / `destructive` / `link` | same names |
| `size="default"` / `sm` / `lg` | `size="md"` (default) / `sm` / `cta` |
| `size="icon"` / `icon-sm` / `icon-lg` | `icon` / `icon-sm` / `icon` (add `icon-xs` in tool chrome) |
| a hand-placed `<Loader2 className="animate-spin" />` | `loading` (keeps the label; `loadingLabel` to change it) |
| `<Icon /> Label` children | `iconStart={<Icon name="plus" />}` / `iconEnd` |

`buttonVariants` is exported, as in shadcn, for the rare non-`Button` element
that must look like one. Prefer `render`.

### Classes shadcn's source teaches that Sable's lint rejects

Copied shadcn markup carries these idioms. `sable-lint` names each one:

| shadcn idiom | Sable | rule |
|---|---|---|
| `text-sm font-medium` | a paired tier: `text-label-md`, `text-body-sm`, `text-heading-3`… (`sable token typography`) | `decomposed-type` |
| `hover:bg-accent hover:text-accent-foreground` | a component, or `sable-surface-interactive` | `surface-hover` |
| `transition-colors`, `transition-all`, `transition-[color,box-shadow]` | `motion-interactive` | `transition-colors`, `transition-all` |
| `animate-in fade-in-0 zoom-in-95 data-[state=open]:…` | `motion-pop` / `motion-fade` / `motion-slide-*` | n/a (tw-animate is gone) |
| `animate-spin`, `animate-pulse` | `motion-spin`, `motion-pulse`, or `Spinner` / `Skeleton` | `builtin-animate` |
| `ring-ring/50`, `focus-visible:ring-[3px]` | the component's own focus ring; `ring-ring` at full strength if you must | `faded-focus-ring` |
| `bg-black/50` scrim | `bg-overlay` (Dialog and Sheet draw their own) | `raw-black-white` |
| `z-50` | `z-(--z-overlay)` and siblings | `raw-z-index` |
| `text-muted-foreground/70` | `text-muted-foreground` | `text-opacity` |
| `overflow-y-auto` alone | add `scrollbar-quiet`, or use `Scroller` | `unmanaged-overflow` |
| `bg-zinc-900`, `text-slate-500` | a semantic token, or a generated family (`bg-blue-100`) for categorical colour | `palette-ref` |
| `<div className="border-input rounded-md …">` dressed as a field | `Input` / `Textarea` / `SearchInput` | `lookalike-control` |

## 2. Tokens

The names carry over. Most shadcn utilities (`bg-background`, `text-foreground`,
`bg-card`, `bg-popover`, `bg-muted`, `text-muted-foreground`, `bg-primary`,
`bg-secondary`, `bg-accent`, `bg-destructive`, `border-border`, `border-input`,
`ring-ring`, `bg-sidebar*`) compile unchanged against Sable. Sable is stricter
about **role**, so check each use against its intent (`sable token <name>`):

| shadcn var | Sable | note |
|---|---|---|
| `--background`, `--foreground` | same | the page ground and ink |
| `--card`, `--popover` | same | `popover` is for anything floating, including persistent inspectors |
| `--muted` | same | recessed and **inert**; not a hover fill |
| `--secondary` | same | a pressable low-emphasis fill; not a surface |
| `--accent` | same | the transient **state** layer (hover, current), applied by components; don't paint it by hand |
| `--border` | `border` or `border-strong` | `border-strong` when the line carries structure (a table rule, a section divider) |
| `--input` | `input` (fields), `control-border` (checkbox, radio, switch) | `control-border` is held to 3:1 |
| `--ring` | same | focus only, never selection |
| `--destructive` | `destructive` (fill), `destructive-text` (ink on a surface) | likewise `success`/`success-text`, `tone-warning`/`tone-warning-text`, `tone-info`/`tone-info-text` |
| `--chart-1`…`--chart-5` | `--chart-1`…`--chart-8`, set by the theme | address series by `tone` on the chart, not by variable |
| `--sidebar-*` | same names | |
| `--radius` (one value, derived) | a ladder: `rounded-xs`…`rounded-xl`, `rounded-full`; `--button-radius` for buttons | a theme sets the ladder; pick by role (`sable token radii`) |

New to a shadcn app: `tone-1`…`tone-3` (category colour), `highlight` (marked
content), `overlay` (scrims), and the generated palette families. Fonts:
Sable's `--font-sans` / `--font-mono` default to Figtree and DM Mono, loaded
by the host (see **Consuming** in `llms.txt`).

Dark mode: `next-themes` → `SableThemeProvider` (`defaultPreference`,
`useSableTheme()`). It writes the same `.dark` class on `<html>`.

## 3. Icons

`lucide-react` imports → `<Icon name="…" />`, rendered by the set in
`<IconProvider set={reiconIconSet}>` (`@sableui/react/icons/reicon`).
Without a provider, every icon renders nothing, including the ones inside
Sable's components. Names are semantic:

| lucide | Sable | lucide | Sable |
|---|---|---|---|
| `X` | `xmark` | `MoreHorizontal` / `Ellipsis` | `ellipsis` |
| `Check` | `check` | `ChevronDown` / `Up` / `Left` / `Right` | `chevron-down` … |
| `Search` | `search` | `Plus` / `Minus` | `plus` / `minus` |
| `Settings` | `gear` | `Trash2` | `trash` |
| `Pencil` | `edit` | `Copy` | `copy` |
| `Loader2` | `spinner` (or `Spinner`) | `AlertTriangle` | `warning` |
| `Info` | `info` | `CircleCheck` | `circle-check` |
| `Mail` | `mail` | `Menu` | `bars` |
| `ExternalLink` | `external` | `LogOut` | `logout` |

The full contract is 84 names (`iconContract.names` in `registry.json`). An app
icon outside it goes in a set of your own composed over Reicon
(`composeIconSets(appIcons, reiconIconSet)`) and is listed in
`.sable/icons.json`. Keeping lucide as that set is allowed; use `<Icon>` at the
call sites either way.

## 4. Component by component

`—` means Sable has no counterpart. The note says what to compose instead.

| shadcn | Sable | what changes |
|---|---|---|
| accordion | `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionPanel` | array values; no `type` or `collapsible` (§1) |
| alert | `Note` (`tone`, `title`, `icon`, `action`) | `variant="destructive"` → `tone="destructive"`. A page-wide bar is `Banner`; a one-line status is `InlineStatus` |
| alert-dialog | `AlertDialog`, `AlertDialogTrigger`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogClose` | `AlertDialogAction` / `AlertDialogCancel` → `AlertDialogClose render={<Button …/>}`. For a delete confirmation use `DestructiveActionModal` (`onConfirm`, `pending`, `confirmText`) |
| aspect-ratio | `AspectBox` (`ratio`) | layout primitive |
| avatar | `Avatar` (`src`, `fallback`, `size`, `status`), or `AvatarRoot` / `AvatarImage` / `AvatarFallback` | the one-element form covers most uses; `AvatarGroup` for stacks |
| badge | `Badge` (`appearance` × `tone`) | `default` → `appearance="solid"`; `secondary` → `soft`; `outline` → `outline`; `destructive` → `tone="destructive"` |
| breadcrumb | `Breadcrumbs`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbPage`, `BreadcrumbSeparator` | no `BreadcrumbList` (the root renders the `<ol>`); no `BreadcrumbEllipsis` |
| button | `Button` | §1 table |
| calendar | `Calendar` | same react-day-picker v9 (`mode`, `selected`, `onSelect`); Sable styles it, so drop `classNames` overrides |
| card | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent`, `CardFooter` | same parts, plus `CardList` for rows and `density="compact"` |
| carousel | `Carousel` (`slidesToShow`, `loop`, `autoplay`, `index`) | one component, no Embla parts |
| checkbox | `Checkbox` | `indeterminate` prop (§1); wrap in `Field label orientation="horizontal"` for a label |
| collapsible | `Collapsible`, `CollapsibleTrigger`, `CollapsiblePanel` | `CollapsibleIndicator` for the chevron |
| combobox (Popover + Command) | `Combobox`, `ComboboxInput`, `ComboboxContent`, `ComboboxList`, `ComboboxItem`, `ComboboxEmpty` | one real combobox instead of a popover holding a command list; `items` on the root, a render function in `ComboboxList`; `multiple` + `ComboboxChips` for several |
| command | `CommandMenu` (`items`, `open`, `onOpenChange`), `CommandMenuPanel` inline | data-driven: `{ group, label, onSelect, icon, hint }` items instead of `CommandGroup`/`CommandItem` children (declarative `CommandMenuGroup` / `CommandMenuItem` exist too). `useCommandMenuShortcut` binds ⌘K |
| context-menu | `ContextMenu`, `ContextMenuTrigger`, `ContextMenuContent`, `ContextMenuItem`, `ContextMenuSeparator`, `ContextMenuGroup`, `ContextMenuGroupLabel` | `onSelect` → `onClick`; destructive rows use `variant="destructive"` |
| data-table | `DataTable` (`columns`, `data`, `rowKey`, `defaultSort`, selection) | built-in sorting and selection; for TanStack features see `sable docs tables-with-tanstack` |
| dialog | `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `DialogClose` | **`showCloseButton` defaults to false** (true in shadcn); `size="fullscreen"` for a media viewer |
| drawer | `Sheet`, `SheetTrigger`, `SheetContent side="bottom"`, `SheetHeader`, `SheetTitle`, `SheetDescription`, `SheetFooter`, `SheetClose` | swipe-to-dismiss included. vaul's `snapPoints` / `activeSnapPoint` / `setActiveSnapPoint` → `Sheet` `snapPoints` / `snapPoint` / `onSnapPointChange` (bottom only; fractions, px or rem); `fadeFromIndex` has no equivalent |
| dropdown-menu | `Menu`, `MenuTrigger`, `MenuContent`, `MenuItem`, `MenuGroup`, `MenuGroupLabel`, `MenuSeparator`, `MenuCheckboxItem`, `MenuRadioGroup`, `MenuRadioItem`, `MenuSubmenu`, `MenuSubmenuTrigger` | §1; `DropdownMenuShortcut` → a `<KbdGroup className="ms-auto">` in the row; an ellipsis trigger is `OverflowMenu` |
| empty | `EmptyState` (`icon`, `title`, `description`, `action`) | |
| field / form (react-hook-form) | `Form`, `Field` (`label`, `description`, `error`, `required`, `name`, `trailing`) | §5 |
| hover-card | `ContextCard`, `ContextCardTrigger`, `ContextCardContent` | |
| input | `Input` | `aria-invalid` drives the error state; `SearchInput` for search; `NumberField` for numbers |
| input-group | `InputGroup` (`leading`, `trailing`) around one `Input` | addons are props, not `InputGroupAddon` / `InputGroupInput` / `InputGroupButton` parts: `<InputGroup leading="https://" trailing={<Button variant="ghost" size="icon-sm" aria-label="Copy">…</Button>}><Input /></InputGroup>`. A button beside the field (not inside it) is `Field trailing` |
| input-otp | `OtpField` (`length`, `groupSize`, `onValueComplete`) | one component: no `InputOTPGroup` / `InputOTPSlot` / `InputOTPSeparator`; `groupSize={3}` draws the split |
| item | `Entity` (`leading`, `title`, `subtitle`, `action`, `interactive`) | |
| kbd | `Kbd`, `KbdGroup` | `mod` renders ⌘ or Ctrl per platform |
| label | `Label`, or better `Field label` | `Field` wires `htmlFor`, `aria-describedby` and `aria-invalid` for you |
| menubar | `Menubar` | one `Menu` per title: `MenubarMenu` → `Menu`, `MenubarTrigger` → `MenubarTrigger`, `MenubarContent` → `MenuContent`, `MenubarItem` → `MenuItem`, `MenubarSub` / `MenubarSubTrigger` / `MenubarSubContent` → `MenuSubmenu` / `MenuSubmenuTrigger` / `MenuContent side="inline-end"`, checkbox and radio rows → `MenuCheckboxItem` / `MenuRadioGroup` + `MenuRadioItem`. No `MenubarShortcut` |
| navigation-menu | `NavigationMenu` | `NavigationMenuList` / `Item` / `Trigger` / `Content` / `Link` keep their names. `NavigationMenuViewport` and `NavigationMenuIndicator` go: the root renders the one shared panel, which glides between triggers and resizes itself. `asChild` on a link → `render={<Link to="…" />}`; mark the current page with `active` (`aria-current="page"`). shadcn's `navigationMenuTriggerStyle()` on a plain link → a `NavigationMenuLink` in its own item, which is styled as a bar entry. Panel rows take `description` for the second line. For app navigation, use `Sidebar` / `SideNav` / `AppHeader` / `BottomNav` in an `AppShell` instead |
| pagination | `Pagination` (`page`, `total`, `onPageChange`, `siblingCount`, `pageLink`) | one component, not `PaginationContent` / `PaginationItem` / `PaginationLink` parts. Links: `` pageLink={(page) => <Link to={`?page=${page}`} />} `` makes every control a real link |
| popover | `Popover`, `PopoverTrigger`, `PopoverContent` (`side`, `align`, `sideOffset`), `PopoverTitle`, `PopoverDescription`, `PopoverClose` | `PopoverAnchor` → `anchor` on `PopoverContent` (an element or ref) |
| progress | `Progress` (`value`, `null` for indeterminate) | a level within a range (storage, quota) is `Meter`, not Progress |
| radio-group | `RadioGroup`, `Radio` | `RadioGroupItem` → `Radio`; `RadioCard` for card options |
| resizable | `PanelGroup`, `Panel`, `PanelResizer`, `usePanelWidth` | pixel widths with persisted bounds, for tool chrome; no percentage layout. A non-resizable two-pane split is `SplitPane` |
| scroll-area | `Scroller` (edge fades), or `scrollbar-quiet` on any overflow element | |
| select | `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`, `SelectGroup`, `SelectGroupLabel`, `SelectSeparator` | `<SelectValue placeholder>` → `<SelectTrigger placeholder>`; the trigger shows the item's label, derived from `SelectItem`s or `items` |
| separator | `Separator` (`orientation`, `label`) | |
| sheet | `Sheet` parts as above, `side` on `SheetContent` (default `"right"`) | `SheetList` for row content |
| sidebar | `Sidebar` (`collapsed`, `variant`), `SidebarHeader`, `SidebarBrand`, `SidebarNav`, `SidebarItem` (`icon`, `label`, `active`, `badge`, `render`), `SidebarFooter`; mounted in `AppShell sidebar={…}` | no `SidebarProvider` / `SidebarMenu*` / `SidebarGroup`; the rail is desktop-only, and mobile uses `AppHeader` + `BottomNav` (`sable pattern` shells show the wiring) |
| skeleton | `Skeleton` | same; shape with utilities |
| slider | `Slider` | number vs array (§1) |
| sonner | `ToastProvider` at the root + `toast` | sonner's API: `toast.success/error/warning/info/loading/promise/dismiss`. `<Toaster />` → `<ToastProvider position="bottom-right">` around the app |
| spinner | `Spinner` (`size`, `appearance="ring" \| "dots"`, `label`) | |
| switch | `Switch` | same `checked` / `onCheckedChange` |
| table | `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`, `TableCaption` | same parts; don't pad edge cells by hand (`table-edge-padding`); `CardContent flush` sets the inset |
| tabs | `Tabs`, `TabsList` (`variant="underline" \| "pill"`), `TabsTrigger`, `TabsPanel` | `TabsContent` still works as an alias |
| textarea | `Textarea` (`autoResize`) | |
| toggle | `Toggle` (`pressed`, `onPressedChange`) | |
| toggle-group | `ToggleGroup` (`appearance="segmented"` for a segmented control), `Toggle` / `ToggleGroupItem` | array value (§1) |
| tooltip | `TooltipProvider`, `Tooltip`, `TooltipTrigger`, `TooltipContent` (`side`), or `SimpleTooltip` | `delayDuration` → `delay` on `TooltipProvider` |
| chart | `AreaChart`, `BarChart`, `LineChart`, `PieChart`, `RadarChart`, `RadialChart`, `Sparkline` | no Recharts and no `ChartContainer`/`ChartConfig`: pass `data`, `index` (the x key) and `series: [{ key, label, tone }]` |
| button-group | `ButtonGroup` | children stay `Button`s; the group squares inner corners and draws the seam. A split button is `ButtonGroup` > `Button` + `Menu` with the chevron `Button` as `MenuTrigger`. No `ButtonGroupSeparator`/`ButtonGroupText` |
| native-select | — | use `Select` in place of a native one |

Before and after for the non-obvious cases:

```tsx
// dropdown-menu
<DropdownMenu>
  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal /></Button></DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuLabel>Post</DropdownMenuLabel>
    <DropdownMenuItem onSelect={edit}>Edit</DropdownMenuItem>
    <DropdownMenuItem className="text-destructive" onSelect={remove}>Delete</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>

<OverflowMenu label="Post actions">
  <MenuGroup>
    <MenuGroupLabel>Post</MenuGroupLabel>
    <MenuItem onClick={edit}>Edit</MenuItem>
    <MenuItem variant="destructive" onClick={remove}>Delete</MenuItem>
  </MenuGroup>
</OverflowMenu>
```

```tsx
// chart
<ChartContainer config={{ revenue: { label: "Revenue", color: "var(--chart-1)" } }}>
  <AreaChart data={data}><XAxis dataKey="month" /><Area dataKey="revenue" /></AreaChart>
</ChartContainer>

<AreaChart label="Revenue" data={data} index="month" series={[{ key: "revenue", label: "Revenue", tone: "1" }]} />
```

## 5. Forms

shadcn's `Form` wraps react-hook-form with `FormField` / `FormItem` /
`FormLabel` / `FormControl` / `FormMessage`. Sable's `Form` + `Field` is
library-agnostic and does that wiring itself:

```tsx
<Form onFormSubmit={save} errors={serverErrors}>
  <Field name="email" label="Email" required messages={{ valueMissing: "Enter your email." }}>
    <Input type="email" autoComplete="email" spellCheck={false} />
  </Field>
  <Button type="submit" loading={saving}>Save</Button>
</Form>
```

- `FormLabel` + `FormControl` + `FormDescription` + `FormMessage` → one
  `Field` (`label`, `description`, `error`). It wires `htmlFor`,
  `aria-describedby` and `aria-invalid`.
- **Keeping react-hook-form** is fine: register the control as usual and pass
  `error={errors.email?.message}` to its `Field`. Use `<Form noValidate>` so
  your resolver owns validation. Don't also mark that `Field` `required`
  with an `error` inside a validating `Form` (`form-required-error`).
- Server errors go in `Form errors={{ email: "Taken" }}`, keyed by `Field name`.
  Each clears when the user edits that field.
- Follow the form submit contract in `AGENTS.md`: submit stays enabled until
  the request starts; focus the first invalid field (`Form` does);
  `loading` keeps the label.

## 6. What Sable doesn't have yet

Every shadcn component in the map above now has a Sable counterpart. For
anything else shadcn's ecosystem offers, compose it from Sable's parts rather
than porting the shadcn file back in. If a missing piece blocks the app, say so
upstream. A local workaround is a
`sable patch`, not a copy.

## 7. Verify

```bash
pnpm exec sable doctor        # wiring: styles order, @source, IconProvider, dedupe
pnpm exec sable lint src      # the idioms in §1, by rule
pnpm exec sable check src     # doctor + lint + grade before calling it done
```

`shadcn-leftover` flags what is still imported from the old stack (`@radix-ui/*`,
`@/components/ui`, `lucide-react`, `sonner`, `vaul`, `cmdk`, `input-otp`,
`next-themes`) and every `asChild` prop. A deliberate keeper, such as a Radix
part Sable does not ship yet, takes a reasoned disable. The rest no rule can
judge, so grep for it; each of these should return nothing:

```bash
grep -rnE 'data-\[state=|animate-in|tw-animate|type="(single|multiple)"' src
grep -rn 'onSelect=' src   # Menu rows: should be onClick (Calendar, CommandMenu items and Entity keep onSelect)
```

Then render it: open each overlay, menu and form in light and dark. Lint
passes on markup that never opens.

## Read next

- [converting-an-app.md](./converting-an-app.md): registers, wiring, tokens, verification by measurement
- [patching-a-component.md](./patching-a-component.md): when a Sable component is wrong and the fix hasn't shipped
- [extending-a-component.md](./extending-a-component.md): owning the source is gone, so this is how you add what a component lacks
- [tables-with-tanstack.md](./tables-with-tanstack.md): data tables beyond `DataTable`
- [auditing-an-app.md](./auditing-an-app.md): staying converted across upgrades

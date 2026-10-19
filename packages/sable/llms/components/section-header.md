# SectionHeader

**Status:** stable

The heading block for one section of a page: a title (h2 by default), an optional line of description, and actions on the title row — a "View all" link or a couple of buttons — that drop beneath the title only when the row runs out of room.

**Keywords:** section header, section heading, section title, shelf, view all, see all, show all, h2, subsection, optical alignment, bleed, editorial section, large section title

## Usage

Use SectionHeader to head each section below the page title — a home-page shelf with View all, a settings group, a list with its own actions. PageHeader is the route's single h1; every section under it takes a SectionHeader, with titleId wired to the section's aria-labelledby.

### Best practices

- Do: Wrap the header and its content in a `<section aria-labelledby={titleId}>` (a flex column with a gap, or a Stack inside it) so the section is a named region and the header's title is its name.
- Do: Pick titleAs by the document outline (h2 under the page h1, h3 inside an h2 section) and size by visual weight: lg for an editorial page's sections under a PageHeader size="lg", md for a page's sections and shelves, sm for denser groups like settings.
- Do: Keep actions to one or two `size="sm"` buttons — the title is centred on that height. A shelf's "View all" is a ghost Button rendered as a link (`render={<a href=… />}`), named for what it opens when the label alone is ambiguous (aria-label="View all new releases").
- Do: Pass a ghost or link action as a plain Button and let the header align it: the last direct child bleeds by its own padding at the end, so "View all" sits on the edge of the grid below, and the first bleeds at the start, which is the edge once the actions wrap beneath the title. Filled buttons keep their edge on the line. Set bleed="none" on the Button to opt one out.
- Don't: Nudge a View all onto the edge with -me-3, or wrap the actions in your own div: the header aligns direct children only, and only by each button's real padding. If you must wrap them, set bleed on the Button inside instead.
- Don't: Use a second PageHeader for a section — that is a second h1, and the outline then reports two documents. And do not hand-build `<div className="flex justify-between"><h2 className="text-heading-3">…` per shelf: it misses the wrapping, the aria wiring and the shared rhythm.
- Don't: Use SectionHeader to title a Card (use CardHeader + CardTitle) or a docked tool panel (use PanelSection). It heads a section of the page, not a surface.
- Don't: Add margin to the header to space it from its content. It has no outer spacing on purpose; the section's gap owns that rhythm, so every section on the page keeps the same one.

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| Title | yes | The section's heading (h2 by default), wrapping rather than truncating. Its id names the section. |
| Description | no | One line of supporting copy under the title, capped at the prose measure. |
| Actions | no | Buttons or links at the title row's end; they move beneath the title when the row is too narrow for both. A borderless (ghost/link) Button at either end of the group is optically aligned: its label, not its invisible padding, meets the content edge. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| title | ReactNode | — | The section's title. |
| description | ReactNode | — | One line of supporting copy beneath the title, capped at the prose measure. |
| actions | ReactNode | — | Trailing actions on the title row — a View all link or a couple of buttons, size="sm". They stay on the title's row and drop beneath it only when the row runs out of room; the title wraps rather than truncating. A ghost or link Button that ends the group bleeds by its padding at the end (and one that starts it, at the start — the edge once wrapped), so its label lines up with the content below; Button bleed="none" opts out. Direct children only. |
| titleAs | "h2" \| "h3" \| "h4" | "h2" | The heading element, chosen by the document outline: h2 for a section under the page's h1, h3 for a subsection inside one. |
| titleId | string | — | The title's id, so the section it heads can point at it: <section aria-labelledby={titleId}>. Generated when omitted. |
| size | "lg" \| "md" \| "sm" | "md" | Visual weight, independent of the heading level: lg (text-heading-2 over a text-body-md description) for an editorial page's sections, under a PageHeader size="lg"; md (text-heading-3) for a page's sections and shelves; sm (text-heading-4) for denser sets — settings groups, subsections. lg stops at heading-2: heading-1 is the page title's, one per route. The actions stay centred on the title's first line at every size. |

## Variants

- **size**: lg, md, sm

## Tokens used

`foreground`, `muted-foreground`

## Motion

- **arrival** · root · _no motion_ — A heading arrives with the section it names; animating it separately would make the section's title lag its content.
- **response** · root · _no motion_ — The header itself is not interactive; the Buttons passed as actions carry their own response.
- **transition** · root · _no motion_ — It has no states of its own to move between.
- **activity** · root · _no motion_ — It never does indeterminate work.

## Accessibility

- Renders a real heading (h2 by default); choose titleAs by the outline, never to get a size — size sets the look.
- The title always carries an id (titleId, or a generated one). Point the section at it with aria-labelledby so the section is announced as a named region and appears in landmark navigation.
- A repeated "View all" is ambiguous in a links list; name each one for its section (aria-label="View all new releases") or keep the visible label specific.

## Related

- Components: PageHeader, CardHeader, PanelSection, Grid, Stack, Button
- Patterns: SettingsPage, DashboardPage

## Examples

### A shelf with View all

```tsx
import { Button, Card, CardDescription, CardHeader, CardTitle, Grid, SectionHeader } from "@sableui/react"

<section aria-labelledby="new-releases" className="flex flex-col gap-4">
	<SectionHeader
		titleId="new-releases"
		title="New releases"
		description="Fresh from artists you follow."
		actions={
			<Button variant="ghost" size="sm" render={<a href="/new" />} aria-label="View all new releases">
				View all
			</Button>
		}
	/>
	<Grid minItemWidth="10rem" gap={2}>
		<Card><CardHeader><CardTitle>Night Swim</CardTitle><CardDescription>Lena Vale</CardDescription></CardHeader></Card>
		<Card><CardHeader><CardTitle>Low Tide</CardTitle><CardDescription>Harbour Lights</CardDescription></CardHeader></Card>
	</Grid>
</section>
```

### A settings section

```tsx
import { Field, SectionHeader, Switch } from "@sableui/react"

<section aria-labelledby="playback" className="flex flex-col gap-4">
	<SectionHeader
		titleId="playback"
		size="sm"
		title="Playback"
		description="How tracks start, end and blend into each other."
	/>
	<Field label="Crossfade" orientation="horizontal">
		<Switch defaultChecked />
	</Field>
	<Field label="Normalize volume" orientation="horizontal">
		<Switch />
	</Field>
</section>
```

### A section with two actions

```tsx
import { Button, Entity, Icon, SectionHeader, Stack } from "@sableui/react"

<section aria-labelledby="playlists" className="flex flex-col gap-4">
	<SectionHeader
		titleId="playlists"
		title="Your playlists"
		actions={
			<>
				<Button variant="ghost" size="sm" iconStart={<Icon name="filter" />}>Filter</Button>
				<Button size="sm" iconStart={<Icon name="plus" />}>New playlist</Button>
			</>
		}
	/>
	<Stack gap={1}>
		<Entity className="[--entity-px:0]" title="Late drives" subtitle="42 tracks" />
		<Entity className="[--entity-px:0]" title="Focus" subtitle="18 tracks" />
	</Stack>
</section>
```

### An editorial section (size lg)

```tsx
import { Button, Card, CardDescription, CardHeader, CardTitle, Grid, SectionHeader } from "@sableui/react"

<section aria-labelledby="selected-work" className="flex flex-col gap-6">
	<SectionHeader
		titleId="selected-work"
		size="lg"
		title="Selected work"
		description="Five projects from the last two years."
		actions={
			<Button variant="ghost" size="sm" render={<a href="/work" />} aria-label="View all work">
				View all
			</Button>
		}
	/>
	<Grid minItemWidth="16rem" gap={3}>
		<Card><CardHeader><CardTitle>Tidewater</CardTitle><CardDescription>Brand identity</CardDescription></CardHeader></Card>
		<Card><CardHeader><CardTitle>Northlight</CardTitle><CardDescription>Product design</CardDescription></CardHeader></Card>
	</Grid>
</section>
```

### A subsection inside a section

```tsx
import { SectionHeader } from "@sableui/react"

<SectionHeader titleAs="h3" size="sm" title="Appears on" />
```

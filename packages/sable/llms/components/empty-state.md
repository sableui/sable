# EmptyState

**Status:** stable

The centered empty / error block: optional icon or error code, title, description and an action. tone="destructive" makes it an announced error, size="lg" a page-level state, surface="card" a self-contained card.

**Keywords:** empty, zero state, blank slate, no results, placeholder, onboarding, no data

## Usage

Use EmptyState when a content area has no items, no search results, or no first-time setup yet. The title should name the empty condition and the description/action should give the user a next step.

### Best practices

- Do: Explain what is empty in plain language, such as "No posts yet" or "No matching collectors".
- Do: Offer one next step when the user can recover, create, clear filters, or start setup.
- Do: Keep the icon decorative and make the title carry the meaning.
- Do: For a search or filter result, name the query back to the user and offer the way out, such as "No results for 'quarterly'" with a Clear filters action. An empty result that does not say what was searched leaves the user unsure whether the query or the data was wrong.
- Don't: Use generic copy like "No data"; it gives users and agents no useful path forward.
- Don't: Park anything the user needs permanently here, such as setup instructions, billing notices, or keyboard shortcuts. An empty state is the one surface guaranteed to disappear the moment content exists, so information that matters after the first item is lost exactly when the user has learned enough to want it.
- Don't: Use it for a field's validation error — that is Field error messaging. Reserve tone="destructive" for a view or block that failed to load.

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| Icon | no | A decorative cue that reinforces the empty condition. |
| Title | yes | The short message naming what is empty. |
| Description | no | Supporting copy that explains why the state exists or what to try next. |
| Action | no | One clear button or link that moves the user forward. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| icon | ReactNode | — | Optional glyph above the title — an `<Icon />` takes the muted ink at 3xl; an image or illustration renders as given. |
| title | ReactNode | — | The headline. Short and direct. |
| description | ReactNode | — | Optional supporting line beneath the title. |
| action | ReactNode | — | Optional action below the copy — typically a `<Button />`. |
| code | ReactNode | — | A large figure above the title, such as an error code (404). |
| tone | "neutral" \| "destructive" | "neutral" | destructive is an error state: a destructive icon (a warning by default) and role="alert" so it is announced. |
| size | "md" \| "lg" | "md" | lg is page-level: the title is an h2 and the block takes more room. md sits in a panel, list or card. |
| surface | "none" \| "card" | "none" | card draws it as a Card, for an error or empty block standing on its own in a page. |

## Variants

- **tone**: neutral, destructive
- **size**: md, lg
- **surface**: none, card

## Tokens used

`muted`, `muted-foreground`, `foreground`, `destructive`

## Accessibility

- Decorative icons should not carry meaning the title doesn't already convey.
- Pair with an actionable next step so the zero-state is a path forward, not a dead end.

## Related

- Components: Button, Icon, Card, Banner, DataTable
- Patterns: FeedPage, ListDetailPage, DashboardPage

## Examples

### With icon and action

```tsx
import { Button, EmptyState, Icon } from "@sableui/react"

<EmptyState icon={<Icon name="info" />} title="No posts yet" description="Create your first." action={<Button>New post</Button>} />
```

### No search results

```tsx
import { Button, EmptyState, Icon } from "@sableui/react"

<EmptyState icon={<Icon name="search" />} title="No matching posts" description="Try a different keyword or clear your filters." action={<Button variant="secondary">Clear filters</Button>} />
```

### First-run setup

```tsx
import { Button, EmptyState, Icon, Row } from "@sableui/react"

<EmptyState surface="card" icon={<Icon name="sparkles" />} title="Start your collection" description="Create a first edition, import an existing drop, or invite collaborators." action={<Row gap={1}><Button>Create edition</Button><Button variant="ghost">Import</Button></Row>} />
```

### Page-level error

```tsx
import { Button, EmptyState } from "@sableui/react"

<EmptyState tone="destructive" size="lg" code="404" title="Page not found" description="The page you are looking for has moved or never existed." action={<Button>Go home</Button>} />
```

### Error card

```tsx
import { Button, EmptyState } from "@sableui/react"

<EmptyState tone="destructive" surface="card" title="Could not load this edition" description="Check your connection and try again." action={<Button variant="secondary">Retry</Button>} />
```

### Empty table body

```tsx
import { DataTable, EmptyState } from "@sableui/react"

<DataTable data={[]} columns={[{ key: "name", header: "Collector" }, { key: "status", header: "Status" }]} empty={<EmptyState title="No collectors yet" description="Collectors appear here after the first mint." />} />
```

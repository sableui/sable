# Avatar

**Status:** stable

Circular profile image over Base UI Avatar — automatic image-load tracking with an initials/glyph fallback. Ergonomic Avatar plus low-level AvatarRoot/AvatarImage/AvatarFallback parts, and AvatarGroup for an overlapping stack with a "+N" overflow count.

**Keywords:** avatar, profile, user, identity, initials, fallback, group, team, stack, overflow, collaborators, facepile

## Usage

Use Avatar to represent a person, team, or account with a compact visual identity. Wrap several in AvatarGroup for collaborators, assignees, or attendees — it overlaps them, rings each in the surface colour, and collapses the rest into a "+N" count; use the low-level parts only when you need custom image/fallback layout.

### Best practices

- Do: Provide meaningful alt text for profile images, or an empty alt when the adjacent text already names the person.
- Do: Use initials or a simple glyph fallback so missing images still communicate identity.
- Do: Use consistent sizes within a group; reserve lg for profile headers or major identity moments.
- Do: Use AvatarGroup for a stack of people, and give it an aria-label with the real count ("12 collaborators"). Set `surface` (or `--avatar-group-ring`) to whatever the group sits on, so the separating ring matches a card or popover, not the page. When it shares a row with actions, set `fit` so it gives up avatars to the "+N" count before the row has to wrap.
- Don't: Hand-build a stack with negative margins and per-avatar ring classes, or fake the overflow as an Avatar with "+4" initials — screen readers hear "plus 4" with no context. Use AvatarGroup's `max`/`total`, or AvatarGroupCount.
- Don't: Use avatars as decoration without nearby identity context. They should help users recognize a person or account.
- Don't: Overload a dense table with large avatars; use sm or omit images when scanning data is more important.

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| Root | yes | The circular frame that clips the image, owns size, and contains image plus fallback. |
| Image | no | The loaded profile image, cropped to fill the root. |
| Fallback | yes | Initials, a glyph, or short text shown while loading, on error, or when no image exists. |
| Group | no | AvatarGroup: the overlapping stack. Sets one size for every avatar and rings each in the surface colour. |
| Count | no | AvatarGroupCount: the "+N" avatar ending a group, read as "and N more". Rendered automatically by `max`/`total`. |

## Subcomponents

| Name | Type | Description |
| --- | --- | --- |
| AvatarRoot | Base UI Avatar.Root props + size + className | Low-level circular frame for full composition control — clips the image and holds the `size` axis. Wraps AvatarImage and AvatarFallback. |
| AvatarImage | Base UI Avatar.Image props + className | The profile image. Fills and crops the frame; hidden by Base UI until it loads. |
| AvatarFallback | Base UI Avatar.Fallback props (delay) + className | Shown when no image is available — typically initials or a glyph. Accepts a delay prop. |
| AvatarGroup | { size?: "sm" \| "md" \| "lg"; surface?: "background" \| "card" \| "popover" \| "muted"; max?: number; fit?: boolean; total?: number; countLabel?: (count: number) => string; "aria-label"?: string; className?: string; children: ReactNode } | Overlapping stack (role=group) — name it with aria-label ("12 collaborators"). `size` applies to every avatar inside. `max` shows that many and collapses the rest into a "+N" count; `total` is the real head-count when you only pass some people. `fit` shows only as many avatars as fit the width the group is given (it fills the space left in a flex row) and folds the rest into the count, so a tight row reads "MO SR +5" instead of wrapping. The separating ring reads the inherited `--avatar-group-ring` (default: the page background); `surface` sets it to card, popover, or muted. |
| AvatarGroupCount | { count: number; label?: string; size?: "sm" \| "md" \| "lg"; className?: string } | The "+N" avatar. Shows "+4" and reads "and 4 more" (override with label). AvatarGroup renders it for you from max/total; use it directly only when composing the stack yourself. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| src | string | — | Image source. When omitted, still loading, or failed, the fallback shows. |
| alt | string | "" | Alt text for the image. Without an image it becomes the avatar's accessible name (role=img), so the initials are never read out as the name. |
| fallback | ReactNode | — | Initials or a glyph rendered when no image is displayed. |
| fallbackDelay | number | — | Delay before showing the fallback, in ms — avoids a flash on fast loads. |
| status | ReactNode | — | A presence indicator pinned to the bottom-end edge, usually <StatusDot tone="success" />. It sits outside the clipped circle and wears a ring in the surface colour (--avatar-group-ring, else the page background). Use this instead of absolutely positioning a dot over an Avatar. |
| size | "sm" \| "md" \| "lg" | "md" | Square footprint: 32px / 40px / 48px. |

## Variants

- **size**: sm, md, lg

## Tokens used

`muted`, `muted-foreground`, `background`, `card`, `popover`

## Accessibility

- Base UI tracks the image loading status and swaps to the fallback on missing/loading/error — no manual onError wiring.
- Provide meaningful alt text via the alt prop; pass an empty alt for decorative avatars.
- The fallback (initials/glyph) gives a non-image identity cue for screen readers and slow connections.
- AvatarGroup renders role=group; give it an aria-label naming the whole set ("12 collaborators"), since the visible stack only shows some of them.
- The "+N" count is hidden from screen readers and replaced by "and N more" (AvatarGroupCount `label`, or AvatarGroup `countLabel`).

## Related

- Components: Entity, StatusDot, Badge, Row
- Patterns: DashboardPage, ListDetailPage

## Examples

### With image

```tsx
import { Avatar } from "@sableui/react"

<Avatar src="/pfp.png" alt="Alex Morgan" fallback="AM" />
```

### Fallback only

```tsx
import { Avatar } from "@sableui/react"

<Avatar fallback="AM" alt="Alex Morgan" />
```

### Sizes

```tsx
import { Avatar } from "@sableui/react"

<Avatar src="/pfp.png" alt="Alex Morgan" fallback="AM" size="sm" />
<Avatar src="/pfp.png" alt="Alex Morgan" fallback="AM" size="md" />
<Avatar src="/pfp.png" alt="Alex Morgan" fallback="AM" size="lg" />
```

### Low-level parts

```tsx
import { AvatarFallback, AvatarImage, AvatarRoot } from "@sableui/react"

<AvatarRoot size="lg"><AvatarImage src="/pfp.png" alt="Mara Okafor" /><AvatarFallback>MO</AvatarFallback></AvatarRoot>
```

### Group with overflow

```tsx
import { Avatar, AvatarGroup } from "@sableui/react"

<AvatarGroup aria-label="6 collaborators" max={3} size="sm" surface="card"><Avatar src="/ana.png" alt="Ana Chen" fallback="AC" /><Avatar src="/mika.png" alt="Mika Lee" fallback="ML" /><Avatar fallback="JL" alt="Jo Lund" /><Avatar fallback="AK" alt="Ari Kim" /><Avatar fallback="SR" alt="Sam Reyes" /><Avatar fallback="MO" alt="Mo Ortiz" /></AvatarGroup>
```

### Group of a larger set

```tsx
import { Avatar, AvatarGroup } from "@sableui/react"

<AvatarGroup aria-label="12 attendees" total={12} countLabel={(n) => `and ${n} more attendees`}><Avatar fallback="MO" alt="Mo Ortiz" /><Avatar fallback="SR" alt="Sam Reyes" /><Avatar fallback="JL" alt="Jo Lund" /></AvatarGroup>
```

### Composed count

```tsx
import { Avatar, AvatarGroup, AvatarGroupCount } from "@sableui/react"

<AvatarGroup aria-label="7 reviewers"><Avatar fallback="AC" alt="Ana Chen" /><Avatar fallback="ML" alt="Mika Lee" /><AvatarGroupCount count={5} label="and 5 more reviewers" /></AvatarGroup>
```

### With status

```tsx
import { Avatar, Entity, StatusDot } from "@sableui/react"

<Entity leading={<Avatar src="/pfp.png" alt="Nova Reed" fallback="NR" status={<StatusDot tone="success" />} />} title="Nova Reed" subtitle="Online" />
```

# Description

**Status:** stable

A labeled key/value list (definition list). Compose with DescriptionTerm + DescriptionDetail, or the ergonomic DescriptionItem shorthand. Aligns terms and details into a grid; cols="2" packs pairs two-wide.

**Keywords:** description list, metadata, details, key value

## Usage

Use Description to present label-value details where each term needs a clear corresponding value.

### Best practices

- Do: Use it for object metadata, settings summaries, and read-only record details.
- Do: Keep terms brief and values scannable so the list works as reference material.
- Don't: Do not use Description for editable forms; pair Label and form controls instead.
- Don't: Do not use it for a single key/value. A definition list of one is a labelled value — use a Label and the value, and keep the list semantics for actual lists.

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| DescriptionItem | yes | One term and detail pair. |
| DescriptionTerm | yes | The label for the value. |
| DescriptionDetail | yes | The value or explanatory detail. |

## Subcomponents

| Name | Type | Description |
| --- | --- | --- |
| DescriptionTerm | <dt> props + className | The key. Muted label tier; sits in the first grid column. |
| DescriptionDetail | <dd> props + tone?: "default" \| "muted" \| "success" \| "warning" \| "destructive" + className | The value. Body tier on the foreground; sits in the second grid column. tone colors the value to encode a status (e.g. Ended → muted, Active → success), replacing inline conditional color classes; defaults to "default". |
| DescriptionItem | { term: ReactNode; detail?: ReactNode; tone?: "default" \| "muted" \| "success" \| "warning" \| "destructive"; children? } | Ergonomic shorthand for one term/detail pair — renders a DescriptionTerm followed by a DescriptionDetail. Pass the value via detail or children; tone (defaults to "default") colors the detail value the same way it does on DescriptionDetail. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| cols | "1" \| "2" | "1" | Column density. One term/detail column, or two pairs per row once the list's container is at least @md (28rem) wide; narrower, it stays one column. A container query, not a viewport breakpoint, so a narrow card on a wide screen stays one column. With cols="2" the <dl> is wrapped in an @container div. |

## Variants

- **cols**: 1, 2
- **tone**: default, muted, success, warning, destructive

## Tokens used

`muted-foreground`, `foreground`, `success`, `tone-warning`, `destructive`

## Accessibility

- Renders semantic <dl>/<dt>/<dd> elements so assistive tech announces the term/detail relationship.
- tone is a visual emphasis only — keep the value text itself meaningful (e.g. "Ended"), never color alone.

## Related

- Components: Fieldset, Entity

## Examples

### Metadata list

```tsx
import { Description, DescriptionItem } from "@sableui/react"

<Description>
	<DescriptionItem term="Network" detail="Solana" />
	<DescriptionItem term="Supply" detail="100" />
	<DescriptionItem term="Royalty" detail="5%" />
</Description>
```

### Composed term/detail

```tsx
import { Description, DescriptionDetail, DescriptionTerm } from "@sableui/react"

<Description>
	<DescriptionTerm>Network</DescriptionTerm>
	<DescriptionDetail>Solana</DescriptionDetail>
	<DescriptionTerm>Contract</DescriptionTerm>
	<DescriptionDetail className="text-mono-sm">7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU</DescriptionDetail>
</Description>
```

### Toned status value

```tsx
import { Description, DescriptionItem } from "@sableui/react"

<Description>
	<DescriptionItem term="Edition" detail="Midnight Archive" />
	<DescriptionItem term="Status" detail={isEnded ? "Ended" : "Active"} tone={isEnded ? "muted" : "success"} />
</Description>
```

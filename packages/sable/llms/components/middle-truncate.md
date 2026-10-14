# MiddleTruncate

**Status:** stable

Middle-truncates a long string (hash, address, signature) to `5J7s…8xQp`, keeping the start and end legible while preserving the full value on hover.

**Keywords:** truncate, middle truncate, hash, identifier

## Usage

Use MiddleTruncate when both the beginning and end of a long identifier must remain visible.

### Best practices

- Do: Use it for hashes, addresses, long filenames, URLs, or generated IDs.
- Do: Provide the full value through title text, copy action, or surrounding detail when needed.
- Don't: Do not use MiddleTruncate for human prose where the middle words carry meaning.
- Don't: Do not middle-truncate a value with no way to obtain it in full. Truncation removes characters from the page, so the value needs a copy affordance beside it: an icon Button with useCopy, as in the Copyable value example.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| text | string | — | The full string to render. When it is truncated, the full value is also set as the title attribute (a pointer tooltip). |
| startChars | number | 6 | How many leading characters to keep before the ellipsis. |
| endChars | number | 6 | How many trailing characters to keep after the ellipsis. |

## Accessibility

- When truncated, the visible abbreviation is aria-hidden and a visually hidden copy carries the full value, so screen readers announce the whole string. The title attribute holds it too, for a pointer tooltip only.
- Renders the string verbatim when it is too short to benefit from truncation, so no value is hidden needlessly.

## Related

- Components: Code, Button

## Examples

### API key

```tsx
import { MiddleTruncate } from "@sableui/react"

<MiddleTruncate text="demo_key_7f3a9c2e5b8d1f4a6c0e9b3d7a2f5c8e1b4" />
```

### Custom start/end counts

```tsx
import { MiddleTruncate } from "@sableui/react"

<MiddleTruncate text="9f2c4e7a1b3d5f60c8e2a4b6d8f0e1c3a5b7d9f2" startChars={4} endChars={4} />
```

### Copyable value

```tsx
import { Button, Icon, MiddleTruncate, Row, useCopy } from "@sableui/react"

const { copy, copied } = useCopy(commitHash)
<Row gap={1}><MiddleTruncate text={commitHash} /><Button variant="ghost" size="icon-xs" aria-label="Copy commit hash" onClick={copy}><Icon name={copied ? "check" : "copy"} /></Button></Row>
```

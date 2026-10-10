# Center

**Status:** stable

Horizontally center a block, optionally capping its width (commonly "prose" for a reading column inside a wider layout).

**Keywords:** center, measure, reading width, layout

## Usage

Use Center to center a block and optionally cap its width inside a wider layout.

### Best practices

- Do: Use it for reading columns, forms, or compact content inside a broad Region.
- Do: Choose a named max when the content role matches Sable's measure tokens.
- Don't: Do not use Center for full page inset or app chrome; use Region or AppShell.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| max | "prose" \| "form" \| "feed" \| "content" \| "wide" \| CSS length | — | Cap width: a named region token or any raw CSS length. |

## Related

- Components: Region, Page, Stack

## Examples

### Reading column in a wide page

```tsx
import { Center } from "@sableui/react"

<Center max="prose"><p className="text-body-lg">Long-form description text that should hold a comfortable reading measure even inside a wide dashboard region.</p></Center>
```

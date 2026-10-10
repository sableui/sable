# Browser

**Status:** stable

A generic, current browser window: one compact toolbar (window controls, back/forward/reload, a centered address field) around page content.

**Keywords:** browser, mockup, preview, website

## Usage

Use Browser to frame a website or product surface preview when the browser chrome is part of the story.

### Best practices

- Do: Use it for documentation, product examples, and visual previews where the page context matters.
- Do: Keep the framed content simple enough to remain legible at the rendered size.
- Don't: Do not use Browser for real navigation, real forms, or arbitrary card decoration.
- Don't: Do not put a real, working URL in the address pill. It reads as a link, is not one, and invites a click that does nothing.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| url | string | — | Address shown in the centered address pill. Omit for a blank pill. |
| children | ReactNode | — | Page content rendered inside the content region. |

## Tokens used

`card`, `background`, `border`, `muted`, `muted-foreground`

## Accessibility

- Purely presentational chrome; the framed content carries its own semantics.
- The toolbar is drawn, not interactive, and hidden from assistive technology; the address is decorative text.

## Related

- Components: Phone, Card

## Examples

### Framing a page

```tsx
import { Browser, PageHeader } from "@sableui/react"

<Browser url="studio.example/explore"><div className="p-8"><PageHeader title="Explore" description="Trending posts from every chain." /></div></Browser>
```

### Mockup, not chrome

```tsx
import { Browser, Region } from "@sableui/react"

// Browser is DECORATIVE framing for a screenshot or a demo — it belongs on a
// marketing page, never around your actual app.

<Region max="wide">
  <Browser url="studio.example">
    <img src="/screenshots/editor.png" alt="The editor" />
  </Browser>
</Region>

// ✗ Wrapping live UI in it. The frame implies "this is a picture of software";
//   putting real controls inside makes users hunt for a browser that isn't there.
// ✗ Using it to fake a URL bar for credibility. Show the real product.
```

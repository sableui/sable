# CodeBlock

**Status:** stable

Multi-line code surface. Optional header bar carries a filename and a copy affordance; the body is a horizontally scrollable monospace pre. Syntax highlighting is opt-in: pass a highlighter per block or once via CodeHighlightProvider (the package ships none).

**Keywords:** code block, snippet, pre, example

## Usage

Use CodeBlock for multiline code samples that users may read, inspect, or copy.

### Best practices

- Do: Give the snippet a filename, or a sentence of surrounding copy, when it helps readers and agents place it.
- Do: Keep examples complete enough to teach the intended pattern.
- Do: Wire highlighting once with CodeHighlightProvider and map token colors to semantic tone tokens (keywords → tone-edition, strings → success, comments → muted-foreground), so code follows the theme instead of a fixed palette.
- Don't: Do not put short inline identifiers in a CodeBlock; use Code for those.
- Don't: Do not paste code with the indentation the surrounding file had. A block indented to sit inside your JSX shows the reader leading whitespace that is not part of the example.

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| CodeBlock | yes | The surface: optional filename header, copy affordance, scrollable pre. |
| CodeHighlightProvider | no | Optional app-level wrapper that supplies one highlighter to every CodeBlock inside it. |

## Subcomponents

| Name | Type | Description |
| --- | --- | --- |
| CodeHighlightProvider | { highlight: (code: string) => ReactNode; children: ReactNode } | Supplies one highlighter to every CodeBlock beneath it, so an app wires highlighting once. Map the highlighter's token colors to Sable tone tokens so code follows the theme. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| code | string | — | The code to display. Always what the copy button copies, whatever the highlighter renders. |
| filename | string | — | Optional filename shown in the header bar. |
| showCopy | boolean | true | Show the copy affordance — in the header bar with a filename, floating in the corner without one. |
| highlight | ((code: string) => ReactNode) \| false | — | Highlighter for this block; overrides CodeHighlightProvider. false renders plain text inside a provider. |
| prompt | string | — | A shell prompt ("$", ">"). Makes it a one-line command: the prompt is dimmed and unselectable, the line truncates, and copy takes only code. |

## Tokens used

`border`, `muted`, `muted-foreground`, `foreground`

## Accessibility

- Code renders inside a <pre><code> for correct semantics and screen-reader handling.
- Copy is the ghost icon Button with `useCopy`, which guards clipboard access for SSR safety.

## Related

- Components: Code

## Examples

### With filename + copy

```tsx
import { CodeBlock } from "@sableui/react"

<CodeBlock filename="cn.ts" code={"import { clsx } from \"clsx\"\nexport const cn = clsx"} />
```

### With a highlighter for the whole app

```tsx
import { CodeBlock, CodeHighlightProvider } from "@sableui/react"

<CodeHighlightProvider highlight={(code) => <span dangerouslySetInnerHTML={{ __html: highlightToHtml(code) }} />}><CodeBlock code={"const a = 1"} /></CodeHighlightProvider>
```

### No header

```tsx
import { CodeBlock } from "@sableui/react"

<CodeBlock showCopy={false} code={"type Size = \"sm\" | \"md\"\nconst size: Size = \"md\""} />
```

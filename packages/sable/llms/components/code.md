# Code

**Status:** stable

Inline code. A styled `<code>` for code spans, keys, and identifiers inside running text — soft muted fill, monospace.

**Keywords:** code, inline code, token, monospace

## Usage

Use Code for short inline identifiers, commands, tokens, props, and file names inside prose.

### Best practices

- Do: Use it for brief technical literals that need to stand apart from body copy.
- Do: Keep inline code short enough that it does not dominate the paragraph.
- Don't: Do not use Code for multiline snippets; use CodeBlock instead.
- Don't: Do not put a value the reader needs to copy inside it. Code has no copy affordance, so they will select it by hand and catch the surrounding punctuation; use CodeBlock with a prompt.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| ...props | ComponentPropsWithRef<"code"> | — | All native `<code>` attributes (children, className, ref, …) pass through. |

## Tokens used

`muted`, `foreground`

## Accessibility

- Renders a semantic `<code>` element so assistive tech announces it as code.
- A `<code>` element is not announced distinctly by most screen readers — a code span in running prose is read as ordinary text. Where the exactness matters (a command to type verbatim, a case-sensitive identifier), say so in the sentence rather than relying on the styling to carry it.

## Related

- Components: CodeBlock, Kbd

## Examples

### Inline

```tsx
import { Code } from "@sableui/react"

Run <Code>pnpm dev</Code> to start the server.
```

### Code vs CodeBlock

```tsx
import { Code, CodeBlock } from "@sableui/react"

// Picking the wrong one is the usual mistake:
//
//   Code                   inline, inside a sentence       → `useState`
//   CodeBlock              multi-line, read-only           → an example to study
//   CodeBlock prompt="$"   one line, meant to be COPIED    → an install command

Install with <Code>pnpm add @sableui/react</Code>          {/* ✗ they will want to copy it */}
<CodeBlock prompt="$" code="pnpm add @sableui/react" />   {/* ✓ one line, with a copy button */}
```

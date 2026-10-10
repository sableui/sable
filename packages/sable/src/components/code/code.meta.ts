import type { ComponentMeta } from "../../lib/meta"

export const codeMeta: ComponentMeta = {
	name: "Code",
	summary:
		"Inline code. A styled `<code>` for code spans, keys, and identifiers inside running text — soft muted fill, monospace.",
	status: "stable",
	keywords: [
		"code",
		"inline code",
		"token",
		"monospace",
	],
	usage: {
		description: "Use Code for short inline identifiers, commands, tokens, props, and file names inside prose.",
		bestPractices: [
			{
				guidance: "do",
				description: "Use it for brief technical literals that need to stand apart from body copy.",
			},
			{
				guidance: "do",
				description: "Keep inline code short enough that it does not dominate the paragraph.",
			},
			{
				guidance: "dont",
				description: "Do not use Code for multiline snippets; use CodeBlock instead.",
			},
			{
				guidance: "dont",
				description: "Do not put a value the reader needs to copy inside it. Code has no copy affordance, so they will select it by hand and catch the surrounding punctuation; use CodeBlock with a prompt.",
			},
		],
	},
	related: {
		components: [
			"CodeBlock",
			"Kbd",
		],
	},
	props: [
		{
			name: "...props",
			type: 'ComponentPropsWithRef<"code">',
			description:
				"All native `<code>` attributes (children, className, ref, …) pass through.",
		},
	],
	tokensUsed: ["muted", "foreground"],
	a11y: [
		"Renders a semantic `<code>` element so assistive tech announces it as code.",
		"A `<code>` element is not announced distinctly by most screen readers — a code span in running prose is read as ordinary text. Where the exactness matters (a command to type verbatim, a case-sensitive identifier), say so in the sentence rather than relying on the styling to carry it.",
	],
	examples: [
		{
			label: "Inline",
			code: "Run <Code>pnpm dev</Code> to start the server.",
		},
		{
			label: "Code vs CodeBlock",
			code: `// Picking the wrong one is the usual mistake:
//
//   Code                   inline, inside a sentence       → \`useState\`
//   CodeBlock              multi-line, read-only           → an example to study
//   CodeBlock prompt="$"   one line, meant to be COPIED    → an install command

Install with <Code>pnpm add @sableui/react</Code>          {/* ✗ they will want to copy it */}
<CodeBlock prompt="$" code="pnpm add @sableui/react" />   {/* ✓ one line, with a copy button */}`
		},
	],
}

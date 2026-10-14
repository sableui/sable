import type { ComponentMeta } from "../../lib/meta"

export const codeBlockMeta: ComponentMeta = {
	name: "CodeBlock",
	summary:
		"Multi-line code surface. Optional header bar carries a filename and a copy affordance; the body is a horizontally scrollable monospace pre. Syntax highlighting is opt-in: pass a highlighter per block or once via CodeHighlightProvider (the package ships none).",
	status: "stable",
	keywords: [
		"code block",
		"snippet",
		"pre",
		"example",
	],
	usage: {
		description: "Use CodeBlock for multiline code samples that users may read, inspect, or copy.",
		anatomy: [
			{ name: "CodeBlock", required: true, description: "The surface: optional filename header, copy affordance, scrollable pre." },
			{ name: "CodeHighlightProvider", required: false, description: "Optional app-level wrapper that supplies one highlighter to every CodeBlock inside it." },
		],
		bestPractices: [
			{
				guidance: "do",
				description: "Give the snippet a filename, or a sentence of surrounding copy, when it helps readers and agents place it.",
			},
			{
				guidance: "do",
				description: "Keep examples complete enough to teach the intended pattern.",
			},
			{
				guidance: "do",
				description: "Wire highlighting once with CodeHighlightProvider and map token colors to semantic tone tokens (keywords → tone-1, strings → success, comments → muted-foreground), so code follows the theme instead of a fixed palette.",
			},
			{
				guidance: "dont",
				description: "Do not put short inline identifiers in a CodeBlock; use Code for those.",
			},
			{
				guidance: "dont",
				description: "Do not paste code with the indentation the surrounding file had. A block indented to sit inside your JSX shows the reader leading whitespace that is not part of the example.",
			},
		],
	},
	related: {
		components: [
			"Code",
		],
	},
	props: [
		{
			name: "code",
			type: "string",
			description: "The code to display. Always what the copy button copies, whatever the highlighter renders.",
		},
		{
			name: "filename",
			type: "string",
			description: "Optional filename shown in the header bar.",
		},
		{
			name: "showCopy",
			type: "boolean",
			default: "true",
			description: "Show the copy affordance — in the header bar with a filename, floating in the corner without one.",
		},
		{
			name: "highlight",
			type: "((code: string) => ReactNode) | false",
			description: "Highlighter for this block; overrides CodeHighlightProvider. false renders plain text inside a provider.",
		},
		{
			name: "prompt",
			type: "string",
			description: "A shell prompt (\"$\", \">\"). Makes it a one-line command: the prompt is dimmed and unselectable, the line truncates, and copy takes only code.",
		},
	],
	subcomponents: [
		{
			name: "CodeHighlightProvider",
			type: "{ highlight: (code: string) => ReactNode; children: ReactNode }",
			description: "Supplies one highlighter to every CodeBlock beneath it, so an app wires highlighting once. Map the highlighter's token colors to Sable tone tokens so code follows the theme.",
		},
	],
	tokensUsed: ["border", "muted", "muted-foreground", "foreground"],
	a11y: [
		"Code renders inside a <pre><code> for correct semantics and screen-reader handling.",
		"Copy is the ghost icon Button with `useCopy`, which guards clipboard access for SSR safety.",
	],
	examples: [
		{
			label: "With filename + copy",
			code: '<CodeBlock filename="cn.ts" code={"import { clsx } from \\"clsx\\"\\nexport const cn = clsx"} />',
		},
		{
			label: "With a highlighter for the whole app",
			code: '<CodeHighlightProvider highlight={(code) => <span dangerouslySetInnerHTML={{ __html: highlightToHtml(code) }} />}><CodeBlock code={"const a = 1"} /></CodeHighlightProvider>',
		},
		{
			label: "No header",
			code: '<CodeBlock showCopy={false} code={"type Size = \\"sm\\" | \\"md\\"\\nconst size: Size = \\"md\\""} />',
		},
	],
}

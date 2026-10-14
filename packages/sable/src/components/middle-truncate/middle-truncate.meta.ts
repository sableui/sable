import type { ComponentMeta } from "../../lib/meta"

export const middleTruncateMeta: ComponentMeta = {
	name: "MiddleTruncate",
	summary:
		"Middle-truncates a long string (hash, address, signature) to `5J7s…8xQp`, keeping the start and end legible while preserving the full value on hover.",
	status: "stable",
	keywords: [
		"truncate",
		"middle truncate",
		"hash",
		"identifier",
	],
	usage: {
		description: "Use MiddleTruncate when both the beginning and end of a long identifier must remain visible.",
		bestPractices: [
			{
				guidance: "do",
				description: "Use it for hashes, addresses, long filenames, URLs, or generated IDs.",
			},
			{
				guidance: "do",
				description: "Provide the full value through title text, copy action, or surrounding detail when needed.",
			},
			{
				guidance: "dont",
				description: "Do not use MiddleTruncate for human prose where the middle words carry meaning.",
			},
			{
				guidance: "dont",
				description: "Do not middle-truncate a value with no way to obtain it in full. Truncation removes characters from the page, so the value needs a copy affordance beside it: an icon Button with useCopy, as in the Copyable value example.",
			},
		],
	},
	related: {
		components: ["Code", "Button"],
	},
	props: [
		{
			name: "text",
			type: "string",
			description: "The full string to render. When it is truncated, the full value is also set as the title attribute (a pointer tooltip).",
		},
		{
			name: "startChars",
			type: "number",
			default: "6",
			description: "How many leading characters to keep before the ellipsis.",
		},
		{
			name: "endChars",
			type: "number",
			default: "6",
			description: "How many trailing characters to keep after the ellipsis.",
		},
	],
	tokensUsed: [],
	a11y: [
		"When truncated, the visible abbreviation is aria-hidden and a visually hidden copy carries the full value, so screen readers announce the whole string. The title attribute holds it too, for a pointer tooltip only.",
		"Renders the string verbatim when it is too short to benefit from truncation, so no value is hidden needlessly.",
	],
	examples: [
		{
			label: "API key",
			code: '<MiddleTruncate text="demo_key_7f3a9c2e5b8d1f4a6c0e9b3d7a2f5c8e1b4" />',
		},
		{
			label: "Custom start/end counts",
			code: '<MiddleTruncate text="9f2c4e7a1b3d5f60c8e2a4b6d8f0e1c3a5b7d9f2" startChars={4} endChars={4} />',
		},
		{
			label: "Copyable value",
			code: 'const { copy, copied } = useCopy(commitHash)\n<Row gap={1}><MiddleTruncate text={commitHash} /><Button variant="ghost" size="icon-xs" aria-label="Copy commit hash" onClick={copy}><Icon name={copied ? "check" : "copy"} /></Button></Row>',
		},
	],
}

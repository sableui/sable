import type { ComponentMeta } from "../../lib/meta"

export const toolCallMeta: ComponentMeta = {
	name: "ToolCall",
	summary:
		"One tool an agent called, as a quiet row inside its turn: a status glyph, what it did, the tool's name and where it is — with the arguments and result behind a disclosure.",
	status: "stable",
	keywords: [
		"tool call",
		"function call",
		"tool use",
		"agent step",
		"mcp",
		"ai",
		"tool result",
		"agent activity",
	],
	usage: {
		description:
			"Use it for each tool call in an assistant's turn, so the person can see what the agent did and check any step. The row is the summary — glyph, a plain-words title, the tool's name, the status — and stays one line, so a turn with ten calls is still scannable. Input and output sit behind the disclosure, because they are read rarely and, when they are, in full.",
		bestPractices: [
			{
				guidance: "do",
				description:
					"Give it a `title` in plain words, in the tense of the status: \"Searching the docs\" while running, \"Searched the docs\" once done. The `name` stays beside it in mono for the person who wants to know exactly which tool ran.",
			},
			{
				guidance: "do",
				description:
					"Drive `status` from the call's real state and keep the same element mounted as it changes. The spinner swaps for the outcome in place, and the change is announced to screen readers once.",
			},
			{
				guidance: "do",
				description:
					"Pass `error` with `status=\"error\"`. It shows under the row without opening anything, because a failure is the one result everyone needs to read.",
			},
			{
				guidance: "do",
				description:
					"Pass a rendered result as `children` when the output is something to look at — a list of hits, a diff — rather than data to inspect. It replaces the output's code view, and `input` still shows above it.",
			},
			{
				guidance: "dont",
				description:
					"Do not put the approve and deny buttons in a ToolCall. A call held for permission is `status=\"awaiting\"` here, and the decision itself is ApprovalBlock, which says what will happen and asks once.",
			},
			{
				guidance: "dont",
				description:
					"Do not use it for the agent's thinking or a progress note. A wait with no tool behind it is ThinkingOrb or a Spinner with a status line, and a row that claims a tool ran when none did makes every other row less trustworthy.",
				instead: ["ThinkingOrb", "Spinner"],
			},
			{
				guidance: "dont",
				description:
					"Do not open every call by default. A turn whose calls all show their JSON buries the answer; leave `defaultOpen` for the one call the person is likely to check, if any.",
			},
		],
		anatomy: [
			{ name: "Status glyph", required: true, description: "Spinner while running, then the outcome: check, warning, clock (awaiting approval) or ×. The only part that moves." },
			{ name: "Title", required: false, description: "What the call does, in plain words. Without one, the tool's name leads." },
			{ name: "Name", required: true, description: "The tool's own name in mono, after the title. Hidden below the sm breakpoint when a title is present." },
			{ name: "Status", required: true, description: "One word for where the call is: Running, Needs approval, Done, Failed, Denied." },
			{ name: "Error line", required: false, description: "The failure message, under the row and always visible." },
			{ name: "Details", required: false, description: "Input and output as code, or a rendered result. A disclosure; the row is its trigger." },
		],
	},
	related: {
		components: ["Message", "ThinkingOrb", "StreamingText", "CodeBlock", "Collapsible", "InlineStatus"],
	},
	props: [
		{ name: "name", type: "string", description: "The tool's own name, as the model called it (`search_docs`). Shown in mono." },
		{ name: "title", type: "ReactNode", description: "What the call does, in words a person reads. Leads the row; omit it and `name` leads." },
		{ name: "status", type: "\"running\" | \"awaiting\" | \"complete\" | \"error\" | \"denied\"", default: "\"running\"", description: "Where the call is. `awaiting` is held for the person's approval; `denied` is one they declined." },
		{ name: "statusLabel", type: "string", description: "Overrides the status word, for another language or a more specific phrase." },
		{ name: "input", type: "unknown", description: "The arguments. A string shows as is; anything else as formatted JSON." },
		{ name: "output", type: "unknown", description: "The result, shown the same way as `input`." },
		{ name: "error", type: "ReactNode", description: "What went wrong, for `status=\"error\"`. Always visible under the row." },
		{ name: "children", type: "ReactNode", description: "A rendered result in place of `output`'s code view." },
		{ name: "defaultOpen", type: "boolean", default: "false", description: "Open the details on mount." },
		{ name: "open", type: "boolean", description: "Controlled open state of the details." },
		{ name: "onOpenChange", type: "(open: boolean) => void", description: "Called when the details open or close." },
	],
	variants: {
		status: ["running", "awaiting", "complete", "error", "denied"],
	},
	tokensUsed: ["card", "border", "destructive", "muted", "muted-foreground", "foreground", "tone-warning", "ring"],
	motion: [
		{
			slot: "arrival",
			recipe: "none",
			part: "Root",
			why: "It arrives as part of the assistant's turn, and the turn's own arrival covers it. A second entrance per call would make a busy turn twitch.",
		},
		{
			slot: "response",
			recipe: "motion-interactive",
			part: "Header",
			why: "The header is the disclosure trigger but reads as a status row. The hover step is what tells the person it opens.",
		},
		{
			slot: "transition",
			recipe: "motion-icon-swap",
			part: "Status glyph",
			why: "The spinner becoming a check or a warning is the moment the call settles, and it is the one change in the row worth catching from the corner of the eye. The swap reads as one mark replaced, not a flicker.",
		},
		{
			slot: "transition",
			recipe: "motion-disclosure",
			part: "Details",
			why: "The height change connects the code that appears to the row that was pressed, in a thread where several rows look alike.",
		},
		{
			slot: "activity",
			recipe: "motion-spin",
			part: "Status glyph",
			why: "While the call runs, the spinner is what separates working from stuck. It pauses once the call settles, so a long thread of finished calls costs nothing.",
		},
	],
	a11y: [
		"With details, the header is a button with aria-expanded (Base UI Collapsible); its name is the title, the tool name and the status word, so it reads as one sentence.",
		"A status change after mount is announced once through a polite role=status region (\"Searched the docs: Done\"). The status a call mounts with is not announced, so a thread restored from history stays quiet.",
		"The glyph is aria-hidden: the status word beside it carries the meaning, so colour and shape are never the only signal.",
	],
	examples: [
		{
			label: "A finished call",
			code: `<ToolCall
	name="search_docs"
	title="Searched the docs"
	status="complete"
	input={{ query: "date range picker" }}
	output={{ hits: ["DatePicker", "Calendar", "DateTile"] }}
/>`,
		},
		{
			label: "Running, then failed",
			code: `<div className="flex flex-col gap-2">
	<ToolCall name="read_file" title="Reading package.json" status="running" input={{ path: "package.json" }} />
	<ToolCall
		name="run_tests"
		title="Ran the tests"
		status="error"
		error="3 of 412 tests failed in date-picker.test.tsx."
		input={{ filter: "date-picker" }}
	/>
</div>`,
		},
		{
			label: "Waiting for approval",
			code: `<ToolCall name="send_email" title="Send the invoice to Ada" status="awaiting" input={{ to: "ada@example.com", subject: "INV-1042" }} />`,
		},
	],
}

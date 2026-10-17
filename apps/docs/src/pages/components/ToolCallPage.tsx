import { Button, Message, Stack, ToolCall, type ToolCallStatus, toolCallMeta } from "@sableui/react"
import { useEffect, useState } from "react"
import { Example, MetaFooter, PageHeader, Section, ledeFor } from "../../components/docs-ui"

const STATUSES: { status: ToolCallStatus; title: string }[] = [
	{ status: "running", title: "Searching the docs" },
	{ status: "awaiting", title: "Send the invoice to Ada" },
	{ status: "complete", title: "Searched the docs" },
	{ status: "error", title: "Ran the tests" },
	{ status: "denied", title: "Delete the draft" },
]

/** Runs one call from start to settle, so the glyph swap can be seen. */
function Settling() {
	const [status, setStatus] = useState<ToolCallStatus>("running")
	const [run, setRun] = useState(0)
	useEffect(() => {
		setStatus("running")
		const timer = window.setTimeout(() => setStatus("complete"), 1800)
		return () => window.clearTimeout(timer)
	}, [run])
	return (
		<Stack gap={3} className="w-full max-w-lg">
			<ToolCall
				name="search_docs"
				title={status === "running" ? "Searching the docs" : "Searched the docs"}
				status={status}
				input={{ query: "date range picker" }}
				output={{ hits: ["DatePicker", "Calendar", "DateTile"] }}
			/>
			<div>
				<Button variant="outline" size="sm" onClick={() => setRun((n) => n + 1)}>
					Run it again
				</Button>
			</div>
		</Stack>
	)
}

export function ToolCallPage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Tool Call" lede={ledeFor(toolCallMeta)} />

			<Section
				title="Settling"
				description="The spinner gives way to the outcome in place. That swap is the only motion in the row."
			>
				<Example>
					<Settling />
				</Example>
			</Section>

			<Section
				title="Statuses"
				description="Five states, each with its own glyph and word. A failure also shows its message under the row."
			>
				<Example>
					<Stack gap={2} className="w-full max-w-lg">
						{STATUSES.map(({ status, title }) => (
							<ToolCall
								key={status}
								name={status === "error" ? "run_tests" : status === "awaiting" ? "send_email" : status === "denied" ? "delete_file" : "search_docs"}
								title={title}
								status={status}
								error={status === "error" ? "3 of 412 tests failed in date-picker.test.tsx." : undefined}
							/>
						))}
					</Stack>
				</Example>
			</Section>

			<Section
				title="Details"
				description="Input and output open from the row. Objects show as formatted JSON; a string shows as it is."
			>
				<Example>
					<div className="w-full max-w-lg">
						<ToolCall
							name="get_weather"
							title="Checked the weather in Lisbon"
							status="complete"
							defaultOpen
							input={{ city: "Lisbon", units: "metric" }}
							output={{ temperature: 21, conditions: "Clear", wind_kph: 9 }}
						/>
					</div>
				</Example>
			</Section>

			<Section
				title="Rendered result"
				description="Pass children when the result is something to look at rather than data to inspect."
			>
				<Example>
					<div className="w-full max-w-lg">
						<ToolCall name="search_docs" title="Searched the docs" status="complete" defaultOpen input={{ query: "date" }}>
							<ul className="flex flex-col gap-1 text-body-sm">
								<li className="text-foreground">DatePicker</li>
								<li className="text-foreground">Calendar</li>
								<li className="text-foreground">DateTile</li>
							</ul>
						</ToolCall>
					</div>
				</Example>
			</Section>

			<Section
				title="In a turn"
				description="Tool calls sit in the assistant's Message, above the answer they led to."
			>
				<Example>
					<div className="w-full max-w-lg">
						<Message messageId="t1">
							<Stack gap={2} className="w-full">
								<ToolCall name="read_file" title="Read package.json" status="complete" input={{ path: "package.json" }} />
								<ToolCall name="run_tests" title="Ran the tests" status="complete" output="412 passed" />
								<p className="text-body-md text-foreground">All 412 tests pass, so the upgrade is safe to merge.</p>
							</Stack>
						</Message>
					</div>
				</Example>
			</Section>

			<MetaFooter meta={toolCallMeta} />
		</>
	)
}

import { Note, noteMeta } from "@sableui/react"
import { type ComponentProps } from "react"
import { as, type PreviewEntry } from "../preview-kit"

const entry: PreviewEntry = {
	meta: noteMeta,
	text: "Reports refresh every hour.",
	only: ["tone"],
	stageClassName: "block",
	render: (values, text) => (
		<Note {...as<ComponentProps<typeof Note>>(values)}>{text}</Note>
	),
}

export default entry

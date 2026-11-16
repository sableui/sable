import { Pill, pillMeta } from "@sableui/react"
import { type ComponentProps } from "react"
import { as, type PreviewEntry } from "../preview-kit"

const entry: PreviewEntry = {
	meta: pillMeta,
	text: "Design",
	render: (values, text) => (
		<Pill {...as<ComponentProps<typeof Pill>>(values)}>{text}</Pill>
	),
}

export default entry

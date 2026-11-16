import { Bubble, bubbleMeta } from "@sableui/react"
import { type ComponentProps } from "react"
import { as, type PreviewEntry } from "../preview-kit"

const entry: PreviewEntry = {
	meta: bubbleMeta,
	text: "Green across the board.",
	only: ["variant", "align", "tail"],
	render: (values, text) => (
		<Bubble {...as<ComponentProps<typeof Bubble>>(values)}>{text}</Bubble>
	),
}

export default entry

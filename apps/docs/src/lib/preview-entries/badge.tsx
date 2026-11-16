import { Badge, badgeMeta } from "@sableui/react"
import { type ComponentProps } from "react"
import { as, type PreviewEntry } from "../preview-kit"

const entry: PreviewEntry = {
	meta: badgeMeta,
	text: "New",
	render: (values, text) => (
		<Badge {...as<ComponentProps<typeof Badge>>(values)}>{text}</Badge>
	),
}

export default entry

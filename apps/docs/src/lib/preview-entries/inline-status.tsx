import { InlineStatus, inlineStatusMeta } from "@sableui/react"
import { type ComponentProps } from "react"
import { as, type PreviewEntry } from "../preview-kit"

const entry: PreviewEntry = {
	meta: inlineStatusMeta,
	text: "Top-up confirmed.",
	only: ["tone", "size"],
	render: (values, text) => (
		<InlineStatus {...as<ComponentProps<typeof InlineStatus>>(values)}>
			{text}
		</InlineStatus>
	),
}

export default entry

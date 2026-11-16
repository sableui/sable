import { StatusDot, statusDotMeta } from "@sableui/react"
import { type ComponentProps } from "react"
import { as, type PreviewEntry } from "../preview-kit"

const entry: PreviewEntry = {
	meta: statusDotMeta,
	only: ["tone", "size", "pulse"],
	render: (values) => (
		<StatusDot {...as<ComponentProps<typeof StatusDot>>(values)} />
	),
}

export default entry

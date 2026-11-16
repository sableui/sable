import { Marker, markerMeta } from "@sableui/react"
import { type ComponentProps } from "react"
import { as, type PreviewEntry } from "../preview-kit"

const entry: PreviewEntry = {
	meta: markerMeta,
	text: "Thinking…",
	only: ["variant", "spin", "shimmer"],
	render: (values, text) => (
		<Marker {...as<ComponentProps<typeof Marker>>(values)}>{text}</Marker>
	),
}

export default entry

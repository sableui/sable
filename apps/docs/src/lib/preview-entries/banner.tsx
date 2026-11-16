import { Banner, bannerMeta } from "@sableui/react"
import { type ComponentProps } from "react"
import { as, type PreviewEntry } from "../preview-kit"

const entry: PreviewEntry = {
	meta: bannerMeta,
	text: "Maintenance window tonight at 02:00 UTC.",
	only: ["tone", "appearance", "dismissible"],
	stageClassName: "block",
	render: (values, text) => (
		<Banner {...as<ComponentProps<typeof Banner>>(values)}>{text}</Banner>
	),
}

export default entry

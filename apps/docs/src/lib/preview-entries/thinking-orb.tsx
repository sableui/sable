import { ThinkingOrb, thinkingOrbMeta } from "@sableui/react"
import { type ComponentProps } from "react"
import { as, type PreviewEntry } from "../preview-kit"

const entry: PreviewEntry = {
	meta: thinkingOrbMeta,
	only: ["mode", "size", "paused"],
	render: (values) => <ThinkingOrb {...as<ComponentProps<typeof ThinkingOrb>>(values)} />,
}

export default entry

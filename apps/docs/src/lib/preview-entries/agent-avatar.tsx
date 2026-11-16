import { AgentAvatar, agentAvatarMeta } from "@sableui/react"
import { type ComponentProps } from "react"
import { as, type PreviewEntry } from "../preview-kit"

const entry: PreviewEntry = {
	meta: agentAvatarMeta,
	only: ["state", "size", "live"],
	render: (values) => <AgentAvatar {...as<ComponentProps<typeof AgentAvatar>>(values)} />,
}

export default entry

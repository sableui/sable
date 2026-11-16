import { Avatar, avatarMeta } from "@sableui/react"
import { type ComponentProps } from "react"
import { as, type PreviewEntry } from "../preview-kit"

const entry: PreviewEntry = {
	fixed: ['fallback="AM"', 'alt="Alex Morgan"'],
	meta: avatarMeta,
	only: ["size", "variant"],
	render: (values) => (
		<Avatar
			{...as<ComponentProps<typeof Avatar>>(values)}
			fallback="AM"
			alt="Alex Morgan"
		/>
	),
}

export default entry

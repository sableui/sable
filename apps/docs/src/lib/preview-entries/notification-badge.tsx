import { NotificationBadge, notificationBadgeMeta } from "@sableui/react"
import { type ComponentProps } from "react"
import { as, type PreviewEntry } from "../preview-kit"

const entry: PreviewEntry = {
	meta: notificationBadgeMeta,
	only: ["tone", "size", "dot"],
	// `dot` takes precedence over `count` in the component, so passing both
	// unconditionally keeps the snippet honest without changing what renders.
	fixed: ["count={8}"],
	render: (values) => (
		<NotificationBadge
			{...as<ComponentProps<typeof NotificationBadge>>(values)}
			count={8}
		/>
	),
}

export default entry

import { Avatar, Entity, entityMeta } from "@sableui/react"
import { type ComponentProps } from "react"
import { as, type PreviewEntry } from "../preview-kit"

const entry: PreviewEntry = {
	meta: entityMeta,
	only: ["density", "interactive", "selected"],
	fixed: ['leading={<Avatar fallback="AM" alt="Alex Morgan" />}', 'title="Alex Morgan"', 'subtitle="@alex"'],
	render: (values) => (
		<div className="w-full max-w-md">
			<Entity
				{...as<ComponentProps<typeof Entity>>(values)}
				leading={<Avatar fallback="AM" alt="Alex Morgan" />}
				title="Alex Morgan"
				subtitle="@alex"
			/>
		</div>
	),
}

export default entry

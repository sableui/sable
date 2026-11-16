import { Progress, progressMeta } from "@sableui/react"
import { type ComponentProps } from "react"
import { as, type PreviewEntry } from "../preview-kit"

const entry: PreviewEntry = {
	meta: progressMeta,
	only: ["size"],
	fixed: ["value={64}", 'aria-label="Upload"'],
	render: (values) => (
		<div className="w-full max-w-sm">
			<Progress {...as<ComponentProps<typeof Progress>>(values)} value={64} aria-label="Upload" />
		</div>
	),
}

export default entry

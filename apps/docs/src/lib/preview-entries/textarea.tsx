import { Textarea, textareaMeta } from "@sableui/react"
import { type ComponentProps } from "react"
import { as, type PreviewEntry } from "../preview-kit"

const entry: PreviewEntry = {
	meta: textareaMeta,
	only: ["autoResize", "disabled", "aria-invalid"],
	fixed: ['aria-label="Caption"', 'placeholder="Write a caption…"'],
	render: (values) => (
		<div className="w-full max-w-sm">
			<Textarea
				{...as<ComponentProps<typeof Textarea>>(values)}
				aria-label="Caption"
				placeholder="Write a caption…"
			/>
		</div>
	),
}

export default entry

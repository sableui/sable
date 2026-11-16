import { FileDropzone, fileDropzoneMeta } from "@sableui/react"
import { type ComponentProps } from "react"
import { as, type PreviewEntry } from "../preview-kit"

const entry: PreviewEntry = {
	meta: fileDropzoneMeta,
	only: ["size", "multiple"],
	fixed: ['description="Images or PDFs, up to 10 MB each"'],
	render: (values) => (
		<div className="w-full max-w-lg">
			<FileDropzone
				{...as<ComponentProps<typeof FileDropzone>>(values)}
				description="Images or PDFs, up to 10 MB each"
			/>
		</div>
	),
}

export default entry

import { Input, inputMeta } from "@sableui/react"
import { type ComponentProps } from "react"
import { as, type PreviewEntry } from "../preview-kit"

const entry: PreviewEntry = {
	meta: inputMeta,
	only: ["size", "disabled", "aria-invalid"],
	fixed: ['aria-label="Email"', 'placeholder="you@example.com"'],
	render: (values) => (
		<div className="w-full max-w-xs">
			<Input
				{...as<ComponentProps<typeof Input>>(values)}
				aria-label="Email"
				placeholder="you@example.com"
			/>
		</div>
	),
}

export default entry

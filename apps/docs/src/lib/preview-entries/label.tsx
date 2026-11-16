import { Label, labelMeta } from "@sableui/react"
import { type ComponentProps } from "react"
import { as, type PreviewEntry } from "../preview-kit"

const entry: PreviewEntry = {
	meta: labelMeta,
	text: "Email",
	only: ["size", "eyebrow"],
	render: (values, text) => (
		<Label {...as<ComponentProps<typeof Label>>(values)}>{text}</Label>
	),
}

export default entry

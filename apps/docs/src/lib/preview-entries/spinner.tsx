import { Spinner, spinnerMeta } from "@sableui/react"
import { type ComponentProps } from "react"
import { as, type PreviewEntry } from "../preview-kit"

const entry: PreviewEntry = {
	meta: spinnerMeta,
	only: ["appearance", "size"],
	render: (values) => <Spinner {...as<ComponentProps<typeof Spinner>>(values)} />,
}

export default entry

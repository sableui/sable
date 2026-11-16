import { Kbd, kbdMeta } from "@sableui/react"
import { type ComponentProps } from "react"
import { as, type PreviewEntry } from "../preview-kit"

const entry: PreviewEntry = {
	meta: kbdMeta,
	text: "K",
	only: ["variant", "mod"],
	render: (values, text) => <Kbd {...as<ComponentProps<typeof Kbd>>(values)}>{text}</Kbd>,
}

export default entry

import { Meter, meterMeta } from "@sableui/react"
import { type ComponentProps } from "react"
import { as, type PreviewEntry } from "../preview-kit"

const entry: PreviewEntry = {
	meta: meterMeta,
	only: ["tone", "shape", "size", "showValue"],
	fixed: ["value={72}", 'aria-label="Storage used"'],
	render: (values) => (
		// A bar needs a width to fill; a ring sizes itself.
		<div className={values.shape === "ring" ? undefined : "w-full max-w-sm"}>
			<Meter {...as<ComponentProps<typeof Meter>>(values)} value={72} aria-label="Storage used" />
		</div>
	),
}

export default entry

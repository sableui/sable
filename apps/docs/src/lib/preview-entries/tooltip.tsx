import { Button, Tooltip, TooltipContent, tooltipMeta, TooltipTrigger } from "@sableui/react"
import { attrs, type PreviewEntry } from "../preview-kit"

const entry: PreviewEntry = {
	meta: tooltipMeta,
	only: ["side"],
	render: (values) => (
		<Tooltip>
			<TooltipTrigger render={<Button variant="secondary">Hover me</Button>} />
			<TooltipContent side={values.side as "top" | "right" | "bottom" | "left"}>
				A short, supplementary label.
			</TooltipContent>
		</Tooltip>
	),
	snippet: (values) => `<Tooltip>
<TooltipTrigger render={<Button variant="secondary">Hover me</Button>} />
<TooltipContent${attrs(tooltipMeta, values, ["side"])}>A short, supplementary label.</TooltipContent>
/Tooltip>`,
}

export default entry

import { Separator, separatorMeta } from "@sableui/react"
import { type ComponentProps } from "react"
import { as, type PreviewEntry } from "../preview-kit"

const entry: PreviewEntry = {
	meta: separatorMeta,
	only: ["orientation"],
	render: (values) => (
		<div
			className={
				values.orientation === "vertical"
					? "flex h-24 items-center gap-4"
					: "w-full max-w-sm"
			}
		>
			<span className="text-body-sm text-muted-foreground">Above</span>
			<Separator {...as<ComponentProps<typeof Separator>>(values)} />
			<span className="text-body-sm text-muted-foreground">Below</span>
		</div>
	),
}

export default entry

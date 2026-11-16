import { MediaTile, mediaTileMeta, Button, Icon } from "@sableui/react"
import { type ComponentProps } from "react"
import { as, type PreviewEntry } from "../preview-kit"

const entry: PreviewEntry = {
	meta: mediaTileMeta,
	only: ["size", "aspect"],
	fixed: ['title="Low tide, high noon"', 'subtitle="Juno Avery"', 'href="/albums/low-tide"', 'action={<Button size="icon" aria-label="Play Low tide, high noon"><Icon name="play" variant="solid" /></Button>}'],
	// Fixed width: the tile fills its grid cell, and the stage has no grid.
	render: (values) => (
		<div className="w-48">
			<MediaTile
				{...as<ComponentProps<typeof MediaTile>>(values)}
				title="Low tide, high noon"
				subtitle="Juno Avery"
				href="#low-tide"
				action={
					<Button size={values.size === "sm" ? "icon-sm" : "icon"} aria-label="Play Low tide, high noon">
						<Icon name="play" variant="solid" />
					</Button>
				}
			/>
		</div>
	),
}

export default entry

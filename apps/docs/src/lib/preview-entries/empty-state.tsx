import { Button, EmptyState, emptyStateMeta, Icon } from "@sableui/react"
import { type ComponentProps } from "react"
import { as, type PreviewEntry } from "../preview-kit"

const entry: PreviewEntry = {
	meta: emptyStateMeta,
	only: ["tone", "size", "surface"],
	fixed: [
		'icon={<Icon name="image-stack" />}',
		'title="No posts yet"',
		'description="Create your first."',
		"action={<Button>New post</Button>}",
	],
	render: (values) => (
		<EmptyState
			{...as<ComponentProps<typeof EmptyState>>(values)}
			icon={<Icon name="image-stack" />}
			title="No posts yet"
			description="Create your first."
			action={<Button>New post</Button>}
		/>
	),
}

export default entry

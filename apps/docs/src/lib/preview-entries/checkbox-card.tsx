import { CheckboxCard, checkboxCardMeta, Icon } from "@sableui/react"
import { type ComponentProps } from "react"
import { as, type PreviewEntry } from "../preview-kit"

const entry: PreviewEntry = {
	meta: checkboxCardMeta,
	only: ["tone"],
	// Checked from the start: the tone colors only a checked card.
	fixed: ["defaultChecked", 'icon={<Icon name="gem" />}', 'title="Featured"', 'description="Pin for the campaign"'],
	render: (values) => (
		<div className="w-full max-w-xs">
			<CheckboxCard
				{...as<ComponentProps<typeof CheckboxCard>>(values)}
				defaultChecked
				icon={<Icon name="gem" />}
				title="Featured"
				description="Pin for the campaign"
			/>
		</div>
	),
}

export default entry

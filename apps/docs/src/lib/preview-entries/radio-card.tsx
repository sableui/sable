import { Icon, RadioCard, radioCardMeta, RadioGroup } from "@sableui/react"
import { type ComponentProps } from "react"
import { as, attrs, type PreviewEntry } from "../preview-kit"

const entry: PreviewEntry = {
	meta: radioCardMeta,
	only: ["tone", "disabled"],
	render: (values) => {
		const props = as<Omit<ComponentProps<typeof RadioCard>, "value">>(values)
		return (
			<RadioGroup defaultValue="featured" className="grid w-full max-w-md gap-3 sm:grid-cols-2">
				<RadioCard {...props} value="post" icon={<Icon name="plus" />} title="Standard" description="Publish to the feed" />
				<RadioCard {...props} value="featured" icon={<Icon name="gem" />} title="Featured" description="Pin for the campaign" />
			</RadioGroup>
		)
	},
	snippet: (values) => {
		const a = attrs(radioCardMeta, values, ["tone", "disabled"])
		return `<RadioGroup defaultValue="featured">
<RadioCard${a} value="post" title="Standard" description="Publish to the feed" />
<RadioCard${a} value="featured" title="Featured" description="Pin for the campaign" />
/RadioGroup>`
	},
}

export default entry

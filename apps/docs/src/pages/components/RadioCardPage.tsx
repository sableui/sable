import { RadioCard, RadioGroup, radioCardMeta, Icon } from "@sableui/react"
import { useState } from "react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

export function RadioCardPage() {
	const [plan, setPlan] = useState("pro")
	const [postType, setPostType] = useState("post")

	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="Radio Card"
				lede={ledeFor(radioCardMeta)}
			/>

			<Section
				title="With icons and tones"
				description="An icon gives the richer card; a tone colours the selected state."
			>
				<Example
					code={`const [postType, setPostType] = useState("post")\n<RadioGroup value={postType} onValueChange={setPostType} className="grid w-full max-w-[760px] sm:grid-cols-3">\n  <RadioCard value="post" tone="standard" icon={<Icon name="plus" />}\n    title="Standard" description="Publish to the main feed" />\n  <RadioCard value="collectible" tone="collectible" icon={<Icon name="gem" />}\n    title="Featured" description="Pin for the campaign" />\n  <RadioCard value="edition" tone="edition" icon={<Icon name="image-stack" />}\n    title="Collection" description="Group with related work" />\n</RadioGroup>`}
				>
					<RadioGroup
						value={postType}
						onValueChange={(value) => setPostType(value as string)}
						className="grid w-full max-w-[760px] sm:grid-cols-3"
					>
						<RadioCard
							value="post"
							tone="standard"
							icon={<Icon name="plus" />}
							title="Standard"
							description="Publish to the main feed"
						/>
						<RadioCard
							value="collectible"
							tone="collectible"
							icon={<Icon name="gem" />}
							title="Featured"
							description="Pin for the campaign"
						/>
						<RadioCard
							value="edition"
							tone="edition"
							icon={<Icon name="image-stack" />}
							title="Collection"
							description="Group with related work"
						/>
					</RadioGroup>
				</Example>
			</Section>

			<Section
				title="Plan picker"
				description="The whole card is clickable."
			>
				<Example
					code={`const [plan, setPlan] = useState("pro")\n<RadioGroup value={plan} onValueChange={setPlan} className="w-full max-w-[420px]">\n  <RadioCard value="free" title="Free" description="For trying things out. Up to 3 projects." />\n  <RadioCard value="pro" title="Pro" description="For growing teams. Unlimited projects and analytics." />\n  <RadioCard value="enterprise" title="Enterprise" description="Custom limits, SSO, and priority support." />\n</RadioGroup>`}
				>
					<RadioGroup
						value={plan}
						onValueChange={(value) => setPlan(value as string)}
						className="w-full max-w-[420px]"
					>
						<RadioCard
							value="free"
							title="Free"
							description="For trying things out. Up to 3 projects."
						/>
						<RadioCard
							value="pro"
							title="Pro"
							description="For growing teams. Unlimited projects and analytics."
						/>
						<RadioCard
							value="enterprise"
							title="Enterprise"
							description="Custom limits, SSO, and priority support."
						/>
					</RadioGroup>
				</Example>
			</Section>

			<Section
				title="With a disabled option"
				description="Unavailable options stay visible but dimmed."
			>
				<Example>
					<RadioGroup
						defaultValue="free"
						className="w-full max-w-[420px]"
					>
						<RadioCard
							value="free"
							title="Free"
							description="For trying things out."
						/>
						<RadioCard
							value="enterprise"
							title="Enterprise"
							description="Contact sales to enable this plan."
							disabled
						/>
					</RadioGroup>
				</Example>
			</Section>

			<Section
				title="Grid layout"
				description="Cards can sit side by side instead of stacking."
			>
				<Example>
					<RadioGroup
						defaultValue="card"
						className="grid w-full max-w-[520px] grid-cols-1 gap-2 sm:grid-cols-2"
					>
						<RadioCard
							value="card"
							title="Card"
							description="Pay with a credit or debit card."
						/>
						<RadioCard
							value="invoice"
							title="Invoice"
							description="Send an invoice to the billing contact."
						/>
					</RadioGroup>
				</Example>
			</Section>

			<MetaFooter meta={radioCardMeta} />
		</>
	)
}

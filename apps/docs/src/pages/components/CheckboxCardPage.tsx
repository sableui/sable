import {
	CheckboxCard,
	checkboxCardMeta,
	CheckboxGroup,
	Icon,
} from "@sableui/react"
import { useState } from "react"
import {
	ComponentPlayground,
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

const REASONS = ["Spam or scam", "Stolen artwork", "Harassment"]

const REPORT_CODE = `const [reasons, setReasons] = useState(["Stolen artwork"])

<CheckboxGroup value={reasons} onValueChange={setReasons}>
	{REASONS.map((reason) => (
		<CheckboxCard key={reason} value={reason} title={reason} />
	))}
</CheckboxGroup>`

function ReportDemo() {
	const [reasons, setReasons] = useState<string[]>(["Stolen artwork"])
	return (
		<CheckboxGroup
			value={reasons}
			onValueChange={setReasons}
			className="w-full max-w-[360px]"
		>
			{REASONS.map((reason) => (
				<CheckboxCard key={reason} value={reason} title={reason} />
			))}
		</CheckboxGroup>
	)
}

export function CheckboxCardPage() {
	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="Checkbox Card"
				lede={ledeFor(checkboxCardMeta)}
			/>

			<ComponentPlayground meta={checkboxCardMeta} />

			<Section
				title="Group"
				description="A stack of cards; pick any number. Give each card a value and the group keeps the list of what's checked."
			>
				<Example code={REPORT_CODE}>
					<ReportDemo />
				</Example>
			</Section>

			<Section
				title="Tones"
				description="When checked, the tone colors the border, box and icon."
			>
				<Example>
					<CheckboxGroup className="w-full max-w-[360px]">
						<CheckboxCard
							tone="edition"
							icon={<Icon name="gem" />}
							title="Editions"
							description="Sell as numbered NFT editions"
							defaultChecked
						/>
						<CheckboxCard
							tone="collectible"
							icon={<Icon name="sparkles" />}
							title="Collectibles"
							description="One-of-one, free to mint"
							defaultChecked
						/>
						<CheckboxCard
							tone="warning"
							icon={<Icon name="warning" />}
							title="Mature content"
							description="Blur previews until confirmed"
						/>
					</CheckboxGroup>
				</Example>
			</Section>

			<Section title="Disabled">
				<Example code='<CheckboxCard title="Legacy minting" description="No longer available" disabled />'>
					<div className="w-full max-w-[360px]">
						<CheckboxCard
							title="Legacy minting"
							description="No longer available"
							disabled
						/>
					</div>
				</Example>
			</Section>

			<MetaFooter meta={checkboxCardMeta} />
		</>
	)
}

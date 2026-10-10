import { Banner, bannerMeta } from "@sableui/react"
import {
	ComponentPlayground,
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

export function BannerPage() {
	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="Banner"
				lede={ledeFor(bannerMeta)}
			/>

			<ComponentPlayground meta={bannerMeta} />

			<Section
				title="Tones"
				description="The tone says what kind of news it is."
			>
				<Example
					className="flex-col items-stretch gap-3"
					code={`<Banner tone="neutral">We just shipped a new editions experience.</Banner>
<Banner tone="info">Maintenance window tonight at 02:00 UTC.</Banner>
<Banner tone="success">Your payout is on its way.</Banner>
<Banner tone="warning">Your session expires soon — save your work.</Banner>
<Banner tone="edition">Limited drop live now — only 50 editions remain.</Banner>
<Banner tone="destructive">Payments are failing. We're on it.</Banner>`}
				>
					<Banner tone="neutral">
						We just shipped a new editions experience.
					</Banner>
					<Banner tone="info">
						Maintenance window tonight at 02:00 UTC.
					</Banner>
					<Banner tone="success">Your payout is on its way.</Banner>
					<Banner tone="warning">
						Your session expires soon — save your work.
					</Banner>
					<Banner tone="edition">
						Limited drop live now — only 50 editions remain.
					</Banner>
					<Banner tone="destructive">
						Payments are failing. We're on it.
					</Banner>
				</Example>
			</Section>

			<Section
				title="Solid fill"
				description="For loud states people can't miss, like going offline."
			>
				<Example
					className="flex-col items-stretch gap-3"
					code={`<Banner tone="neutral" appearance="solid">You're viewing a preview build.</Banner>
<Banner tone="warning" appearance="solid">The network is congested. Transactions may be slow.</Banner>
<Banner tone="destructive" appearance="solid">You're offline. Changes will sync when you reconnect.</Banner>`}
				>
					<Banner tone="neutral" appearance="solid">
						You're viewing a preview build.
					</Banner>
					<Banner tone="warning" appearance="solid">
						The network is congested. Transactions may be slow.
					</Banner>
					<Banner tone="destructive" appearance="solid">
						You're offline. Changes will sync when you reconnect.
					</Banner>
				</Example>
			</Section>

			<Section
				title="Dismissible"
				description="A close button for notices people can safely hide."
			>
				<Example className="flex-col items-stretch gap-3">
					<Banner tone="warning" dismissible>
						Heads up — this is a dismissible banner.
					</Banner>
				</Example>
			</Section>

			<MetaFooter meta={bannerMeta} />
		</>
	)
}

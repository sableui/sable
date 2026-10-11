import {
	Progress,
	ProgressLabel,
	progressMeta,
	ProgressTrack,
	ProgressValue,
} from "@sableui/react"
import {
	ComponentPlayground,
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

export function ProgressPage() {
	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="Progress"
				lede={ledeFor(progressMeta)}
			/>

			<ComponentPlayground meta={progressMeta} />

			<Section title="Determinate" description="When you know how far along it is.">
				<Example code={'<Progress value={64} aria-label="Upload" />'}>
					<div className="w-full max-w-sm">
						<Progress value={64} aria-label="Upload" />
					</div>
				</Example>
			</Section>

			<Section
				title="Indeterminate"
				description="When you don't. The bar pulses."
			>
				<Example code={'<Progress aria-label="Preparing export" />'}>
					<div className="w-full max-w-sm">
						<Progress aria-label="Preparing export" />
					</div>
				</Example>
			</Section>

			<Section title="With label and value">
				<Example
					code={`<Progress value={40}>
	<div className="mb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
		<ProgressLabel>Uploading</ProgressLabel>
		<ProgressValue />
	</div>
	<ProgressTrack />
</Progress>`}
				>
					<div className="w-full max-w-sm">
						<Progress value={40}>
							<div className="mb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
								<ProgressLabel>Uploading</ProgressLabel>
								<ProgressValue />
							</div>
							<ProgressTrack />
						</Progress>
					</div>
				</Example>
			</Section>

			<Section title="Values">
				<Example>
					<div className="flex w-full max-w-sm flex-col gap-4">
						{[0, 25, 50, 75, 100].map((value) => (
							<Progress key={value} value={value} aria-label={`Example at ${value}%`} />
						))}
					</div>
				</Example>
			</Section>

			<Section
				title="Sizes"
				description="Three thicknesses, the same rails Meter uses."
			>
				<Example
					code={`<Progress value={80} size="sm" aria-label="Small" />
<Progress value={80} aria-label="Medium" />
<Progress value={80} size="lg" aria-label="Large" />`}
				>
					<div className="flex w-full max-w-sm flex-col gap-4">
						<Progress value={80} size="sm" aria-label="Small" />
						<Progress value={80} aria-label="Medium" />
						<Progress value={80} size="lg" aria-label="Large" />
					</div>
				</Example>
			</Section>

			<MetaFooter meta={progressMeta} />
		</>
	)
}

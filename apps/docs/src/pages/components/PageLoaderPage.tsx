import { PageLoader, pageLoaderMeta } from "@sableui/react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

export function PageLoaderPage() {
	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="Page Loader"
				lede={ledeFor(pageLoaderMeta)}
			/>

			<Section
				title="Contained"
				description="Covers the whole screen by default. Here it fills a frame instead."
			>
				<Example>
					<div className="relative h-72 w-full overflow-hidden rounded-lg border border-border">
						<PageLoader fullscreen={false} label="Loading Studio" />
					</div>
				</Example>
			</Section>

			<Section
				title="Custom mark"
				description="Your logo can replace the default pulsing mark."
			>
				<Example>
					<div className="relative h-72 w-full overflow-hidden rounded-lg border border-border">
						<PageLoader fullscreen={false} label="Loading">
							<span
								aria-hidden
								className="block size-12 rounded-xl bg-primary"
							/>
						</PageLoader>
					</div>
				</Example>
			</Section>

			<Section
				title="Without the bar"
				description="A quieter splash with no progress bar."
			>
				<Example>
					<div className="relative h-72 w-full overflow-hidden rounded-lg border border-border">
						<PageLoader fullscreen={false} hideBar label="Loading" />
					</div>
				</Example>
			</Section>

			<MetaFooter meta={pageLoaderMeta} />
		</>
	)
}

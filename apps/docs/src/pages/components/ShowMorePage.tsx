import { ShowMore, showMoreMeta } from "@sableui/react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

export function ShowMorePage() {
	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="Show More"
				lede={ledeFor(showMoreMeta)}
			/>

			<Section
				title="Default"
				description="Long content fades out at the cut. The toggle reveals the rest."
			>
				<Example>
					<div className="max-w-[480px]">
						<ShowMore>
							<p className="text-body-md text-muted-foreground">
								Sable is a themeable product UI system where the same semantic
								tokens power dense app shells, editorial landing pages, forms,
								data tables, and status-heavy workflows. Components stay reusable
								because they never name palette colors directly; each theme owns
								the palette underneath. A consuming app can keep one visual
								language across onboarding, account settings, analytics, support,
								and marketing routes while still letting teams switch between
								brand expressions.
							</p>
						</ShowMore>
					</div>
				</Example>
			</Section>

			<Section
				title="Collapsed to a line count"
				description="Show a longer preview before the fade. Counted in lines, it keeps its length when the type scale changes."
			>
				<Example>
					<div className="max-w-[480px]">
						<ShowMore collapsedLines={6}>
							<p className="text-body-md text-muted-foreground">
								A taller preview suits release notes or terms, where the reader
								wants a longer glance before committing to the full text. This
								release brings a refreshed settings page, faster search across
								every workspace, and clearer billing summaries. Notifications now
								group by project, so a busy morning reads as a short list instead
								of a long one. Exports include every column you can see, in the
								order you arranged them. Shared links remember the filters you
								applied, and the people you send them to see exactly what you
								saw. Keyboard shortcuts are listed in one place, and every one of
								them can be changed. Older projects can be archived in bulk, and
								restored just as easily if you change your mind later.
							</p>
						</ShowMore>
					</div>
				</Example>
			</Section>

			<MetaFooter meta={showMoreMeta} />
		</>
	)
}

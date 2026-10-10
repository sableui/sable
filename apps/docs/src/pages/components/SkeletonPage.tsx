import { Skeleton, skeletonMeta } from "@sableui/react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

export function SkeletonPage() {
	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="Skeleton"
				lede={ledeFor(skeletonMeta)}
			/>

			<Section
				title="Shapes"
				description="Lines, circles and media blocks."
			>
				<Example
					code={`<Skeleton className="h-4 w-40" />
<Skeleton className="size-12 rounded-full" />
<Skeleton className="h-32 w-56" />`}
				>
					<Skeleton className="h-4 w-40" />
					<Skeleton className="size-12 rounded-full" />
					<Skeleton className="h-32 w-56" />
				</Example>
			</Section>

			<Section
				title="Text lines"
				description="A few lines of different widths suggest a paragraph."
			>
				<Example className="!block">
					<div className="max-w-sm space-y-2">
						<Skeleton className="h-3 w-full" />
						<Skeleton className="h-3 w-5/6" />
						<Skeleton className="h-3 w-2/3" />
					</div>
				</Example>
			</Section>

			<Section
				title="A loading post"
				description="Mirror the layout that will load, so nothing jumps when it arrives."
			>
				<Example className="!block">
					<div
						className="max-w-md space-y-4"
						aria-busy="true"
						aria-label="Loading post"
					>
						<div className="flex items-center gap-3">
							<Skeleton className="size-10 rounded-full" />
							<div className="space-y-2">
								<Skeleton className="h-3 w-32" />
								<Skeleton className="h-3 w-20" />
							</div>
						</div>
						<div className="space-y-2">
							<Skeleton className="h-3 w-full" />
							<Skeleton className="h-3 w-4/5" />
						</div>
						<Skeleton className="h-48 w-full rounded-lg" />
						<div className="flex gap-4">
							<Skeleton className="h-4 w-12" />
							<Skeleton className="h-4 w-12" />
							<Skeleton className="h-4 w-12" />
						</div>
					</div>
				</Example>
			</Section>

			<MetaFooter meta={skeletonMeta} />
		</>
	)
}

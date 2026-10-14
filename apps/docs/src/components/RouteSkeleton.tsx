import { Grid, Region, Skeleton, cn } from "@sableui/react"
import { type ReactNode, useEffect } from "react"
import { useCustomizer } from "../customizer/CustomizerProvider"
import { WIDE } from "../lib/use-media-query"

/*
 * What a page shows while its code loads: the page's own shape in Skeleton
 * blocks, not a spinner in the middle of nowhere. Each one mirrors the layout
 * that replaces it (same containers, same line boxes, same gaps), so the swap
 * changes the content and never moves it.
 */

/** One line of text in the given type style: the line box of that style, the
 * bar centred in it at roughly the height of its letters. */
function Line({ type, className }: { type: string; className?: string }) {
	return (
		<div className={cn("flex h-lh items-center", type)}>
			<Skeleton className={cn("h-[0.7em]", className)} />
		</div>
	)
}

function Loading({ children, className }: { children?: ReactNode; className?: string }) {
	return (
		<div aria-busy="true" className={className}>
			<span role="status" className="sr-only">Loading page</span>
			{children}
		</div>
	)
}

/** A docs page: PageHeader (title and lede), then sections that open with a
 * SectionHeader over a framed example. The header and the first section's
 * heading land exactly where the page's do; the example frames are a modest
 * height, since they vary page to page (a playground runs taller), and real
 * content growing down from a short block reads better than collapsing up. */
export function DocPageSkeleton() {
	return (
		<Loading>
			<div className="mb-12 flex max-w-(--measure-prose) flex-col gap-2">
				<Line type="text-heading-2" className="w-40" />
				<Line type="text-body-md" className="w-full max-w-md" />
				<Line type="text-body-md sm:hidden" className="w-1/2" />
			</div>
			{[0, 1].map((index) => (
				<section key={index} className="mt-14 first:mt-0">
					<div className="mb-6 flex flex-col gap-2">
						<Line type="text-heading-4" className="w-28" />
						<Line type="text-body-md" className="w-56" />
					</div>
					<Skeleton className="h-48 rounded-xl" />
				</section>
			))}
		</Loading>
	)
}

/** The homepage once its intro has played: the hero, then the showcase grid. */
export function HomeSkeleton() {
	return (
		<Loading>
			<Region max="wide" className="grid justify-items-center gap-7 pt-20 pb-16 sm:pt-28 lg:pt-36 lg:pb-20">
				{/* Phones wrap the headline to two lines and the lede to four. */}
				<div className="grid w-full justify-items-center">
					<Line type="text-display-lg sm:text-display-xl w-full justify-center" className="w-full max-w-xl" />
					<Line type="text-display-lg w-full justify-center sm:hidden" className="w-2/3" />
				</div>
				<div className="grid w-full max-w-xl justify-items-center">
					<Line type="text-body-lg w-full justify-center" className="w-full" />
					<Line type="text-body-lg w-full justify-center" className="w-full sm:w-3/4" />
					<Line type="text-body-lg w-full justify-center sm:hidden" className="w-full" />
					<Line type="text-body-lg w-full justify-center sm:hidden" className="w-3/4" />
				</div>
				<div className="flex flex-wrap justify-center gap-3">
					<Skeleton className="h-(--control-cta) w-28 rounded-[var(--button-radius,9999px)]" />
					<Skeleton className="h-(--control-cta) w-44 rounded-[var(--button-radius,9999px)]" />
				</div>
			</Region>
			<Region max="wide" className="grid gap-6 pb-24">
				<div className="grid justify-items-center gap-3">
					<Line type="text-body-sm" className="w-56" />
					<Skeleton className="h-(--control-sm) w-72 max-w-full rounded-[var(--button-radius,9999px)]" />
				</div>
				<Grid cols={{ base: 1, sm: 2, xl: 3 }} gap={2}>
					{[0, 1, 2].map((index) => (
						<Skeleton key={index} className={cn("h-[29rem] rounded-xl", index === 2 && "max-xl:hidden")} />
					))}
				</Grid>
			</Region>
		</Loading>
	)
}

/** The Customize canvas: the platform switch, then the grid of scenes. */
export function CanvasSkeleton() {
	// The canvas opens the Customize panel on arrival (CustomizeCanvasPage);
	// opening it here too makes the room for it now, so the grid doesn't
	// narrow under the skeleton the moment the page lands.
	const { setOpen } = useCustomizer()
	useEffect(() => { if (window.matchMedia(WIDE).matches) setOpen(true) }, [setOpen])
	return (
		<Loading>
			{/* Hidden where the canvas hides its switch: a phone has no iOS view. */}
			<div className="mb-6 [@media(max-width:47.99rem)_and_(pointer:coarse)]:hidden">
				<Skeleton className="h-(--control-sm) w-32 rounded-[var(--button-radius,9999px)]" />
			</div>
			<Grid minItemWidth="calc(20rem + var(--spacing) * 16)" gap="calc(var(--spacing) * 4)">
				{[0, 1, 2, 3].map((index) => (
					<Skeleton key={index} className="h-[29rem] rounded-xl" />
				))}
			</Grid>
		</Loading>
	)
}

/** A bare pattern preview, usually inside the Patterns page's iframe. Patterns
 * differ too much for one skeleton to match them, so it holds the page's
 * background and says it is busy rather than guessing at a shape. */
export function PreviewSkeleton() {
	return <Loading className="min-h-dvh bg-background" />
}

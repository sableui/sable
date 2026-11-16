import { Region, type RegionProps } from "./Region"
import { Stack, type StackProps } from "./Stack"

export interface PageProps extends RegionProps {
	/**
	 * Vertical gap between the stacked page sections. Number = rhythm units
	 * (one baseline step each — 8px at Sable's default type, two Tailwind spacing steps, so gap={2} is gap-4); string = raw CSS. @default 4
	 */
	gap?: StackProps["gap"]
	/** Cross-axis alignment of the stacked sections. @default "stretch" */
	align?: StackProps["align"]
}

/**
 * Page — a route shell. A `Region` (fluid page inset, opt-in `max` cap, optional
 * `safeArea`) whose children flow as vertically-rhythmic sections (a `Stack`).
 * Replaces the repeated `<Region><Stack>…</Stack></Region>` wrapper around
 * create / settings / admin routes.
 *
 * Distinct from `AppShell` (the app frame the page lives inside) and `PageHeader`
 * (the heading block at the top of a page) — `Page` is the content region itself.
 *
 *   <Page max="feed" gap={4}>…</Page>
 *   <Page as="main" max="wide">…</Page>
 *   <Page bleed>…</Page>
 */
export function Page({ gap = 4, align, children, ...regionProps }: PageProps) {
	return (
		<Region {...regionProps}>
			<Stack gap={gap} align={align}>
				{children}
			</Stack>
		</Region>
	)
}
Page.displayName = "Page"

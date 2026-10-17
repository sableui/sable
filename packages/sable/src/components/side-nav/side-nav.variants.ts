import { cva } from "class-variance-authority"

/**
 * The nav row, once. SideNav's rows and Sidebar's rail rows were two hand copies
 * of the same row (padding, radius, active fill, focus ring, icon box) that
 * could only drift; both now draw from this recipe. `rail` is Sidebar's rung.
 *
 * Every rung is `rounded-sm`, the list-row radius (foundations/shape). They were
 * 12px and 16px — on a 44px rail row 16px is most of a pill, and neither nested
 * in the usual rounded-lg p-2 nav frame (16 − 8 = 8 is concentric; 12 is not).
 */
/**
 * The rail row's horizontal geometry: inset and icon-to-label gap. Named so a
 * row that is not an item (SidebarBrand) lands on the same columns.
 */
export const RAIL_ROW_INLINE = "gap-3 px-3"

export const sideNavItemVariants = cva(
	// `relative`: a row paints above SideNav's gliding current-page fill, which is
	// absolutely positioned and earlier in the DOM.
	"relative flex w-full items-center text-start motion-interactive focus-visible:outline-none focus-visible:ring-2 data-[active]:font-semibold",
	{
		variants: {
			size: {
				md: "gap-2.5 rounded-sm px-3 py-1.5 text-body-sm",
				lg: "gap-3 rounded-sm px-3 py-2 text-body-md",
				// The app rail (Sidebar): chrome-weight rows on the label tier.
				rail: `${RAIL_ROW_INLINE} rounded-sm py-2.5 text-label-lg`,
			},
			activeVariant: {
				content:
					"text-foreground hover:bg-muted focus-visible:ring-ring data-[active]:bg-accent data-[active]:text-accent-foreground",
				sidebar:
					"text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-sidebar-ring data-[active]:bg-sidebar-accent data-[active]:text-sidebar-accent-foreground",
			},
		},
		defaultVariants: { size: "md", activeVariant: "content" },
	},
)

/**
 * The icon box, sized in the icon's own unit. Icons are 1em, so the box is a
 * multiple of the font size it sets: on the spacing scale (`size-5`) it shrank
 * with a theme's `--spacing` while the icon held its size, and a 3.3px step
 * left every icon 2px below its label. Flex, not grid, centres it: content
 * larger than a grid track spills downward only, flex spills it evenly.
 */
export const sideNavItemIconVariants = cva(
	"flex shrink-0 items-center justify-center",
	{
		// md 20px icon in a 20px box; lg 20px in 24px; rail 24px in 24px.
		variants: { size: { md: "size-[1em] text-xl", lg: "size-[1.2em] text-xl", rail: "size-[1em] text-2xl" } },
		defaultVariants: { size: "md" },
	},
)

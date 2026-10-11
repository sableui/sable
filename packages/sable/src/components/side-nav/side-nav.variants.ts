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
export const sideNavItemVariants = cva(
	"flex w-full items-center text-start motion-interactive focus-visible:outline-none focus-visible:ring-2 data-[active]:font-semibold",
	{
		variants: {
			size: {
				md: "gap-2.5 rounded-sm px-3 py-1.5 text-body-sm",
				lg: "gap-3 rounded-sm px-3 py-2 text-body-md",
				// The app rail (Sidebar): chrome-weight rows on the label tier.
				rail: "gap-3 rounded-sm px-3 py-2.5 text-label-lg",
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

export const sideNavItemIconVariants = cva(
	"grid shrink-0 place-items-center",
	{
		variants: { size: { md: "size-5 text-xl", lg: "size-6 text-xl", rail: "size-6 text-2xl" } },
		defaultVariants: { size: "md" },
	},
)

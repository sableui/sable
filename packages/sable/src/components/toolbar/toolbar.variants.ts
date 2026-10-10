import { cva } from "class-variance-authority"

/*
 * Toolbar owns only its layout. Every interactive item reads an existing
 * control's styling — ToolbarButton/ToolbarLink take `buttonVariants`,
 * ToolbarInput renders `Input` — so a toolbar can never drift from the buttons
 * and fields it sits beside. Heights come from the density ladder through
 * those variants; nothing here sets one.
 *
 * Orientation styles key off Base UI's `data-orientation`, which the root sets
 * from its `orientation` prop and which ToolbarGroup inherits.
 */
export const toolbarVariants = cva(
	"inline-flex items-center gap-1 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch",
)

export const toolbarGroupVariants = cva(
	"inline-flex items-center gap-1 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch",
)

/*
 * Base UI gives the separator the axis OPPOSITE the toolbar's: a horizontal
 * toolbar gets a vertical rule. `hairline-strong` rather than `border` so the
 * rule reads at chrome weight in a workspace bar without shouting on a page.
 */
export const toolbarSeparatorVariants = cva(
	"shrink-0 self-stretch bg-hairline-strong data-[orientation=vertical]:mx-1 data-[orientation=vertical]:my-1.5 data-[orientation=vertical]:w-px data-[orientation=horizontal]:mx-1.5 data-[orientation=horizontal]:my-1 data-[orientation=horizontal]:h-px",
)

import { cva } from "class-variance-authority"

/**
 * Edge-anchored sheet surface. The shared base pins the popup to a viewport
 * edge and wires the enter/exit slide via Base UI's data-[starting-style] /
 * data-[ending-style] attributes; each `side` supplies its anchor, sizing,
 * inner border, and off-screen translate. Popover surface, square corners (the
 * panel meets the viewport on three sides, so a radius would only show on one
 * edge). Side widths are on the spacing scale (w-95, 380px at the default
 * ladder), so a roomier Character widens the panel with its content.
 *
 * Every side is height-bounded — left/right by `h-full`, top/bottom by
 * `max-h-[80vh]` — so a sheet whose content outgrows its bound has to scroll or
 * it clips, and Base UI has locked the page scroll behind it, leaving nothing to
 * reach the rest with. The overflow sits on the popup itself (the flex column),
 * so `SheetFooter`'s `mt-auto` still pins it to the bottom of a short sheet and
 * simply follows the content in a long one.
 *
 * Swipe-to-dismiss (Base UI Drawer): while a finger drags the sheet, Base UI
 * writes the travel into --drawer-swipe-movement-x/-y and sets data-swiping
 * (inline transition: none, so the panel tracks the finger 1:1). Each side
 * translates along its own axis only via `transform`, which composes with the
 * Tailwind `translate` used for enter/exit — so a released swipe continues
 * off-screen from where the finger left it. A swipe dismissal scales the exit
 * duration by --drawer-swipe-strength (a fast flick leaves faster), still in
 * units of the motion token, so reduced motion keeps it instant.
 */
export const sheetVariants = cva(
	"fixed z-(--z-overlay) flex flex-col gap-4 overflow-y-auto overscroll-contain border-border-floating bg-popover sable-surface-popover p-6 text-popover-foreground shadow-lg outline-none transition-transform duration-(--motion-duration-base) ease-emphasized scrollbar-quiet data-[swiping]:select-none data-[swipe-dismiss]:duration-[calc(var(--motion-duration-base)*var(--drawer-swipe-strength))]",
	{
		variants: {
			side: {
				right:
					"inset-y-0 right-0 [transform:translateX(var(--drawer-swipe-movement-x))] h-full w-95 max-w-[90vw] border-l data-[ending-style]:translate-x-full data-[starting-style]:translate-x-full",
				left: "inset-y-0 left-0 [transform:translateX(var(--drawer-swipe-movement-x))] h-full w-95 max-w-[90vw] border-r data-[ending-style]:-translate-x-full data-[starting-style]:-translate-x-full",
				top: "inset-x-0 top-0 [transform:translateY(var(--drawer-swipe-movement-y))] h-auto max-h-[80vh] w-full border-b data-[ending-style]:-translate-y-full data-[starting-style]:-translate-y-full",
				bottom:
					"inset-x-0 bottom-0 [transform:translateY(var(--drawer-swipe-movement-y))] h-auto max-h-[80vh] w-full border-t data-[ending-style]:translate-y-full data-[starting-style]:translate-y-full",
			},
		},
		defaultVariants: {
			side: "right",
		},
	},
)

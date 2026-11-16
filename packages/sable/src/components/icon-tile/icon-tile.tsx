import type { VariantProps } from "class-variance-authority"
import type { ComponentPropsWithRef } from "react"
import { Icon } from "../../icon"
import { cn } from "../../lib/cn"
import { isPaletteColor, type PaletteColor } from "../../lib/palette"
import { iconTileVariants } from "./icon-tile.variants"

export interface IconTileProps
	extends Omit<ComponentPropsWithRef<"span">, "children">,
		VariantProps<typeof iconTileVariants> {
	/** The semantic icon name, as `<Icon name>` takes it. */
	icon: string
	/** Paint the tile from a palette family (its wash, its deep ink) instead of the appearance's fill. @default "neutral" */
	tone?: "neutral" | PaletteColor
	/**
	 * What the icon means, when nothing beside it says so. Omitted, the tile is
	 * decorative and hidden from assistive technology — right when a title sits
	 * next to it, which is nearly always.
	 */
	label?: string
}

/**
 * IconTile — one icon on a small square tile.
 *
 *   <IconTile icon="file" />
 *   <IconTile icon="layout" size="lg" />
 *   <IconTile icon="paperclip" size="sm" appearance="muted" />
 *
 * Use it instead of a hand-built `grid size-10 place-items-center rounded-md`
 * box around an Icon. A picture of a person or a thing (initials, a logo, a
 * photo) is an Avatar; a status mark beside text is a StatusDot or Badge.
 */
export function IconTile({ icon, size, appearance, tone = "neutral", label, className, ...props }: IconTileProps) {
	const palette = isPaletteColor(tone) ? tone : undefined
	return (
		<span
			data-slot="icon-tile"
			data-palette={palette}
			{...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
			// A tone replaces the appearance's fill outright (null skips the
			// variant), rather than stacking two backgrounds and trusting the order.
			className={cn(iconTileVariants({ size, appearance: palette ? null : appearance }), palette && "bg-palette-wash text-palette-text", className)}
			{...props}
		>
			<Icon name={icon} />
		</span>
	)
}
IconTile.displayName = "IconTile"

import { cva } from "class-variance-authority"
import { AVATAR_SQUARE_RADIUS } from "../avatar/avatar.variants"

/**
 * IconTile — a square that holds one icon: the mark beside a feature's title,
 * a file type in a result row, a category in a settings list.
 *
 * `size` reads the Avatar ladder (32 / 40 / 48px) and its square corner, so a
 * tile beside a square Avatar in a row is the same shape. The icon scales with
 * the tile (text-base / text-xl / text-2xl), about half its side.
 *
 * `appearance` picks the fill. `well` (default) is the relative recess of the
 * surface it sits on (`sable-well`), so it reads on a card, a muted section or
 * a popover alike; `muted` is the flat muted surface with muted ink, quieter,
 * for a row's leading slot. A palette `tone` replaces either with that
 * family's wash and ink (the pair a soft Badge uses).
 */
export const iconTileVariants = cva("inline-grid shrink-0 select-none place-items-center", {
	variants: {
		size: {
			sm: `size-8 text-base ${AVATAR_SQUARE_RADIUS.sm}`,
			md: `size-10 text-xl ${AVATAR_SQUARE_RADIUS.md}`,
			lg: `size-12 text-2xl ${AVATAR_SQUARE_RADIUS.lg}`,
		},
		appearance: {
			well: "sable-well text-foreground",
			muted: "bg-muted text-muted-foreground",
		},
	},
	defaultVariants: {
		size: "md",
		appearance: "well",
	},
})

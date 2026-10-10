import { cva } from "class-variance-authority"

/**
 * Avatar root — a circular, fixed-size frame that clips its image. The only axis
 * is `size`, which sets the square footprint; the image and fallback inherit it.
 * `bg-muted` is the resting surface shown behind a loading or missing image.
 */
export const avatarVariants = cva(
	"relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-muted",
	{
		variants: {
			size: {
				sm: "size-8",
				md: "size-10",
				lg: "size-12",
			},
		},
		defaultVariants: {
			size: "md",
		},
	},
)

/**
 * AvatarGroup — an overlapping stack. Each child is pulled left by about an
 * eighth to a sixth of its footprint and wears a 2px ring in the colour of the
 * surface the group sits on, so the overlap reads as a cut-out rather than a
 * collision. The overlap is kept that small on purpose: at a quarter it cut
 * into faces and clipped centred two-letter initials.
 *
 * The ring colour is the inherited `--avatar-group-ring` custom property,
 * falling back to `--background` (the page). Set it once on a card, sheet, or
 * popover and every group inside matches — or pass `surface` for the common
 * cases.
 */
export const avatarGroupVariants = cva(
	"flex w-fit items-center *:ring-2 *:ring-[color:var(--avatar-group-ring,var(--background))]",
	{
		variants: {
			size: {
				sm: "*:not-first:-ms-1",
				md: "*:not-first:-ms-1.5",
				lg: "*:not-first:-ms-2",
			},
			surface: {
				background: "[--avatar-group-ring:var(--background)]",
				card: "[--avatar-group-ring:var(--card)]",
				popover: "[--avatar-group-ring:var(--popover)]",
				muted: "[--avatar-group-ring:var(--muted)]",
			},
		},
		defaultVariants: {
			size: "md",
		},
	},
)

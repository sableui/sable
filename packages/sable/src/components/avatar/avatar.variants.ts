import { cva } from "class-variance-authority"

/**
 * Avatar root — a fixed-size frame that clips its image. `size` sets the square
 * footprint; the image and fallback inherit it. `shape` picks the corner: a
 * circle for a person, a square for what is not a face (a workspace, a project,
 * an org, a team), whose radius steps with the size so the corner stays
 * concentric with anything nested inside it.
 * `bg-muted` is the resting surface shown behind a loading or missing image.
 * Each size also sets the tier its initials (and a group's "+N") take, so the
 * initials grow with the circle instead of one 12px label at every size. They
 * hold roughly 30% of the diameter all the way up: the label tiers cover the
 * row sizes; past them the initials are a mark standing in for a face — type
 * as image — so the portrait sizes borrow heading-2 (28px in 96) and display-lg
 * (48px in 160), the tiers built to be read as a shape at that size.
 *
 * `2xs` (20px) and `xs` (24px) are the dense-row sizes: an assignee in a
 * 32px issue row, a reviewer beside a commit, a project mark in a nav item.
 * Their initials take the smallest tiers the label scale has (ui-micro, then
 * label-xs) — two letters still fit inside the circle at 20px.
 *
 * `xl` and `2xl` are portrait sizes — a profile header, an artist hero, a
 * roster tile — not row sizes, so AvatarGroup stops at `lg`.
 */
/**
 * The square's corner per size: about a sixth of its side, read from the
 * theme's radius steps so a square theme stays square. Exported because the
 * status anchor around a square avatar has to round the same way.
 */
export const AVATAR_SQUARE_RADIUS = {
	"2xs": "rounded-xs",
	xs: "rounded-xs",
	sm: "rounded-sm",
	md: "rounded-sm",
	lg: "rounded-md",
	xl: "rounded-lg",
	"2xl": "rounded-xl",
} as const

export const avatarVariants = cva(
	"relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden bg-muted",
	{
		variants: {
			size: {
				"2xs": "size-5 text-ui-micro",
				xs: "size-6 text-label-xs",
				sm: "size-8 text-label-sm",
				md: "size-10 text-label-md",
				lg: "size-12 text-label-lg",
				xl: "size-24 text-heading-2",
				"2xl": "size-40 text-display-lg",
			},
			shape: {
				circle: "rounded-full",
				square: "",
			},
		},
		compoundVariants: Object.entries(AVATAR_SQUARE_RADIUS).map(([size, className]) => ({
			shape: "square" as const,
			size: size as keyof typeof AVATAR_SQUARE_RADIUS,
			className,
		})),
		defaultVariants: {
			size: "md",
			shape: "circle",
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
				"2xs": "*:not-first:-ms-1",
				xs: "*:not-first:-ms-1",
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

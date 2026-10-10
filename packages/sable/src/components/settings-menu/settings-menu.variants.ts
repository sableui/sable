import type { ButtonProps } from "../button/button"

/**
 * The summary trigger — a control that spends most of its life being read
 * rather than pressed. It renders Sable's `Button` (so focus ring, press,
 * density-ladder heights and disabled handling are the Button's, not a copy),
 * and this file only maps SettingsMenu's own vocabulary onto Button's.
 *
 * It is deliberately quieter than a primary Button. Its job is to *state the
 * current setting* and be available if you want to change it, so it sits at
 * the bottom of a composer or the corner of a toolbar without competing with
 * the primary action next to it. That is why the resting state is `ghost`:
 * the affordance appears on hover, and the text carries the information in
 * the meantime.
 *
 * `subtle` maps to Button's `secondary` — a resting fill for surfaces where
 * the trigger would otherwise float unanchored (the pill inside a composer).
 */
export const SETTINGS_TRIGGER_VARIANT = {
	ghost: "ghost",
	subtle: "secondary",
} as const satisfies Record<"ghost" | "subtle", NonNullable<ButtonProps["variant"]>>

/** Heights read the density ladder through Button's `xs` / `sm` sizes. */
export const SETTINGS_TRIGGER_SIZE = {
	xs: "xs",
	sm: "sm",
} as const satisfies Record<"xs" | "sm", NonNullable<ButtonProps["size"]>>

/**
 * What the trigger adds on top of Button: it may shrink and truncate its
 * summary, stays lit while its menu is open, and keeps its chevron at the
 * small (0.75rem) size rather than Button's icon step — the chevron is a hint,
 * not an action glyph.
 */
export const settingsMenuTriggerClassName =
	"max-w-full [--button-icon:0.75rem] data-[popup-open]:bg-accent data-[popup-open]:text-accent-foreground"

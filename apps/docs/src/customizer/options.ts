import type { Look, Neutrals, Palette } from "./look"

/*
 * The inspector's option lists, in one place: the
 * Simple view's Color section and the Advanced property grid offer the same
 * choices under the same names.
 */

export const PALETTES: readonly { value: Palette; label: string }[] = [
	{ value: "preset", label: "Brand only" },
	{ value: "harmonize", label: "Harmonize" },
	{ value: "analogous", label: "Analogous" },
	{ value: "triadic", label: "Triadic" },
]

export const NEUTRALS: readonly { value: Neutrals; label: string }[] = [
	{ value: "theme", label: "Preset" },
	{ value: "mono", label: "Mono" },
	{ value: "warm", label: "Warm" },
	{ value: "cool", label: "Cool" },
]

/** Neutrals with a brand to tint them by. */
export const NEUTRALS_TINTED: readonly { value: Neutrals; label: string }[] = [...NEUTRALS, { value: "brand", label: "Tinted" }]

/**
 * The look's fields by inspector section, for each section's reset. A section
 * resets everything it shows, the Advanced anchors for its domain included.
 */
export const SECTION_FIELDS = {
	color: ["hue", "brand", "primary", "palette", "neutrals", "harmony", "statusLean"],
	character: ["bold", "airy", "typeBase", "typeRatio", "controlBase", "spacingBase"],
	shape: ["corners", "depth", "buttons", "fields", "shadows", "radiusBase", "shadowAngle", "shadowDistance", "shadowBlur", "shadowOpacity"],
	typography: ["sans", "display", "mono"],
	advancedTypography: ["sans", "display", "mono", "typeBase", "typeRatio", "bold"],
	layout: ["controlBase", "spacingBase"],
	corners: ["corners", "radiusBase", "buttons"],
	shadow: ["depth", "shadows", "shadowAngle", "shadowDistance", "shadowBlur", "shadowOpacity"],
	motion: ["motion", "motionBase"],
} as const satisfies Record<string, readonly (keyof Look)[]>

import type { ThemeManifest } from "../_contract"

/**
 * Verdant — a Sable theme. Concrete token values live in
 * `verdant.css`; this manifest is the typed, machine-readable description.
 */
export const verdantTheme: ThemeManifest = {
	id: "verdant",
	label: "Verdant",
	modes: ["light","dark"],
	defaultMode: "light",
	fonts: {
		sans: "\"Inter\", system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
		mono: "\"IBM Plex Mono\", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Courier New\", monospace",
		display: "\"Instrument Serif\", Georgia, \"Times New Roman\", serif",
	},
}

export default verdantTheme

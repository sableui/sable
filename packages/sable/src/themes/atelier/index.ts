import type { ThemeManifest } from "../_contract"

/**
 * Mono Editorial — a Sable theme. Concrete token values live in
 * `atelier.css`; this manifest is the typed, machine-readable description.
 */
export const atelierTheme: ThemeManifest = {
	id: "atelier",
	label: "Atelier",
	deprecated: { replacement: "base" },
	modes: ["light","dark"],
	defaultMode: "light",
	fonts: {
		sans: "\"Inter\", system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
		mono: "\"Martian Mono\", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Courier New\", monospace",
	},
}

export default atelierTheme

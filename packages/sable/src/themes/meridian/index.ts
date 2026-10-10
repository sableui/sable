import type { ThemeManifest } from "../_contract"

/**
 * Meridian — a Sable theme. Concrete token values live in
 * `meridian.css`; this manifest is the typed, machine-readable description.
 */
export const meridianTheme: ThemeManifest = {
	id: "meridian",
	label: "Meridian",
	modes: ["light","dark"],
	defaultMode: "light",
	fonts: {
		sans: "\"Instrument Sans\", system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
		mono: "\"Geist Mono\", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Courier New\", monospace",
	},
}

export default meridianTheme

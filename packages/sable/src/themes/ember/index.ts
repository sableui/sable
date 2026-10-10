import type { ThemeManifest } from "../_contract"

/**
 * Ember — a Sable theme. Concrete token values live in
 * `ember.css`; this manifest is the typed, machine-readable description.
 */
export const emberTheme: ThemeManifest = {
	id: "ember",
	label: "Ember",
	modes: ["dark","light"],
	defaultMode: "dark",
	fonts: {
		sans: "\"Work Sans\", sans-serif",
		mono: "\"DM Mono\", ui-monospace, monospace",
	},
}

export default emberTheme

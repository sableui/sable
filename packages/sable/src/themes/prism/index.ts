import type { ThemeManifest } from "../_contract"

/** Original Sable preset; no third-party artwork or reference-site code. */
export const prismTheme: ThemeManifest = {
	id: "prism",
	label: "Prism",
	modes: ["light", "dark"],
	defaultMode: "light",
	fonts: {
		sans: '"Outfit", ui-sans-serif, system-ui, sans-serif',
		mono: '"Roboto Mono", ui-monospace, monospace',
		display: '"Playfair Display", ui-serif, Georgia, serif',
	},
}
export default prismTheme

import type { ThemeManifest } from "../_contract"

/** Original Sable preset; no third-party artwork or reference-site code. */
export const poppyTheme: ThemeManifest = {
	id: "poppy",
	label: "Poppy",
	modes: ["light", "dark"],
	defaultMode: "light",
	fonts: {
		sans: '"Albert Sans", ui-sans-serif, system-ui, sans-serif',
		mono: '"Red Hat Mono", ui-monospace, monospace',
		display: '"Unbounded", ui-sans-serif, system-ui, sans-serif',
	},
}
export default poppyTheme

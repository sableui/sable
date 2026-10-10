import type { ThemeManifest } from "../_contract"

/**
 * Base — the default Sable theme. Concrete token values live in
 * `base.css`; this manifest is the typed, machine-readable description.
 */
export const baseTheme: ThemeManifest = {
	id: "base",
	label: "Base",
	modes: ["dark", "light"],
	defaultMode: "dark",
	fonts: {
		sans: '"Figtree", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
		mono: '"DM Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Courier New", monospace',
	},
}

export default baseTheme

import type { ThemeManifest } from "../_contract"

/**
 * Sable — the default theme. Concrete token values live in
 * `sable.css`; this manifest is the typed, machine-readable description.
 */
export const sableTheme: ThemeManifest = {
	id: "sable",
	label: "Sable",
	modes: ["dark", "light"],
	defaultMode: "dark",
	fonts: {
		sans: '"Figtree", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
		mono: '"DM Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Courier New", monospace',
	},
}

export default sableTheme

/**
 * Font roles and the Google Fonts catalog behind them.
 *
 * Three roles, matching the theme contract's stacks:
 *   primary   → --font-sans     body text and interface
 *   secondary → --font-display  headings and display tiers (falls back to primary)
 *   mono      → --font-mono     code, IDs, aligned numbers
 *
 * Fonts load on demand from Google Fonts. Browsing a list fetches each family
 * subset to just the letters of its own name (`text=`), so a 20-font list
 * previews every face for a few kilobytes; choosing one loads its real
 * weights. The export prints the same <link> a consuming app needs.
 */

export type FontRole = "primary" | "secondary" | "mono"

export interface FontEntry {
	family: string
	/** css2 axis spec: a range for variable fonts ("400..700"), a list for static ones ("400;700"). */
	weights: string
	/** Generic fallback appended to the stack. */
	generic: "sans-serif" | "serif" | "monospace"
	/** A short note shown under the name. */
	note: string
}

const sans = (family: string, weights: string, note: string): FontEntry => ({ family, weights, generic: "sans-serif", note })
const serif = (family: string, weights: string, note: string): FontEntry => ({ family, weights, generic: "serif", note })
const mono = (family: string, weights: string, note: string): FontEntry => ({ family, weights, generic: "monospace", note })

export const FONT_CATALOG: Record<FontRole, readonly FontEntry[]> = {
	primary: [
		sans("Inter", "400..700", "Neutral, dense UI"),
		sans("Figtree", "400..700", "Friendly geometric"),
		sans("Geist", "400..700", "Crisp, technical"),
		sans("Manrope", "400..700", "Open, modern"),
		sans("DM Sans", "400..700", "Soft, low contrast"),
		sans("Instrument Sans", "400..700", "Compact grotesque"),
		sans("IBM Plex Sans", "400;500;600;700", "Engineered, sturdy"),
		serif("Josefin Slab", "400..700", "Light, geometric slab serif"),
		sans("Work Sans", "400..700", "Broad, readable"),
		sans("Plus Jakarta Sans", "400..700", "Warm geometric"),
		sans("Onest", "400..700", "Clean, even"),
		sans("Public Sans", "400..700", "Plain, civic"),
		sans("Hanken Grotesk", "400..700", "Light grotesque"),
		sans("Albert Sans", "400..700", "Scandinavian"),
		sans("Outfit", "400..700", "Round geometric"),
		sans("Schibsted Grotesk", "400..700", "Editorial grotesque"),
		sans("Rubik", "400..700", "Rounded corners"),
	],
	secondary: [
		serif("Josefin Slab", "400..700", "Geometric slab serif"),
		serif("Instrument Serif", "400", "Condensed display serif"),
		serif("Fraunces", "400..700", "Soft, wonky serif"),
		serif("Newsreader", "400..700", "Editorial text serif"),
		serif("Playfair Display", "400..700", "High-contrast display"),
		serif("Source Serif 4", "400..700", "Calm book serif"),
		serif("EB Garamond", "400..700", "Classic old-style"),
		serif("Young Serif", "400", "Heavy, warm"),
		serif("DM Serif Display", "400", "Bold display serif"),
		sans("Bricolage Grotesque", "400..700", "Expressive grotesque"),
		sans("Space Grotesk", "400..700", "Quirky technical"),
		sans("Sora", "400..700", "Wide geometric"),
		sans("Syne", "400..700", "Art-school display"),
		sans("Unbounded", "400..800", "Wide, rounded"),
		sans("Schibsted Grotesk", "400..700", "Tight headlines"),
	],
	mono: [
		mono("DM Mono", "400;500", "Soft, readable"),
		mono("Geist Mono", "400..700", "Crisp, technical"),
		mono("JetBrains Mono", "400..700", "Coding classic"),
		mono("IBM Plex Mono", "400;500;600", "Engineered"),
		mono("Martian Mono", "400..700", "Wide, distinct"),
		mono("Space Mono", "400;700", "Retro, characterful"),
		mono("Fira Code", "400..700", "Ligatures"),
		mono("Roboto Mono", "400..700", "Neutral"),
		mono("Red Hat Mono", "400..700", "Humanist mono"),
	],
}

export const ROLE_LABEL: Record<FontRole, { title: string; detail: string }> = {
	primary: { title: "Primary", detail: "Body and interface" },
	secondary: { title: "Secondary", detail: "Headings and display" },
	mono: { title: "Mono", detail: "Code and numbers" },
}

const enc = (family: string) => family.replace(/ /g, "+")

/** Full css2 URL for the families in use — the <link> a consumer adds. */
export function googleFontsUrl(entries: readonly FontEntry[]): string | null {
	if (!entries.length) return null
	const params = entries.map((e) => `family=${enc(e.family)}:wght@${e.weights}`).join("&")
	return `https://fonts.googleapis.com/css2?${params}&display=swap`
}

export function findFont(family: string): FontEntry | undefined {
	for (const list of Object.values(FONT_CATALOG)) {
		const hit = list.find((e) => e.family === family)
		if (hit) return hit
	}
	return undefined
}

function inject(id: string, href: string) {
	if (typeof document === "undefined" || document.getElementById(id)) return
	const link = document.createElement("link")
	link.id = id
	link.rel = "stylesheet"
	link.href = href
	document.head.appendChild(link)
}

/** Load a family's real weights (idempotent). */
export function loadFont(entry: FontEntry) {
	inject(`gf-${enc(entry.family)}`, googleFontsUrl([entry]) ?? "")
}

/**
 * Load just enough of each family to preview its own name. `text=` subsets
 * the font server-side to those glyphs, so a whole list costs a few KB.
 */
export function loadPreviews(entries: readonly FontEntry[]) {
	for (const entry of entries) {
		const text = encodeURIComponent(`${entry.family}Aa`)
		inject(`gf-preview-${enc(entry.family)}`, `https://fonts.googleapis.com/css2?family=${enc(entry.family)}&text=${text}&display=swap`)
	}
}

export function stackFor(entry: FontEntry | undefined, family: string, fallback: FontEntry["generic"]): string {
	const generic = entry?.generic ?? fallback
	const system = generic === "monospace" ? "ui-monospace, monospace" : generic === "serif" ? "ui-serif, serif" : "ui-sans-serif, system-ui, sans-serif"
	return `"${family}", ${system}`
}

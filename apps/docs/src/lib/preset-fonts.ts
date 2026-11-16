/**
 * The bundled presets' typefaces, loaded after first paint instead of in
 * index.html.
 *
 * index.html used to request all 17 families in one render-blocking Google
 * Fonts stylesheet (76 kB of CSS, 192 @font-face rules) on every page, though
 * first paint needs only Sable's own Figtree and DM Mono. Those two stay in
 * index.html; the rest load here, with the same families and weights as
 * before so no preset renders a different face or a synthesized weight:
 *
 *   - at once, when the page boots with a non-default preset active (the
 *     theme boot script has already set `data-sable-theme` on <html>);
 *   - at once, the moment the reader switches to one;
 *   - when a preset preview mounts (PresetPreview calls loadPresetFonts);
 *   - otherwise when the browser goes idle, for the previews and tiles that
 *     show a preset's face (the Customize preset picker's "Aa").
 *
 * A stylesheet only declares the faces; the browser fetches a font file the
 * first time text needs it, so loading this early costs CSS, not fonts.
 * Fonts a reader picks in Customize load on demand (customizer/fonts.ts).
 */
const PRESET_FONTS_HREF =
	"https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&family=Instrument+Sans:wght@400;500;600;700&family=Instrument+Serif&family=Inter:wght@300;400;500;600;700;800;900&family=Martian+Mono:wght@400;500;600;700&family=Sora:wght@400;500;600;700;800&family=Work+Sans:wght@300;400;500;600;700&family=Outfit:wght@400..700&family=Playfair+Display:wght@400..700&family=Roboto+Mono:wght@400..700&family=Albert+Sans:wght@400..700&family=Unbounded:wght@400..800&family=Red+Hat+Mono:wght@400..700&display=swap"

const ID = "gf-presets"

/** Load every bundled preset's faces now. Idempotent. */
export function loadPresetFonts() {
	if (typeof document === "undefined" || document.getElementById(ID)) return
	const link = document.createElement("link")
	link.id = ID
	link.rel = "stylesheet"
	link.href = PRESET_FONTS_HREF
	document.head.appendChild(link)
}

/** Call once at startup: loads the preset faces as soon as anything needs them, or at idle. */
export function deferPresetFonts() {
	if (typeof document === "undefined") return
	const root = document.documentElement
	// The boot script writes no attribute for the default preset (Sable), so
	// its presence means a preset with its own faces is active.
	if (root.hasAttribute("data-sable-theme")) return loadPresetFonts()
	const observer = new MutationObserver(() => {
		if (!root.hasAttribute("data-sable-theme")) return
		observer.disconnect()
		loadPresetFonts()
	})
	observer.observe(root, { attributes: true, attributeFilter: ["data-sable-theme"] })
	const idle = () => {
		observer.disconnect()
		loadPresetFonts()
	}
	if ("requestIdleCallback" in window) window.requestIdleCallback(idle, { timeout: 3000 })
	else setTimeout(idle, 2000)
}

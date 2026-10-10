import type { ComponentPropsWithRef } from "react"

/*
 * The system status icons: device chrome, not app iconography, so they are not
 * in Sable's icon contract or any icon set. Apple's SF Symbols may not be
 * redistributed outside Apple-platform apps, so these are our own glyphs drawn
 * to the iOS status bar's proportions: four rounded signal bars, Wi-Fi as two
 * arcs over a wedge, and a battery with a faint outline, a fill and a nub, at
 * their point sizes (17×12, 16×12, 27×13) in currentColor. Shared by Phone and
 * the iOS adapter's NativeApp so the two status bars match.
 */
export function StatusIcons(props: ComponentPropsWithRef<"span">) {
	return (
		<span aria-hidden {...props}>
			<svg viewBox="0 0 17 12" width="17" height="12" fill="currentColor">
				<rect x="0" y="7.5" width="3" height="4.5" rx="1" />
				<rect x="4.66" y="5" width="3" height="7" rx="1" />
				<rect x="9.33" y="2.5" width="3" height="9.5" rx="1" />
				<rect x="14" y="0" width="3" height="12" rx="1" />
			</svg>
			<svg viewBox="0 0 16 12" width="16" height="12" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round">
				<path d="M1.64 4.84 A9 9 0 0 1 14.36 4.84" />
				<path d="M4.04 7.64 A5.6 5.6 0 0 1 11.96 7.64" />
				<path d="M8 11.4 L6.25 9.65 A2.5 2.5 0 0 1 9.75 9.65 Z" fill="currentColor" stroke="none" />
			</svg>
			<svg viewBox="0 0 27 13" width="27" height="13" fill="currentColor">
				<rect x="0.5" y="0.5" width="23" height="12" rx="3.8" fill="none" stroke="currentColor" opacity="0.35" />
				<rect x="2" y="2" width="20" height="9" rx="2.5" />
				<path d="M25 4.5 a1.5 1.5 0 0 1 1.5 1.5 v1 a1.5 1.5 0 0 1 -1.5 1.5 z" opacity="0.4" />
			</svg>
		</span>
	)
}

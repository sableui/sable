import { App } from "konsta/react"
import { type CSSProperties, type ReactNode, useEffect } from "react"
import { StatusIcons } from "../components/phone/status-icons"
import { LiquidGlassMaterial } from "./liquid-glass"
import { type IosBrandTokens, iosThemeStyle } from "./theme"

/**
 * The root of a native prototype document: Konsta's iOS App, Sable's preset on
 * the chrome, glass material, and the system status bar and home indicator.
 *
 * Load Sable's styles in the same document and set `data-sable-theme` on <html>;
 * the chrome and any Sable content then follow the preset together. `tokens`
 * overrides individual semantic values. `mode` also sets `dark` on <html>, so
 * Sable popups portaled to <body> follow the prototype's appearance.
 *
 * `systemChrome={false}` is for a prototype shown on a real phone, without
 * PhoneFrame: the device already draws its own status bar and home indicator,
 * so the fake ones go, and the safe areas come from the device
 * (`env(safe-area-inset-*)`) instead of the standard phone's fixed geometry.
 */
export function NativeApp({
	children,
	mode = "light",
	glassTint = 0.35,
	reducedMotion = false,
	className = "",
	tokens = {},
	style,
	systemChrome = true,
}: {
	children: ReactNode
	mode?: "light" | "dark"
	glassTint?: number
	reducedMotion?: boolean
	className?: string
	tokens?: IosBrandTokens
	style?: CSSProperties
	/** Draw the status bar, island and home indicator. Turn off on a real phone. @default true */
	systemChrome?: boolean
}) {
	const dark = mode === "dark"
	useEffect(() => {
		document.documentElement.classList.toggle("dark", dark)
	}, [dark])
	const tint = Math.max(0, Math.min(1, Number.isFinite(glassTint) ? glassTint : 0.35))
	return (
		<App
			theme="ios"
			dark={dark}
			className={`ios-prototype ${dark ? "dark" : ""} ${systemChrome ? "" : "ios-bare"} ${className}`}
			data-reduced-motion={reducedMotion || undefined}
			style={{ ...iosThemeStyle(tokens), "--ios-glass-tint": tint, ...style } as CSSProperties}
		>
			<LiquidGlassMaterial />
			{systemChrome ? (
				<div className="ios-status-bar" aria-hidden="true">
					<span>9:41</span>
					<span className="ios-island" />
					<StatusIcons className="ios-status-icons" />
				</div>
			) : null}
			{children}
			{systemChrome ? <div className="ios-home-indicator" aria-hidden="true" /> : null}
		</App>
	)
}

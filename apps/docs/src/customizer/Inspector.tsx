import { Button, Icon, cn, useCopy } from "@sableui/react"
import { type ReactNode, useState } from "react"
import { useTheme } from "../theme"
import { useCustomizer } from "./CustomizerProvider"
import { BrandColorInput, CharacterPad, CornerControl, HueStrip, PresetCards, Segmented } from "./controls"
import { FontPicker } from "./FontPicker"
import { ANCHOR_ROWS, AnchorField, CONTROL_ROWS, MOTION_ROWS, RADIUS_ROWS, Readout, SPACING_ROWS, TYPE_ROWS, useMeasured } from "./Readouts"
import { brandFor, presetTypeRatio } from "./look"
import { formatOklch, oklchToHex } from "./color"
import { PresetExchange } from "./PresetExchange"

const ADVANCED_KEY = "sable-docs-customize-advanced"

function Group({ title, hint, children, action }: { title: string; hint?: string; children: ReactNode; action?: ReactNode }) {
	return (
		<section className="grid gap-2.5">
			<div className="flex items-baseline justify-between gap-2">
				<h3 className="text-label-md">{title}</h3>
				{action ?? (hint ? <span className="text-caption text-muted-foreground">{hint}</span> : null)}
			</div>
			{children}
		</section>
	)
}

/**
 * The inspector — a floating tool panel, not a settings sidebar. It follows the
 * page's light/dark mode (so the preset tiles it paints sit on matching chrome)
 * but is always the house look — the Sable theme, at the tool scale
 * (`data-canvas-chrome`, see CustomizerProvider) — so neither a preset nor
 * the look you are tuning repaints or resizes the controls you are using. That separation is what makes it feel like a design tool: the tool
 * is not part of the artboard.
 */
export function Inspector({
	className,
	onClose,
	floating = true,
}: {
	className?: string
	onClose?: () => void
	floating?: boolean
}) {
	const { themeId, themes, mode, preference, setPreference, presets } = useTheme()
	const { look, setLook, reset, shareUrl, isCustomized, requestPreset, pendingPreset, confirmPreset, cancelPreset } = useCustomizer()
	const share = useCopy(shareUrl)
	const [view, setView] = useState<"tune" | "export">("tune")
	// Simple is the default; Advanced adds the resolved numbers under each
	// control. A per-viewer preference, so it lives in localStorage.
	const [advanced, setAdvancedState] = useState(() => {
		try {
			return window.localStorage.getItem(ADVANCED_KEY) === "1"
		} catch {
			return false
		}
	})
	const setAdvanced = (next: boolean) => {
		setAdvancedState(next)
		try {
			window.localStorage.setItem(ADVANCED_KEY, next ? "1" : "0")
		} catch {
			/* storage unavailable: the toggle still works for this session */
		}
	}
	const [openFont, setOpenFont] = useState<"primary" | "secondary" | "mono" | null>(null)
	const { base } = useCustomizer()
	// Current body size, medium control, row padding, medium radius, base duration:
	// what each anchor shows until it is set.
	const live = useMeasured(ANCHOR_ROWS, advanced)
	// What "Preset" means for each role right now: the first family of the
	// active preset's stack, read from the theme rather than assumed.
	const first = (stack?: string) => stack?.split(",")[0]?.trim().replace(/^["']|["']$/g, "") || "Preset"
	const presetFamily = (role: "primary" | "secondary" | "mono") =>
		first(role === "primary" ? base.colors?.fontSans : role === "mono" ? base.colors?.fontMono : base.colors?.fontDisplay)
	const brandOklch = brandFor(look, mode === "dark" ? "dark" : "light")
	const brand = brandOklch ? formatOklch(brandOklch) : null
	const brandLight = brandFor(look, "light")
	const brandHex = look.brand ?? (brandLight ? oklchToHex(brandLight) : "")
	const hasBrand = brandOklch != null

	// Choosing a preset starts over (see CustomizerProvider.requestPreset); the
	// confirm lives here because this panel is where the changes are.
	const pendingLabel = themes.find((theme) => theme.id === pendingPreset)?.label ?? "this preset"

	return (
		<aside
			aria-label="Customize"
			data-canvas-chrome=""
			data-sable-theme="sable"
			className={cn(
				"relative flex flex-col overflow-hidden sable-surface-popover bg-popover text-popover-foreground ring-1 ring-border-floating",
				mode === "dark" && "dark",
				floating ? "rounded-md shadow-xl" : "",
				className,
			)}
		>
			<header className="flex items-center justify-between gap-2 border-b border-border py-2 ps-2 pe-2">
				<div className="flex items-center gap-2">
					{view === "tune" ? (
						// The mode switch IS the title: it names what you are looking at and
						// shows the way back, where a lone "Advanced" button only showed the way in.
						<Segmented
							label="Customize mode"
							value={advanced ? "advanced" : "simple"}
							onChange={(next) => setAdvanced(next === "advanced")}
							options={[
								{ value: "simple", label: "Simple" },
								{ value: "advanced", label: "Advanced" },
							]}
							className="w-44"
						/>
					) : (
						<span className="ps-2 text-label-lg">Export</span>
					)}
				</div>
				<div className="flex items-center gap-1">
					<Button
						variant={view === "export" ? "secondary" : "ghost"}
						size="sm"
						onClick={() => setView(view === "tune" ? "export" : "tune")}
					>
						{view === "tune" ? "Export" : "Back"}
					</Button>
					{onClose ? (
						<Button variant="ghost" size="icon-sm" aria-label="Close customize" onClick={onClose}>
							<Icon name="xmark" />
						</Button>
					) : null}
				</div>
			</header>

			{view === "export" ? (
				// Swipe-ignore: in the mobile sheet, a drag on the controls (the
				// Character pad, the hue strip) or a scroll is never a swipe to close.
				<div data-base-ui-swipe-ignore="" className="grid min-h-0 flex-1 content-start gap-4 overflow-y-auto p-4 scrollbar-quiet">
					<PresetExchange />
					{!presets.some(preset => preset.id === themeId) && (
					<div className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2">
						<span className="text-label-md">Share this look</span>
						<Button variant="ghost" size="icon-sm" aria-label="Copy a link to this look" onClick={share.copy} className="text-muted-foreground">
							<Icon name={share.copied ? "check" : "copy"} />
						</Button>
					</div>
					)}
				</div>
			) : (
				<div data-base-ui-swipe-ignore="" className="grid min-h-0 flex-1 content-start gap-5 overflow-y-auto p-4 scrollbar-quiet">
					<Group title="Preset" hint="Where you start">
						<PresetCards themes={themes} value={themeId} mode={mode === "dark" ? "dark" : "light"} onChange={requestPreset} />
					</Group>

					<Group title="Mode">
						<Segmented
							label="Color mode"
							value={preference}
							onChange={setPreference}
							options={[
								{ value: "light", label: "Light" },
								{ value: "dark", label: "Dark" },
								{ value: "system", label: "System" },
							]}
						/>
					</Group>

					<Group title="Character" hint="Weight, edges and scale">
						{advanced ? (
							<>
								<Readout title="Type scale" rows={TYPE_ROWS}>
									<AnchorField label="Body size" prefix="B" min={11} max={22} step={0.5} value={look.typeBase} measured={live[0]} onChange={(typeBase) => setLook({ typeBase })} />
									<AnchorField label="Scale ratio" prefix="R" suffix="×" min={1.05} max={1.6} step={0.01} value={look.typeRatio} measured={presetTypeRatio(base)} onChange={(typeRatio) => setLook({ typeRatio })} />
								</Readout>
								<Readout title="Control heights" rows={CONTROL_ROWS}>
									<AnchorField label="Medium height" prefix="H" min={28} max={60} value={look.controlBase} measured={live[1]} onChange={(controlBase) => setLook({ controlBase })} />
								</Readout>
								<Readout title="Spacing" rows={SPACING_ROWS}>
									<AnchorField label="Row padding" prefix="P" min={4} max={16} step={0.5} value={look.spacingBase} measured={live[2]} onChange={(spacingBase) => setLook({ spacingBase })} />
								</Readout>
								<span className="pt-1 text-caption text-muted-foreground">Heading weight</span>
								<Segmented
									label="Heading weight"
									value={look.bold == null ? "preset" : look.bold < 34 ? "500" : look.bold > 66 ? "700" : "600"}
									onChange={(w) => setLook({ bold: w === "preset" ? null : w === "500" ? 16 : w === "600" ? 50 : 84 })}
									options={[
										{ value: "preset", label: "Preset" },
										{ value: "500", label: "500" },
										{ value: "600", label: "600" },
										{ value: "700", label: "700" },
									]}
								/>
							</>
						) : (
							// The pad is a gesture across type, controls and spacing at once; it
							// hands those domains back from any exact anchors set in Advanced.
							<CharacterPad
								bold={look.bold}
								airy={look.airy}
								onChange={(patch) => setLook({ ...patch, typeBase: null, typeRatio: null, controlBase: null, spacingBase: null })}
							/>
						)}
					</Group>

					<Group
						title="Color"
						action={
							brand ? (
								<Button variant="ghost" size="xs" onClick={() => setLook({ hue: null, brand: null, palette: "preset" })}>
									Reset
								</Button>
							) : null
						}
					>
						<HueStrip hue={look.brand ? null : look.hue} onChange={(hue) => setLook({ hue, brand: null })} />
						<BrandColorInput value={brandHex} onChange={(hex) => setLook({ brand: hex })} />
						{hasBrand ? (
							<Segmented
								label="Palette"
								value={look.palette}
								onChange={(palette) => setLook({ palette })}
								options={[
									{ value: "preset", label: "Brand only" },
									{ value: "harmonize", label: "Harmonize" },
									{ value: "analogous", label: "Analogous" },
									{ value: "triadic", label: "Triadic" },
								]}
							/>
						) : null}
						{hasBrand ? (
							<Segmented
								label="Primary action"
								value={look.primary}
								onChange={(primary) => setLook({ primary })}
								options={[
									{ value: "brand", label: "Brand fill" },
									{ value: "neutral", label: "Neutral fill" },
								]}
							/>
						) : null}
						<Segmented
							label="Neutrals"
							value={look.neutrals}
							onChange={(neutrals) => setLook({ neutrals })}
							options={[
								{ value: "theme", label: "Preset" },
								{ value: "mono", label: "Mono" },
								{ value: "warm", label: "Warm" },
								{ value: "cool", label: "Cool" },
								...(hasBrand ? [{ value: "brand" as const, label: "Tinted" }] : []),
							]}
						/>
					</Group>

					<Group title="Corners" action={look.corners != null || look.radiusBase != null ? <Button variant="ghost" size="xs" onClick={() => setLook({ corners: null, radiusBase: null })}>Reset</Button> : null}>
						{advanced ? (
							<Readout title="Radius" rows={RADIUS_ROWS}>
								<AnchorField label="Medium radius" prefix="R" min={0} max={18} value={look.radiusBase} measured={live[3]} onChange={(radiusBase) => setLook({ radiusBase })} />
							</Readout>
						) : (
							<CornerControl corners={look.corners} onChange={(corners) => setLook({ corners, radiusBase: null })} />
						)}
						<span className="pt-1 text-caption text-muted-foreground">Button shape</span>
						<Segmented
							label="Button shape"
							value={look.buttons}
							onChange={(buttons) => setLook({ buttons })}
							options={[
								{ value: "theme", label: "Preset" },
								{ value: "pill", label: "Pill" },
								{ value: "match", label: "Match corners" },
							]}
						/>
					</Group>

					<Group title="Typography" hint="Google Fonts">
						{(["primary", "secondary", "mono"] as const).map((role) => {
							const field = role === "primary" ? "sans" : role === "secondary" ? "display" : "mono"
							return (
								<FontPicker
									key={role}
									role={role}
									value={look[field]}
									onChange={(family) => setLook({ [field]: family })}
									presetLabel={presetFamily(role)}
									open={openFont === role}
									onOpenChange={(next) => setOpenFont(next ? role : null)}
								/>
							)
						})}
					</Group>

					<Group title="Motion" hint="Scales every duration">
						{advanced ? (
							<Readout title="Durations" rows={MOTION_ROWS}>
								<AnchorField label="Base duration" prefix="T" suffix="ms" min={0} max={600} step={10} value={look.motionBase} measured={live[4]} onChange={(motionBase) => setLook({ motionBase })} />
							</Readout>
						) : (
							<Segmented
								label="Motion"
								value={look.motion}
								onChange={(motion) => setLook({ motion, motionBase: null })}
								options={[
									{ value: "off", label: "Still" },
									{ value: "snappy", label: "Snappy" },
									{ value: "default", label: "Preset" },
									{ value: "relaxed", label: "Relaxed" },
								]}
							/>
						)}
					</Group>


					<div className="flex justify-end border-t border-border pt-4">
						<Button variant="ghost" size="sm" onClick={reset} disabled={!isCustomized}>
							Reset to preset
						</Button>
					</div>
				</div>
			)}

			{/* Switching presets clears the look, so the confirm takes over the
			    whole panel: a scrim over every control, not a strip that is easy
			    to scroll past. */}
			{pendingPreset ? (
				<div
					className="absolute inset-0 z-10 grid place-items-center bg-background/70 p-4 backdrop-blur-sm"
					onPointerDown={(event) => event.target === event.currentTarget && cancelPreset()}
					onKeyDown={(event) => event.key === "Escape" && cancelPreset()}
				>
					{/* design-lint-disable-next-line hand-rolled-control -- scoped to this panel on purpose; Sable AlertDialog is page-modal and would hide the preview the choice is about */}
					<div
						role="alertdialog"
						aria-modal="true"
						aria-labelledby="preset-confirm-title"
						aria-describedby="preset-confirm-body"
						className="grid w-full gap-4 rounded-md bg-popover p-4 text-popover-foreground shadow-xl ring-1 ring-border-floating"
					>
						<div className="grid gap-1">
							<h2 id="preset-confirm-title" className="text-title-sm">
								{pendingPreset === themeId ? "Start over?" : `Switch to ${pendingLabel}?`}
							</h2>
							<p id="preset-confirm-body" className="text-body-sm text-muted-foreground">
								Your changes will be cleared.
							</p>
						</div>
						<div className="flex justify-end gap-2">
							<Button variant="ghost" size="sm" onClick={() => cancelPreset()}>
								Cancel
							</Button>
							<Button size="sm" autoFocus onClick={confirmPreset}>
								{pendingPreset === themeId ? "Start over" : "Switch"}
							</Button>
						</div>
					</div>
				</div>
			) : null}
		</aside>
	)
}

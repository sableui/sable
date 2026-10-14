import { Button, Density, Icon, PanelSection, PropertyPair, PropertyRow, cn, useCopy } from "@sableui/react"
import { type ReactNode, useState } from "react"
import { useTheme } from "../theme"
import { useCustomizer } from "./CustomizerProvider"
import {
	PresetPicker,
	BrandColorInput,
	CharacterPad,
	ChromeSelect,
	ChromeTip,
	HueStrip,
	LookSlider,
	PalettePreview,
	Segmented,
	ShapePreview,
	cornersText,
	depthText,
} from "./controls"
import { FontPicker } from "./FontPicker"
import { ANCHOR_ROWS, AnchorCaption, AnchorField, CONTROL_ROWS, MOTION_ROWS, MeasuredLadder, RADIUS_ROWS, SPACING_ROWS, ShadowSteps, TYPE_ROWS, useMeasured } from "./Readouts"
import { DEFAULT_STATUS_LEAN, brandFor, cornerRadius, presetTypeRatio, shadowLadder, toPx } from "./look"
import { definingDrop, describeStep, formatShadow, ladderAngle } from "./shadow"
import { oklchToHex } from "./color"
import { PresetExchange, PresetImport } from "./PresetExchange"

const ADVANCED_KEY = "sable-docs-customize-advanced"

type Role = "primary" | "secondary" | "mono"
const FONT_FIELD = { primary: "sans", secondary: "display", mono: "mono" } as const

const PALETTES = [
	{ value: "preset", label: "Brand" },
	{ value: "harmonize", label: "Harmonize" },
	{ value: "analogous", label: "Analogous" },
	{ value: "triadic", label: "Triadic" },
] as const
const PRIMARY = [
	{ value: "brand", label: "Brand" },
	{ value: "neutral", label: "Neutral" },
] as const
const NEUTRALS = [
	{ value: "theme", label: "Preset" },
	{ value: "mono", label: "Mono" },
	{ value: "warm", label: "Warm" },
	{ value: "cool", label: "Cool" },
] as const
const TINTED = { value: "brand", label: "Tinted" } as const
const BUTTONS = [
	{ value: "theme", label: "Preset" },
	{ value: "pill", label: "Pill" },
	{ value: "match", label: "Match corners" },
] as const
const SHADOWS = [
	{ value: "theme", label: "Preset" },
	{ value: "soft", label: "Soft" },
	{ value: "crisp", label: "Crisp" },
	{ value: "offset", label: "Offset" },
] as const
const MOTIONS = [
	{ value: "off", label: "Still" },
	{ value: "snappy", label: "Snappy" },
	{ value: "default", label: "Preset" },
	{ value: "relaxed", label: "Relaxed" },
] as const
const WEIGHTS = [
	{ value: "preset", label: "Preset" },
	{ value: "500", label: "Medium · 500" },
	{ value: "600", label: "Semibold · 600" },
	{ value: "700", label: "Bold · 700" },
] as const
const MODES = [
	{ value: "light", label: <Icon name="sun" />, ariaLabel: "Light" },
	{ value: "dark", label: <Icon name="moon" />, ariaLabel: "Dark" },
	{ value: "system", label: <Icon name="desktop" />, ariaLabel: "System" },
] as const

/**
 * A panel section: Sable's PanelSection, the workspace register's grouping —
 * a hairline and a title, never a card. Its header carries the section's
 * reset while there is something to reset, or a standing action.
 */
function Section({ title, children }: { title: string; children: ReactNode }) {
	return (
		<PanelSection title={title}>
			{children}
		</PanelSection>
	)
}

/** Every view's body: flush sections, the first without a rule under the header's. */
const BODY = "flex flex-col pb-2 [&>section:first-child]:border-t-0"
/** Simple is gestures over previews, so it gets a wider gutter and more air between them. */
const SIMPLE_BODY = "[--panel-inset:--spacing(4)] [&>section]:pt-1.5 [&>section]:pb-2 [&>section>div]:gap-3"
const ADVANCED_BODY = "[--panel-inset:--spacing(3)] [&>section]:pb-1"

/**
 * The inspector — a floating tool panel, not a settings sidebar. It follows the
 * page's light/dark mode (so the preset tiles it paints sit on matching chrome)
 * but is always the house look — the Sable theme, at the tool scale
 * (`data-canvas-chrome`, see CustomizerProvider) — so neither a preset nor
 * the look you are tuning repaints or resizes the controls you are using. That
 * separation is what makes it feel like a design tool: the tool is not part of
 * the artboard.
 *
 * Two views over one look. Simple is gestures with pictures — a pad, sliders
 * over one shape preview, a strip of swatches — for finding a direction.
 * Advanced is a property grid in the workspace register (compact Density,
 * PanelSection, PropertyRow/Pair, ScrubField, Select): one exact anchor per
 * domain with the ladder it resolves to beneath it, the way a design tool's
 * inspector reads. Mode, reset and export sit in a footer both views share.
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
	const { look, setLook, reset, getShareUrl, isCustomized, requestPreset, pendingPreset, confirmPreset, cancelPreset, base } = useCustomizer()
	const share = useCopy(getShareUrl())
	const sharable = !presets.some((preset) => preset.id === themeId)
	const [view, setView] = useState<"tune" | "export">("tune")
	const [importStatus, setImportStatus] = useState("")
	// Simple is the default. A per-viewer preference, so it lives in localStorage.
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
	const [openFont, setOpenFont] = useState<Role | null>(null)
	// Current body size, medium control, row padding, medium radius, base duration:
	// what each anchor shows until it is set.
	const live = useMeasured(ANCHOR_ROWS, advanced)
	// What "Preset" means for each role right now: the first family of the
	// active preset's stack, read from the theme rather than assumed.
	const first = (stack?: string) => stack?.split(",")[0]?.trim().replace(/^["']|["']$/g, "") || "Preset"
	const presetFamily = (role: Role) =>
		first(role === "primary" ? base.colors?.fontSans : role === "mono" ? base.colors?.fontMono : base.colors?.fontDisplay)
	const hasBrand = brandFor(look, mode === "dark" ? "dark" : "light") != null
	const brandLight = brandFor(look, "light")
	const brandHex = look.brand ?? (brandLight ? oklchToHex(brandLight) : "")
	const presetPrimary = base.colors?.light?.primary ? oklchToHex(base.colors.light.primary) : undefined
	// The shadows the look paints in this mode (the preset's when untouched), for the previews.
	const shadowMode = mode === "dark" ? "dark" : "light"
	const ladder = shadowLadder(look, base, shadowMode) ?? base.shadows?.[shadowMode]
	const shadowPreview = ladder ? { sm: formatShadow(ladder.sm), md: formatShadow(ladder.md), xl: formatShadow(ladder.xl) } : null
	// What each anchor shows until it is set: the top step's longest drop. Opacity
	// is in light-mode terms (see look.ts), so it reads the light ladder.
	const topDrop = ladder ? definingDrop(ladder) : null
	const lightLadder = shadowLadder(look, base, "light") ?? base.shadows?.light
	const lightTop = lightLadder ? definingDrop(lightLadder) : null
	// The preview's radii: the preset's ladder through the same curve look.ts
	// writes, ceilings included (0 until measured).
	const radius = Object.fromEntries(
		(["xs", "sm", "md", "lg"] as const).map((step) => {
			const preset = toPx(base.radius[step], base.rootPx) ?? 0
			return [step, cornerRadius(step, preset, look.corners ?? 50)]
		}),
	) as Record<"xs" | "sm" | "md" | "lg", number>
	const shadowSteps = ladder
		? (
				[
					["Small · cards", "SM", ladder.sm],
					["Base", "Base", ladder.base],
					["Medium · menus", "MD", ladder.md],
					["Large · dialogs", "LG", ladder.lg],
					["Extra large · toasts", "XL", ladder.xl],
				] as const
			).map(([label, short, step]) => ({ label, short, shadow: formatShadow(step), value: describeStep(step) }))
		: []
	const neutrals = hasBrand ? [...NEUTRALS, TINTED] : NEUTRALS
	const weight = look.bold == null ? "preset" : look.bold < 34 ? "500" : look.bold > 66 ? "700" : "600"
	const setWeight = (w: string) => setLook({ bold: w === "preset" ? null : w === "500" ? 16 : w === "600" ? 50 : 84 })

	const fonts = (size: "md" | "xs") =>
		(["primary", "secondary", "mono"] as const).map((role) => (
			<FontPicker
				key={role}
				role={role}
				size={size}
				value={look[FONT_FIELD[role]]}
				onChange={(family) => setLook({ [FONT_FIELD[role]]: family })}
				presetLabel={presetFamily(role)}
				open={openFont === role}
				onOpenChange={(next) => setOpenFont(next ? role : null)}
			/>
		))

	// Choosing a preset starts over (see CustomizerProvider.requestPreset); the
	// confirm lives here because this panel is where the changes are.
	const presetSection = (
		<Section title="Preset">
			<PresetPicker
				themes={themes}
				value={themeId}
				mode={mode === "dark" ? "dark" : "light"}
				onChange={requestPreset}
				footer={<PresetImport onStatus={setImportStatus} />}
			/>
			<p role="status" className={cn("text-ui-body text-muted-foreground", !importStatus && "sr-only")}>
				{importStatus}
			</p>
		</Section>
	)

	const simple = (
		<>
			{presetSection}
			<Section title="Character">
				{/* The pad is a gesture across type, controls and spacing at once; it
				    hands those domains back from any exact anchors set in Advanced. */}
				<CharacterPad
					bold={look.bold}
					airy={look.airy}
					onChange={(patch) => setLook({ ...patch, typeBase: null, typeRatio: null, controlBase: null, spacingBase: null })}
				/>
			</Section>
			<Section title="Color">
				<HueStrip hue={look.brand ? null : look.hue} onChange={(hue) => setLook({ hue, brand: null })} />
				<BrandColorInput value={brandHex} fallback={presetPrimary} onChange={(hex) => setLook({ brand: hex })} />
				<PalettePreview />
				{hasBrand ? (
					<PropertyRow stacked label="Palette">
						<Segmented label="Palette" value={look.palette} onChange={(palette) => setLook({ palette })} options={PALETTES} />
					</PropertyRow>
				) : null}
				{hasBrand ? (
					<PropertyRow stacked label="Primary action">
						<Segmented label="Primary action" value={look.primary} onChange={(primary) => setLook({ primary })} options={PRIMARY} />
					</PropertyRow>
				) : null}
				<PropertyRow stacked label="Neutrals">
					<Segmented label="Neutrals" value={look.neutrals} onChange={(next) => setLook({ neutrals: next })} options={neutrals} />
				</PropertyRow>
			</Section>
			<Section title="Shape">
				<ShapePreview radius={radius} shadow={shadowPreview} />
				{/* Each slider is a gesture over its whole domain; it hands that domain
				    back from any exact numbers set in Advanced. The light angle is not
				    part of depth, so it stays. */}
				<LookSlider label="Corners" value={look.corners} valueText={cornersText} onChange={(corners) => setLook({ corners, radiusBase: null })} />
				<LookSlider
					label="Depth"
					value={look.depth}
					valueText={depthText}
					onChange={(depth) => setLook({ depth, shadowDistance: null, shadowBlur: null, shadowOpacity: null })}
				/>
				<PropertyRow stacked label="Buttons">
					<Segmented label="Button shape" value={look.buttons} onChange={(buttons) => setLook({ buttons })} options={BUTTONS} />
				</PropertyRow>
				<PropertyRow stacked label="Shadows">
					<Segmented label="Shadow style" value={look.shadows} onChange={(shadows) => setLook({ shadows })} options={SHADOWS} />
				</PropertyRow>
			</Section>
			<Section title="Typography">
				{fonts("md")}
			</Section>
			<Section title="Motion">
				<Segmented label="Motion" value={look.motion} onChange={(motion) => setLook({ motion, motionBase: null })} options={MOTIONS} />
			</Section>
		</>
	)

	const advancedView = (
		<>
			{presetSection}
			<Section title="Typography">
				{fonts("xs")}
				<PropertyPair labels={[<AnchorCaption label="Body size" set={look.typeBase != null} onReset={() => setLook({ typeBase: null })} />, <AnchorCaption label="Scale ratio" set={look.typeRatio != null} onReset={() => setLook({ typeRatio: null })} />]}>
					<AnchorField label="Body size" prefix="B" min={11} max={22} step={0.5} value={look.typeBase} measured={live[0]} onChange={(typeBase) => setLook({ typeBase })} />
					<AnchorField label="Scale ratio" prefix="R" suffix="×" min={1.05} max={1.6} step={0.01} value={look.typeRatio} measured={presetTypeRatio(base)} onChange={(typeRatio) => setLook({ typeRatio })} />
				</PropertyPair>
				<PropertyRow label="Heading weight">
					<ChromeSelect label="Heading weight" value={weight} onChange={setWeight} options={WEIGHTS} className="w-36" />
				</PropertyRow>
				<MeasuredLadder rows={TYPE_ROWS} />
			</Section>
			<Section title="Layout">
				<PropertyPair labels={[<AnchorCaption label="Control height" set={look.controlBase != null} onReset={() => setLook({ controlBase: null })} />, <AnchorCaption label="Baseline step" set={look.spacingBase != null} onReset={() => setLook({ spacingBase: null })} />]}>
					<AnchorField label="Medium control height" prefix="H" min={28} max={60} value={look.controlBase} measured={live[1]} onChange={(controlBase) => setLook({ controlBase })} />
					<AnchorField label="Baseline step" prefix="S" min={4} max={16} value={look.spacingBase} measured={live[2]} onChange={(spacingBase) => setLook({ spacingBase })} />
				</PropertyPair>
				<MeasuredLadder caption="Controls" rows={CONTROL_ROWS} />
				<MeasuredLadder caption="Spacing" rows={SPACING_ROWS} />
			</Section>
			<Section title="Color">
				<HueStrip size="sm" hue={look.brand ? null : look.hue} onChange={(hue) => setLook({ hue, brand: null })} />
				<BrandColorInput size="xs" value={brandHex} fallback={presetPrimary} onChange={(hex) => setLook({ brand: hex })} />
				<PalettePreview />
				{hasBrand ? (
					<PropertyRow label="Palette">
						<ChromeSelect label="Palette" value={look.palette} onChange={(palette) => setLook({ palette })} options={PALETTES} className="w-36" />
					</PropertyRow>
				) : null}
				{hasBrand ? (
					// Status lean: 0 keeps success, warning and destructive as the preset
					// ships them; 100 takes each to the edge of the hue range where it still
					// reads as itself (see leanStatus). Untouched, it shows the palette's default.
					<PropertyPair labels={["Primary action", <AnchorCaption key="lean" label="Status lean" set={look.statusLean != null} onReset={() => setLook({ statusLean: null })} />]}>
						<Segmented size="sm" label="Primary action" value={look.primary} onChange={(primary) => setLook({ primary })} options={PRIMARY} />
						<AnchorField label="Status lean" prefix="S" suffix="%" min={0} max={100} value={look.statusLean} measured={DEFAULT_STATUS_LEAN[look.palette]} onChange={(statusLean) => setLook({ statusLean })} />
					</PropertyPair>
				) : null}
				<PropertyRow label="Neutrals">
					<ChromeSelect label="Neutrals" value={look.neutrals} onChange={(next) => setLook({ neutrals: next })} options={neutrals} className="w-36" />
				</PropertyRow>
			</Section>
			<Section title="Corners">
				<PropertyPair labels={[<AnchorCaption label="Medium radius" set={look.radiusBase != null} onReset={() => setLook({ radiusBase: null })} />, "Buttons"]}>
					<AnchorField label="Medium radius" prefix="R" min={0} max={18} value={look.radiusBase} measured={live[3]} onChange={(radiusBase) => setLook({ radiusBase })} />
					<ChromeSelect label="Button shape" value={look.buttons} onChange={(buttons) => setLook({ buttons })} options={BUTTONS} />
				</PropertyPair>
				<MeasuredLadder rows={RADIUS_ROWS} />
			</Section>
			<Section title="Shadow">
				<PropertyRow label="Style">
					<ChromeSelect label="Shadow style" value={look.shadows} onChange={(shadows) => setLook({ shadows })} options={SHADOWS} className="w-36" />
				</PropertyRow>
				{/* Exact numbers, set on the top step (the toast's); every other step
				    follows in proportion. */}
				<PropertyPair labels={[<AnchorCaption label="Light angle" set={look.shadowAngle != null} onReset={() => setLook({ shadowAngle: null })} />, <AnchorCaption label="Distance" set={look.shadowDistance != null} onReset={() => setLook({ shadowDistance: null })} />]}>
					<AnchorField label="Light angle" prefix="A" suffix="°" min={0} max={360} step={5} value={look.shadowAngle} measured={ladder ? ladderAngle(ladder) : null} onChange={(shadowAngle) => setLook({ shadowAngle })} />
					<AnchorField label="Distance" prefix="D" min={0} max={48} step={1} value={look.shadowDistance} measured={topDrop ? Math.hypot(topDrop.x, topDrop.y) : null} onChange={(shadowDistance) => setLook({ shadowDistance })} />
				</PropertyPair>
				<PropertyPair labels={[<AnchorCaption label="Blur" set={look.shadowBlur != null} onReset={() => setLook({ shadowBlur: null })} />, <AnchorCaption label="Opacity" set={look.shadowOpacity != null} onReset={() => setLook({ shadowOpacity: null })} />]}>
					<AnchorField label="Blur" prefix="B" min={0} max={96} step={1} value={look.shadowBlur} measured={topDrop?.blur} onChange={(shadowBlur) => setLook({ shadowBlur })} />
					<AnchorField label="Opacity" prefix="O" suffix="%" min={0} max={60} step={1} value={look.shadowOpacity} measured={lightTop ? lightTop.color.a * 100 : null} onChange={(shadowOpacity) => setLook({ shadowOpacity })} />
				</PropertyPair>
				<ShadowSteps steps={shadowSteps} />
				<p className="text-ui-body text-muted-foreground">Set on the largest step; the others follow. Opacity is light mode's; dark keeps its own in proportion.</p>
			</Section>
			<Section title="Motion">
				<PropertyPair labels={["Speed", <AnchorCaption label="Base duration" set={look.motionBase != null} onReset={() => setLook({ motionBase: null })} />]}>
					<ChromeSelect label="Motion speed" value={look.motion} onChange={(motion) => setLook({ motion, motionBase: null })} options={MOTIONS} />
					<AnchorField label="Base duration" prefix="T" suffix="ms" min={0} max={600} step={10} value={look.motionBase} measured={live[4]} onChange={(motionBase) => setLook({ motionBase })} />
				</PropertyPair>
				<MeasuredLadder rows={MOTION_ROWS} />
			</Section>
		</>
	)

	const pendingLabel = themes.find((theme) => theme.id === pendingPreset)?.label ?? "this preset"
	// The confirm is scoped to this panel, not a modal, so nothing restores focus
	// when it closes: it fell to <body> and a keyboard user lost their place.
	// Every way out (Cancel, Escape, the scrim, Switch) hands it back to the
	// preset row that asked. A frame later, once the confirm has unmounted.
	const closeConfirm = (action: () => void) => {
		action()
		requestAnimationFrame(() => document.querySelector<HTMLElement>("[data-preset-trigger]")?.focus())
	}

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
			{view === "tune" ? (
				<header className="flex shrink-0 items-center justify-between gap-2 border-b border-hairline p-2">
					{/* The mode switch IS the title: it names what you are looking at and
					    shows the way back, where a lone "Advanced" button only showed the way in. */}
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
					<div className="flex items-center gap-1">
						{/* A personal preset lives only in this browser, so a link to it
						    would open on Sable for anyone else; Export shares it as a file. */}
						{sharable ? (
							<ChromeTip label={share.copied ? "Link copied" : "Copy link to this look"}>
								<Button variant="ghost" size="icon-sm" aria-label={share.copied ? "Link copied" : "Copy a link to this look"} onClick={share.copy}>
									<Icon name={share.copied ? "check" : "share"} />
								</Button>
							</ChromeTip>
						) : null}
						{onClose ? (
							<ChromeTip label="Close">
								<Button variant="ghost" size="icon-sm" aria-label="Close customize" onClick={onClose}>
									<Icon name="xmark" />
								</Button>
							</ChromeTip>
						) : null}
					</div>
				</header>
			) : (
				// A view inside the panel, not a panel of its own: the only way out is
				// back, so it has no close and no share of its own.
				<header className="flex shrink-0 items-center gap-1 border-b border-hairline p-2">
					<Button variant="ghost" size="icon-sm" aria-label="Back" onClick={() => setView("tune")}>
						<Icon name="arrow-left" />
					</Button>
					<h2 className="text-label-lg">Export</h2>
				</header>
			)}

			{/* Swipe-ignore: in the mobile sheet, a drag on the controls (the
			    Character pad, the hue strip) or a scroll is never a swipe to close. */}
			{view === "export" ? (
				<div data-base-ui-swipe-ignore="" className="grid min-h-0 flex-1 content-start gap-4 overflow-y-auto p-4 scrollbar-quiet">
					<PresetExchange />
				</div>
			) : (
				<div data-base-ui-swipe-ignore="" className="min-h-0 flex-1 overflow-y-auto scrollbar-quiet">
					{advanced ? (
						<Density value="compact" className={cn(BODY, ADVANCED_BODY)}>
							{advancedView}
						</Density>
					) : (
						<div className={cn(BODY, SIMPLE_BODY)}>{simple}</div>
					)}
				</div>
			)}

			{/* What applies to the whole look, pinned where it is always in reach:
			    the page's mode, starting over, and taking the look away. */}
			{view === "tune" ? (
				<footer className="flex shrink-0 items-center justify-between gap-2 border-t border-hairline p-2">
					<Segmented label="Color mode" size="sm" fill={false} value={preference} onChange={setPreference} options={MODES} />
					<div className="flex items-center gap-1">
						<Button variant="ghost" size="sm" onClick={reset} disabled={!isCustomized}>
							Reset all
						</Button>
						<Button size="sm" onClick={() => setView("export")}>
							Export
						</Button>
					</div>
				</footer>
			) : null}

			{/* Switching presets clears the look, so the confirm takes over the
			    whole panel: a scrim over every control, not a strip that is easy
			    to scroll past. */}
			{pendingPreset ? (
				<div
					className="absolute inset-0 z-10 grid place-items-center bg-background/70 p-4 backdrop-blur-sm"
					onPointerDown={(event) => event.target === event.currentTarget && closeConfirm(cancelPreset)}
					onKeyDown={(event) => event.key === "Escape" && closeConfirm(cancelPreset)}
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
							<Button variant="ghost" size="sm" onClick={() => closeConfirm(cancelPreset)}>
								Cancel
							</Button>
							<Button size="sm" autoFocus onClick={() => closeConfirm(confirmPreset)}>
								{pendingPreset === themeId ? "Start over" : "Switch"}
							</Button>
						</div>
					</div>
				</div>
			) : null}
		</aside>
	)
}

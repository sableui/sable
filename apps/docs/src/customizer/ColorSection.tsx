import { Button, PALETTE_COLORS, PanelSection, PropertyGroup, PropertyRow, Toggle, ToggleGroup, cn } from "@sableui/react"
import { type ReactNode, useLayoutEffect, useMemo, useState } from "react"
import { useTheme } from "../theme"
import { formatOklch, oklchToHex } from "./color"
import { useCustomizer } from "./CustomizerProvider"
import { BrandColorInput, HueStrip, LookSlider, Segmented } from "./controls"
import { DEFAULT_LOOK, type Look, type Neutrals, type Palette, type ThemeBase, brandFor, toCss } from "./look"

/*
 * The simple view's Color section. The brand, then one folding group per thing
 * the brand drives — the generated palette, the tones, the neutrals — each
 * summarised by its own swatches while closed and choosing by preview while
 * open. Every colour here is the one the page paints, read back, never a
 * recomputation that could drift from it.
 */

const TONES: readonly { value: Palette; label: string }[] = [
	{ value: "preset", label: "Brand only" },
	{ value: "harmonize", label: "Harmonize" },
	{ value: "analogous", label: "Analogous" },
	{ value: "triadic", label: "Triadic" },
]
const NEUTRALS: readonly { value: Neutrals; label: string }[] = [
	{ value: "theme", label: "Preset" },
	{ value: "mono", label: "Mono" },
	{ value: "warm", label: "Warm" },
	{ value: "cool", label: "Cool" },
]
const TINTED = { value: "brand", label: "Tinted" } as const

/** The families at the step a tag's dot or a solid swatch uses. */
const FAMILY_TOKENS = ["neutral", ...PALETTE_COLORS].map((name) => `${name}-500`)
/** Tones, then status (Harmonize and the wheel schemes lean status too). */
const TONE_TOKENS = ["tone-1", "tone-2", "tone-3", "tone-info"]
const STATUS_TOKENS = ["success", "tone-warning", "destructive"]
/** Ink to page, the way a neutral ramp reads. */
const NEUTRAL_TOKENS = ["foreground", "muted-foreground", "border", "muted", "background"]
const LIVE_TOKENS = [...FAMILY_TOKENS, ...TONE_TOKENS, ...STATUS_TOKENS, ...NEUTRAL_TOKENS]

/** The look's colour fields, as a fresh look has them. */
const COLOR_DEFAULTS: Partial<Look> = {
	hue: DEFAULT_LOOK.hue,
	brand: DEFAULT_LOOK.brand,
	primary: DEFAULT_LOOK.primary,
	palette: DEFAULT_LOOK.palette,
	neutrals: DEFAULT_LOOK.neutrals,
	harmony: DEFAULT_LOOK.harmony,
	statusLean: DEFAULT_LOOK.statusLean,
}

/**
 * The colours the page paints now, resolved by a probe on the page: the
 * families are relative colours computed from --primary, and would re-resolve
 * against the panel's own house theme if their values were painted in here.
 * Runs a frame after the look's stylesheet is rewritten.
 */
function useLiveColors(): Record<string, string> {
	const { css } = useCustomizer()
	const { mode } = useTheme()
	const [colors, setColors] = useState<Record<string, string>>({})
	useLayoutEffect(() => {
		const frame = requestAnimationFrame(() => {
			const probe = document.createElement("span")
			probe.style.cssText = "position:absolute;visibility:hidden;pointer-events:none"
			document.body.appendChild(probe)
			const out: Record<string, string> = {}
			for (const token of LIVE_TOKENS) {
				probe.style.color = `var(--${token})`
				out[token] = getComputedStyle(probe).color
			}
			probe.remove()
			setColors(out)
		})
		return () => cancelAnimationFrame(frame)
	}, [css, mode])
	return colors
}

/**
 * What a choice would paint, without applying it: the look's CSS with one
 * field swapped, read for this mode, falling back to the preset's own value
 * for any token the look leaves alone.
 */
function preview(look: Look, base: ThemeBase, themeId: string, mode: "light" | "dark", tokens: readonly string[]): Record<string, string> {
	const css = toCss(look, base, themeId)
	const block = (selector: string) => {
		const start = css.indexOf(`${selector} {`)
		if (start < 0) return new Map<string, string>()
		const body = css.slice(start, css.indexOf("}", start))
		return new Map(Array.from(body.matchAll(/--([\w-]+):\s*([^;]+);/g), (m) => [m[1], m[2].trim()]))
	}
	const light = block(":root:root:root")
	const dark = mode === "dark" ? block(":root:root:root.dark") : new Map<string, string>()
	const resolved = base.colors?.[mode]
	return Object.fromEntries(
		tokens.map((token) => {
			const own = dark.get(token) ?? light.get(token)
			const fallback = resolved?.[token]
			return [token, own ?? (fallback ? formatOklch(fallback) : "transparent")]
		}),
	)
}

/** A strip of swatches, in order, with a hairline edge so a white swatch still has one. */
function Swatches({ colors, tokens, className }: { colors: Record<string, string>; tokens: readonly string[]; className?: string }) {
	return (
		<span className={cn("flex overflow-hidden rounded-xs outline-1 -outline-offset-1 outline-hairline-strong", className)} aria-hidden>
			{tokens.map((token) => (
				<span key={token} className="flex-1" style={{ background: colors[token] || "transparent" }} />
			))}
		</span>
	)
}

/** Tones, a gap, then status: two strips that read as one row. */
function ToneSwatches({ colors, className }: { colors: Record<string, string>; className?: string }) {
	return (
		<span className={cn("flex gap-1", className)} aria-hidden>
			<Swatches colors={colors} tokens={TONE_TOKENS} className="flex-[4_1_0]" />
			<Swatches colors={colors} tokens={STATUS_TOKENS} className="flex-[3_1_0]" />
		</span>
	)
}

/**
 * One-of-many, chosen by looking: each option is a row with its name and the
 * swatches it would paint. Sable's ToggleGroup, vertical, so arrows move
 * between options and the pressed one is the current value.
 */
function OptionList<T extends string>({
	label,
	value,
	options,
	onChange,
	disabled,
}: {
	label: string
	value: T
	options: readonly { value: T; label: string; swatches: ReactNode }[]
	onChange: (value: T) => void
	disabled?: boolean
}) {
	return (
		<ToggleGroup
			aria-label={label}
			orientation="vertical"
			disabled={disabled}
			value={[value]}
			onValueChange={(next) => {
				const picked = (next as T[])[0]
				if (picked != null && picked !== value) onChange(picked)
			}}
			className="flex flex-col gap-0.5"
		>
			{options.map((option) => (
				<Toggle
					key={option.value}
					value={option.value}
					className="flex h-7 w-full items-center justify-start gap-3 rounded-sm px-2 text-ui-md data-[pressed]:bg-accent data-[pressed]:text-accent-foreground"
				>
					<span className="w-20 shrink-0 text-start">{option.label}</span>
					{option.swatches}
				</Toggle>
			))}
		</ToggleGroup>
	)
}

/** A colour dot inside a segment, so Brand and Neutral show what they are. */
function Dot({ color }: { color: string | undefined }) {
	return <span className="size-2.5 shrink-0 rounded-full outline-1 -outline-offset-1 outline-hairline-strong" style={{ background: color || "transparent" }} aria-hidden />
}

export function ColorSection() {
	const { look, setLook, base } = useCustomizer()
	const { mode, themeId } = useTheme()
	const paint = mode === "dark" ? "dark" : "light"
	const colors = useLiveColors()

	const hasBrand = brandFor(look, paint) != null
	const brandLight = brandFor(look, "light")
	const brandHex = look.brand ?? (brandLight ? oklchToHex(brandLight) : "")
	const presetPrimary = base.colors?.light?.primary ? oklchToHex(base.colors.light.primary) : undefined
	const neutralOptions = hasBrand ? [...NEUTRALS, TINTED] : NEUTRALS
	const changed = (Object.keys(COLOR_DEFAULTS) as (keyof Look)[]).some((key) => look[key] !== COLOR_DEFAULTS[key])

	// What each Tones and Neutrals choice would paint, recomputed with the look.
	const toneOptions = useMemo(
		() =>
			TONES.map((option) => ({
				...option,
				swatches: <ToneSwatches colors={preview({ ...look, palette: option.value }, base, themeId, paint, [...TONE_TOKENS, ...STATUS_TOKENS])} className="h-3.5 flex-1" />,
			})),
		[look, base, themeId, paint],
	)
	const neutralChoices = useMemo(
		() =>
			neutralOptions.map((option) => ({
				...option,
				swatches: <Swatches colors={preview({ ...look, neutrals: option.value }, base, themeId, paint, NEUTRAL_TOKENS)} tokens={NEUTRAL_TOKENS} className="h-3.5 flex-1" />,
			})),
		[look, base, themeId, paint, neutralOptions],
	)

	const pull = look.harmony == null ? "Theme" : look.harmony === 0 ? "Own hues" : `${look.harmony}%`
	// Without a brand the tones are the preset's own; the scheme has nothing to build from.
	const tones = hasBrand ? (TONES.find((option) => option.value === look.palette)?.label ?? "Brand only") : "Preset"
	const neutrals = neutralOptions.find((option) => option.value === look.neutrals)?.label ?? "Preset"

	return (
		<PanelSection
			title="Color"
			action={
				changed ? (
					<Button variant="ghost" size="xs" onClick={() => setLook(COLOR_DEFAULTS)}>
						Reset
					</Button>
				) : null
			}
		>
			<PropertyRow stacked label="Brand color">
				<div className="flex flex-col gap-2">
					<BrandColorInput value={brandHex} fallback={presetPrimary} onChange={(hex) => setLook({ brand: hex })} />
					<HueStrip hue={look.brand ? null : look.hue} onChange={(hue) => setLook({ hue, brand: null })} />
				</div>
			</PropertyRow>
			{hasBrand ? null : <p className="text-ui-micro text-muted-foreground">Pick a brand color to set the primary action and generate tones.</p>}
			<PropertyRow label="Primary action">
				<Segmented
					size="sm"
					fill={false}
					label="Primary action"
					value={look.primary}
					onChange={(primary) => setLook({ primary })}
					disabled={!hasBrand}
					options={[
						{ value: "brand", label: <span className="flex items-center gap-1.5"><Dot color={brandHex || presetPrimary} />Brand</span> },
						{ value: "neutral", label: <span className="flex items-center gap-1.5"><Dot color={colors.foreground} />Neutral</span> },
					]}
				/>
			</PropertyRow>

			<div className="mt-1 flex flex-col">
				{/* The families (bg-blue-500 …) and how far the brand pulls them. */}
				<PropertyGroup label="Color palette" summary={<><Swatches colors={colors} tokens={FAMILY_TOKENS} className="h-3 w-16" />{pull === "Theme" ? null : <span>{pull} pull</span>}</>}>
					<Swatches colors={colors} tokens={FAMILY_TOKENS} className="h-5" />
					<LookSlider
						label="Pull to brand"
						value={look.harmony == null ? null : look.harmony / 2}
						valueText={(value) => (value == null ? "Theme" : value === 0 ? "Own hues" : `${Math.round(value * 2)}%`)}
						onChange={(value) => setLook({ harmony: value == null ? null : Math.round(value * 2) })}
					/>
					<span className="flex justify-between text-ui-micro text-muted-foreground" aria-hidden>
						<span>Own hues</span>
						<span>200%</span>
					</span>
				</PropertyGroup>
				<PropertyGroup label="Tones" summary={<><ToneSwatches colors={colors} className="h-3 w-16" /><span>{tones}</span></>}>
					<OptionList label="Tones" value={look.palette} options={toneOptions} onChange={(palette) => setLook({ palette })} disabled={!hasBrand} />
				</PropertyGroup>
				<PropertyGroup label="Neutrals" summary={<><Swatches colors={colors} tokens={NEUTRAL_TOKENS} className="h-3 w-16" /><span>{neutrals}</span></>}>
					<OptionList label="Neutrals" value={look.neutrals} options={neutralChoices} onChange={(next) => setLook({ neutrals: next })} />
				</PropertyGroup>
			</div>
		</PanelSection>
	)
}

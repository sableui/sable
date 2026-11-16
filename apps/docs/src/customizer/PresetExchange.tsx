import { Button, CodeBlock, Icon, Input, Label, Note, Textarea, useDisclosurePicker } from "@sableui/react"
import { type SablePreset, presetCss } from "@sableui/react/presets"
import { isThemeId } from "@sableui/react/themes"
import { useEffect, useId, useRef, useState } from "react"
import { useTheme } from "../theme"
import { useCustomizer, useCustomizerActions } from "./CustomizerProvider"
import { type FontEntry, findFont, googleFontsUrl } from "./fonts"
import { DEFAULT_LOOK, type Look, fontsInUse, lookMotionScale } from "./look"
import { downloadPreset, presetMotionScale, snapshotPreset } from "./preset"

/** The family a font stack asks for first, unquoted (`"Geist", sans-serif` → Geist). */
function firstFamily(stack: string) {
	return stack.split(",")[0]?.trim().replace(/^["']|["']$/g, "") ?? ""
}

/** Step 0 of every route out: an app that does not use Sable yet. */
const INSTALL = "pnpm add @sableui/react\npnpm exec sable init"

/**
 * The preset as a message for a coding agent: save it, then apply it to the
 * app and build. Pasting a style is a request to see it in the app, so the
 * message asks for the whole job; an agent told only to save and validate
 * stops there, leaving the app on its old theme and fonts.
 */
function agentMessage(preset: SablePreset) {
	const path = `.sable/presets/${preset.id}.json`
	const fonts = [...new Set(Object.values(preset.fonts).filter(Boolean).map(firstFamily))].join(", ")
	const fence = "```"
	return [
		`Apply this Sable preset (${preset.label}, revision ${preset.revision}) to this project's app:`,
		"",
		"0. If the project does not use Sable yet, install it first: `pnpm add @sableui/react`, then `pnpm exec sable init` from the app root (it wires the CSS, fonts and providers, then runs `sable doctor`). Never run bare `npx sable` before the install.",
		`1. Save it as ${path} (replace an earlier revision with the same ID) and run \`sable preset --check ${path}\`. Report contrast findings; don't change the preset's colours to clear them.`,
		`2. Generate its CSS with \`sable preset --css ${path}\` into a stylesheet imported after Sable's, replacing the CSS of any earlier revision.`,
		`3. Load its fonts (${fonts}) the way the app loads fonts now, and drop the previous theme's fonts if nothing else uses them.`,
		`4. Make it the app's theme: register it in SableThemeProvider with \`customThemes={[presetManifest(parsePreset(record))]}\`, \`defaultThemeId="${preset.id}"\` and \`defaultPreference="${preset.defaultMode}"\`, replacing the current default theme. \`sable docs using-presets\` has the full wiring.`,
		"5. Run the app's build and type check and `sable check`, fix what they report, and look at the result in light and dark.",
		"",
		"If the project has no app yet, stop after step 1; I'll build with it next.",
		"",
		`${fence}json`,
		JSON.stringify(preset, null, 2),
		fence,
		"",
	].join("\n")
}

function errorText(error: unknown) {
	return error instanceof Error ? error.message.split("\n").slice(0, 3).join(" ") : "Could not use this preset."
}

/** A preset ID from its name: a lowercase slug that starts with a letter and is never a bundled preset's. */
export function presetIdFor(label: string): string {
	let slug = label.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
	if (!slug) return "my-preset"
	if (!/^[a-z]/.test(slug)) slug = `preset-${slug}`
	if (isThemeId(slug)) slug = `${slug}-personal`
	return slug.slice(0, 64).replace(/-$/, "")
}

/** The settings a look changes, in words, for the default design notes. */
const CHANGE_NAMES: [keys: (keyof Look)[], name: string][] = [
	[["hue", "brand"], "brand color"],
	[["primary"], "primary action"],
	[["palette", "harmony", "statusLean"], "tones"],
	[["neutrals"], "neutrals"],
	[["bold", "airy", "typeBase", "typeRatio", "controlBase", "spacingBase"], "character and density"],
	[["corners", "radiusBase", "buttons"], "corners"],
	[["depth", "shadows", "shadowAngle", "shadowDistance", "shadowBlur", "shadowOpacity"], "shadows"],
	[["fields"], "fields"],
	[["sans", "display", "mono"], "type"],
	[["motion", "motionBase"], "motion"],
]

function defaultDirection(themeLabel: string, look: Look) {
	const changed = CHANGE_NAMES.filter(([keys]) => keys.some((key) => look[key] !== DEFAULT_LOOK[key])).map(([, name]) => name)
	return changed.length
		? `Tuned from ${themeLabel} in the Sable canvas, changing its ${changed.join(", ")}. Keep compositions as ${themeLabel} draws them.`
		: `${themeLabel} as shipped, saved from the Sable canvas.`
}

export function PresetExchange() {
	const { themeId, themes, mode, presets } = useTheme()
	const { look, base } = useCustomizer()
	const { isCustomized } = useCustomizerActions()
	const selected = presets.find((preset) => preset.id === themeId)
	const themeLabel = themes.find((theme) => theme.id === themeId)?.label ?? themeId
	const [label, setLabel] = useState(selected?.label ?? `${themeLabel} personal`)
	const [direction, setDirection] = useState(selected?.direction ?? "")
	const [status, setStatus] = useState("")
	const uid = useId()
	useEffect(() => {
		setLabel(selected?.label ?? `${themeLabel} personal`)
		setDirection(selected?.direction ?? "")
	}, [themeId, selected, themeLabel])
	const id = selected && label === selected.label ? selected.id : presetIdFor(label)
	const named = Boolean(label.trim())
	// Notes are optional here: the preset schema needs them, so an empty field
	// exports this summary, which the field shows as its placeholder.
	const fallbackDirection = defaultDirection(themeLabel, look)
	const prompt = `$sable build <describe your idea> using .sable/presets/${id}.json`
	function record() {
		const authored = lookMotionScale(look, base)
		return snapshotPreset({
			id,
			label: label.trim() || "My preset",
			direction: direction.trim() || fallbackDirection,
			defaultMode: mode,
			revision: selected?.id === id ? selected.revision + 1 : 1,
			references: selected?.references,
			motionScale: authored == null ? presetMotionScale(selected) : String(authored),
			source: selected,
		})
	}
	function report(error: unknown) {
		setStatus(errorText(error))
	}
	// The fonts the app must load: the look's picks and the preset's own families.
	const presetFonts = [base.colors?.fontSans, base.colors?.fontDisplay, base.colors?.fontMono]
		.map((stack) => (stack ? findFont(firstFamily(stack)) : undefined))
		.filter((entry): entry is FontEntry => Boolean(entry))
	const fontUrl = googleFontsUrl([...new Set([...fontsInUse(look), ...presetFonts])])
	const bundled = !selected
	return (
		<div className="grid gap-4">
			{!isCustomized && bundled ? (
				// Nothing to export: the bundled preset is already the whole design.
				<Note tone="info" title={`Unchanged ${themeLabel}`}>
					<CodeBlock code={themeId === "sable" ? INSTALL : `@import "@sableui/react/styles.css";
@import "@sableui/react/theme/${themeId}.css";

<html data-sable-theme="${themeId}">`} />
				</Note>
			) : null}
			<p className="text-body-sm text-muted-foreground">Save this design for your next project. The preset includes both color modes, fonts, your adjustments, and design notes.</p>
			<div className="grid gap-2">
				<Label size="sm" htmlFor={`${uid}-name`}>Preset name</Label>
				<Input id={`${uid}-name`} value={label} maxLength={120} aria-describedby={`${uid}-id`} onChange={(event) => setLabel(event.target.value)} />
				<p id={`${uid}-id`} className="text-caption text-muted-foreground">
					{named ? <>Theme ID <code className="text-mono-caption">{id}</code></> : "Name the preset to download it or copy it for an agent."}
				</p>
			</div>
			<div className="grid gap-2">
				<Label size="sm" htmlFor={`${uid}-direction`}>Design notes <span className="text-muted-foreground">(optional)</span></Label>
				<Textarea id={`${uid}-direction`} rows={4} maxLength={16000} value={direction} placeholder={fallbackDirection} onChange={(event) => setDirection(event.target.value)} />
			</div>
			<div className="flex flex-wrap gap-2">
				<Button size="sm" disabled={!named} aria-describedby={`${uid}-id`} onClick={async () => { try { const preset = record(); await navigator.clipboard.writeText(agentMessage(preset)); setStatus(`Copied. Paste it into your coding agent to apply ${preset.label} to your app.`) } catch (error) { report(error) } }}>Copy for agent</Button>
				<Button variant="secondary" size="sm" disabled={!named} aria-describedby={`${uid}-id`} onClick={() => { try { const preset = record(); downloadPreset(preset); setStatus(`Downloaded ${preset.id}.json. Place it in your project's .sable/presets folder.`) } catch (error) { report(error) } }}>Download preset</Button>
				<Button variant="ghost" size="sm" onClick={async () => { try { const preset = record(); await navigator.clipboard.writeText(presetCss(preset)); setStatus(`Copied the CSS for ${preset.id}. Load its fonts and set its theme ID in your project.`) } catch (error) { report(error) } }}>Copy CSS</Button>
			</div>
			<p role="status" className="text-caption text-muted-foreground">{status}</p>
			<div className="grid gap-2">
				<h3 className="text-label-lg">Install</h3>
				<CodeBlock code={INSTALL} />
				{fontUrl ? (
					<>
						<h3 className="text-label-lg">Fonts</h3>
						<CodeBlock code={`<link rel="stylesheet" href="${fontUrl}" />`} />
					</>
				) : null}
				<h3 className="text-label-lg">Theme</h3>
				<CodeBlock code={`<html data-sable-theme="${id}">`} />
			</div>
			<p className="text-caption text-muted-foreground">Paste the preset into your coding agent, or put the downloaded file in your project. Then build with it. In Claude Code or Cursor, use /sable.</p>
			<CodeBlock code={prompt} />
		</div>
	)
}

/**
 * Import a preset file — usually one an agent made with `$sable inspire` — to
 * preview and tune it on real components. It becomes a preset to start from,
 * so it is the last row of the preset list, not a button in Export or in a
 * section header. Picking a file closes the list.
 */
export function PresetImport({ onStatus }: { onStatus: (status: string) => void }) {
	const { importPreset } = useTheme()
	const { reset } = useCustomizerActions()
	const { close } = useDisclosurePicker()
	const input = useRef<HTMLInputElement>(null)
	return (
		<>
			<Button variant="ghost" size="sm" iconStart={<Icon name="upload" />} onClick={() => input.current?.click()} className="w-full justify-start text-muted-foreground">
				Import preset file…
			</Button>
			<input ref={input} type="file" accept=".json,application/json" hidden aria-label="Import a preset" onChange={async (event) => {
				const file = event.target.files?.[0]
				event.target.value = ""
				if (!file) return
				close()
				try {
					if (file.size > 512 * 1024) throw new Error("Choose a preset JSON file smaller than 512 KB.")
					const preset = importPreset(JSON.parse(await file.text()))
					reset()
					onStatus(`Loaded ${preset.label}, revision ${preset.revision}. Check that its declared fonts are available.`)
				} catch (error) { onStatus(errorText(error)) }
			}} />
		</>
	)
}

import { Button, CodeBlock, Icon, Input, Label, Textarea } from "@sableui/react"
import { type SablePreset, presetCss } from "@sableui/react/presets"
import { useEffect, useId, useRef, useState } from "react"
import { useTheme } from "../theme"
import { useCustomizer } from "./CustomizerProvider"
import { downloadPreset, snapshotPreset } from "./preset"

/** The family a font stack asks for first, unquoted (`"Geist", sans-serif` → Geist). */
function firstFamily(stack: string) {
	return stack.split(",")[0]?.trim().replace(/^["']|["']$/g, "") ?? ""
}

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

export function PresetExchange() {
	const { themeId, themes, mode, presets } = useTheme()
	const selected = presets.find(preset => preset.id === themeId)
	const themeLabel = themes.find(theme => theme.id === themeId)?.label ?? themeId
	const [label, setLabel] = useState(selected?.label ?? `${themeLabel} personal`)
	const [direction, setDirection] = useState(selected?.direction ?? "")
	const [status, setStatus] = useState("")
	const uid = useId()
	useEffect(() => {
		setLabel(selected?.label ?? `${themeLabel} personal`)
		setDirection(selected?.direction ?? "")
	}, [themeId, selected, themeLabel])
	const slug = label.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
	const id = selected && label === selected.label ? selected.id : slug
	const prompt = `$sable build <describe your idea> using .sable/presets/${id || "my-preset"}.json`
	function record() {
		return snapshotPreset({ id, label, direction, defaultMode: mode, revision: selected?.id === id ? selected.revision + 1 : 1, references: selected?.references })
	}
	function report(error: unknown) { setStatus(errorText(error)) }
	const ready = Boolean(label.trim() && direction.trim())
	return (
		<div className="grid gap-4">
			<p className="text-body-sm text-muted-foreground">Save this design for your next project. The preset includes both color modes, fonts, your adjustments, and design notes.</p>
			<div className="grid gap-2">
				<Label size="sm" htmlFor={`${uid}-name`}>Preset name</Label>
				<Input id={`${uid}-name`} value={label} maxLength={120} onChange={event => setLabel(event.target.value)} />
			</div>
			<div className="grid gap-2">
				<Label size="sm" htmlFor={`${uid}-direction`}>Design notes</Label>
				<Textarea id={`${uid}-direction`} rows={4} maxLength={16000} value={direction} placeholder="Describe the composition, imagery, and feel to carry into your project." onChange={event => setDirection(event.target.value)} />
			</div>
			<div className="flex flex-wrap gap-2">
				<Button size="sm" disabled={!ready} onClick={async () => { try { const preset = record(); await navigator.clipboard.writeText(agentMessage(preset)); setStatus(`Copied. Paste it into your coding agent to apply ${preset.label} to your app.`) } catch (error) { report(error) } }}>Copy for agent</Button>
				<Button variant="secondary" size="sm" disabled={!ready} onClick={() => { try { const preset = record(); downloadPreset(preset); setStatus(`Downloaded ${preset.id}.json. Place it in your project's .sable/presets folder.`) } catch (error) { report(error) } }}>Download preset</Button>
				<Button variant="ghost" size="sm" disabled={!ready} onClick={async () => { try { await navigator.clipboard.writeText(presetCss(record())); setStatus("Copied the full preset CSS. Load its fonts and apply its theme ID in your project.") } catch (error) { report(error) } }}>Copy CSS</Button>
			</div>
			<p className="text-caption text-muted-foreground">Paste the preset into your coding agent, or put the downloaded file in your project. Then build with it. In Claude Code or Cursor, use /sable.</p>
			<CodeBlock code={prompt} />
			<p role="status" className="text-caption text-muted-foreground">{status}</p>
		</div>
	)
}

/**
 * Import a preset file — usually one an agent made with `$sable inspire` — to
 * preview and tune it on real components. It becomes a preset to start from,
 * so it sits with the preset cards, not with Export.
 */
export function PresetImport({ onStatus }: { onStatus: (status: string) => void }) {
	const { importPreset } = useTheme()
	const { reset } = useCustomizer()
	const input = useRef<HTMLInputElement>(null)
	return (
		<>
			{/* At the section header's scale: an action beside a title, not a second title. */}
			<Button variant="ghost" size="xs" onClick={() => input.current?.click()} className="-me-1.5 text-ui-md text-muted-foreground">
				<Icon name="upload" />
				Import
			</Button>
			<input ref={input} type="file" accept=".json,application/json" hidden aria-label="Import a preset" onChange={async event => {
				const file = event.target.files?.[0]
				event.target.value = ""
				if (!file) return
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

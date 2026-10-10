import { Button, CodeBlock, Input, Label, Textarea } from "@sableui/react"
import { presetCss } from "@sableui/react/presets"
import { useEffect, useId, useState } from "react"
import { useTheme } from "../theme"
import { useCustomizer } from "./CustomizerProvider"
import { downloadPreset, snapshotPreset } from "./preset"

export function PresetExchange() {
	const { themeId, themes, mode, presets, importPreset } = useTheme()
	const { reset } = useCustomizer()
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
	function report(error: unknown) { setStatus(error instanceof Error ? error.message.split("\n").slice(0, 3).join(" ") : "Could not use this preset.") }
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
				<Button size="sm" disabled={!label.trim() || !direction.trim()} onClick={() => { try { const preset = record(); downloadPreset(preset); setStatus(`Downloaded ${preset.id}.json. Place it in your project's .sable/presets folder.`) } catch (error) { report(error) } }}>Download preset</Button>
				<Button variant="secondary" size="sm" disabled={!label.trim() || !direction.trim()} onClick={async () => { try { await navigator.clipboard.writeText(presetCss(record())); setStatus("Copied the full preset CSS. Load its fonts and apply its theme ID in your project.") } catch (error) { report(error) } }}>Copy CSS</Button>
			</div>
			<p className="text-caption text-muted-foreground">Place the downloaded file in your project, then give your coding agent this prompt. In Claude Code or Cursor, use /sable.</p>
			<CodeBlock code={prompt} />
			<div className="grid gap-2">
				<Label size="sm" htmlFor={`${uid}-import`}>Import a preset</Label>
				<Input id={`${uid}-import`} type="file" accept=".json,application/json" onChange={async event => {
					const file = event.target.files?.[0]
					event.target.value = ""
					if (!file) return
					try {
						if (file.size > 512 * 1024) throw new Error("Choose a preset JSON file smaller than 512 KB.")
						const preset = importPreset(JSON.parse(await file.text()))
						reset()
						setStatus(`Loaded ${preset.label}, revision ${preset.revision}. Check that its declared fonts are available.`)
					} catch (error) { report(error) }
				}} />
			</div>
			<p role="status" className="text-caption text-muted-foreground">{status}</p>
		</div>
	)
}

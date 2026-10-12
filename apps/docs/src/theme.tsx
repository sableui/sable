import {
	SableThemeProvider,
	type SableColorMode,
	type SableThemePreference,
	useSableTheme,
} from "@sableui/react"
import { isThemeId } from "@sableui/react/themes"
import { parsePreset, presetCss, presetManifest, type SablePreset } from "@sableui/react/presets"
import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from "react"
import { findFont, loadFont } from "./customizer/fonts"

export type ThemePreference = SableThemePreference
export type Mode = SableColorMode

const PRESETS_KEY = "sable-docs-presets"
const PersonalPresets = createContext<{ presets: SablePreset[]; importPreset: (record: unknown) => SablePreset }>({ presets: [], importPreset: () => { throw new Error("Missing ThemeProvider") } })

function storedPresets(): SablePreset[] {
	try {
		const records: unknown = JSON.parse(localStorage.getItem(PRESETS_KEY) ?? "[]")
		if (!Array.isArray(records)) return []
		return records.flatMap(record => { try { const preset = parsePreset(record); return isThemeId(preset.id) ? [] : [preset] } catch { return [] } })
	} catch { return [] }
}

function initialPreference(): ThemePreference {
	let value: string | null = new URLSearchParams(window.location.search).get("mode")
	try { value ??= localStorage.getItem("sable-docs-theme") } catch { /* storage disabled */ }
	return value === "light" || value === "system" ? value : "dark"
}

function initialTheme(presets: SablePreset[]): string {
	let id = new URLSearchParams(window.location.search).get("theme")
	try { id ??= localStorage.getItem("sable-docs-theme-id") } catch { /* storage disabled */ }
	return id && (isThemeId(id) || presets.some(preset => preset.id === id)) ? id : "sable"
}

export function ThemeProvider({ children }: { children: ReactNode }) {
	const [presets, setPresets] = useState(storedPresets)
	const [themeId, setThemeId] = useState(() => initialTheme(presets))
	const [preference, setPreference] = useState(initialPreference)
	const customThemes = useMemo(() => presets.map(presetManifest), [presets])
	// Storage is the record; the address bar stays clean. A share link's
	// `?theme=` / `?mode=` are read once above and cleared by CustomizerProvider.
	useLayoutEffect(() => {
		try {
			localStorage.setItem("sable-docs-theme-id", themeId)
			localStorage.setItem("sable-docs-theme", preference)
		} catch { /* storage disabled: current preview still works */ }
	}, [themeId, preference])
	useEffect(() => {
		try { localStorage.setItem(PRESETS_KEY, JSON.stringify(presets)) } catch { /* preview remains usable for this session */ }
		for (const preset of presets) for (const stack of Object.values(preset.fonts)) {
			const font = findFont(stack.split(",")[0].trim().replace(/^["']|["']$/g, ""))
			if (font) loadFont(font)
		}
	}, [presets])
	const importPreset = (record: unknown) => {
		const preset = parsePreset(record)
		if (isThemeId(preset.id)) throw new Error("Choose a personal preset ID; this ID belongs to a bundled Sable preset.")
		setPresets(current => [...current.filter(item => item.id !== preset.id), preset])
		setThemeId(preset.id)
		setPreference(preset.defaultMode)
		return preset
	}
	return (
		<PersonalPresets.Provider value={{ presets, importPreset }}>
			{presets.map(preset => <style key={`${preset.id}-${preset.revision}`}>{presetCss(preset)}</style>)}
		<SableThemeProvider
			preference={preference}
			onPreferenceChange={setPreference}
			themeId={themeId}
			onThemeIdChange={setThemeId}
			customThemes={customThemes}
			colorStorageKey="sable-docs-theme"
			themeStorageKey="sable-docs-theme-id"
		>
			{children}
		</SableThemeProvider>
		</PersonalPresets.Provider>
	)
}

export function useTheme() {
	const theme = useSableTheme()
	const personal = useContext(PersonalPresets)
	return { ...theme, ...personal, themes: [...theme.themes, ...personal.presets.map(presetManifest)] }
}

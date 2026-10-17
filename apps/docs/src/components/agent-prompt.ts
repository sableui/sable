import { type MotionLevel, componentLabel } from "@sableui/react"
import { isThemeId } from "@sableui/react/themes"
import { useCustomizer } from "../customizer/CustomizerProvider"
import { useTheme } from "../theme"

/*
 * "Copy for agent" on a playground: the configured component as a short
 * request for a coding agent. It is the Customize panel's Copy for agent
 * (customizer/PresetExchange) one size down — same voice, same idea: say what
 * to do, hand over the exact code, and point at the CLI for everything else.
 * The installed package is the source of truth, so the message names the
 * command that prints the contract rather than pasting props or source into
 * the prompt; that way it can't go stale against the version the agent has.
 */

/** How the preview's motion level reached the snippet. */
export type SnippetMotion = "none" | "prop" | "scope" | "provider"

/** The Sable names a snippet uses: its JSX tags, and the imperative `toast`. */
export function sableImports(snippet: string): string[] {
	const names = new Set<string>()
	for (const match of snippet.matchAll(/<([A-Z][A-Za-z0-9]*)/g)) names.add(match[1])
	if (/\btoast(?=[.(])/.test(snippet)) names.add("toast")
	return [...names]
}

/** The theme the reader is looking at, as one instruction. */
export interface AgentTheme {
	id: string
	label: string
	mode: string
	personal: boolean
	customized: boolean
}

export function useAgentTheme(): AgentTheme {
	const { themeId, themes, mode } = useTheme()
	const { isCustomized } = useCustomizer()
	return {
		id: themeId,
		label: themes.find((theme) => theme.id === themeId)?.label ?? themeId,
		mode,
		personal: !isThemeId(themeId),
		customized: isCustomized,
	}
}

function themeLine(theme: AgentTheme): string {
	const tuned = theme.customized
		? " The preview also had Customize adjustments on top; they travel as a preset (Customize → Export → Copy for agent), not in this snippet."
		: ""
	if (theme.personal) {
		return `Theme: my preset "${theme.label}" (${theme.mode} mode). If .sable/presets/${theme.id}.json isn't in the project yet, ask me for it; I'll export it from Customize.${tuned}`
	}
	if (theme.id === "sable") return `Theme: Sable's default (already in styles.css), ${theme.mode} mode.${tuned}`
	return `Theme: Sable's bundled ${theme.label} preset, ${theme.mode} mode. Import \`@sableui/react/theme/${theme.id}.css\` after styles.css and make it the default with \`<SableThemeProvider defaultThemeId="${theme.id}">\`.${tuned}`
}

function motionLine(level: MotionLevel, how: SnippetMotion): string | null {
	if (level === "full" || how === "none") return null
	const what = level === "subtle" ? "essential motion only: feedback, overlays and loaders play, flourishes don't" : "no motion; every state still changes"
	if (how === "prop") return `Motion: \`motion="${level}"\` is deliberate (${what}). Keep it.`
	if (how === "scope") return `Motion: the \`<MotionScope level="${level}">\` wrapper is deliberate (${what}). Keep it around this region only.`
	return `Motion: I want ${what}. Set it app-wide with \`<MotionProvider defaultPolicy="${level}">\`, since this one isn't a region a scope can wrap.`
}

export function agentPrompt({
	name,
	snippet,
	level,
	motion,
	theme,
}: {
	/** The component's export name (`Button`). */
	name: string
	/** The exact code the playground shows. */
	snippet: string
	level: MotionLevel
	motion: SnippetMotion
	theme: AgentTheme
}): string {
	const fence = "```"
	// The component first, whatever wraps it in the snippet — but only a name
	// the snippet uses: Toast is a meta name, the code imports `toast`.
	const used = sableImports(snippet)
	const imports = used.includes(name) ? [name, ...used.filter((imported) => imported !== name)] : used.length ? used : [name]
	const lines = [
		`Add a Sable ${componentLabel(name)} to this project, configured like this:`,
		"",
		`${fence}tsx`,
		`import { ${imports.join(", ")} } from "@sableui/react"`,
		"",
		snippet,
		fence,
		"",
		"1. If Sable isn't installed yet, run `pnpm add @sableui/react`, then `pnpm exec sable init` (it wires the CSS, fonts and icon provider, then runs `sable doctor`).",
		`2. Read the contract before you place it: \`pnpm exec sable component ${name}\` prints the props, parts, accessibility notes and examples for the installed version.`,
		`3. ${themeLine(theme)}`,
	]
	const motionText = motionLine(level, motion)
	if (motionText) lines.push(`4. ${motionText}`)
	lines.push(
		`${motionText ? 5 : 4}. Put it where I ask, composed from Sable parts rather than rebuilt, then run \`pnpm exec sable check\` and fix what it reports.`,
		"",
	)
	return lines.join("\n")
}

import { PageHeader } from "../components/docs-ui"
import { Markdown } from "../components/Markdown"
import COLOR_MODE from "../generated/guides/color-mode.md?raw"
import CONVERTING from "../generated/guides/converting-an-app.md?raw"
import SHADCN from "../generated/guides/migrating-from-shadcn.md?raw"
import NEXTJS from "../generated/guides/nextjs.md?raw"
import TROUBLESHOOTING from "../generated/guides/troubleshooting.md?raw"

/**
 * The consumer guides. Each page renders one task guide from
 * packages/sable/llms/tasks (copied by scripts/sync-guides.mjs), and that file
 * is also the page's markdown twin (src/markdown-twins.json). The page and what
 * an agent reads are the same text; edit the guide, not this file.
 */

export function NextjsPage() {
	return <>
		<PageHeader title="Next.js" lede="Set up Sable in the Next.js App Router: what sable init does, the providers file and layout it prints, and colour mode before first paint." />
		<Markdown source={NEXTJS} skipTitle base="/llms/tasks/nextjs.md" />
	</>
}

export function ColorModePage() {
	return <>
		<PageHeader title="Colour mode and themes" lede="Light, dark and system, a dark default, and the stylesheet every alternate theme needs." />
		<Markdown source={COLOR_MODE} skipTitle base="/llms/tasks/color-mode.md" />
	</>
}

export function TroubleshootingPage() {
	return <>
		<PageHeader title="Troubleshooting" lede="Unstyled, iconless, blank or wrong-theme pages: each symptom, its cause, and the fix sable doctor names." />
		<Markdown source={TROUBLESHOOTING} skipTitle base="/llms/tasks/troubleshooting.md" />
	</>
}

export function ConvertingAnAppPage() {
	return <>
		<PageHeader title="Migrate an app" lede="Move an existing React app onto Sable in the order that avoids rework." />
		<Markdown source={CONVERTING} skipTitle base="/llms/tasks/converting-an-app.md" />
	</>
}

export function MigratingFromShadcnPage() {
	return <>
		<PageHeader title="Migrate from shadcn/ui" lede="Replace a shadcn/ui and Radix components folder with Sable: render instead of asChild, values, events, tokens, icons, and every component mapped." />
		<Markdown source={SHADCN} skipTitle base="/llms/tasks/migrating-from-shadcn.md" />
	</>
}

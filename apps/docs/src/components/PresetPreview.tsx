import { cn } from "@sableui/react"
import { ProductScene } from "../pages/CustomizeCanvas"

/**
 * The same object rendered inside one preset, as shipped. A preset's selectors
 * are plain `[data-sable-theme="…"]`, so scoping one to a subtree restyles
 * everything beneath it — but only for the tokens that preset declares.
 * Anything else would inherit the reader's Customize look and the active
 * preset from :root; `data-preset-preview` resets those to Sable's defaults
 * (see CustomizerProvider).
 */
export function PresetPreview({ id, dark, className }: { id: string; dark: boolean; className?: string }) {
	return (
		<div data-sable-theme={id} data-preset-preview="" className={cn("grid overflow-hidden rounded-lg bg-background font-sans text-foreground", dark && "dark", className)}>
			<ProductScene />
		</div>
	)
}

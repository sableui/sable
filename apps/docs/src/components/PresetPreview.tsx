import { cn } from "@sableui/react"
import { ProductScene } from "../pages/CustomizeCanvas"

/**
 * The same object rendered inside one preset, as shipped. A preset's selectors
 * are plain `[data-sable-theme="…"]`, so scoping one to a subtree restyles
 * everything beneath it — but only for the tokens that preset declares.
 * Anything else would inherit the reader's Customize look and the active
 * preset from :root; `data-preset-preview` resets those to Sable's defaults
 * (see CustomizerProvider).
 *
 * The frame clips at the Stage's own radius (`rounded-xl`) and paints nothing
 * itself. Clipped at `lg` with a background, a preset whose xl corner is much
 * larger (Poppy) showed a crescent of that background outside the Stage's
 * curve at every corner; the Stage covers the frame, so it needs no fill.
 */
export function PresetPreview({ id, dark, className }: { id: string; dark: boolean; className?: string }) {
	return (
		<div data-sable-theme={id} data-preset-preview="" className={cn("grid overflow-hidden rounded-xl font-sans text-foreground", dark && "dark", className)}>
			<ProductScene />
		</div>
	)
}

import { Badge, Grid, Tabs, TabsList, TabsPanel, TabsTrigger, ToastProvider, cn } from "@sableui/react"
import { memo, useEffect, useState } from "react"
import { BlockScene } from "../canvas/scenes"
import { BLOCKS, CANVAS_TILES, type CanvasTile } from "../canvas/tiles"
import { useCustomizerActions } from "../customizer/CustomizerProvider"
import { PHONE, WIDE, useMediaQuery } from "../lib/use-media-query"
import { IosCanvasPreview } from "./IosCanvasPreview"

/*
 * The customize canvas: the whole system as a SET, so a change to character,
 * color or corners is judged by its effect on a real composition — a payment
 * card, an app nav, a settings form — rather than on one component in
 * isolation.
 *
 * The tiles are data (canvas/tiles.ts) drawn by one wrapper; the stage and the
 * scenes other pages borrow live in canvas/scenes.tsx. To add a block to the
 * canvas, add it to CANVAS_TILES.
 */

/**
 * One tile: the block on its stage, nothing above it — the canvas is the set,
 * not a catalogue. Named for assistive technology only: a section labelled
 * with the block, so a screen reader hears where each tile starts.
 */
function Tile({ tile }: { tile: CanvasTile }) {
	const Block = tile.block ? BLOCKS[tile.block] : null
	return (
		<section aria-label={tile.block ? `${tile.name} (${tile.block})` : tile.name} className="grid min-w-0">
			{tile.scene ? <tile.scene /> : Block ? <BlockScene<Record<never, never>> block={Block} /> : null}
		</section>
	)
}

/**
 * The grid of tiles. Memoized and prop-less: a look change restyles the tiles
 * through CSS and never re-renders them (the page reads only the customizer's
 * stable actions).
 */
const ThemeCanvas = memo(function ThemeCanvas() {
	return (
		// As many columns as fit, not a column count per window width: the space
		// left beside the Customize panel, and the size of everything at the
		// current Character setting, decide how many scenes fit across. The floor
		// is one card at its widest (max-w-xs, 20rem) plus the stage's padding
		// (16 spacing units, which density scales), so a card is never squeezed
		// below the width it is built for.
		// Blocks that end in a toast (Storage, Share) need a provider. Bottom
		// centre keeps the toasts clear of the Customize panel on the right.
		<ToastProvider position="bottom-center">
			<Grid minItemWidth="calc(20rem + var(--spacing) * 16)" gap="calc(var(--spacing) * 4)">
				{CANVAS_TILES.map((tile) => (
					<Tile key={tile.id} tile={tile} />
				))}
			</Grid>
		</ToastProvider>
	)
})

export function CustomizeCanvasPage() {
	// The canvas is where you tune the look, so arriving opens the same
	// Customize panel every page uses (the shell makes room for it). Not on a
	// small screen, where the panel covers part of the canvas: there the
	// header's Customize button opens it.
	const { setOpen } = useCustomizerActions()
	const [target, setTarget] = useState(() => new URLSearchParams(location.search).get('target') === 'ios' ? 'ios' : 'web')
	const [showIos, setShowIos] = useState(target === 'ios')
	// On a phone the web canvas IS the phone view, and an iPhone prototype
	// inside an iPhone only spends the screen: there is no platform switch, and
	// a shared ?target=ios link opens the web canvas (it still opens iOS on a
	// larger screen).
	const phone = useMediaQuery(PHONE)
	const platform = phone ? 'web' : target
	useEffect(() => { if (window.matchMedia(WIDE).matches) setOpen(true) }, [setOpen])
	return (
		<div>
			<h1 className="sr-only">Customize Sable</h1>
			<Tabs value={platform} onValueChange={value => {
				const next = String(value)
				setTarget(next)
				if (next === 'ios') setShowIos(true)
				const url = new URL(location.href)
				if (next === 'ios') url.searchParams.set('target', 'ios')
				else url.searchParams.delete('target')
				history.replaceState(history.state, '', url)
			}}>
				{/* Hidden by CSS too, so a phone never sees it flash before hydration. */}
				<div className={cn("flex items-center justify-between gap-4 mb-6", "[@media(max-width:47.99rem)_and_(pointer:coarse)]:hidden", phone && "hidden")}>
					<TabsList variant="pill" aria-label="Canvas platform"><TabsTrigger value="web">Web</TabsTrigger><TabsTrigger value="ios">iOS<Badge size="sm">Beta</Badge></TabsTrigger></TabsList>
				</div>
				{/* The web canvas unmounts behind the iOS tab: 38 live blocks restyling
				    under an iframe was work no one could see. */}
				<TabsPanel value="web"><ThemeCanvas /></TabsPanel>
				<TabsPanel value="ios" keepMounted>{showIos && !phone && <IosCanvasPreview />}</TabsPanel>
			</Tabs>
		</div>
	)
}

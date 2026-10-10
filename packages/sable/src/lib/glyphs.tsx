import { Icon } from "../icon"

/**
 * The carousel and marquee transport toggle. It used to be a hand-drawn SVG
 * because the icon contract had no media names; `play`/`pause` are contract
 * names now, so the glyph follows the app's icon set like every other one.
 */
export function PlayPauseGlyph({ playing }: { playing: boolean }) {
	return <Icon name={playing ? "pause" : "play"} variant="solid" className="text-base" />
}

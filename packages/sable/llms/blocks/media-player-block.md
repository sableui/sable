# MediaPlayerBlock

A now-playing card: cover, title and artist as an Entity with a Like action, a position Slider with elapsed and remaining time, and previous / play-pause / next.

**Intent:** Reach for this for audio or video playback controls outside the media itself — a mini player, a podcast card, a preview in a feed. Playback over the video frame is the Video component's own chrome.

**Block:** Media & files · card · designed for 18rem–20rem wide (fills its container up to the max)

## Notes

- Play/pause is the one filled control, centred between two ghost skips.
- Times are `text-mono-caption`, so the digits do not shift as they count.
- The cover is painted from the palette as a placeholder; swap it for the real artwork.

## Accessibility

- Every icon-only Button carries aria-label, and play/pause's label follows its state.
- The Slider carries aria-label="Position". Give it aria-valuetext in your player ("1:24 of 3:40") so the position is read as time, not a percentage.

## Source

```tsx
import { useState } from "react"
import { Button, Card, CardContent, cn, Entity, Icon, Slider } from "@sableui/react"

const track = { title: "Low tide, high noon", artist: "Juno Avery", position: 38, elapsed: "1:24", remaining: "-2:16" }

/**
 * Placeholder cover painted from the palette — the theme's decorative tones
 * over the brand, so it follows every look. Replace with the cover image.
 */
const ART_TONES = ["info", "collectible", "edition"]
const ART_SPOTS = [[20, 20, 70], [85, 30, 60], [60, 90, 65]]
const cover = [
	...ART_SPOTS.map(
		([x, y, reach], i) =>
			// design-lint-disable-next-line inline-color -- relative colour derived from the theme's own --tone token, so it follows every look
			`radial-gradient(in oklab at ${x}% ${y}%, oklch(from var(--tone-${ART_TONES[i % ART_TONES.length]}) clamp(0.5, calc(l + 0.16), 0.9) max(calc(c * 1.25), 0.1) h), transparent ${reach}%)`,
	),
	"var(--primary)",
].join(", ")

export interface MediaPlayerBlockProps {
	className?: string
	/** false drops the card's surface and border — for a Sheet or muted section that already frames it. */
	framed?: boolean
	/** Called with the new playing state. */
	onPlayingChange?: (playing: boolean) => void
	onPrevious?: () => void
	onNext?: () => void
}

export function MediaPlayerBlock({ className, framed = true, onPlayingChange, onPrevious, onNext }: MediaPlayerBlockProps) {
	const [playing, setPlaying] = useState(true)
	return (
		<Card variant={framed ? "default" : "flat"} className={cn("w-full max-w-xs", className)}>
			<CardContent className="flex flex-col gap-4">
				{/* Entity's own row padding is for lists; inside a card's content the
				    card already pads it. */}
				<Entity
					className="p-0"
					leading={<div aria-hidden className="size-14 rounded-md" style={{ background: cover }} />}
					title={track.title}
					subtitle={track.artist}
					action={
						<Button variant="ghost" size="icon-sm" aria-label="Like">
							<Icon name="heart" />
						</Button>
					}
				/>
				<div className="flex flex-col gap-1.5">
					<Slider defaultValue={track.position} aria-label="Position" />
					<div className="flex justify-between text-mono-caption text-muted-foreground">
						<span>{track.elapsed}</span>
						<span>{track.remaining}</span>
					</div>
				</div>
				<div className="flex items-center justify-center gap-3">
					<Button variant="ghost" size="icon" aria-label="Previous" onClick={onPrevious}>
						<Icon name="previous" variant="solid" />
					</Button>
					<Button
						size="icon"
						aria-label={playing ? "Pause" : "Play"}
						onClick={() => {
							setPlaying(!playing)
							onPlayingChange?.(!playing)
						}}
					>
						<Icon name={playing ? "pause" : "play"} variant="solid" />
					</Button>
					<Button variant="ghost" size="icon" aria-label="Next" onClick={onNext}>
						<Icon name="next" variant="solid" />
					</Button>
				</div>
			</CardContent>
		</Card>
	)
}
```

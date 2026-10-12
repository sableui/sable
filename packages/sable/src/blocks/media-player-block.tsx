import { useState } from "react"
import { Button } from "../components/button"
import { Card, CardContent } from "../components/card"
import { Entity } from "../components/entity"
import { MediaImage } from "../components/media-image"
import { Slider } from "../components/slider"
import { Icon } from "../icon"
import { cn } from "../lib/cn"

// ---block-code---
// `cover` is the artwork URL; left empty, the cover paints art seeded by the title.
const track = { title: "Low tide, high noon", artist: "Juno Avery", cover: "", duration: 220, position: 84 }

/** Seconds → m:ss, the way the readout and the screen reader both say it. */
function formatTime(seconds: number) {
	return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`
}


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
	const [position, setPosition] = useState(track.position)
	return (
		<Card variant={framed ? "default" : "flat"} className={cn("w-full max-w-xs", className)}>
			<CardContent className="flex flex-col gap-4">
				{/* Entity's own row padding is for lists; inside a card's content the
				    card already pads it. */}
				<Entity
					className="p-0"
					leading={<MediaImage src={track.cover} seed={track.title} className="size-14 shrink-0 rounded-md" />}
					title={track.title}
					subtitle={track.artist}
					action={
						<Button variant="ghost" size="icon-sm" aria-label="Like">
							<Icon name="heart" />
						</Button>
					}
				/>
				<div className="flex flex-col gap-1.5">
					<Slider
						value={position}
						max={track.duration}
						onValueChange={setPosition}
						aria-label="Position"
						// Spoken as a time, not "38": the number alone means nothing.
						getAriaValueText={(_, value) => `${formatTime(value)} of ${formatTime(track.duration)}`}
					/>
					<div className="flex justify-between text-mono-caption text-muted-foreground">
						<span>{formatTime(position)}</span>
						<span>-{formatTime(track.duration - position)}</span>
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

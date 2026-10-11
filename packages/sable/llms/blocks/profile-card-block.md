# ProfileCardBlock

A profile card: a cover banner, an avatar rising into it, Share and Follow, the name and handle, a one-line bio and two counts.

**Intent:** Reach for this for a person or creator summary — a suggested-follow card, a hover target's full view, the top of a profile sidebar. For a small inline preview on hover, use ContextCard; for a row in a list of people, use Entity.

**Block:** Social & messaging · card · designed for 18rem–20rem wide (fills its container up to the max)

## Notes

- The avatar overlaps the banner by half its height with a ring in the card colour, so it reads as sitting on the card, not pasted over the art.
- Follow is the one primary action and flips to a secondary Following once pressed; Share is an icon-only ghost Button beside it.
- Counts pair a label-tier number with muted body text, so the numbers scan as a row.

## Accessibility

- The Share button carries aria-label; Follow's visible text changes with its state.
- The banner is decorative (aria-hidden); the Avatar's alt is the person's name.

## Source

```tsx
import { useState } from "react"
import { Avatar, Button, Card, CardContent, CardDescription, CardTitle, cn, Icon } from "@sableui/react"

const profile = {
	name: "Juno Avery",
	initials: "JA",
	handle: "@juno · Sound and light",
	bio: "Field recordings, slowed down. New edition every full moon.",
	stats: [
		{ value: "128", label: "posts" },
		{ value: "4.2k", label: "followers" },
	],
}

/**
 * Placeholder banner painted from the palette — the theme's decorative tones
 * over the brand, so it follows every look. Replace with the person's cover image.
 */
const ART_TONES = ["info", "collectible", "edition", "standard"]
const ART_SPOTS = [[10, 50, 60], [50, 0, 55], [90, 60, 60], [40, 100, 50]]
const banner = [
	...ART_SPOTS.map(
		([x, y, reach], i) =>
			// design-lint-disable-next-line inline-color -- relative colour derived from the theme's own --tone token, so it follows every look
			`radial-gradient(in oklab at ${x}% ${y}%, oklch(from var(--tone-${ART_TONES[i % ART_TONES.length]}) clamp(0.5, calc(l + 0.16), 0.9) max(calc(c * 1.25), 0.1) h), transparent ${reach}%)`,
	),
	"var(--primary)",
].join(", ")

export interface ProfileCardBlockProps {
	className?: string
	/** false drops the card's surface and border — for a muted section that already frames it. */
	framed?: boolean
	/** Called with the new follow state. */
	onFollowChange?: (following: boolean) => void
	onShare?: () => void
}

export function ProfileCardBlock({ className, framed = true, onFollowChange, onShare }: ProfileCardBlockProps) {
	const [following, setFollowing] = useState(false)
	return (
		<Card variant={framed ? "default" : "flat"} className={cn("w-full max-w-xs overflow-hidden", className)}>
			<div aria-hidden className="h-20" style={{ background: banner }} />
			{/* pt-0: the avatar rises into the banner above, so the content
			    starts at the banner's edge rather than a full pad below it. */}
			<CardContent className="flex flex-col gap-3 pt-0">
				<div className="flex items-start justify-between">
					<Avatar size="lg" fallback={profile.initials} alt={profile.name} className="-mt-6 ring-4 ring-card" />
					<div className="flex gap-1.5 pt-3">
						<Button variant="ghost" size="icon-sm" aria-label="Share profile" onClick={onShare}>
							<Icon name="share" />
						</Button>
						<Button
							size="sm"
							variant={following ? "secondary" : "primary"}
							onClick={() => {
								setFollowing(!following)
								onFollowChange?.(!following)
							}}
						>
							{following ? "Following" : "Follow"}
						</Button>
					</div>
				</div>
				<div className="flex flex-col gap-0.5">
					<CardTitle>{profile.name}</CardTitle>
					<CardDescription>{profile.handle}</CardDescription>
				</div>
				<p className="text-body-sm">{profile.bio}</p>
				<div className="flex gap-4 text-body-sm">
					{profile.stats.map((s) => (
						<span key={s.label}>
							<span className="text-label-lg">{s.value}</span> <span className="text-muted-foreground">{s.label}</span>
						</span>
					))}
				</div>
			</CardContent>
		</Card>
	)
}
```

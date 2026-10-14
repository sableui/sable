import { useState } from "react"
import { Avatar } from "../components/avatar"
import { Button } from "../components/button"
import { Card, CardContent, CardDescription, CardTitle } from "../components/card"
import { GradientArt } from "../components/gradient-art"
import { Icon } from "../icon"
import { cn } from "../lib/cn"

// ---block-code---
const profile = {
	name: "Juno Avery",
	initials: "JA",
	handle: "@juno · Sound and light",
	bio: "Field recordings, slowed down. New track every full moon.",
	stats: [
		{ value: "128", label: "posts" },
		{ value: "4.2k", label: "followers" },
	],
}


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
			{/* Placeholder banner painted from the theme, so it follows every look. Replace with the person's cover image. */}
			<GradientArt aria-hidden seed={profile.handle} className="h-20" />
			{/* pt-0: the avatar rises into the banner above, so the content
			    starts at the banner's edge rather than a full pad below it. */}
			<CardContent className="flex flex-col gap-3 pt-0">
				<div className="flex items-start justify-between">
					<Avatar variant="art" size="lg" fallback={profile.initials} alt={profile.name} className="-mt-6 ring-4 ring-card" />
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

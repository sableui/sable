import { Button, Tooltip, TooltipContent, TooltipTrigger } from "@sableui/react"
import { brandIconSet } from "@sableui/react/icons/brands"
import { useEffect, useState } from "react"

/**
 * LAUNCH FLAG — flip to `true` when the GitHub repository is public.
 *
 * While the repository is private, GitHub's API answers 404 (a console error on
 * every page) and the link leads to a page visitors cannot open. With the flag
 * off, GitHubLink renders nothing and makes no request. Every placement (top
 * bar, mobile header, home footer) follows this one switch.
 */
export const GITHUB_REPO_IS_PUBLIC = false

// Keep the real repository until a neutral public repository exists.
const REPO = "sableui/sable"
const CACHE = "sable-github-stars"

/**
 * The repository's star count from GitHub's public API, cached for the session
 * (unauthenticated calls are rate-limited to 60 an hour). A private repository
 * answers 404, so the count reads 0 until the repository is public.
 */
function useStars(): number {
	const [stars, setStars] = useState(() => {
		try {
			return Number(window.sessionStorage.getItem(CACHE)) || 0
		} catch {
			return 0
		}
	})
	useEffect(() => {
		try {
			if (window.sessionStorage.getItem(CACHE) !== null) return
		} catch {}
		const controller = new AbortController()
		fetch(`https://api.github.com/repos/${REPO}`, { signal: controller.signal })
			.then((response) => (response.ok ? response.json() : null))
			.then((repo) => {
				const count = typeof repo?.stargazers_count === "number" ? repo.stargazers_count : 0
				setStars(count)
				try {
					window.sessionStorage.setItem(CACHE, String(count))
				} catch {}
			})
			.catch(() => {})
		return () => controller.abort()
	}, [])
	return stars
}

const compactNumber = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 })

export function GitHubLink({ compact = false }: { compact?: boolean }) {
	if (!GITHUB_REPO_IS_PUBLIC) return null
	return <GitHubLinkButton compact={compact} />
}

function GitHubLinkButton({ compact }: { compact: boolean }) {
	const stars = useStars()
	const mark = brandIconSet({ name: "github", variant: "brands", title: "", className: "text-base" })
	return (
		<Tooltip>
			<TooltipTrigger
				render={
					<Button
						variant="ghost"
						size={compact ? "icon" : "sm"}
						render={<a href={`https://github.com/${REPO}`} target="_blank" rel="noopener noreferrer" />}
						aria-label={`Sable on GitHub, ${stars} ${stars === 1 ? "star" : "stars"} (opens in a new tab)`}
					>
						{mark}
						{compact ? null : <span className="text-muted-foreground tabular-nums">{compactNumber.format(stars)}</span>}
					</Button>
				}
			/>
			<TooltipContent>Sable on GitHub</TooltipContent>
		</Tooltip>
	)
}

import { Button, cn, Icon, Region, Reveal, TextReveal, Toggle, ToggleGroup, useMotion } from "@sableui/react"
import { useEffect, useRef, useState } from "react"
import { GitHubLink } from "../components/GitHubLink"
import { IntroCurtain, introPending, markIntroPlayed } from "../components/IntroCurtain"
import type { SableMarkHandle } from "../components/SableLogo"
import { hrefFor } from "../lib/router"
import { useCustomizer } from "../customizer/CustomizerProvider"
import { useTheme } from "../theme"
import {
	BillingScene, ChatScene, CollectScene, EventScene, NowPlayingScene,
	ProfileScene, SettingsScene, StatScene, TasksScene,
} from "./CustomizeCanvas"

/*
 * The homepage: one proposition, two actions, and the system itself — real
 * compositions from the canvas, restyled live by the preset you pick. The
 * header is the docs header (this page renders inside DocsShell), so moving
 * between home and docs changes the page, never the chrome.
 */

const SCENES = [BillingScene, CollectScene, StatScene, NowPlayingScene, SettingsScene, ChatScene, ProfileScene, TasksScene, EventScene]

/** A duration scaled by the active --motion-scale, as every Sable duration is
 *  — the Customize motion slider slows or speeds the intro too. */
function scaled(ms: number): number {
	const raw = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--motion-scale"))
	return ms * (Number.isFinite(raw) ? Math.max(0, raw) : 1)
}
const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, scaled(ms)))

/**
 * Runs the intro and reports when the page should start arriving.
 *
 * Beats: the S is drawn — guides, outline, fill (≈1.2s) — turns into the
 * sable (620ms), holds a moment, then fades and softens out in place while the curtain dissolves and
 * the page reveals beneath it. Any key or pointer press skips straight to the
 * page.
 */
function useIntro() {
	const { enabled } = useMotion()
	const [playing] = useState(() => introPending() && enabled)
	const [revealed, setRevealed] = useState(!playing)
	const [curtain, setCurtain] = useState<"up" | "leaving" | "gone">(playing ? "up" : "gone")
	const markRef = useRef<SableMarkHandle>(null)

	useEffect(() => {
		if (!playing) return
		const root = document.documentElement
		let cancelled = false
		root.dataset.intro = ""
		const finish = () => {
			if (cancelled) return
			cancelled = true
			delete root.dataset.intro
			markIntroPlayed()
			setRevealed(true)
			setCurtain("gone")
		}
		const skip = (event: Event) => {
			if (event instanceof KeyboardEvent && ["Shift", "Control", "Alt", "Meta"].includes(event.key)) return
			finish()
		}
		window.addEventListener("keydown", skip)
		window.addEventListener("pointerdown", skip)

		;(async () => {
			await wait(120)
			if (cancelled) return
			await markRef.current?.drawIn()
			if (cancelled) return
			await wait(140)
			if (cancelled) return
			await markRef.current?.play(1)
			await wait(160)
			if (cancelled) return
			setRevealed(true)
			setCurtain("leaving")
			// The curtain's exit runs at --motion-duration-slower (500ms).
			await wait(500)
			finish()
		})()

		return () => {
			window.removeEventListener("keydown", skip)
			window.removeEventListener("pointerdown", skip)
			if (!cancelled) {
				cancelled = true
				delete root.dataset.intro
				markIntroPlayed()
			}
		}
	}, [playing])

	return { revealed, curtain, markRef }
}

function PresetSwitcher() {
	const { themes, themeId } = useTheme()
	// Through the Customize flow, not setThemeId: a preset is a starting point,
	// so choosing one clears a custom look (with a confirm) instead of stacking
	// that look onto a different preset.
	const { requestPreset } = useCustomizer()
	return (
		<ToggleGroup
			aria-labelledby="showcase-heading"
			value={[themeId]}
			onValueChange={(values) => { if (values[0]) requestPreset(String(values[0])) }}
			// Scrolls sideways on a phone rather than wrapping one preset onto a
			// line of its own. A scroller clips anything painted past its box, so
			// it pads for the focus ring and only exists below sm.
			className="max-w-full justify-start p-1 max-sm:overflow-x-auto max-sm:scrollbar-hidden sm:justify-center"
		>
			{themes.map((theme) => <Toggle key={theme.id} value={theme.id}>{theme.label}</Toggle>)}
		</ToggleGroup>
	)
}

export function IntroductionPage() {
	const { revealed, curtain, markRef } = useIntro()
	return (
		<>
			{curtain === "gone" ? null : <IntroCurtain markRef={markRef} leaving={curtain === "leaving"} />}

			<Region max="wide" className="grid justify-items-center gap-7 pt-20 pb-16 text-center sm:pt-28 lg:pt-36 lg:pb-20">
				<h1 tabIndex={-1} className="text-display-lg text-balance outline-none sm:text-display-xl">
					<TextReveal text="UI your agent gets right." stagger={70} when={revealed} />
				</h1>
				<Reveal delay={260} when={revealed}>
					<p className="max-w-xl text-body-lg text-balance text-muted-foreground">
					Build a beautiful website or app from your idea, with themeable React components, reusable presets, and a skill that guides your coding agent.
					</p>
				</Reveal>
				<Reveal delay={360} when={revealed} className="flex flex-wrap justify-center gap-3">
					<Button size="cta" render={<a href={hrefFor("getting-started")} />}>Get started</Button>
					<Button size="cta" variant="ghost" render={<a href={hrefFor("button")} />} iconEnd={<Icon name="chevron-right" />}>Browse components</Button>
				</Reveal>
			</Region>

			<Region as="section" aria-labelledby="showcase-heading" max="wide" className="grid gap-6 pb-24">
				<Reveal delay={440} when={revealed} className="grid justify-items-center gap-3">
					<h2 id="showcase-heading" className="text-body-sm text-muted-foreground">Pick a preset to restyle every example</h2>
					<PresetSwitcher />
				</Reveal>
				{/* The canvas, cropped — four scenes on a phone, six on a tablet, nine
				    on a desktop: the grid fades out where the page invites you
				    into the full set rather than ending on a hard edge. */}
				<div className="relative">
					<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
						{SCENES.map((Scene, index) => (
							<Reveal key={index} delay={520 + (index % 3) * 90 + Math.floor(index / 3) * 60} when={revealed} amount={0.05} className={cn("grid", index >= 4 && "max-sm:hidden", index >= 6 && "sm:max-xl:hidden")}>
								<Scene />
							</Reveal>
						))}
					</div>
					<div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-linear-to-t from-background to-transparent" />
					<div className="absolute inset-x-0 bottom-8 flex justify-center">
						<Button variant="outline" render={<a href={hrefFor("customize")} />} iconEnd={<Icon name="chevron-right" />}>Customize all examples</Button>
					</div>
				</div>
			</Region>

			<Region as="section" aria-labelledby="agent-heading" max="wide" className="pb-24">
				<Reveal className="grid justify-items-center gap-4 text-center">
					<h2 id="agent-heading" className="text-heading-2 text-balance">Bring your coding agent.</h2>
					<p className="max-w-lg text-body-md text-balance text-muted-foreground">
						Describe your idea, develop a preset from inspiration, or audit an existing product. The skill connects your direction to Sable's components and checks the working result.
					</p>
					<Button variant="secondary" render={<a href={hrefFor("build-with-sable")} />}>Build with your agent</Button>
				</Reveal>
			</Region>

			<Region as="footer" max="wide" className="flex flex-wrap items-center justify-between gap-4 py-8">
				<p className="text-body-sm text-muted-foreground">Open source under the MIT license. Install it from npm as @sableui/react.</p>
				<nav aria-label="Footer" className="flex items-center gap-1">
					<Button variant="ghost" size="sm" render={<a href={hrefFor("whats-new")} />}>What's new</Button>
					<Button variant="ghost" size="sm" render={<a href={hrefFor("credits")} />}>Credits and license</Button>
					<GitHubLink />
				</nav>
			</Region>
		</>
	)
}

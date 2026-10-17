import type { ComponentMeta } from "../../lib/meta"

export const carouselMeta: ComponentMeta = {
	name: "Carousel",
	summary:
		"Generic, accessible, zero-dependency slide carousel. Transform track with measured slide pitch — multiple slides per view, infinite loop (cloned ends), pointer drag-to-swipe with snap, autoplay (with a pause control + hover/focus/reduced-motion pausing), arrows, dots, counter, and keyboard. Motion is token-driven.",
	status: "stable",
	keywords: [
		"carousel",
		"gallery",
		"slides",
		"horizontal",
	],
	usage: {
		description: "Use Carousel for a curated, finite sequence of media or cards that benefits from horizontal browsing.",
		bestPractices: [
			{
				guidance: "do",
				description: "Use obvious previous and next controls and make the current position understandable.",
			},
			{
				guidance: "do",
				description: "Keep slide content independent so users do not need every slide to complete a task.",
			},
			{
				guidance: "dont",
				description: "Do not hide critical information or primary conversion actions only inside later slides.",
			},
			{
				guidance: "dont",
				description: "Do not autoplay without a visible pause control. Motion that cannot be stopped fails WCAG 2.2.2 and makes the surrounding text hard to read.",
			},
		],
	},
	related: {
		components: [
			"Scroller",
			"Dialog",
		],
	},
	props: [
		{ name: "children", type: "ReactNode", description: "Each top-level child becomes one slide." },
		{
			name: "slidesToShow",
			type: "number | { base?: number; sm?: number; md?: number; lg?: number; xl?: number }",
			default: "1",
			description:
				"Slides visible per view. A number, or a mobile-first breakpoint set keyed to Tailwind's default min-widths (sm 640, md 768, lg 1024, xl 1280px); a missing key inherits from the next smaller defined one, and base (default 1) is also the server-render value. Resolved with matchMedia, so no hand-rolled resize hook is needed.",
		},
		{ name: "gap", type: "string", default: '"0px"', description: "Gap between slides (any CSS length). Use the spacing scale — e.g. \"calc(var(--spacing) * 4)\" — so density moves it." },
		{ name: "loop", type: "boolean", default: "false", description: "Infinite loop via cloned ends (needs count > slidesToShow)." },
		{ name: "autoplay", type: "number", default: "0", description: "Auto-advance interval in ms (0 = off). Pauses on hover/focus/reduced-motion and exposes a play/pause control." },
		{ name: "arrows", type: "boolean", default: "true", description: "Prev/next arrow buttons." },
		{ name: "dots", type: "boolean", default: "true", description: "Pagination dots." },
		{ name: "counter", type: "boolean", default: "false", description: "An N / M slide counter." },
		{ name: "draggable", type: "boolean", default: "true", description: "Pointer drag-to-swipe." },
		{ name: "index", type: "number", description: "Controlled active index." },
		{ name: "defaultIndex", type: "number", default: "0", description: "Initial index (uncontrolled)." },
		{ name: "onIndexChange", type: "(index: number) => void", description: "Notified when the active index changes." },
		{ name: "label", type: "string", description: "Accessible label for the carousel region." },
		{ name: "slideClassName", type: "string", description: "Class for each slide wrapper (e.g. an aspect ratio)." },
		{
			name: "arrowClassName",
			type: "string",
			description:
				"Class for both prev/next arrow buttons. Merged through cn(), so a radius or shadow utility replaces the default rounded-full shadow-md rather than stacking with it.",
		},
		{
			name: "motion",
			type: '"full" | "subtle" | "off"',
			default: '"full"',
			description:
				"How much motion this component uses: `full` (default) inherits the app's policy, `subtle` keeps feedback and drops the glide, `off` stills it. It can only turn motion down — it never overrides a reader's reduce-motion setting. Under subtle the slides still travel and the active dot snaps; off also cuts between slides and pauses autoplay.",
		},
	],
	tokensUsed: [
		"border",
		"ring",
		"popover",
		"popover-foreground",
		"foreground",
		"muted-foreground",
	],
	motion: [
		{
			slot: "arrival",
			recipe: "none",
			part: "Root",
			why: "A carousel arrives with its section. Its content already moves on every advance; an entrance on top would make the first view feel like an advance nobody asked for.",
		},
		{
			slot: "response",
			recipe: "motion-interactive",
			part: "Dot",
			why: "The dot's 24px hit area eases its focus ring and the dot brightens under the pointer, which is how a 6px mark tells you it is a button.",
		},
		{
			slot: "transition",
			recipe: "custom",
			part: "Track",
			why: "The slide track's translate is set inline from the measured slide pitch, on --motion-duration-slow and the emphasized easing, and switched off during a drag so the track follows the finger. A recipe cannot carry a measured, drag-interrupted offset. Essential: it is the answer to \"next\", so it plays under subtle.",
		},
		{
			slot: "transition",
			recipe: "motion-glide",
			part: "Dot",
			why: "The active dot stretches to a bar while the one it left shrinks, on one timeline, so the row keeps its length and the mark reads as travelling with the slide. It used to change width unanimated and jumped while the slides beside it glided. Expressive: motion=\"subtle\" snaps it.",
		},
		{
			slot: "activity",
			recipe: "none",
			part: "Root",
			why: "Autoplay's progress is the slides themselves advancing and the play/pause control; a separate timer animation would put a second clock beside the first.",
		},
	],
	a11y: [
		"Region carries aria-roledescription='carousel'; each slide is a group with aria-roledescription='slide' and an 'N of M' label; clones are aria-hidden.",
		"Arrows and dots are real buttons (dots set aria-current); Left/Right arrow keys navigate when the viewport is focused.",
		"A polite live region announces the active slide; it goes silent while auto-rotating (APG).",
		"Autoplay exposes a pause/play control and pauses on hover, focus, and under prefers-reduced-motion (which also makes transitions instant).",
	],
	examples: [
		{
			label: "Looping media",
			code: '<Carousel loop dots slideClassName="aspect-video">{images.map((s) => <img key={s.id} src={s.url} alt={s.alt} className="size-full object-cover" />)}</Carousel>',
		},
		{
			label: "Multiple per view",
			code: '<Carousel slidesToShow={3} gap="calc(var(--spacing) * 4)">{cards}</Carousel>',
		},
		{
			label: "Responsive per view",
			code: '<Carousel slidesToShow={{ base: 1, sm: 2, lg: 3 }} gap="calc(var(--spacing) * 6)" label="Templates">{cards}</Carousel>',
		},
		{
			label: "Autoplay",
			code: "<Carousel loop autoplay={4000} counter>{slides}</Carousel>",
		},
		{
			label: "Subtle motion",
			code: '<Carousel loop motion="subtle" label="Gallery">{slides}</Carousel>',
		},
	],
}

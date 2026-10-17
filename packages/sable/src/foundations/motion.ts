import type { Foundation } from "./types"

const motion: Foundation = {
	slug: "motion",
	title: "Motion",
	summary:
		"Motion explains a change: where something came from, what responded, and that work is happening. Components ship crafted by default: one indicator travels instead of two blinking, numbers roll, ticks draw, a refused answer shakes. It is built from named recipes, comes in two levels, and one switch turns it off.",
	headline: "4 slots · 3 speeds · 2 levels · enter-only overshoot · 1 kill switch",
	vocabularies: [
		{
			title: "Three speeds",
			note: "Match duration to the distance and size of what moves. Each value is multiplied by --motion-scale. Two edge steps sit outside the three: --motion-duration-instant (75ms) for a checkbox tick or tab swap, and --motion-duration-slower (500ms) for progress and value changes.",
			terms: [
				{ name: "fast  --motion-duration-fast", value: "150ms", use: "Hover, press, focus, tooltips, small toggles. Also every exit." },
				{ name: "base  --motion-duration-base", value: "200ms", use: "Menus, popovers, tabs, disclosure. The default enter." },
				{ name: "slow  --motion-duration-slow", value: "300ms", use: "Dialogs, sheets, page-level transitions." },
			],
		},
		{
			title: "Recipes",
			note: "Reach for one named class before writing a transition.",
			terms: [
				{ name: "motion-interactive", value: "fast · standard", use: "Hover/focus/press chrome on anything clickable. Replaces transition-colors." },
				{ name: "motion-press", value: "fast · scale settle", use: "Tactile press. Always paired with motion-interactive." },
				{ name: "motion-fade", value: "enter base / exit fast", use: "Scrims and backdrops." },
				{ name: "motion-pop", value: "enter base · spring", use: "Anchored or centred surfaces: popovers, menus, dialogs." },
				{ name: "motion-slide-{up,down,left,right}", value: "enter base / exit fast", use: "Directional surfaces: sheets, toasts." },
				{ name: "motion-disclosure", value: "base · standard", use: "Height changes: accordion, collapsible." },
				{ name: "motion-icon-swap", value: "enter · emphasized cross-fade", use: "Two icons of one control trading places: play/pause, outline/fill, copy/check." },
				{ name: "motion-glide", value: "slow · emphasized · expressive", use: "ONE indicator travelling to the selected option: tabs, segmented thumb, active dot." },
				{ name: "motion-shake", value: "~400ms decaying · expressive", use: "A refused answer: wrong code, invalid submit. Plays while data-shake is set (useShake). Never the only signal." },
				{ name: "motion-tick", value: "fast fade + base wipe · expressive", use: "A check mark that draws itself in. Exits only fade." },
				{ name: "motion-appear", value: "fast fade + base scale", use: "A small control mounting in place: a clear button, a send arrow, a badge. @starting-style, no JS." },
				{ name: "motion-arrive", value: "base · decelerate · staggered · expressive", use: "Items a user action brings into a list: a folder's children on expand, a row just added. Never on every render." },
				{ name: "motion-size", value: "base · emphasized · expressive", use: "An element easing between intrinsic sizes when its label changes: a two-step confirm, Copy → Copied." },
				{ name: "motion-draw", value: "slower · decelerate", use: "SVG line art drawing on when a <Reveal> scrolls in. The path needs pathLength=\"1\"; stagger siblings with --motion-draw-delay." },
				{ name: "motion-spin · pulse · shimmer · dot-bounce · ping", value: "loops", use: "Activity. Scale-aware, so reduced motion freezes them." },
			],
		},
		{
			title: "Easings",
			terms: [
				{ name: "ease-standard", value: "cubic-bezier(0.4, 0, 0.2, 1)", use: "The default for state changes." },
				{ name: "ease-decelerate", value: "cubic-bezier(0, 0, 0.2, 1)", use: "Entrances: arrive fast, settle slowly." },
				{ name: "ease-emphasized", value: "cubic-bezier(0.2, 0, 0, 1)", use: "Large surfaces covering a lot of distance." },
				{ name: "ease-spring", value: "~4% overshoot", use: "A gentle pop on enter. Never on exit." },
				{ name: "ease-bounce", value: "~10% overshoot", use: "A playful pop, opt-in only. Enter only, never on exit." },
			],
		},
		{
			title: "Two levels",
			note: "Essential motion answers the user; expressive motion narrates continuity. Expressive durations are also multiplied by --motion-expressive, which `subtle` sets to 0. Each level can only turn motion down from what surrounds it.",
			terms: [
				{ name: "essential", value: "always, unless off", use: "Colour and focus feedback, press, overlay arrival, disclosure height, loaders, chart hover." },
				{ name: "expressive", value: "full only", use: "Glides, rolling numbers (NumberTicker), drawn ticks, shakes, staggers, chart arrival and morph, scroll reveals, spring overshoot." },
				{ name: "full", value: "default", use: "Both levels play. The crafted default." },
				{ name: "subtle", value: "data-motion=\"subtle\"", use: "Essential only; nothing overshoots. For dense tools, embedded widgets, readers who want calm without stillness." },
				{ name: "off", value: "data-motion=\"off\" · reduce-motion", use: "Nothing moves; every state still changes." },
				{ name: "where", value: "provider · scope · prop", use: "<MotionProvider policy> for the app, <MotionScope level> for a region, `motion` on a component that owns a flourish." },
			],
		},
		{
			title: "The four slots",
			note: "Every interactive component answers all four, by filling the slot or declining it with a reason in meta.motion.",
			terms: [
				{ name: "arrival", value: "fade · slide · pop · Reveal", use: "How does it enter?" },
				{ name: "response", value: "motion-interactive · motion-press", use: "What happens under the pointer?" },
				{ name: "transition", value: "motion-disclosure · eased transform", use: "How does it move between its own states?" },
				{ name: "activity", value: "spin · pulse · shimmer", use: "How do you tell working from frozen?" },
			],
		},
	],
	rules: [
		{
			rule: "Every motion has a reason: orientation, feedback, continuity or activity.",
			why: "Motion with no reason is latency. If you cannot say which of the four it serves, remove it.",
		},
		{
			rule: "Reach for a recipe first; drop to tokens only when none fits.",
			why: "Recipes are reviewed once and respect the kill switch. A bespoke transition string is reviewed never.",
			enforcedBy: "sable-lint: transition-colors, transition-all",
		},
		{
			rule: "Exits are one step faster than entrances, and never overshoot.",
			why: "Something leaving should get out of the way. A bounce on exit draws the eye to what the user just dismissed.",
		},
		{
			rule: "Animate opacity and transform only.",
			why: "They run on the compositor. Width, height, top and left cause layout on every frame. motion-disclosure is the one sanctioned exception.",
		},
		{
			rule: "Durations come from tokens, so --motion-scale can stop them.",
			why: "prefers-reduced-motion and <MotionProvider> off both set --motion-scale to 0. A raw duration ignores that.",
			enforcedBy: "sable-lint: raw-duration, builtin-animate",
		},
		{
			rule: "Interactive elements always respond. Something styled for hover with no motion recipe snaps.",
			why: "A snap between states reads as broken. The four prohibitive rules could not catch missing motion, so this one does.",
			enforcedBy: "sable-lint: static-interactive",
		},
		{
			rule: "JS motion reads useMotion().enabled and does nothing when it is false.",
			why: "Reduced motion is an accessibility setting, not a style preference.",
		},
		{
			rule: "One thing travels; two things do not blink. When a selection, a value or a mark changes in place, move the one element that represents it.",
			why: "A fill switching off here and on there is two events the eye has to connect. A glide, a roll or a draw is one, and it is most of what makes an interface feel made rather than assembled.",
		},
		{
			rule: "Flourishes are expressive: multiply their durations by --motion-expressive and gate JS ones on useMotion().expressive.",
			why: "`subtle` promises the answers without the choreography. A glide on a plain token keeps playing after someone asked for calm.",
		},
		{
			rule: "A state change finishes its story: refused shakes and says why, success confirms in place, armed asks again.",
			why: "Motion that starts a change and leaves the outcome to a snap reads as unfinished. ConfirmButton, OtpField's invalid shake and the copy-to-check swap are the reference cases.",
		},
		{
			rule: "Component motion props and MotionScope only turn motion down.",
			why: "`full` on a component means inherit. Nothing below the provider can switch motion back on for a reader who asked for it off.",
		},
	],
	noGos: [
		{
			never: "Tailwind's animate-spin / animate-pulse / animate-ping / animate-bounce.",
			instead: "motion-spin, motion-pulse, motion-ping, motion-dot-bounce.",
			why: "The built-ins ignore --motion-scale, so reduced motion cannot freeze them.",
			enforcedBy: "sable-lint: builtin-animate",
		},
		{
			never: "duration-150, duration-300, or any raw duration utility.",
			instead: "duration-(--motion-duration-fast) and siblings.",
			why: "Raw durations bypass the kill switch.",
			enforcedBy: "sable-lint: raw-duration",
		},
		{
			never: "transition-all, or transition-colors on its own.",
			instead: "motion-interactive, or name the properties you animate.",
			why: "transition-all animates unrelated layout changes and defeats the browser's pre-computation.",
			enforcedBy: "sable-lint: transition-all, transition-colors",
		},
		{
			never: "Motion on first paint of static content, or staggered entrances on every list.",
			instead: "Reveal for one deliberate moment per view.",
			why: "Entrance choreography repeated everywhere becomes a loading delay.",
		},
		{
			never: "The motion library in the core package.",
			instead: "src/motion (WAAPI, IntersectionObserver, View Transitions).",
			why: "Sable's motion layer is zero-dependency; drag, FLIP and velocity springs belong in an optional adapter.",
		},
	],
	details: [
		{
			title: "Hover that respects the kill switch",
			before: '<button className="transition-colors duration-150 sable-surface-interactive">',
			after: '<button className="motion-interactive sable-surface-interactive">',
			why: "Same feel, but reduced motion now resolves it instantly.",
		},
		{
			title: "A selection that travels",
			before: '<Tab className="data-[active]:border-b-2 data-[active]:border-foreground" />',
			after: '<Tabs.Indicator className="motion-glide left-(--active-tab-left) w-(--active-tab-width)" />',
			why: "The underline used to vanish under one tab and appear under the next. Now it slides, and Tabs renders it for you.",
		},
		{
			title: "A value that rolls",
			before: "<span>{total}</span>",
			after: '<NumberTicker value={total} format={{ style: "currency", currency: "USD" }} />',
			why: "The digits that changed roll; the ones that did not stay still, so the eye goes straight to the difference.",
		},
		{
			title: "Faster exits",
			before: "transition: opacity 200ms ease-in-out;  /* in and out */",
			after: "data-[starting-style]: enter 200ms decelerate · data-[ending-style]: exit 150ms standard",
			why: "motion-pop and motion-slide-* already do this; dismissing feels responsive instead of sluggish.",
		},
	],
	related: ["accessibility", "sable docs reviewing-motion", "sable token motion"],
}

export default motion

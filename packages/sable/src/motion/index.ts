// Owned, zero-dependency motion layer. Policy controls (provider + hooks) drive
// the CSS `--motion-scale` switch; the browser-native primitives (Presence,
// useInView/Reveal, TextReveal, ViewTransition) cover the JS-only cases without
// pulling in an animation library. Richer physics lives in a future optional
// `@sableui/motion` adapter (peer-dep `motion`).

// Policy
export { MotionProvider, useMotion } from "./MotionProvider"
export type { MotionPolicy, MotionProviderProps } from "./MotionProvider"
export { useReducedMotion } from "./useReducedMotion"

// Browser-native primitives
export { useInView, type UseInViewOptions } from "./useInView"
export { Reveal, type RevealProps } from "./Reveal"
export { TextReveal, type TextRevealProps } from "./TextReveal"
export { Presence, type PresenceProps } from "./Presence"
export {
	startViewTransition,
	supportsViewTransitions,
	ViewTransitionName,
	type ViewTransitionNameProps,
} from "./viewTransition"

import { defineConfig } from "vitest/config"

/**
 * Vitest config for @sableui/react. Behavioral + a11y tests for the custom
 * widgets (the ones with no behavior engine under them — CommandMenu, FileTree,
 * Carousel, CopyButton…) live next to their components as *.test.tsx and run in
 * a jsdom DOM. design-lint, typecheck, and build remain the other CI gates;
 * this adds the behavior gate so keyboard/ARIA contracts can't silently regress.
 */
export default defineConfig({
	test: {
		environment: "jsdom",
		setupFiles: ["./src/test/setup.ts"],
		include: ["src/**/*.test.{ts,tsx}"],
		// Components import .variants.ts (plain TS), never .css at runtime — the
		// theme ships separately — so there is no CSS to transform in tests.
		css: false,
	},
})

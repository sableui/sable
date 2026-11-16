import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { sableAsPublished } from "../../scripts/sable-consumer.mjs"

/**
 * The long-lived vendor chunks. Matches both ways the docs resolve Sable: the
 * package's src (dev, build:source) and its dist (the consumer build). The
 * solid icon weight is left out on purpose: only the Icons page imports it,
 * and naming it here would put it in the chunk every page loads.
 */
function vendorChunk(id: string): string | undefined {
	const path = id.replace(/\\/g, "/")
	if (/\/node_modules\/(react|react-dom|scheduler)\//.test(path)) return "react"
	if (/\/node_modules\/@(base-ui|floating-ui)\//.test(path)) return "base-ui"
	if (/\/icon-sets\/reicon(\.generated)?\.(js|tsx?)$/.test(path)) return "icons"
	return undefined
}

// `vite build --mode consumer` resolves @sableui/react through its PUBLISHED
// export map to the built dist, as a user's app does (see
// scripts/sable-consumer.mjs). `vite` (dev) stays on the package's src.
export default defineConfig(({ mode }) => ({
	plugins: [...(mode === "consumer" ? [sableAsPublished()] : []), react(), tailwindcss()],
	server: { port: 4000, strictPort: true },
	build: {
		rollupOptions: {
			input: { main: 'index.html', native: 'native.html', iosCanvas: 'ios-canvas.html' },
			// Vendors that change on their own schedules get their own chunks. Left
			// to Rollup, React, react-dom, Base UI and the icon set were one 665 kB
			// chunk on every page, so bumping any one of them re-downloaded all.
			output: { manualChunks: vendorChunk },
		},
	},
	// The workspace package (@sableui/react) and its Base UI dep can resolve a second
	// copy of React from packages/sable/node_modules. Force a single instance.
	resolve: { dedupe: ["react", "react-dom"] },
}))

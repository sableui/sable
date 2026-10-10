import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { sableAsPublished } from "../../scripts/sable-consumer.mjs"

// `vite build --mode consumer` resolves @sableui/react through its PUBLISHED
// export map to the built dist, as a user's app does (see
// scripts/sable-consumer.mjs). `vite` (dev) stays on the package's src.
export default defineConfig(({ mode }) => ({
	plugins: [...(mode === "consumer" ? [sableAsPublished()] : []), react(), tailwindcss()],
	server: { port: 4000, strictPort: true },
	build: { rollupOptions: { input: { main: 'index.html', native: 'native.html', iosCanvas: 'ios-canvas.html' } } },
	// The workspace package (@sableui/react) and its Base UI dep can resolve a second
	// copy of React from packages/sable/node_modules. Force a single instance.
	resolve: { dedupe: ["react", "react-dom"] },
}))

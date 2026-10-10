#!/usr/bin/env node
/**
 * sable-mode — choose how the docs consume @sableui/react.
 *
 *   node scripts/sable-mode.mjs source     (dev: the package's src, instant edits)
 *   node scripts/sable-mode.mjs consumer   (build: the published dist, like a user)
 *
 * The logic lives in scripts/sable-consumer.mjs. The docs
 * import themes.css as well as styles.css because their ThemeSelector switches
 * across every preset; an app with a single theme should not.
 */

import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { runSableModeCli } from "../../../scripts/sable-consumer.mjs"

runSableModeCli({
	app: "docs",
	appDir: join(dirname(fileURLToPath(import.meta.url)), ".."),
	css: ["./styles.css", "./themes.css"],
	separateCss: { "sable-ios.css": ["./ios/styles.css"] },
})

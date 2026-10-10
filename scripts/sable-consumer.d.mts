import type { Plugin } from "vite"

/** Absolute path of packages/sable. */
export declare const PKG: string

/** Vite plugin: resolve @sableui/react through publishConfig.exports to dist. */
export declare function sableAsPublished(): Plugin

export declare function writeSableMode(opts: {
	appDir: string
	mode: "source" | "consumer"
	css: string[]
}): string

export declare function runSableModeCli(opts: { app: string; appDir: string; css: string[] }): void

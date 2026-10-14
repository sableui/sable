#!/usr/bin/env node
/**
 * render-og-image — draws the social share image (og:image / twitter:image)
 * from og.html, which composes it from Sable's own components, and writes
 * public/og-image.png at 1200×630 (rendered at 2× and kept at 2400×1260, so
 * it stays sharp on high-density timelines).
 *
 * Needs the docs dev server (`pnpm dev`, port 4000) or SABLE_DOCS_URL:
 *
 *   node scripts/render-og-image.mjs
 *
 * prerender-routes.mjs points every page's social meta at the result; rerun
 * this when the brand, the tagline or the blocks shown change, and commit
 * the PNG.
 */

import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import puppeteer from "puppeteer"

const DOCS_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const OUT = join(DOCS_ROOT, "public", "og-image.png")
const BASE = (process.env.SABLE_DOCS_URL ?? "http://localhost:4000").replace(/\/+$/, "")

const browser = await puppeteer.launch({ headless: true })
try {
	const page = await browser.newPage()
	await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 })
	await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }])
	await page.goto(`${BASE}/og.html`, { waitUntil: "networkidle0" })
	await page.waitForSelector("[data-og-ready]")
	await page.evaluate(() => document.fonts.ready)
	const fonts = await page.evaluate(() => ["Figtree", "DM Mono"].filter((family) => !document.fonts.check(`16px "${family}"`)))
	if (fonts.length) throw new Error(`fonts not loaded: ${fonts.join(", ")}`)
	await page.screenshot({ path: OUT, clip: { x: 0, y: 0, width: 1200, height: 630 } })
	console.log(`[render-og-image] ✓ wrote ${OUT}`)
} finally {
	await browser.close()
}

/** Uses the existing docs server; never starts another instance. */
import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync as writeFileAtomic } from "node:fs"
import { randomUUID } from "node:crypto"
import { tmpdir } from "node:os"
import { resolve } from "node:path"
import puppeteer from "puppeteer"
/** Replace complete evidence atomically; a viewer may hold the previous file open. */
function writeFileSync(file, data) {
	const temporary = `${file}.${randomUUID()}.tmp`
	try {
		writeFileAtomic(temporary, data)
		renameSync(temporary, file)
	} finally { rmSync(temporary, { force: true }) }
}

const root = resolve(import.meta.dirname, "../../..")
const cli = resolve(root, "packages/sable/bin/sable.mjs")
const url = process.env.SABLE_DOCS_URL ?? "http://localhost:4000"
const scratch = mkdtempSync(resolve(tmpdir(), "sable-preset-browser-"))
const output = resolve(root, ".evidence/preset-workflow")
mkdirSync(output, { recursive: true })
const browser = await puppeteer.launch({ headless: true })
const page = await browser.newPage()
const errors = []
page.on("pageerror", error => errors.push(error.message))
const client = await page.createCDPSession()
await client.send("Page.setDownloadBehavior", { behavior: "allow", downloadPath: scratch })
const readTokens = () => page.evaluate(() => {
	const style = getComputedStyle(document.documentElement)
	const panel = document.querySelector('aside[aria-label="Customize"]')
	const probe = document.createElement("span")
	probe.hidden = true
	probe.style.transitionDuration = "var(--motion-duration-base)"
	document.documentElement.appendChild(probe)
	const duration = Number.parseFloat(getComputedStyle(probe).transitionDuration)
	probe.remove()
	return { background: style.getPropertyValue("--background").trim(), primary: style.getPropertyValue("--primary").trim(), radius: style.getPropertyValue("--theme-radius-md").trim(), spacing: style.getPropertyValue("--spacing").trim(), weight: style.getPropertyValue("--type-heading-weight").trim(), leading: style.getPropertyValue("--leading-scale").trim(), font: style.getPropertyValue("--font-sans").trim(), motion: Number.parseFloat(style.getPropertyValue("--motion-scale")), duration, chrome: panel ? getComputedStyle(panel).getPropertyValue("--font-sans").trim() : "" }
})
/**
 * The rendered canvas, not a hand-picked token list: computed type, spacing,
 * shape and colour on real elements. Comparing this before export and after
 * import is what catches a look value the snapshot does not carry (the lost
 * Airy leading changed ~1,500 line heights while every listed token matched).
 */
const readRendered = () => page.evaluate(() => {
	const props = ["line-height", "font-size", "font-weight", "font-family", "letter-spacing", "border-top-left-radius", "padding-top", "padding-left", "row-gap", "color", "background-color", "box-shadow"]
	return Array.from(document.querySelectorAll('[role="tabpanel"] *')).slice(0, 2500).map(element => {
		const style = getComputedStyle(element)
		return props.map(name => style.getPropertyValue(name)).join("|")
	})
})
function renderedDiffs(before, after) {
	const diffs = []
	before.forEach((row, i) => { if (row !== after[i]) diffs.push(i) })
	return diffs
}
async function click(label) { const button = await page.$(`::-p-aria(${label}[role="button"])`); assert(button, `Missing button ${label}`); await button.scrollIntoView(); await button.click() }
async function enter(label, text) { const field = await page.$(`::-p-aria(${label})`); assert(field, `Missing field ${label}`); await field.focus(); await field.evaluate(node => node.select()); await field.type(text) }
try {
	await page.setViewport({ width: 1440, height: 1000 })
	await page.goto(`${url}/customize?theme=prism&mode=dark`, { waitUntil: "networkidle0" })
	await page.waitForSelector('aside[aria-label="Customize"]')
	await page.evaluate(() => document.fonts.ready)
	const character = await page.$('::-p-aria(Character[role="slider"])')
	await character.focus()
	await page.keyboard.press("ArrowRight")
	await page.keyboard.press("ArrowUp")
	// Airy to the top: the leading moves every reading line height.
	await page.keyboard.down("Shift")
	for (let i = 0; i < 5; i++) await page.keyboard.press("ArrowUp")
	await page.keyboard.up("Shift")
	await page.waitForFunction(() => localStorage.getItem("sable-docs-look"))
	await click("Relaxed")
	const starting = await readTokens()
	const startingRendered = await readRendered()
	assert(startingRendered.length > 1000, "Canvas did not render")
	await click("Export")
	await enter("Preset name", "Prism personal")
	await enter("Design notes (optional)", "Compact technical composition with clear product hierarchy and restrained motion.")
	await click("Download preset")
	const downloaded = resolve(scratch, "prism-personal.json")
	await page.waitForFunction(() => document.querySelector('aside[aria-label="Customize"] [role="status"]')?.textContent?.includes("Downloaded prism-personal"))
	for (let i = 0; i < 30 && !existsSync(downloaded); i++) await new Promise(done => setTimeout(done, 100))
	assert(existsSync(downloaded), "Preset was not downloaded")
	const record = JSON.parse(readFileSync(downloaded, "utf8"))
	const check = JSON.parse(execFileSync(process.execPath, [cli, "preset", "--check", downloaded, "--json"], { cwd: root, encoding: "utf8" }))
	assert(check.data.valid, "Canvas exported an invalid preset")
	assert.equal(record.tokens.dark.primary, starting.primary)
	assert.equal(record.tokens.dark["theme-radius-md"], starting.radius)
	assert.equal(record.fonts.sans, starting.font)
	assert.equal(record.tokens.dark.spacing, starting.spacing)
	assert.equal(record.tokens.dark["type-heading-weight"], starting.weight)
	assert.equal(Number.parseFloat(record.tokens.dark["motion-scale"]), starting.motion)
	assert(Math.abs(Number.parseFloat(record.tokens.dark["motion-duration-base"]) / 1000 * starting.motion - starting.duration) < 0.001, "Canvas exported a scaled rather than nominal duration")
	assert.deepEqual(await readTokens(), starting, "Export changed the active theme or mode")
	assert.notEqual(starting.leading, "1", "Airy did not move the leading")
	assert.equal(record.tokens.dark["theme-leading-scale"], starting.leading, "Canvas export dropped the Airy leading")
	// OS reduced motion pins --motion-scale to 0 on the page; the export must
	// still carry the look's own speed (Relaxed), not freeze the app's motion.
	await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }])
	await click("Download preset")
	await page.waitForFunction(() => document.querySelector('aside[aria-label="Customize"] [role="status"]')?.textContent?.includes("Downloaded prism-personal"))
	await new Promise(done => setTimeout(done, 300))
	const reduced = JSON.parse(readFileSync(downloaded, "utf8"))
	assert.equal(reduced.tokens.light["motion-scale"], "1.4", "Reduced-motion export froze the motion scale")
	assert.equal(reduced.tokens.dark["motion-scale"], "1.4", "Reduced-motion export froze the dark motion scale")
	await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "no-preference" }])
	writeFileSync(resolve(output, "desktop-export.png"), await page.screenshot())
	// Import sits with the preset cards, in the main view.
	await click("Back")
	// Import is the last row of the preset list, mounted while the list is open.
	const openPresets = async () => { await page.click("[data-preset-trigger]"); await page.waitForSelector('input[type="file"]') }
	await openPresets()
	const upload = await page.$('input[type="file"]')
	await upload.uploadFile(downloaded)
	await page.waitForFunction(() => document.documentElement.getAttribute("data-sable-theme") === "prism-personal")
	await page.evaluate(() => new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done))))
	const imported = await readTokens()
	assert(Math.abs(imported.duration - starting.duration) < 0.001, "Imported preset scaled the motion duration twice")
	assert.deepEqual(imported, starting, "Imported preset changed the preview or inspector fonts")
	const importedDiffs = renderedDiffs(startingRendered, await readRendered())
	assert.equal(importedDiffs.length, 0, `Imported preset renders ${importedDiffs.length} canvas elements differently from the look it was exported from`)
	await page.reload({ waitUntil: "networkidle0" })
	assert.equal(await page.evaluate(() => document.documentElement.getAttribute("data-sable-theme")), "prism-personal", "Imported preset did not survive reload")
	await click("Export")
	await click("Download preset")
	await page.waitForFunction(() => document.querySelector('aside[aria-label="Customize"] [role="status"]')?.textContent?.includes("Downloaded prism-personal"))
	await new Promise(done => setTimeout(done, 300))
	assert.equal(JSON.parse(readFileSync(downloaded, "utf8")).revision, 2, "Edited preset revision did not advance")
	const invalid = resolve(scratch, "invalid.json")
	writeFileSync(invalid, JSON.stringify({ ...record, tokens: { ...record.tokens, light: { ...record.tokens.light, primary: "red; } body { display:none" } } }))
	await click("Back")
	await openPresets()
	await (await page.$('input[type="file"]')).uploadFile(invalid)
	await page.waitForFunction(() => document.querySelector('aside[aria-label="Customize"] [role="status"]')?.textContent?.includes("Unsafe"))
	assert.equal(await page.evaluate(() => document.documentElement.getAttribute("data-sable-theme")), "prism-personal", "Invalid import replaced the active preset")
	await click("Light")
	assert.equal((await readTokens()).primary, record.tokens.light.primary, "Imported light-mode tokens differ from the exported record")
	await click("Export")
	await page.setViewport({ width: 390, height: 844 })
	writeFileSync(resolve(output, "mobile-export.png"), await page.screenshot())
	assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "Mobile export overflows the viewport")
	await page.goto(`${url}/build-with-sable`, { waitUntil: "networkidle0" })
	assert(await page.evaluate(() => document.querySelector("h1")?.textContent === "Build with Sable"), "Workflow guide does not render")
	assert.deepEqual(errors, [], "Browser reported errors")
	writeFileSync(resolve(output, "result.json"), JSON.stringify({ passed: true, checkedAt: new Date().toISOString(), checks: ["customized export", "CLI validation", "snapshot preserves preview", "rendered canvas parity after import", "Airy leading exported", "reduced-motion export keeps the motion scale", "import and inspector isolation", "reload persistence", "revision", "invalid import recovery", "both modes", "mobile overflow", "workflow guide"], errors }, null, 2))
	console.log("Preset workflow passes: Canvas export/import, CLI validation, preview parity, persistence, revision, invalid input recovery, mobile layout, and the workflow guide.")
} finally {
	await browser.close()
	rmSync(scratch, { recursive: true, force: true })
}

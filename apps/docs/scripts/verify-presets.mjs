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
	return { background: style.getPropertyValue("--background").trim(), primary: style.getPropertyValue("--primary").trim(), radius: style.getPropertyValue("--theme-radius-md").trim(), spacing: style.getPropertyValue("--spacing").trim(), weight: style.getPropertyValue("--type-heading-weight").trim(), font: style.getPropertyValue("--font-sans").trim(), motion: Number.parseFloat(style.getPropertyValue("--motion-scale")), duration, chrome: panel ? getComputedStyle(panel).getPropertyValue("--font-sans").trim() : "" }
})
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
	await page.waitForFunction(() => localStorage.getItem("sable-docs-look"))
	await click("Relaxed")
	const starting = await readTokens()
	await click("Export")
	await enter("Preset name", "Prism personal")
	await enter("Design notes", "Compact technical composition with clear product hierarchy and restrained motion.")
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
	writeFileSync(resolve(output, "desktop-export.png"), await page.screenshot())
	// Import sits with the preset cards, in the main view.
	await click("Back")
	const upload = await page.$('input[type="file"]')
	await upload.uploadFile(downloaded)
	await page.waitForFunction(() => document.documentElement.getAttribute("data-sable-theme") === "prism-personal")
	await page.evaluate(() => new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done))))
	const imported = await readTokens()
	assert(Math.abs(imported.duration - starting.duration) < 0.001, "Imported preset scaled the motion duration twice")
	assert.deepEqual(imported, starting, "Imported preset changed the preview or inspector fonts")
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
	writeFileSync(resolve(output, "result.json"), JSON.stringify({ passed: true, checkedAt: new Date().toISOString(), checks: ["customized export", "CLI validation", "snapshot preserves preview", "import and inspector isolation", "reload persistence", "revision", "invalid import recovery", "both modes", "mobile overflow", "workflow guide"], errors }, null, 2))
	console.log("Preset workflow passes: Canvas export/import, CLI validation, preview parity, persistence, revision, invalid input recovery, mobile layout, and the workflow guide.")
} finally {
	await browser.close()
	rmSync(scratch, { recursive: true, force: true })
}

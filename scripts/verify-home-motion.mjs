// Uses the existing docs server and retains real, timestamped animation frames.
import puppeteer from "puppeteer"
import { mkdirSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"
import { pathToFileURL } from "node:url"

const out = resolve(".evidence/home")
mkdirSync(out, { recursive: true })
const browser = await puppeteer.launch({ headless: true })
const report = { route: "/", viewport: { width: 1440, height: 1000 }, mode: "dark", motion: "full", frames: [], checks: [] }
const selector = 'button[aria-label="Replay Sable mascot animation"]'
try {
	const page = await browser.newPage()
	await page.setViewport(report.viewport)
	await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "no-preference" }])
	await page.evaluateOnNewDocument(() => localStorage.setItem("sable-docs-theme", "dark"))
	await page.goto(process.env.SABLE_DOCS_URL ?? "http://localhost:4000/", { waitUntil: "networkidle2" })
	await page.evaluate(() => document.fonts.ready)
	const mascot = await page.$(selector)
	const clip = await mascot.boundingBox()
	const start = await page.$eval(selector, button => { button.click(); return performance.now() })
	for (const target of [0, 140, 300, 700]) {
		await page.waitForFunction((origin, time) => performance.now() - origin >= time, {}, start, target)
		const timestampMs = await page.evaluate(origin => Math.round(performance.now() - origin), start)
		const path = `mascot-${target}.png`
		await page.screenshot({ path: resolve(out, path), clip })
		report.frames.push({ path, timestampMs })
	}
	const finished = await mascot.$eval("circle", eye => eye.getAttribute("r"))
	await mascot.focus()
	await page.keyboard.press("Enter")
	await page.keyboard.press("Space")
	await page.waitForFunction(s => document.querySelector(s + " circle")?.getAttribute("r") === "1.4", {}, selector)
	if (await mascot.$eval("circle", eye => eye.getAttribute("r")) !== finished) throw new Error("Interrupted replay did not finish at the profile")
	report.checks.push("Enter and Space replay; repeated activation settles at the final profile")
	await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }])
	await mascot.click()
	if (await mascot.$eval("circle", eye => eye.getAttribute("r")) !== finished) throw new Error("Reduced-motion replay did not settle immediately")
	report.checks.push("Reduced-motion replay snaps to the final profile")
	const client = await page.createCDPSession()
	const tree = await client.send("Accessibility.getFullAXTree")
	for (const name of ["Email updates", "Weekly summary"]) {
		if (!tree.nodes.some(node => node.role?.value === "switch" && node.name?.value === name)) throw new Error(`Switch has no accessible name: ${name}`)
	}
	report.checks.push("Both sample switches expose their visible labels as accessible names")
	writeFileSync(resolve(out, "motion-report.json"), JSON.stringify(report, null, 2) + "\n")
	const html = `<!doctype html><html lang="en"><meta charset="utf-8"><title>Sable mascot frame review</title><style>body{font:16px system-ui;max-width:700px;margin:40px auto;padding:20px}img{display:block;background:#090a0a;margin:20px 0}button{padding:10px;margin-right:10px}</style><h1>Sable mascot frame review</h1><p>Desktop, dark, full motion. Actual frames sampled after replay. Timestamps are measured before each capture; these frames do not establish continuous smoothness or frame rate.</p><img id="frame" alt="Sampled Sable mascot animation frame"><p id="time"></p><button id="previous">Previous frame</button><button id="next">Next frame</button><script>const frames=${JSON.stringify(report.frames)};let index=0;function show(){document.querySelector('#frame').src=frames[index].path;document.querySelector('#time').textContent='Frame '+(index+1)+' of '+frames.length+' · '+frames[index].timestampMs+' ms after replay'}document.querySelector('#previous').onclick=()=>{index=Math.max(0,index-1);show()};document.querySelector('#next').onclick=()=>{index=Math.min(frames.length-1,index+1);show()};show()</script></html>`
	writeFileSync(resolve(out, "motion-review.html"), html)
	await page.goto(pathToFileURL(resolve(out, "motion-review.html")).href)
	await page.click("#next")
	if (!await page.$eval("#time", element => element.textContent.startsWith("Frame 2"))) throw new Error("Saved frame viewer cannot advance")
	console.log(`Mascot checks passed; ${report.frames.length} sampled frames and working viewer.`)
} finally {
	await browser.close()
}

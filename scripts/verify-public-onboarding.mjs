// Reuses the existing docs server. This script never starts an app instance.
import puppeteer from "puppeteer"
import { execFileSync } from "node:child_process"
import { createHash } from "node:crypto"
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const out = join(root, ".evidence/home")
const base = process.env.SABLE_DOCS_URL ?? "http://localhost:4000"
const assert = (condition, message) => { if (!condition) throw new Error(message) }
mkdirSync(out, { recursive: true })
const browser = await puppeteer.launch({ headless: true })
const report = { server: base, routes: [], artifacts: [], checks: [], errors: [], sourceHash: null }
try {
	const page = await browser.newPage()
	page.on("pageerror", error => report.errors.push(error.message))
	async function load(route) {
		await page.goto(new URL(route, base).href, { waitUntil: "networkidle2" })
		await page.waitForSelector("h1")
		await page.evaluate(() => document.fonts.ready)
	}
	async function clickButton(label) {
		for (const button of await page.$$("button")) {
			if (await button.evaluate((element, expected) => element.textContent?.trim() === expected, label)) {
				await button.click()
				return
			}
		}
		throw new Error(`No button labeled ${label}`)
	}
	async function capture(name, route, viewport, mode, reducedMotion = false) {
		await page.setViewport(viewport)
		await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: reducedMotion ? "reduce" : "no-preference" }])
		const modeScript = await page.evaluateOnNewDocument(value => localStorage.setItem("sable-docs-theme", value), mode)
		await load(route)
		await page.removeScriptToEvaluateOnNewDocument(modeScript.identifier)
		assert(await page.evaluate(value => document.documentElement.classList.contains("dark") === (value === "dark"), mode), "Theme preference did not apply")
		const state = await page.evaluate(() => ({
			heading: document.querySelector("h1")?.textContent,
			headings: document.querySelectorAll("h1").length,
			overflow: document.documentElement.scrollWidth > window.innerWidth,
			title: document.title,
			switches: document.querySelectorAll('[role="switch"]').length,
		}))
		assert(state.headings === 1, `${route}: expected one h1`)
		assert(!state.overflow, `${route} overflows at ${viewport.width}px`)
		const path = join(out, `${name}.png`)
		await page.screenshot({ path, fullPage: true })
		report.artifacts.push({ path: `${name}.png`, sha256: createHash("sha256").update(readFileSync(path)).digest("hex"), route, viewport, mode, reducedMotion, state })
	}
	for (const mode of ["dark", "light"]) {
		await capture(`home-${mode}-desktop`, "/", { width: 1440, height: 1000 }, mode)
		await capture(`home-${mode}-mobile`, "/", { width: 390, height: 844 }, mode)
	}
	await capture("docs-wide-desktop", "/button", { width: 1440, height: 1000 }, "dark")
	const wide = await page.$eval("main [style*=max-width]", element => element.getBoundingClientRect().width)
	assert(wide > 900, `Docs pane remains too narrow: ${wide}px`)
	assert(await page.$('header a[href="https://github.com/sableui/sable"]'), "Docs header has no repository link")
	await capture("home-dark-320-reduced", "/", { width: 320, height: 740 }, "dark", true)
	assert(!await page.$("aside"), "Home still renders the docs sidebar")
	assert(await page.$('header a[href="https://github.com/sableui/sable"]'), "Home header has no repository link")
	const mascot = await page.$('button[aria-label="Replay Sable mascot animation"]')
	assert(mascot, "Prominent mascot missing")
	assert(await mascot.$eval("svg", svg => svg.getBoundingClientRect().width >= 90), "Mascot still renders at icon size")
	const settledEye = await mascot.$eval("circle", eye => eye.getAttribute("r"))
	await mascot.click()
	assert(await mascot.$eval("circle", eye => eye.getAttribute("r")) === settledEye, "Reduced-motion replay did not settle immediately")
	await page.click('main a[href="/getting-started"]')
	await page.waitForFunction(() => document.querySelector("h1")?.textContent === "Get started")
	await page.waitForFunction(() => document.activeElement?.tagName === "H1")
	assert((await page.title()) === "Get started — Sable", "Navigation did not update title")
	await page.keyboard.press("Tab")
	assert(await page.evaluate(() => document.activeElement?.tagName === "BUTTON"), "Tab did not reach the first setup control")
	await capture("setup-dark-mobile", "/getting-started", { width: 390, height: 844 }, "dark", true)
	await capture("setup-light-desktop", "/getting-started", { width: 1440, height: 1000 }, "light")
	await capture("credits-dark-desktop", "/credits", { width: 1440, height: 1000 }, "dark")
	await load("/")
	const toggle = await page.$('[role="switch"]')
	assert(toggle, "Homepage has no switch")
	const before = await toggle.evaluate(element => element.getAttribute("aria-checked"))
	await toggle.focus()
	await page.keyboard.press("Space")
	const after = await toggle.evaluate(element => element.getAttribute("aria-checked"))
	assert(before !== after, "Keyboard did not toggle the demo")
	assert(await page.evaluate(() => [...document.querySelectorAll('[role="status"]')].some(e => e.textContent?.includes("off"))), "Toggle feedback was absent")
	await page.screenshot({ path: join(out, "home-keyboard-toggle.png"), fullPage: true })
	report.artifacts.push({ path: "home-keyboard-toggle.png", sha256: createHash("sha256").update(readFileSync(join(out, "home-keyboard-toggle.png"))).digest("hex"), route: "/", viewport: { width: 1440, height: 1000 }, mode: "dark", reducedMotion: false })
	const checkboxes = await page.$$('[role="checkbox"]')
	assert(checkboxes.length === 3, "Sample project has no task controls")
	await checkboxes[2].focus()
	await page.keyboard.press("Space")
	assert(await page.evaluate(() => document.body.innerText.includes("3 of 3 steps complete")), "Task did not update project progress")
	await clickButton("Reset demo")
	assert(await page.evaluate(() => document.body.innerText.includes("0 of 3 steps complete")), "Reset did not clear task progress")
	await clickButton("Verdant")
	await page.waitForFunction(() => document.documentElement.getAttribute("data-sable-theme") === "verdant")
	await capture("home-verdant-desktop", "/", { width: 1440, height: 1000 }, "dark")
	await clickButton("Atelier")
	await capture("home-atelier-mobile", "/", { width: 390, height: 844 }, "light")
	await clickButton("Sable")
	await page.click('main a[href="/customize"]')
	await page.waitForFunction(() => document.title === "Canvas — Sable")
	assert(await page.$('header a[href="/introduction"]'), "Canvas has no return-home link")
	await page.click('header a[href="/introduction"]')
	await page.waitForFunction(() => document.activeElement?.id === "home-heading")
	await browser.defaultBrowserContext().overridePermissions(base, ["clipboard-read", "clipboard-write", "clipboard-sanitized-write"])
	await load("/getting-started")
	const buttons = await page.$$eval("main button", elements => elements.map(e => ({ label: e.getAttribute("aria-label"), text: e.textContent })))
	const copyLabel = buttons.find(e => e.label?.includes("Copy"))?.label
	assert(copyLabel, "Getting started has no copy control")
	await page.click(`main button[aria-label=${JSON.stringify(copyLabel)}]`)
	await page.waitForFunction(async () => (await navigator.clipboard.readText()).includes("pnpm add @sableui/react"), { timeout: 10000 })
	const copied = await page.evaluate(() => navigator.clipboard.readText())
	assert(copied.includes("pnpm add @sableui/react"), "The install command was not copied")
	for (const route of ["/button", "/avatar", "/whats-new", "/themes", "/patterns"]) {
		await load(route)
		report.routes.push({ route, title: await page.title(), h1: await page.$eval("h1", e => e.textContent) })
	}
	assert(report.errors.length === 0, `Browser errors: ${report.errors.join("; ")}`)
	report.checks = ["one h1 per sampled onboarding state", "no horizontal overflow at 320/390/1440", "separate landing without docs sidebar", "docs pane wider than 900px at 1440px", "repository links in home/docs headers", "prominent mascot and immediate reduced-motion replay", "homepage-to-setup navigation", "route title and heading focus across shells", "keyboard switch and status feedback", "task progress and reset", "theme choices", "canvas round trip", "setup configuration clipboard", "representative catalog routes load"]
	const grade = JSON.parse(execFileSync(process.execPath, [join(root, "packages/sable/bin/sable.mjs"), "grade", "apps/docs/src", "apps/docs/public/media", "--json"], { cwd: root, encoding: "utf8" }))
	report.sourceHash = grade.data.sourceHash
	console.log(`Onboarding browser checks passed; ${report.artifacts.length} captures and ${report.routes.length} catalog routes. Source ${report.sourceHash}.`)
} finally {
	writeFileSync(join(out, "browser-review.json"), JSON.stringify(report, null, 2) + "\n")
	await browser.close()
}


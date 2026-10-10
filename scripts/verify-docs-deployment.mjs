// Check the built website using an existing preview or production server.
import puppeteer from "puppeteer"
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"

const base = process.env.SABLE_DOCS_URL ?? "http://localhost:4173"
const out = resolve(".vercel/verification")
mkdirSync(out, { recursive: true })
const registry = JSON.parse(readFileSync("packages/sable/registry.json", "utf8"))
const slug = (name) => name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()
const routes = ["/", "/getting-started", "/credits", "/customize", "/patterns", "/whats-new", ...registry.components.map(c => `/${slug(c.name)}`)]
const report = { base, routes: [], errors: [] }
const browser = await puppeteer.launch({ headless: true })
try {
	const page = await browser.newPage()
	await page.setCacheEnabled(false)
	page.on("pageerror", error => report.errors.push(error.message))
	await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }])
	const widths = (process.env.SABLE_DOCS_WIDTHS ?? "1440,390").split(",").map(Number)
	for (const width of widths) {
		await page.setViewport({ width, height: 900 })
		for (const route of width === 1440 && !process.env.SABLE_DOCS_SMOKE ? routes : routes.slice(0, 6)) {
			const response = await page.goto(new URL(route, base).href, { waitUntil: "networkidle2" })
			await page.waitForSelector("h1", { timeout: 15000 })
			const state = await page.evaluate(() => ({
				heading: document.querySelector("h1")?.textContent?.trim(),
				h1Count: document.querySelectorAll("h1").length,
				overflow: document.documentElement.scrollWidth > window.innerWidth,
				title: document.title,
			}))
			// Component examples can intentionally include another PageHeader.
			if (!response.ok() || !state.heading || state.overflow) {
				throw new Error(`${route} at ${width}px: ${response.status()} ${JSON.stringify(state)}`)
			}
			report.routes.push({ route, width, status: response.status(), ...state })
			if (["/", "/getting-started", "/customize"].includes(route)) {
				await page.screenshot({ path: resolve(out, `${route.slice(1) || "home"}-${width}.png`), fullPage: true })
			}
		}
	}
	await page.goto(new URL("/", base).href, { waitUntil: "networkidle2" })
	const links = await page.$$('a[href="/getting-started"]')
	let clicked = false
	for (const link of links) {
		if (await link.evaluate(element => element.getBoundingClientRect().width > 0)) {
			await link.click()
			clicked = true
			break
		}
	}
	if (!clicked) throw new Error("Get started has no visible link.")
	await page.waitForFunction(() => location.pathname === "/getting-started" && document.querySelector("h1")?.textContent?.includes("Get started"))
	await page.reload({ waitUntil: "networkidle2" })
	await page.waitForSelector("h1")
	if (report.errors.length) throw new Error(report.errors.join("\n"))
	console.log(`Verified ${report.routes.length} route/viewport combinations, navigation and direct reload; no browser errors.`)
} finally {
	writeFileSync(resolve(out, "report.json"), `${JSON.stringify(report, null, 2)}\n`)
	await browser.close()
}

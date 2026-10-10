/** Render every document route against the running docs server. */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import ts from "typescript"
import puppeteer from "puppeteer"

const docsRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const source = ts.createSourceFile("App.tsx", readFileSync(resolve(docsRoot, "src/App.tsx"), "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
let routes = []
function visit(node) {
	if (ts.isVariableDeclaration(node) && node.name.getText(source) === "pages") {
		routes = node.initializer.properties.map(property => property.name.text)
	}
	ts.forEachChild(node, visit)
}
visit(source)
if (!routes.length) throw new Error("No document routes found")
// Home, Canvas and full-page pattern previews own product layouts. The rest
// of the route map, plus Guidelines, are documentation pages.
routes = [...routes.filter(route => route !== "introduction"), "guidelines"]
const origin = process.env.DOCS_URL ?? "http://localhost:4000"
const evidence = resolve(docsRoot, "../../.evidence/docs-widths")
mkdirSync(evidence, { recursive: true })
const browser = await puppeteer.launch({ headless: true })
const results = []
try {
	const page = await browser.newPage()
	await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }])
	for (const width of [1800, 390]) {
		await page.setViewport({ width, height: 1000 })
		for (const route of routes) {
			// Open the URL fresh so a previous lazy page cannot supply this
			// route's heading or geometry while its replacement is loading.
			await page.goto(`${origin}/${route}?theme=base&mode=light`, { waitUntil: "domcontentloaded" })
			await page.waitForSelector("main h1")
			await page.evaluate(() => document.fonts.ready)
			// Lazy imports and disclosure animations settle before geometry reads.
			await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
			await page.evaluate(() => {
				for (const button of document.querySelectorAll("main button[aria-expanded='false']")) {
					if (button.textContent.includes("Developer details")) button.click()
				}
			})
			await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
			const geometry = await page.evaluate(() => {
				const main = document.querySelector("main")
				const failures = []
				const probe = document.createElement("div")
				probe.style.cssText = "position:fixed;visibility:hidden;pointer-events:none;width:var(--measure-prose);height:0"
				main.append(probe)
				const prose = [...main.querySelectorAll("p,blockquote,li")].filter(element => {
					if (element.closest("[data-docs-example],table")) return false
					if (element.tagName === "LI" && element.querySelector("p")) return false
					return element.textContent.trim().length > 65 && element.getBoundingClientRect().height > 0
				})
				for (const element of prose) {
					const style = getComputedStyle(element.querySelector("span.text-body-md") ?? element)
					probe.style.font = style.font
					const limit = probe.getBoundingClientRect().width
					const actual = element.getBoundingClientRect().width
					if (actual > limit + 2) failures.push({ kind: "prose", width: Math.round(actual), limit: Math.round(limit), text: element.textContent.trim().slice(0, 120) })
				}
				probe.remove()
				const actions = [...main.querySelectorAll("button.inline-flex,a.inline-flex")].filter(element => !element.closest("[data-docs-example],table"))
				for (const element of actions) {
					const actual = element.getBoundingClientRect().width
					if (actual > 450) failures.push({ kind: "action", width: Math.round(actual), text: element.textContent.trim().slice(0, 100) })
				}
				if (document.documentElement.scrollWidth > innerWidth + 2) failures.push({ kind: "page-overflow", width: document.documentElement.scrollWidth, viewport: innerWidth })
				return { title: main.querySelector("h1")?.textContent, prose: prose.length, actions: actions.length, failures }
			})
			results.push({ route, viewport: width, ...geometry })
			if (geometry.failures.length) console.log(JSON.stringify(results.at(-1)))
		}
		console.log(`Checked ${routes.length} document routes at ${width}px.`)
	}
} finally {
	await browser.close()
}
writeFileSync(resolve(evidence, "geometry.json"), JSON.stringify(results, null, 2) + "\n")
const failures = results.filter(result => result.failures.length)
if (failures.length) {
	console.error(`${failures.length} route/viewport checks need attention.`)
	process.exitCode = 1
} else {
	console.log(`Document widths pass: ${results.length} route/viewport checks.`)
}

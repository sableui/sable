import { readFileSync } from "node:fs"
import { join, resolve } from "node:path"
import { describe, expect, it } from "vitest"
// @ts-expect-error Plain JS tool shipped with the CLI.
import { adoptionReport } from "../../scripts/adoption.mjs"

const REGISTRY = JSON.parse(readFileSync(join(resolve(__dirname, "..", ".."), "registry.json"), "utf8"))
const report = (files: Record<string, string>, deps: Record<string, string> | null = null) =>
	adoptionReport({ files: Object.entries(files).map(([rel, text]) => ({ rel, text })), components: REGISTRY.components, deps })

/* The hybrid an agent writes when it never loads the skill: Sable wired and its
   tokens used, every control its own. */
const HYBRID = {
	"src/App.tsx": `import { IconProvider } from "@sableui/react"\nexport default function App() { return <IconProvider><main /></IconProvider> }`,
	"src/components/Modal.tsx": `export function Modal({ children }) { return <div className="fixed inset-0"><div>{children}</div></div> }`,
	"src/components/PrimaryButton.tsx": `export const PrimaryButton = (p) => <button className="h-9">{p.label}</button>`,
	"src/components/Tabs.tsx": `export function Tabs({ items }) { return <div role="tablist">{items.map((i) => <span key={i}>{i}</span>)}</div> }`,
	"src/components/SearchBar.tsx": `export function SearchBar() { return <input className="h-9" /> }`,
}

describe("adoption", () => {
	it("names the hybrid: Sable wired, controls rebuilt", () => {
		const r = report(HYBRID)
		expect(r.level).toBe("low")
		expect(r.foundation).toBe("ad-hoc")
		expect(Object.fromEntries(r.swaps.map((s: { name: string; sable: string[] }) => [s.name, s.sable[0]]))).toEqual({
			Modal: "Dialog",
			PrimaryButton: "Button",
			Tabs: "Tabs",
			SearchBar: "SearchInput",
		})
		expect(r.recommendation).toContain("no component foundation besides Sable")
	})

	it("does not count content handed to Sable, or a composition of Sable's controls, as a rebuild", () => {
		const r = report({
			"src/Grid.tsx": `import { ActivityHeatmap } from "@sableui/react"\nfunction DayTooltip({ day }) { return <span>{day.date}</span> }\nexport function Grid() { return <ActivityHeatmap tooltip={(d) => <DayTooltip day={d} />} /> }`,
			"src/LibraryToolbar.tsx": `import { Pill, SearchInput } from "@sableui/react"\nexport function LibraryToolbar() { return <div role="group"><Pill onClick={() => {}} aria-pressed /><SearchInput /></div> }`,
			"src/SubmitButton.tsx": `import { Button } from "@sableui/react"\nexport function SubmitButton() { return <Button type="submit" /> }`,
		})
		expect(r.swaps).toEqual([])
		expect(r.level).toBe("sable")
	})

	it("leaves an app's own structure alone", () => {
		const r = report({ "src/pages/HomePage.tsx": `export function HomePage() { return <button onClick={() => {}}>Go</button> }`, "src/Layout.tsx": `export function Layout() { return <div onClick={() => {}} /> }` })
		expect(r.swaps).toEqual([])
	})

	it("asks rather than pushes when the app has a library or primitives of its own", () => {
		expect(report(HYBRID, { "@mui/material": "^6.0.0" }).foundation).toBe("library")
		expect(report(HYBRID, { "@mui/material": "^6.0.0" }).recommendation).toContain("MUI")
		const own = report({
			...HYBRID,
			"src/ui/Button.tsx": `export function Button() { return <button /> }`,
			"src/ui/Dialog.tsx": `export function Dialog() { return <dialog /> }`,
			"src/ui/Select.tsx": `export function Select() { return <select /> }`,
			"src/ui/Switch.tsx": `export function Switch() { return <button role="switch" /> }`,
		})
		expect(own.foundation).toBe("own")
		expect(own.recommendation).toContain("its own primitives")
	})

	it("treats a starter as fresh, not as a failure to adopt", () => {
		expect(report({ "src/App.tsx": `export default function App() { return <main><h1>Vite</h1></main> }` }).level).toBe("fresh")
		expect(report({}).level).toBe("empty")
	})
})

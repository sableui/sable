import { createHash } from "node:crypto"
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
// @ts-expect-error Plain JS tool shipped with the CLI.
import { changelogMentions, componentFiles, patchChecks } from "../../scripts/patches.mjs"

const CARD = "dist/components/card/card.js"
const sha = (text: string) => createHash("sha256").update(text).digest("hex").slice(0, 16)

let pkg: string
let app: string

/** A fake installed Sable at `version`, shipping `shipped` as card.js; `installed` is what is on disk. */
function install(version: string, shipped: string, installed = shipped, changelog = "") {
	rmSync(pkg, { recursive: true, force: true })
	mkdirSync(join(pkg, "dist/components/card"), { recursive: true })
	writeFileSync(join(pkg, "package.json"), JSON.stringify({ version }))
	writeFileSync(join(pkg, "registry.json"), JSON.stringify({ components: [{ name: "Card", path: "components/card", subcomponents: [{ name: "CardList" }] }] }))
	writeFileSync(join(pkg, CARD), installed)
	writeFileSync(join(pkg, "dist/components/card/card.meta.js"), "meta")
	writeFileSync(join(pkg, "dist/components/card/index.js"), "barrel")
	writeFileSync(join(pkg, "dist/file-hashes.json"), JSON.stringify({ [CARD]: sha(shipped) }))
	writeFileSync(join(pkg, "CHANGELOG.md"), `# What's new\n\n${changelog}`)
}

function record(version: string, shippedThen: string) {
	mkdirSync(join(app, ".sable"), { recursive: true })
	writeFileSync(
		join(app, ".sable/patches.json"),
		JSON.stringify({ patches: [{ component: "Card", files: [CARD], version, base: { [CARD]: sha(shippedThen) }, reason: "table hover pokes past the corners", repro: "hover the last row of a flush table" }] }),
	)
}

beforeEach(() => {
	pkg = mkdtempSync(join(tmpdir(), "sable-pkg-"))
	app = mkdtempSync(join(tmpdir(), "sable-app-"))
	writeFileSync(join(app, "package-lock.json"), "{}")
})
afterEach(() => {
	rmSync(pkg, { recursive: true, force: true })
	rmSync(app, { recursive: true, force: true })
})

describe("sable patch", () => {
	it("resolves a component, or one of its parts, to its own modules", () => {
		install("0.7.1", "v1")
		expect(componentFiles(pkg, "CardList")).toEqual({ component: "Card", files: [CARD] })
		expect(componentFiles(pkg, "Nope")).toBeNull()
	})

	it("passes an applied patch on the version it was made for, and warns when it is not applied", () => {
		install("0.7.1", "v1", "v1 patched")
		record("0.7.1", "v1")
		expect(patchChecks(pkg, app, "0.7.1")[0]).toMatchObject({ status: "pass", name: "patch:Card" })
		install("0.7.1", "v1")
		expect(patchChecks(pkg, app, "0.7.1")[0]).toMatchObject({ status: "warn" })
	})

	it("fails after an upgrade that changed the patched file, citing the changelog, until the repro decides", () => {
		install("0.8.0", "v2", "v2", "## 0.8.0\n\n- **A table in a flush `Card` keeps its corners.** Clipped.\n- **Toggle gap.** Spaced.\n\n## 0.7.1\n\n- **Card thing.** Older.\n")
		record("0.7.1", "v1")
		const [check] = patchChecks(pkg, app, "0.8.0")
		expect(check.status).toBe("fail")
		expect(check.detail).toContain("Sable changed dist/components/card/card.js")
		expect(check.detail).toContain("Changelog: 0.8.0: A table in a flush `Card` keeps its corners.")
		expect(check.detail).not.toContain("corners..")
		expect(check.detail).not.toContain("Older")
		expect(check.fix).toContain("hover the last row of a flush table")
		expect(check.fix).toContain("sable patch Card --drop")
	})

	it("fails when Sable left the file alone but the patch did not carry over, and passes when it did", () => {
		install("0.8.0", "v1")
		record("0.7.1", "v1")
		expect(patchChecks(pkg, app, "0.8.0")[0]).toMatchObject({ status: "fail" })
		expect(patchChecks(pkg, app, "0.8.0")[0].detail).toContain("not applied")
		install("0.8.0", "v1", "v1 patched")
		expect(patchChecks(pkg, app, "0.8.0")[0]).toMatchObject({ status: "pass" })
	})

	it("reads only the changelog between the patch and the installed version", () => {
		install("0.9.0", "v3", "v3", "## 0.9.0\n\n- **Card a.** x\n\n## 0.8.0\n\n- **Card b.** y\n\n## 0.7.1\n\n- **Card c.** z\n")
		expect(changelogMentions(pkg, "Card", "0.7.1", "0.8.0")).toEqual(["0.8.0: Card b"])
	})
})

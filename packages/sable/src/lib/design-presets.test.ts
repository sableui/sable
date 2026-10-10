import { execFileSync, spawnSync } from "node:child_process"
import { mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { describe, expect, it } from "vitest"

const cli = resolve(import.meta.dirname, "../../bin/sable.mjs")
const template = () => JSON.parse(execFileSync(process.execPath, [cli, "preset", "--template", "--json"], { encoding: "utf8" })).data

describe("preset CLI", () => {
	it("validates its complete template and compiles scoped CSS from a project file", () => {
		const root = mkdtempSync(join(tmpdir(), "sable-preset-cli-"))
		try {
			const preset = template()
			preset.id = "my-shop"
			const file = join(root, "my-shop.json")
			writeFileSync(file, JSON.stringify(preset))
			const checked = JSON.parse(execFileSync(process.execPath, [cli, "preset", "--check", file, "--json"], { cwd: root, encoding: "utf8" }))
			expect(checked.data).toMatchObject({ valid: true, id: "my-shop", revision: 1 })
			const css = execFileSync(process.execPath, [cli, "preset", "--css", file], { cwd: root, encoding: "utf8" })
			expect(css).toContain('[data-sable-theme="my-shop"]')
			expect(css).toContain("--primary:")
			expect(css).not.toMatch(/var\(--(?:zinc|white|torch-red)/)
		} finally { rmSync(root, { recursive: true, force: true }) }
	})
	it.each([["--template", "--unknown"], ["--check"], ["--template", "--css", "x.json"]])("reports invalid flags and missing input: %j", (...args) => {
		const result = spawnSync(process.execPath, [cli, "preset", ...args, "--json"], { encoding: "utf8" })
		expect(result.status).toBe(1)
		expect(JSON.parse(result.stderr)).toMatchObject({ type: "error", code: "ERR_PRESET_INVALID" })
	})
})

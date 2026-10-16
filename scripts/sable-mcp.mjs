/**
 * The hosted Sable MCP server, served at sableui.com/api/mcp (see api/mcp.mjs).
 *
 * It answers from the `sable` CLI of a *published* @sableui/react version, run
 * out of that version's own npm tarball, never from this workspace. So every
 * answer is exactly what `pnpm exec sable …` prints for someone who has that
 * version installed: one source of truth, nothing unreleased, and an older
 * version is one `version` argument away.
 *
 * Once the package is installed, the CLI is still the better path: it works
 * offline and can't drift from node_modules. The server says so in its
 * instructions. The server is for discovery before an install, and for anyone
 * who prefers MCP.
 *
 * Stateless Streamable HTTP: one JSON-RPC message per POST, a JSON reply, no
 * sessions and no SSE. Three tools with short descriptions, because a client
 * loads tool definitions into every session where the server is configured.
 */

import { execFile } from "node:child_process"
import { createHash, randomUUID } from "node:crypto"
import { existsSync, mkdirSync, renameSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join, normalize, sep } from "node:path"
import { gunzipSync } from "node:zlib"

const PACKAGE = "@sableui/react"
const PACKUMENT_URL = "https://registry.npmjs.org/@sableui%2freact"
const PACKUMENT_TTL_MS = 5 * 60_000
const CACHE_DIR = join(tmpdir(), "sable-mcp")
const PROTOCOLS = ["2025-11-25", "2025-06-18", "2025-03-26", "2024-11-05"]

const INSTRUCTIONS = [
	`Sable (${PACKAGE}) catalog: the same answers as the \`sable\` CLI that ships in the package.`,
	"Start with `search`, then `get` the entries it names.",
	"If the project already has the package installed, prefer `pnpm exec sable …`: it runs offline at the installed version.",
	"Otherwise pass `version` (the installed one) so answers match it.",
	"Not installed yet? `pnpm add @sableui/react`, then `pnpm exec sable init`.",
].join(" ")

/* ── Tools. The command each one runs is fixed. Arguments only fill its slots. ── */

const VERSION = {
	type: "string",
	description: `The project's installed ${PACKAGE} version, so answers match it. Default: latest.`,
}
const KINDS = ["component", "block", "pattern", "layout", "provider", "token", "utility"]

const TOOLS = [
	{
		name: "search",
		description:
			"Search Sable: components, blocks, page patterns, layout primitives, providers, tokens, utilities, examples and guides. Start here.",
		inputSchema: {
			type: "object",
			properties: { query: { type: "string", description: 'What the UI needs, e.g. "date range" or "pricing".' }, version: VERSION },
			required: ["query"],
		},
		annotations: { readOnlyHint: true, openWorldHint: false },
	},
	{
		name: "get",
		description:
			"One entry's contract: props, do's and don'ts, accessibility, tokens and examples. Omit name to list everything of that kind.",
		inputSchema: {
			type: "object",
			properties: {
				kind: { type: "string", enum: KINDS },
				name: { type: "string", description: 'e.g. "Button", "PricingCardBlock", "DashboardPage".' },
				detail: { type: "string", enum: ["brief", "compact", "full"], description: "Default compact; full adds every example." },
				version: VERSION,
			},
			required: ["kind"],
		},
		annotations: { readOnlyHint: true, openWorldHint: false },
	},
	{
		name: "docs",
		description: "Sable's guides: setup, building with Sable, theming, foundations, tasks. Omit slug to list them.",
		inputSchema: {
			type: "object",
			properties: { slug: { type: "string", description: 'e.g. "building-with-sable".' }, version: VERSION },
		},
		annotations: { readOnlyHint: true, openWorldHint: false },
	},
]

class ToolError extends Error {}

/** A CLI argument from the caller. Never a flag, so a name can't turn into an option. */
function word(value, field) {
	if (typeof value !== "string" || !value.trim()) throw new ToolError(`\`${field}\` must be a non-empty string.`)
	if (value.trim().startsWith("-")) throw new ToolError(`\`${field}\` can't start with "-".`)
	return value.trim()
}

function cliArgs(tool, args) {
	switch (tool) {
		case "search":
			return ["search", word(args.query, "query")]
		case "get": {
			if (!KINDS.includes(args.kind)) throw new ToolError(`\`kind\` must be one of ${KINDS.join(", ")}.`)
			const detail = args.detail === undefined ? [] : ["--detail", args.detail]
			if (detail.length && !["brief", "compact", "full"].includes(args.detail)) {
				throw new ToolError("`detail` must be brief, compact or full.")
			}
			return args.name === undefined ? [args.kind, "--list", ...detail] : [args.kind, word(args.name, "name"), ...detail]
		}
		case "docs":
			return args.slug === undefined ? ["docs", "--list"] : ["docs", word(args.slug, "slug")]
	}
}

async function callTool(name, args) {
	if (!TOOLS.some((t) => t.name === name)) return null
	try {
		const argv = cliArgs(name, args ?? {})
		const { version, latest } = await resolveVersion(args?.version)
		const root = await packageRoot(version)
		const { ok, text } = await runCli(root, argv)
		const heading = `${PACKAGE} ${version}${version === latest ? " (latest)" : `, latest is ${latest}`}`
		return { content: [{ type: "text", text: `${heading}\n\n${text}` }], ...(ok ? null : { isError: true }) }
	} catch (error) {
		const text = error instanceof ToolError ? error.message : `The server couldn't answer: ${error.message}`
		return { content: [{ type: "text", text }], isError: true }
	}
}

/* ── Versions, resolved against npm. ─────────────────────────────────────────── */

let packument = { at: 0, data: null }

async function published() {
	if (packument.data && Date.now() - packument.at < PACKUMENT_TTL_MS) return packument.data
	const res = await fetch(PACKUMENT_URL, { headers: { accept: "application/vnd.npm.install-v1+json" } })
	if (!res.ok) throw new Error(`npm answered ${res.status} for ${PACKAGE}`)
	packument = { at: Date.now(), data: await res.json() }
	return packument.data
}

async function resolveVersion(requested) {
	const data = await published()
	const latest = data["dist-tags"]?.latest
	// A package.json range ("^0.12.0") names the version the caller means.
	const wanted = requested === undefined || requested === "latest" ? latest : String(requested).trim().replace(/^[\^~=v]+/, "")
	if (!data.versions?.[wanted]) {
		const recent = Object.keys(data.versions ?? {}).slice(-5).reverse()
		throw new ToolError(`${PACKAGE} has no published version "${requested}". Recent versions: ${recent.join(", ")}.`)
	}
	return { version: wanted, latest }
}

/* ── One extracted package per version, cached for the life of the instance. ── */

const roots = new Map()

function packageRoot(version) {
	if (!roots.has(version)) {
		roots.set(
			version,
			extract(version).catch((error) => {
				roots.delete(version)
				throw error
			}),
		)
	}
	return roots.get(version)
}

async function extract(version) {
	const dir = join(CACHE_DIR, version)
	if (!existsSync(join(dir, ".complete"))) {
		const { tarball, integrity } = (await published()).versions[version].dist
		const res = await fetch(tarball)
		if (!res.ok) throw new Error(`npm answered ${res.status} for the ${version} tarball`)
		const bytes = Buffer.from(await res.arrayBuffer())
		const [algorithm, expected] = String(integrity).split("-")
		if (createHash(algorithm).update(bytes).digest("base64") !== expected) {
			throw new Error(`the ${version} tarball failed its integrity check`)
		}
		// Extract beside the target and rename it in, so a half-written package is never served.
		const staging = `${dir}.${randomUUID()}`
		untar(gunzipSync(bytes), staging)
		writeFileSync(join(staging, ".complete"), "")
		rmSync(dir, { recursive: true, force: true })
		renameSync(staging, dir)
	}
	if (!existsSync(join(dir, "bin", "sable.mjs"))) {
		throw new ToolError(`${PACKAGE} ${version} predates the sable CLI this server answers from. Ask for a newer version.`)
	}
	return dir
}

/** Regular files only, from a ustar/pax archive. npm tarballs hold everything under `package/`. */
function untar(tar, dest) {
	let longName = null
	for (let offset = 0; offset + 512 <= tar.length; ) {
		const header = tar.subarray(offset, offset + 512)
		if (header.every((b) => b === 0)) break
		const field = (start, end) => header.subarray(start, end).toString("utf8").replace(/\0[\s\S]*$/, "")
		const size = Number.parseInt(field(124, 136).trim() || "0", 8)
		const type = header[156] === 0 ? "0" : String.fromCharCode(header[156])
		const body = tar.subarray(offset + 512, offset + 512 + size)
		offset += 512 + Math.ceil(size / 512) * 512

		if (type === "x") {
			longName = /\d+ path=([^\n]*)\n/.exec(body.toString("utf8"))?.[1] ?? null
			continue
		}
		if (type === "L") {
			longName = body.toString("utf8").replace(/\0[\s\S]*$/, "")
			continue
		}
		const prefix = field(345, 500)
		const name = longName ?? (prefix ? `${prefix}/${field(0, 100)}` : field(0, 100))
		longName = null
		if (type !== "0") continue

		const out = normalize(join(dest, name.replace(/^[^/]+\//, "")))
		if (!out.startsWith(normalize(dest) + sep)) continue
		mkdirSync(dirname(out), { recursive: true })
		writeFileSync(out, body)
	}
}

function runCli(root, argv) {
	return new Promise((resolve) => {
		execFile(
			process.execPath,
			[join(root, "bin", "sable.mjs"), ...argv],
			// A bare environment: the CLI needs none, and the function's own secrets stay out of it.
			{ cwd: root, env: { PATH: process.env.PATH ?? "" }, timeout: 20_000, maxBuffer: 8 * 1024 * 1024 },
			(error, stdout, stderr) => {
				const text = (error ? stderr || stdout || error.message : stdout).replace(/^\[sable\] /gm, "").trim()
				resolve({ ok: !error, text })
			},
		)
	})
}

/* ── JSON-RPC. ────────────────────────────────────────────────────────────────── */

const result = (id, value) => ({ jsonrpc: "2.0", id, result: value })
const rpcError = (id, code, message) => ({ jsonrpc: "2.0", id, error: { code, message } })

/** One JSON-RPC message in, its reply out, or null for a notification. */
export async function handleMessage(message) {
	if (!message || message.jsonrpc !== "2.0" || typeof message.method !== "string") {
		return rpcError(message?.id ?? null, -32600, "Invalid request")
	}
	if (message.id === undefined) return null
	const { id, method, params } = message
	switch (method) {
		case "initialize":
			return result(id, {
				protocolVersion: PROTOCOLS.includes(params?.protocolVersion) ? params.protocolVersion : PROTOCOLS[0],
				capabilities: { tools: {} },
				serverInfo: { name: "sable", title: "Sable", version: "1.0.0" },
				instructions: INSTRUCTIONS,
			})
		case "ping":
			return result(id, {})
		case "tools/list":
			return result(id, { tools: TOOLS })
		case "tools/call": {
			const answer = await callTool(params?.name, params?.arguments)
			return answer ? result(id, answer) : rpcError(id, -32602, `Unknown tool: ${params?.name}`)
		}
		default:
			return rpcError(id, -32601, `Method not found: ${method}`)
	}
}

const CORS = {
	"access-control-allow-origin": "*",
	"access-control-allow-methods": "POST, OPTIONS",
	"access-control-allow-headers": "content-type, accept, authorization, mcp-protocol-version, mcp-session-id",
}

const json = (body, status = 200) =>
	new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", ...CORS } })

/** The HTTP edge: a web-standard Request in, a Response out. */
export async function handleRequest(request) {
	if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS })
	if (request.method !== "POST") {
		return new Response(`Sable MCP server (Streamable HTTP). Add it to your client at this URL; it takes JSON-RPC over POST.\n`, {
			status: 405,
			headers: { allow: "POST, OPTIONS", "content-type": "text/plain; charset=utf-8", ...CORS },
		})
	}
	let body
	try {
		body = await request.json()
	} catch {
		return json(rpcError(null, -32700, "Parse error"), 400)
	}
	const replies = Array.isArray(body) ? await Promise.all(body.map(handleMessage)) : [await handleMessage(body)]
	const sent = replies.filter(Boolean)
	if (!sent.length) return new Response(null, { status: 202, headers: CORS })
	return json(Array.isArray(body) ? sent : sent[0])
}

// sableui.com/api/mcp: the Sable MCP server. The logic lives in scripts/sable-mcp.mjs.
import { handleRequest } from "../scripts/sable-mcp.mjs"

export function GET(request) {
	return handleRequest(request)
}

export function POST(request) {
	return handleRequest(request)
}

export function OPTIONS(request) {
	return handleRequest(request)
}

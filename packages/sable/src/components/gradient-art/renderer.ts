"use client";

import {
	getShaderNoiseTexture,
	grainGradientFragmentShader,
	grainGradientMeta,
	staticMeshGradientFragmentShader,
	staticMeshGradientMeta,
} from "@paper-design/shaders"

/**
 * One WebGL2 context for every GradientArt on the page.
 *
 * Paper's own ShaderMount creates a context per mount. Browsers cap live WebGL
 * contexts at roughly sixteen and drop the oldest past that, so a list of
 * avatars, or the Blocks page, would lose art as it scrolled. Here one hidden
 * canvas renders each piece once, at its size, and the frame is copied into that
 * instance's own 2D canvas. The art is static, so nothing runs between paints:
 * a paint happens on mount, on resize and when the theme changes.
 *
 * The fragment shaders are Paper's (Apache-2.0, see THIRD_PARTY_NOTICES.md);
 * the package does not export its vertex shader, so VERTEX below is adapted
 * from Paper Shaders 0.0.81 `vertex-shader.js`, cut down to the outputs the two
 * fragment shaders read.
 */

export type ArtVariant = "mesh" | "grain"
export type Rgba = [number, number, number, number]

export interface ArtJob {
	variant: ArtVariant
	/** Mesh: one spot per colour. Grain: the first is the ground, the rest are bands. */
	colors: Rgba[]
	/** 0–1, from the seed: where the spots sit and which way the field turns. */
	seed: number
	width: number
	height: number
	pixelRatio: number
	/** The theme's art character (--art-warp, --art-softness, --art-grain), each 0–1. */
	warp: number
	softness: number
	grain: number
}

/*
 * Adapted from Paper Shaders 0.0.81 (Apache-2.0), dist/vertex-shader.js.
 * Modified: the image and responsive outputs are removed, since neither
 * fragment shader used here reads them.
 */
// mediump, as Paper ships it: grain declares its shared uniforms mediump, and
// a highp vertex stage fails to link against it ("precisions of uniform
// u_pixelRatio differ"), leaving grain on its CSS fallback.
const VERTEX = `#version 300 es
precision mediump float;

layout(location = 0) in vec4 a_position;

uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform float u_originX;
uniform float u_originY;
uniform float u_worldWidth;
uniform float u_worldHeight;
uniform float u_fit;
uniform float u_scale;
uniform float u_rotation;
uniform float u_offsetX;
uniform float u_offsetY;

out vec2 v_objectUV;
out vec2 v_objectBoxSize;
out vec2 v_patternUV;
out vec2 v_patternBoxSize;

vec3 getBoxSize(float boxRatio, vec2 givenBoxSize) {
  vec2 box = vec2(0.);
  box.x = boxRatio * min(givenBoxSize.x / boxRatio, givenBoxSize.y);
  float noFitBoxWidth = box.x;
  if (u_fit == 1.) {
    box.x = boxRatio * min(u_resolution.x / boxRatio, u_resolution.y);
  } else if (u_fit == 2.) {
    box.x = boxRatio * max(u_resolution.x / boxRatio, u_resolution.y);
  }
  box.y = box.x / boxRatio;
  return vec3(box, noFitBoxWidth);
}

void main() {
  gl_Position = a_position;

  vec2 uv = gl_Position.xy * .5;
  vec2 boxOrigin = vec2(.5 - u_originX, u_originY - .5);
  vec2 givenBoxSize = vec2(u_worldWidth, u_worldHeight);
  givenBoxSize = max(givenBoxSize, vec2(1.)) * u_pixelRatio;
  float r = u_rotation * 3.14159265358979323846 / 180.;
  mat2 graphicRotation = mat2(cos(r), sin(r), -sin(r), cos(r));
  vec2 graphicOffset = vec2(-u_offsetX, u_offsetY);

  vec2 fixedRatioBoxGivenSize = vec2(
    (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
    (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );
  v_objectBoxSize = getBoxSize(1., fixedRatioBoxGivenSize).xy;
  vec2 objectWorldScale = u_resolution.xy / v_objectBoxSize;
  v_objectUV = uv;
  v_objectUV *= objectWorldScale;
  v_objectUV += boxOrigin * (objectWorldScale - 1.);
  v_objectUV += graphicOffset;
  v_objectUV /= u_scale;
  v_objectUV = graphicRotation * v_objectUV;

  vec2 patternBoxGivenSize = vec2(
    (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
    (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );
  float patternBoxRatio = patternBoxGivenSize.x / patternBoxGivenSize.y;
  vec3 boxSizeData = getBoxSize(patternBoxRatio, patternBoxGivenSize);
  v_patternBoxSize = boxSizeData.xy;
  float patternBoxNoFitBoxWidth = boxSizeData.z;
  vec2 patternBoxScale = u_resolution.xy / v_patternBoxSize;
  v_patternUV = uv;
  v_patternUV += graphicOffset / patternBoxScale;
  v_patternUV += boxOrigin;
  v_patternUV -= boxOrigin / patternBoxScale;
  v_patternUV *= u_resolution.xy;
  v_patternUV /= u_pixelRatio;
  if (u_fit > 0.) {
    v_patternUV *= (patternBoxNoFitBoxWidth / v_patternBoxSize.x);
  }
  v_patternUV /= u_scale;
  v_patternUV = graphicRotation * v_patternUV;
  v_patternUV += boxOrigin / patternBoxScale;
  v_patternUV -= boxOrigin;
  v_patternUV *= .01;
}
`

const FRAGMENTS: Record<ArtVariant, string> = { mesh: staticMeshGradientFragmentShader, grain: grainGradientFragmentShader }
const MAX_COLORS: Record<ArtVariant, number> = { mesh: staticMeshGradientMeta.maxColorCount, grain: grainGradientMeta.maxColorCount }

/** Grain's shapes, by Paper's numbering; "corners" reads as a lit surface rather than a pattern. */
const GRAIN_CORNERS = 4

interface Program {
	program: WebGLProgram
	uniforms: Map<string, WebGLUniformLocation | null>
}

interface State {
	canvas: HTMLCanvasElement
	gl: WebGL2RenderingContext
	/** null: the variant failed to compile or link, so it stays on its CSS fallback (and logs once). */
	programs: Partial<Record<ArtVariant, Program | null>>
	noise: WebGLTexture | null
	lost: boolean
}

/** undefined: not tried yet. null: WebGL2 is unavailable, so every GradientArt stays CSS. */
let state: State | null | undefined
let noiseImage: HTMLImageElement | null = null
const listeners = new Set<() => void>()

/** Every instance re-paints when the context comes back or the noise texture arrives. */
export function onArtInvalidate(listener: () => void): () => void {
	listeners.add(listener)
	return () => listeners.delete(listener)
}
const invalidate = () => {
	for (const listener of listeners) listener()
}

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
	const shader = gl.createShader(type)
	if (!shader) return null
	gl.shaderSource(shader, source)
	gl.compileShader(shader)
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.error("GradientArt: shader failed to compile", gl.getShaderInfoLog(shader))
		gl.deleteShader(shader)
		return null
	}
	return shader
}

function programFor(s: State, variant: ArtVariant): Program | null {
	const cached = s.programs[variant]
	if (cached !== undefined) return cached
	s.programs[variant] = null
	const { gl } = s
	const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX)
	const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENTS[variant])
	if (!vertex || !fragment) return null
	const program = gl.createProgram()
	if (!program) return null
	gl.attachShader(program, vertex)
	gl.attachShader(program, fragment)
	gl.linkProgram(program)
	gl.deleteShader(vertex)
	gl.deleteShader(fragment)
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error("GradientArt: shader failed to link", gl.getProgramInfoLog(program))
		return null
	}
	const entry = { program, uniforms: new Map() }
	s.programs[variant] = entry
	return entry
}

function setup(s: State) {
	const { gl } = s
	// One quad covering clip space; every program reads it at location 0.
	const buffer = gl.createBuffer()
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW)
	gl.enableVertexAttribArray(0)
	gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
	s.programs = {}
	s.noise = null
	if (noiseImage?.complete && noiseImage.naturalWidth) uploadNoise(s, noiseImage)
}

function uploadNoise(s: State, image: HTMLImageElement) {
	const { gl } = s
	const texture = gl.createTexture()
	gl.activeTexture(gl.TEXTURE0)
	gl.bindTexture(gl.TEXTURE_2D, texture)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
	s.noise = texture
}

function getState(): State | null {
	if (state !== undefined) return state
	if (typeof document === "undefined") return null
	const canvas = document.createElement("canvas")
	// preserveDrawingBuffer: the frame is copied out right after drawing, but a
	// preserved buffer keeps that copy correct whatever the compositor does between.
	const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: true, antialias: false, preserveDrawingBuffer: true })
	if (!gl) {
		state = null
		return state
	}
	const s: State = { canvas, gl, programs: {}, noise: null, lost: false }
	setup(s)
	canvas.addEventListener("webglcontextlost", (event) => {
		// Claim the restore; until it comes, every instance keeps its last frame.
		event.preventDefault()
		s.lost = true
	})
	canvas.addEventListener("webglcontextrestored", () => {
		s.lost = false
		setup(s)
		invalidate()
	})
	state = s
	return state
}

/** Grain samples Paper's noise texture; it decodes once, then every grain instance re-paints. */
function noiseReady(s: State): boolean {
	if (s.noise) return true
	if (!noiseImage) {
		noiseImage = getShaderNoiseTexture() ?? null
		noiseImage?.decode().then(
			() => {
				const current = getState()
				if (current && noiseImage) uploadNoise(current, noiseImage)
				invalidate()
			},
			() => {
				/* never decoded: grain stays on its CSS fallback */
			},
		)
	}
	return false
}

/** Whether this browser can paint shader art at all (WebGL2). */
export function artSupported(): boolean {
	return getState() !== null
}

/**
 * Paint one piece into `target`. Returns false when it could not paint (no
 * WebGL2, a lost context, grain's texture still decoding); the caller keeps
 * showing its CSS fallback and is told to try again through onArtInvalidate.
 */
export function paintArt(target: HTMLCanvasElement, job: ArtJob): boolean {
	const s = getState()
	if (!s || s.lost) return false
	if (job.variant === "grain" && !noiseReady(s)) return false
	const entry = programFor(s, job.variant)
	if (!entry) return false
	const { gl, canvas } = s
	const { width, height } = job

	if (canvas.width !== width || canvas.height !== height) {
		canvas.width = width
		canvas.height = height
	}
	gl.viewport(0, 0, width, height)
	gl.useProgram(entry.program)

	const at = (name: string) => {
		if (!entry.uniforms.has(name)) entry.uniforms.set(name, gl.getUniformLocation(entry.program, name))
		return entry.uniforms.get(name) ?? null
	}
	const float = (name: string, value: number) => gl.uniform1f(at(name), value)

	// Sizing: the art covers its box (fit 2), turned and placed by the seed.
	gl.uniform2f(at("u_resolution"), width, height)
	float("u_pixelRatio", job.pixelRatio)
	float("u_originX", 0.5)
	float("u_originY", 0.5)
	float("u_worldWidth", 0)
	float("u_worldHeight", 0)
	float("u_fit", 2)
	float("u_scale", 1)
	float("u_offsetX", 0)
	float("u_offsetY", 0)

	const max = MAX_COLORS[job.variant]
	const fill = (colors: Rgba[]) => {
		const flat = new Float32Array(max * 4)
		colors.slice(0, max).forEach((color, i) => flat.set(color, i * 4))
		gl.uniform4fv(at("u_colors"), flat)
		float("u_colorsCount", Math.min(colors.length, max))
	}

	if (job.variant === "mesh") {
		// Zoomed out a little: at 1 the frame sees about half the spots, and a
		// seed that parks the rest off-frame paints a near-flat field.
		float("u_scale", 0.72)
		float("u_rotation", job.seed * 360)
		fill(job.colors)
		float("u_positions", job.seed * 100)
		float("u_waveX", job.warp)
		float("u_waveXShift", job.seed)
		float("u_waveY", job.warp)
		float("u_waveYShift", (job.seed * 7.3) % 1)
		float("u_mixing", job.softness)
		// Grain roughens the spots' edges as well as overlaying the film grain.
		float("u_grainMixer", job.grain * 0.6)
		float("u_grainOverlay", job.grain)
	} else {
		const [ground = [0, 0, 0, 1], ...bands] = job.colors
		float("u_rotation", job.seed * 360)
		gl.uniform4fv(at("u_colorBack"), ground)
		fill(bands.length ? bands : [ground])
		// Grain's shapes move with time; a seeded moment gives each piece its own form.
		float("u_time", job.seed * 100)
		float("u_softness", job.softness * 0.8)
		float("u_intensity", 0.15 + job.warp * 0.2)
		float("u_noise", 0.15 + job.grain * 0.5)
		float("u_shape", GRAIN_CORNERS)
		gl.activeTexture(gl.TEXTURE0)
		gl.bindTexture(gl.TEXTURE_2D, s.noise)
		gl.uniform1i(at("u_noiseTexture"), 0)
	}

	gl.clearColor(0, 0, 0, 0)
	gl.clear(gl.COLOR_BUFFER_BIT)
	gl.drawArrays(gl.TRIANGLES, 0, 6)

	if (target.width !== width || target.height !== height) {
		target.width = width
		target.height = height
	}
	const context = target.getContext("2d")
	if (!context) return false
	context.clearRect(0, 0, width, height)
	context.drawImage(canvas, 0, 0)
	return true
}

/* ── Theme tokens → shader colours ────────────────────────────────────────── */

let swatch: CanvasRenderingContext2D | null | undefined
const parsed = new Map<string, Rgba>()

/**
 * A computed CSS colour (any syntax the browser serialises: oklch, color(),
 * rgb) as sRGB floats. The browser's own canvas does the conversion, so every
 * colour space a theme can author converts the way it paints.
 */
export function cssColorToRgba(color: string): Rgba | null {
	const hit = parsed.get(color)
	if (hit) return hit
	if (swatch === undefined) {
		swatch = typeof document === "undefined" ? null : document.createElement("canvas").getContext("2d", { willReadFrequently: true })
		if (swatch) swatch.canvas.width = swatch.canvas.height = 1
	}
	if (!swatch) return null
	swatch.clearRect(0, 0, 1, 1)
	swatch.fillStyle = "transparent"
	swatch.fillStyle = color
	swatch.fillRect(0, 0, 1, 1)
	const [r, g, b, a] = swatch.getImageData(0, 0, 1, 1).data
	const out: Rgba = [r / 255, g / 255, b / 255, a / 255]
	if (parsed.size > 512) parsed.clear()
	parsed.set(color, out)
	return out
}

/* ── Theme changes ────────────────────────────────────────────────────────── */

const themeListeners = new Set<() => void>()
let observer: MutationObserver | null = null
let pending = 0

/**
 * Called after anything that can change a token: the mode class, the preset
 * attribute or inline variables on <html>, and any stylesheet added to or
 * rewritten in <head> (a live theme editor rewrites one per frame). One
 * observer for the page, coalesced to a frame.
 */
export function onThemeChange(listener: () => void): () => void {
	themeListeners.add(listener)
	if (!observer && typeof MutationObserver !== "undefined") {
		const notify = () => {
			if (pending) return
			pending = requestAnimationFrame(() => {
				pending = 0
				for (const fn of themeListeners) fn()
			})
		}
		observer = new MutationObserver(notify)
		observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style", "data-sable-theme"] })
		observer.observe(document.head, { childList: true, subtree: true, characterData: true })
	}
	return () => {
		themeListeners.delete(listener)
		if (!themeListeners.size && observer) {
			observer.disconnect()
			observer = null
			cancelAnimationFrame(pending)
			pending = 0
		}
	}
}

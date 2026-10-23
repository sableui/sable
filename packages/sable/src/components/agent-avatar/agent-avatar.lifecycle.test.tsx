import { act, cleanup, render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { AgentAvatar } from "./agent-avatar"
import { pointer } from "./agent-avatar.loop"

describe("AgentAvatar animation lifecycle", () => {
	let frames: Map<number, FrameRequestCallback>
	let observers: IntersectionObserverCallback[]
	let now: number
	let nextFrame: number
	let hidden: boolean

	beforeEach(() => {
		frames = new Map()
		observers = []
		now = 1000
		nextFrame = 0
		hidden = false
		vi.stubGlobal("matchMedia", (media: string) => ({
			matches: false, media, addEventListener() {}, removeEventListener() {},
		}))
		vi.spyOn(performance, "now").mockImplementation(() => now)
		vi.spyOn(document, "hidden", "get").mockImplementation(() => hidden)
		vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
			frames.set(++nextFrame, callback)
			return nextFrame
		})
		vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id))
		vi.stubGlobal("IntersectionObserver", class {
			constructor(callback: IntersectionObserverCallback) { observers.push(callback) }
			observe() {}
			disconnect() {}
		})
	})

	afterEach(() => {
		cleanup()
		vi.restoreAllMocks()
		vi.unstubAllGlobals()
	})

	const visibility = (index: number, isIntersecting: boolean) => act(() => {
		observers[index]([{ isIntersecting } as IntersectionObserverEntry], {} as IntersectionObserver)
	})
	const advance = (count = 1) => act(() => {
		for (let i = 0; i < count; i++) {
			now += 1000 / 60
			const pending = [...frames.values()]
			frames.clear()
			for (const callback of pending) callback(now)
		}
	})

	it("does not schedule frames for an earlier turn, even when visible", () => {
		render(<AgentAvatar live={false} state="speaking" />)
		visibility(0, true)
		expect(frames.size).toBe(0)
	})

	it("shares one frame, releases hidden avatars, and resumes on return", () => {
		render(<><AgentAvatar /><AgentAvatar /></>)
		visibility(0, true)
		visibility(1, true)
		expect(frames.size).toBe(1)
		visibility(0, false)
		expect(frames.size).toBe(1)
		visibility(1, false)
		expect(frames.size).toBe(0)
		visibility(0, true)
		expect(frames.size).toBe(1)
	})

	it("rests under subtle motion and wakes for a new state", () => {
		const { rerender } = render(<AgentAvatar motion="subtle" />)
		visibility(0, true)
		advance(180)
		expect(frames.size).toBe(0)
		rerender(<AgentAvatar motion="subtle" state="thinking" />)
		expect(frames.size).toBe(1)
		advance(60)
		expect(frames.size).toBe(1)
		rerender(<AgentAvatar motion="subtle" />)
		advance(180)
		expect(frames.size).toBe(0)
	})

	it("suspends a background tab and clears stale pointer attention", () => {
		render(<AgentAvatar />)
		visibility(0, true)
		pointer.on = true
		hidden = true
		act(() => document.dispatchEvent(new Event("visibilitychange")))
		expect(frames.size).toBe(0)
		expect(pointer.on).toBe(false)
		hidden = false
		act(() => document.dispatchEvent(new Event("visibilitychange")))
		expect(frames.size).toBe(1)
	})

	it("cleans up while hidden so returning to the tab cannot restart it", () => {
		const { unmount } = render(<AgentAvatar />)
		visibility(0, true)
		hidden = true
		act(() => document.dispatchEvent(new Event("visibilitychange")))
		unmount()
		hidden = false
		act(() => document.dispatchEvent(new Event("visibilitychange")))
		expect(frames.size).toBe(0)
	})

	it("motion off schedules no frames and still updates the pose", () => {
		const { container, rerender } = render(<AgentAvatar motion="off" />)
		visibility(0, true)
		const before = container.querySelector("svg > g")!.getAttribute("transform")
		rerender(<AgentAvatar motion="off" state="thinking" />)
		expect(container.querySelector("svg > g")!.getAttribute("transform")).not.toBe(before)
		expect(frames.size).toBe(0)
	})

	it("the system reduced-motion setting wins over full motion", () => {
		vi.stubGlobal("matchMedia", (media: string) => ({
			matches: true, media, addEventListener() {}, removeEventListener() {},
		}))
		const { container, rerender } = render(<AgentAvatar motion="full" />)
		visibility(0, true)
		const before = container.querySelector("svg > g")!.getAttribute("transform")
		rerender(<AgentAvatar motion="full" state="speaking" />)
		expect(container.querySelector("svg > g")!.getAttribute("transform")).not.toBe(before)
		expect(frames.size).toBe(0)
	})
})

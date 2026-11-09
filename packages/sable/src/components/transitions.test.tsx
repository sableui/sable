import { act, fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createRef, Profiler } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { MotionProvider, MotionScope } from "../motion/MotionProvider"
import { CardStack } from "./card-stack"
import { TextSwap } from "./text-swap"
import { Tilt } from "./tilt"

afterEach(() => vi.unstubAllGlobals())

describe("TextSwap", () => {
	it("keeps only the latest visual pair and one current accessible string during rapid replacement", () => {
		const view = render(<TextSwap text="Preparing" />)
		expect(view.container.querySelector(".motion-swap-in")).toBeNull()
		view.rerender(<TextSwap text="Ready" />)
		view.rerender(<TextSwap text="Saved" />)
		const root = view.container.firstElementChild!
		expect(root.querySelector(".sr-only")).toHaveTextContent("Saved")
		expect(root.textContent).toBe("Saved")
		expect([...root.querySelectorAll("[data-text]")].map(node => node.getAttribute("data-text"))).toEqual(["Ready", "Saved"])
		expect(root).not.toHaveTextContent("Preparing")
	})
	it("keeps a longer outgoing label on one line", () => {
		const view = render(<TextSwap text="Unsaved changes" />)
		view.rerender(<TextSwap text="Saved" />)
		const outgoing = view.container.querySelector(".motion-swap-out")!
		expect(outgoing).toHaveAttribute("data-text", "Unsaved changes")
		expect(outgoing).toHaveClass("whitespace-pre")
		expect(outgoing).not.toHaveClass("inset-0")
	})
	it.each(["subtle", "off"] as const)("does not revive expressive motion inside a %s scope", level => {
		const content = (text: string) => <MotionProvider policy="full"><MotionScope level={level}><TextSwap text={text} motion="full" /></MotionScope></MotionProvider>
		const view = render(content("Before"))
		view.rerender(content("After"))
		expect(view.container.querySelector(".motion-swap-in")).toBeNull()
		expect(view.container.querySelector(".motion-swap-out")).toBeNull()
		expect(view.container).toHaveTextContent("After")
	})
})

describe("CardStack", () => {
	it("lets the front card expand and collapse by pointer without a separate button", () => {
		render(<CardStack label="Projects" trigger="stack"><div>Research</div><div>Design</div></CardStack>)
		const front = screen.getByRole("button", { name: "Research" })
		const back = screen.getByText("Design").parentElement!
		expect(screen.queryByRole("button", { name: "Browse collection" })).not.toBeInTheDocument()
		expect(back).toHaveAttribute("inert")
		front.focus()
		fireEvent.click(front)
		expect(front).toHaveAttribute("aria-expanded", "true")
		expect(front).toHaveFocus()
		expect(back).not.toHaveAttribute("inert")
		fireEvent.click(front)
		expect(front).toHaveAttribute("aria-expanded", "false")
		expect(front).toHaveFocus()
		expect(back).toHaveAttribute("inert")
	})
	it("supports Enter and Space on the same front card with motion off", async () => {
		const user = userEvent.setup()
		render(<CardStack label="Projects" trigger="stack" motion="off"><div>Research</div><div>Design</div></CardStack>)
		const front = screen.getByRole("button", { name: "Research" })
		front.focus()
		await user.keyboard("{Enter}")
		expect(front).toHaveAttribute("aria-expanded", "true")
		await user.keyboard(" ")
		expect(front).toHaveAttribute("aria-expanded", "false")
		expect(front).toHaveFocus()
	})
	it("does not add a trigger for a single card", () => {
		render(<CardStack label="Projects" trigger="stack"><div>Research</div></CardStack>)
		expect(screen.queryByRole("button")).not.toBeInTheDocument()
	})
	it("keeps back-card controls inert until explicitly expanded, retaining card state", () => {
		render(<CardStack label="Projects" expandLabel="Browse projects"><input aria-label="First project" defaultValue="Research" /><button>Back action</button></CardStack>)
		const back = screen.getByText("Back action").parentElement!
		expect(back).toHaveAttribute("inert")
		expect(back).toHaveAttribute("aria-hidden", "true")
		fireEvent.change(screen.getByLabelText("First project"), { target: { value: "Updated" } })
		fireEvent.click(screen.getByRole("button", { name: "Browse projects" }))
		expect(back).not.toHaveAttribute("inert")
		expect(screen.getByRole("button", { name: "Collapse collection" })).toHaveAttribute("aria-expanded", "true")
		fireEvent.click(screen.getByRole("button", { name: "Collapse collection" }))
		expect(screen.getByLabelText("First project")).toHaveValue("Updated")
		expect(back).toHaveAttribute("inert")
	})
	it("eases the height and every card together, on the theme's timing, from what is on screen", () => {
		const animate = vi.fn(function (this: Element) { return { id: "card-stack-flip", cancel: vi.fn() } as unknown as Animation })
		const real = window.getComputedStyle.bind(window)
		const timing: Record<string, string> = { transitionDuration: "0.3s", transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)" }
		vi.stubGlobal("getComputedStyle", (element: Element) => {
			const style = real(element)
			if (element.getAttribute("data-slot") !== "card-stack") return style
			return new Proxy(style, { get: (target, key) => (typeof key === "string" && key in timing ? timing[key] : Reflect.get(target, key)) })
		})
		const rect = vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
			const stack = this.closest("[data-slot=card-stack]")!
			const open = stack.hasAttribute("data-expanded")
			const box = stack.firstElementChild!
			if (this === box) return { top: 0, height: open ? 320 : 100 } as DOMRect
			const index = [...box.firstElementChild!.children].indexOf(this)
			return { top: open ? index * 110 : 0, height: 100 } as DOMRect
		})
		Element.prototype.animate = animate
		try {
			render(<CardStack label="Projects" trigger="stack"><div>Research</div><div>Design</div><div>Final</div></CardStack>)
			fireEvent.click(screen.getByRole("button", { name: "Research" }))
			const calls = animate.mock.calls as unknown as [Keyframe[], KeyframeAnimationOptions][]
			// The box, then the two cards that move; the front card stays where it is.
			expect(calls.map(([frames]) => frames[0])).toEqual([{ height: "100px" }, { translate: "0 -110px" }, { translate: "0 -220px" }])
			expect(calls[0][1]).toMatchObject({ duration: 300, easing: "cubic-bezier(0.4, 0, 0.2, 1)" })
		} finally {
			// @ts-expect-error jsdom has no animate; remove the stub
			delete Element.prototype.animate
			rect.mockRestore()
		}
	})
	it("leaves controlled expansion to its owner", () => {
		const change = vi.fn()
		render(<CardStack label="Projects" expanded={false} onExpandedChange={change}><div>One</div><div>Two</div></CardStack>)
		fireEvent.click(screen.getByRole("button", { name: "Browse collection" }))
		expect(change).toHaveBeenCalledWith(true)
		expect(screen.getByRole("button", { name: "Browse collection" })).toHaveAttribute("aria-expanded", "false")
	})
})

describe("Tilt", () => {
	let frames: Map<number, FrameRequestCallback>
	let next: number
	beforeEach(() => {
		frames = new Map(); next = 0
		vi.stubGlobal("requestAnimationFrame", vi.fn((callback: FrameRequestCallback) => { frames.set(++next, callback); return next }))
		vi.stubGlobal("cancelAnimationFrame", vi.fn((id: number) => frames.delete(id)))
		vi.stubGlobal("matchMedia", vi.fn((query: string) => ({ matches: query.includes("pointer: fine"), media: query, addEventListener: vi.fn(), removeEventListener: vi.fn() })))
		vi.stubGlobal("PointerEvent", class extends MouseEvent {
			pointerType: string
			constructor(type: string, init: PointerEventInit = {}) { super(type, init); this.pointerType = init.pointerType ?? "mouse" }
		})
	})
	const flush = () => act(() => { const pending = [...frames.values()]; frames.clear(); pending.forEach(callback => callback(16)) })
	it("coalesces samples into one geometry read without a React commit", () => {
		const commits = vi.fn(); const ref = createRef<HTMLDivElement>()
		render(<MotionProvider policy="full"><Profiler id="tilt" onRender={commits}><Tilt ref={ref}>Surface</Tilt></Profiler></MotionProvider>)
		const rect = vi.spyOn(ref.current!, "getBoundingClientRect").mockReturnValue({ top: 0, left: 0, width: 100, height: 100 } as DOMRect)
		commits.mockClear()
		for (let n = 0; n < 10; n++) fireEvent.pointerMove(ref.current!, { clientX: 100, clientY: 100, pointerType: "mouse" })
		expect(frames.size).toBe(1)
		flush()
		expect(rect).toHaveBeenCalledOnce()
		expect(commits).not.toHaveBeenCalled()
		expect(ref.current!.style.transform).toContain("rotateY(6deg)")
	})
	it("ramps the lean up on entry, holds a layer only while leaning, then follows the pointer", () => {
		vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] })
		const real = window.getComputedStyle.bind(window)
		vi.stubGlobal("getComputedStyle", (element: Element) => {
			const style = real(element)
			return element.getAttribute("data-slot") === "tilt"
				? new Proxy(style, { get: (target, key) => (key === "transitionDuration" ? "0.2s" : Reflect.get(target, key)) })
				: style
		})
		const at = (time: number) => act(() => { const pending = [...frames.values()]; frames.clear(); pending.forEach(callback => callback(time)) })
		try {
			const ref = createRef<HTMLDivElement>()
			render(<MotionProvider policy="full"><Tilt ref={ref}>Surface</Tilt></MotionProvider>)
			vi.spyOn(ref.current!, "getBoundingClientRect").mockReturnValue({ top: 0, left: 0, width: 100, height: 100 } as DOMRect)
			expect(ref.current!.style.willChange).toBe("")
			// The pointer arrives at the right edge, where the lean is largest.
			fireEvent.pointerMove(ref.current!, { clientX: 100, clientY: 50, pointerType: "mouse" })
			at(1000)
			expect(ref.current).toHaveAttribute("data-tracking")
			expect(ref.current!.style.willChange).toBe("transform")
			expect(ref.current!.style.transform).toContain("rotateY(0deg)")
			// It keeps drawing with the pointer still, and reaches the full lean at the end.
			at(1100)
			const halfway = Number(/rotateY\(([\d.]+)deg\)/.exec(ref.current!.style.transform)![1])
			expect(halfway).toBeGreaterThan(3)
			expect(halfway).toBeLessThan(6)
			at(1200)
			expect(ref.current!.style.transform).toContain("rotateY(6deg)")
			expect(frames.size).toBe(0)
			fireEvent.pointerLeave(ref.current!)
			expect(ref.current).not.toHaveAttribute("data-tracking")
			expect(ref.current!.style.transform).toBe("")
			// The layer stays for the return to flat, then goes.
			expect(ref.current!.style.willChange).toBe("transform")
			act(() => vi.runAllTimers())
			expect(ref.current!.style.willChange).toBe("")
		} finally {
			vi.useRealTimers()
		}
	})
	it("does nothing at maxAngle 0", () => {
		const ref = createRef<HTMLDivElement>()
		render(<MotionProvider policy="full"><Tilt ref={ref} maxAngle={0}>Surface</Tilt></MotionProvider>)
		fireEvent.pointerMove(ref.current!, { clientX: 100, clientY: 50, pointerType: "mouse" })
		expect(frames.size).toBe(0)
		expect(ref.current!.style.willChange).toBe("")
	})
	it("cancels queued work on leaving, policy change and unmount", () => {
		const ref = createRef<HTMLDivElement>()
		const content = (policy: "full" | "off") => <MotionProvider policy={policy}><Tilt ref={ref}>Surface</Tilt></MotionProvider>
		const view = render(content("full"))
		fireEvent.pointerMove(ref.current!, { pointerType: "mouse" })
		fireEvent.pointerLeave(ref.current!)
		expect(frames.size).toBe(0)
		fireEvent.pointerMove(ref.current!, { pointerType: "mouse" })
		view.rerender(content("off"))
		expect(frames.size).toBe(0)
		fireEvent.pointerMove(ref.current!, { pointerType: "mouse" })
		expect(frames.size).toBe(0)
		view.rerender(content("full"))
		fireEvent.pointerMove(ref.current!, { pointerType: "mouse" })
		view.unmount()
		expect(frames.size).toBe(0)
	})
	it("preserves consumer cancellation and ignores touch", () => {
		const ref = createRef<HTMLDivElement>()
		render(<MotionProvider policy="full"><Tilt ref={ref} onPointerMove={event => event.preventDefault()}>Surface</Tilt></MotionProvider>)
		fireEvent.pointerMove(ref.current!, { pointerType: "mouse", cancelable: true })
		fireEvent.pointerMove(ref.current!, { pointerType: "touch" })
		expect(frames.size).toBe(0)
	})
})

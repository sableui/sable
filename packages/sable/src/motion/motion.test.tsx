import { type CSSProperties, createRef } from "react"
import { act, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { MotionProvider, MotionScope, type MotionLevel, type MotionPolicy, useMotion, useMotionLevel } from "./MotionProvider"
import { Presence } from "./Presence"
import { Reveal } from "./Reveal"
import { TextReveal } from "./TextReveal"

interface AnimationStub {
	onfinish: (() => void) | null
	oncancel: (() => void) | null
	cancel: ReturnType<typeof vi.fn>
}

let animations: AnimationStub[]
let animate: ReturnType<typeof vi.fn>
let intersection: IntersectionObserverCallback
let observerOptions: IntersectionObserverInit | undefined
let disconnect: ReturnType<typeof vi.fn>

beforeEach(() => {
	animations = []
	animate = vi.fn(() => {
		const animation: AnimationStub = {
			onfinish: null,
			oncancel: null,
			cancel: vi.fn(() => animation.oncancel?.()),
		}
		animations.push(animation)
		return animation
	})
	vi.stubGlobal("IntersectionObserver", class {
		constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
			intersection = callback
			observerOptions = options
		}
		observe() {}
		disconnect = disconnect = vi.fn()
	})
	Object.defineProperty(Element.prototype, "animate", { value: animate, configurable: true })
})

afterEach(() => {
	vi.unstubAllGlobals()
	Reflect.deleteProperty(Element.prototype, "animate")
	document.documentElement.removeAttribute("data-motion")
})

function visible(ratio: number, isIntersecting = ratio > 0) {
	act(() => intersection([
		{ isIntersecting, intersectionRatio: ratio } as IntersectionObserverEntry,
	], {} as IntersectionObserver))
}

describe("Presence lifecycle", () => {
	it("animates the actual node when an initially hidden child opens, including after a completed exit", () => {
		const complete = vi.fn(() => expect(screen.queryByText("Panel")).not.toBeInTheDocument())
		const content = (show: boolean) => <Presence show={show} onExitComplete={complete}><div>Panel</div></Presence>
		const view = render(content(false))
		expect(screen.queryByText("Panel")).not.toBeInTheDocument()
		view.rerender(content(true))
		expect(screen.getByText("Panel")).toBeInTheDocument()
		expect(animate).toHaveBeenCalledTimes(1)
		expect(animate.mock.instances[0]).toBe(screen.getByText("Panel"))
		view.rerender(content(false))
		expect(screen.getByText("Panel")).toBeInTheDocument()
		expect(complete).not.toHaveBeenCalled()
		act(() => animations[1].onfinish?.())
		expect(complete).toHaveBeenCalledOnce()
		view.rerender(content(true))
		expect(animate).toHaveBeenCalledTimes(3)
	})

	it("scales its durations by --motion-scale and takes custom easings", () => {
		const content = (show: boolean) => (
			<div style={{ "--motion-scale": "2" } as CSSProperties}>
				<Presence show={show} duration={{ enter: 100, exit: 300 }} easing={{ exit: "cubic-bezier(0, 0, 0.2, 1)" }}>
					<div>Panel</div>
				</Presence>
			</div>
		)
		const view = render(content(false))
		view.rerender(content(true))
		expect(animate.mock.calls[0][1]).toMatchObject({ duration: 200, easing: "cubic-bezier(0, 0, 0.2, 1)" })
		view.rerender(content(false))
		expect(animate.mock.calls[1][1]).toMatchObject({ duration: 600, easing: "cubic-bezier(0, 0, 0.2, 1)" })
	})

	it("leaves initially visible content at rest and forwards its React 19 ref", () => {
		const ref = createRef<HTMLDivElement>()
		render(<Presence show><div ref={ref}>Panel</div></Presence>)
		expect(animate).not.toHaveBeenCalled()
		expect(ref.current).toBe(screen.getByText("Panel"))
	})

	it("cancels an interrupted exit without unmounting a reopened child", () => {
		const complete = vi.fn()
		const content = (show: boolean) => <Presence show={show} onExitComplete={complete}><div>Panel</div></Presence>
		const view = render(content(true))
		view.rerender(content(false))
		const exit = animations[0]
		view.rerender(content(true))
		expect(exit.cancel).toHaveBeenCalledOnce()
		expect(exit.onfinish).toBeNull()
		expect(screen.getByText("Panel")).toBeInTheDocument()
		expect(complete).not.toHaveBeenCalled()
	})

	it.each(["off", "reduced"] as MotionPolicy[])("settles an active exit when motion changes to %s", (policy) => {
		const complete = vi.fn()
		const content = (show: boolean, policy: MotionPolicy) => (
			<MotionProvider policy={policy}>
				<Presence show={show} onExitComplete={complete}><div>Panel</div></Presence>
			</MotionProvider>
		)
		const view = render(content(true, "full"))
		view.rerender(content(false, "full"))
		view.rerender(content(false, policy))
		expect(animations[0].cancel).toHaveBeenCalledOnce()
		expect(screen.queryByText("Panel")).not.toBeInTheDocument()
		expect(complete).toHaveBeenCalledOnce()
	})

	it("settles an active enter when motion turns off and cleans up when its owner unmounts", () => {
		const content = (show: boolean, policy: MotionPolicy) => <MotionProvider policy={policy}><Presence show={show}><div>Panel</div></Presence></MotionProvider>
		const view = render(content(false, "full"))
		view.rerender(content(true, "full"))
		view.rerender(content(true, "off"))
		expect(animations[0].cancel).toHaveBeenCalledOnce()
		expect(screen.getByText("Panel")).toBeInTheDocument()
		view.rerender(content(false, "full"))
		view.unmount()
		expect(animations[1].cancel).toHaveBeenCalledOnce()
		expect(animations[1].onfinish).toBeNull()
	})

	it("uses the latest exit callback without restarting an active animation", () => {
		const oldComplete = vi.fn()
		const newComplete = vi.fn()
		const view = render(<Presence show onExitComplete={oldComplete}><div>Panel</div></Presence>)
		view.rerender(<Presence show={false} onExitComplete={oldComplete}><div>Panel</div></Presence>)
		view.rerender(<Presence show={false} onExitComplete={newComplete}><div>Panel</div></Presence>)
		expect(animate).toHaveBeenCalledOnce()
		act(() => animations[0].onfinish?.())
		expect(newComplete).toHaveBeenCalledOnce()
		expect(oldComplete).not.toHaveBeenCalled()
	})

	it("mounts and removes content immediately when Web Animations is unavailable", () => {
		Reflect.deleteProperty(Element.prototype, "animate")
		const complete = vi.fn()
		const view = render(<Presence show={false} onExitComplete={complete}><div>Panel</div></Presence>)
		view.rerender(<Presence show onExitComplete={complete}><div>Panel</div></Presence>)
		expect(screen.getByText("Panel")).toBeInTheDocument()
		view.rerender(<Presence show={false} onExitComplete={complete}><div>Panel</div></Presence>)
		expect(screen.queryByText("Panel")).not.toBeInTheDocument()
		expect(complete).toHaveBeenCalledOnce()
	})
})

describe("scroll reveal", () => {
	it("waits for the requested visible fraction before revealing once", () => {
		render(<Reveal amount={0.5}>Story</Reveal>)
		expect(observerOptions?.threshold).toBe(0.5)
		visible(0.01)
		expect(screen.getByText("Story")).toHaveAttribute("data-reveal", "out")
		expect(disconnect).not.toHaveBeenCalled()
		visible(0.5)
		expect(screen.getByText("Story")).toHaveAttribute("data-reveal", "in")
		expect(disconnect).toHaveBeenCalledOnce()
	})

	it("resets repeat reveals when visibility drops below the threshold", () => {
		render(<Reveal once={false} amount={0.5}>Story</Reveal>)
		visible(0.8)
		expect(screen.getByText("Story")).toHaveAttribute("data-reveal", "in")
		visible(0.2)
		expect(screen.getByText("Story")).toHaveAttribute("data-reveal", "out")
	})

	it("holds an in-view reveal until its gate opens", () => {
		const view = render(<Reveal when={false}>Story</Reveal>)
		visible(1)
		expect(screen.getByText("Story")).toHaveAttribute("data-reveal", "out")
		view.rerender(<Reveal when>Story</Reveal>)
		expect(screen.getByText("Story")).toHaveAttribute("data-reveal", "in")
	})

	it("shows content when IntersectionObserver is unavailable", () => {
		vi.stubGlobal("IntersectionObserver", undefined)
		render(<Reveal>Story</Reveal>)
		expect(screen.getByText("Story")).toHaveAttribute("data-reveal", "in")
	})

	it("removes reveal delays with reduced motion", () => {
		const content = (policy: MotionPolicy) => <MotionProvider policy={policy}><Reveal delay={600}>Story</Reveal></MotionProvider>
		const view = render(content("full"))
		expect(screen.getByText("Story").style.transitionDelay).toBe("calc(600ms * var(--motion-scale, 1))")
		view.rerender(content("reduced"))
		expect(screen.getByText("Story")).toHaveAttribute("data-reveal", "in")
		expect(screen.getByText("Story").style.transitionDelay).toBe("0ms")
	})

	it("staggers visible words, preserves readable text, and removes all delays when disabled", () => {
		const content = (policy: MotionPolicy) => <MotionProvider policy={policy}><TextReveal as="h2" text="Craft with care" stagger={40} /></MotionProvider>
		const view = render(content("full"))
		const heading = screen.getByRole("heading", { name: "Craft with care" })
		const words = () => Array.from(heading.querySelectorAll<HTMLElement>("[data-reveal]"))
		expect(words().map((word) => word.style.transitionDelay)).toEqual([
			"calc(0ms * var(--motion-scale, 1))", "calc(40ms * var(--motion-scale, 1))", "calc(80ms * var(--motion-scale, 1))",
		])
		expect(heading.querySelector(".sr-only")).toHaveTextContent("Craft with care")
		view.rerender(content("off"))
		for (const word of words()) {
			expect(word.style.transitionDelay).toBe("0ms")
			expect(word).toHaveAttribute("data-reveal", "in")
			expect(word).toHaveAttribute("aria-hidden", "true")
		}
	})

	it("keeps combined characters and emoji intact when splitting by character", () => {
		const { container } = render(<TextReveal text="é 👩🏽‍💻" split="char" />)
		expect(Array.from(container.querySelectorAll("[data-reveal]"), (node) => node.textContent)).toEqual(["é", "👩🏽‍💻"])
	})
})

describe("motion levels", () => {
	function Probe({ level }: { level?: MotionLevel }) {
		const ctx = useMotion()
		const own = useMotionLevel(level)
		return (
			<output
				data-testid="probe"
				data-enabled={String(ctx.enabled)}
				data-expressive={String(ctx.expressive)}
				data-level={own.level}
				data-attribute={own.attribute ?? "none"}
			/>
		)
	}
	const probe = () => screen.getByTestId("probe")

	it("keeps essential motion and drops expressive motion under the subtle policy", () => {
		render(<MotionProvider policy="subtle"><Probe /></MotionProvider>)
		expect(document.documentElement).toHaveAttribute("data-motion", "subtle")
		expect(probe()).toHaveAttribute("data-enabled", "true")
		expect(probe()).toHaveAttribute("data-expressive", "false")
		expect(probe()).toHaveAttribute("data-level", "subtle")
	})

	it("lets a component prop and a scope turn motion down but never back up", () => {
		const view = render(<MotionProvider policy="full"><Probe level="subtle" /></MotionProvider>)
		expect(probe()).toHaveAttribute("data-level", "subtle")
		expect(probe()).toHaveAttribute("data-attribute", "subtle")
		view.rerender(<MotionProvider policy="off"><Probe level="full" /></MotionProvider>)
		expect(probe()).toHaveAttribute("data-level", "off")
		expect(probe()).toHaveAttribute("data-attribute", "none")
		view.rerender(<MotionProvider policy="full"><MotionScope level="off"><Probe level="full" /></MotionScope></MotionProvider>)
		expect(probe()).toHaveAttribute("data-enabled", "false")
		expect(probe()).toHaveAttribute("data-level", "off")
	})

	it("renders a box-less scope wrapper that carries data-motion", () => {
		render(<MotionScope level="subtle"><Probe /></MotionScope>)
		const wrapper = probe().parentElement as HTMLElement
		expect(wrapper).toHaveAttribute("data-motion", "subtle")
		expect(wrapper.style.display).toBe("contents")
		expect(probe()).toHaveAttribute("data-expressive", "false")
	})

	it("shows a reveal immediately under subtle, because a scroll reveal is a flourish", () => {
		render(<MotionProvider policy="subtle"><Reveal delay={300}>Story</Reveal></MotionProvider>)
		expect(screen.getByText("Story")).toHaveAttribute("data-reveal", "in")
		expect(screen.getByText("Story").style.transitionDelay).toBe("0ms")
	})
})

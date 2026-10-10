"use client";

import type { RefObject } from "react"
import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect"

/**
 * Run `measure` once before paint and again whenever any observed element
 * resizes. `measure` must be stable (wrap it in `useCallback`); the refs are read
 * at effect time, so pass stable ref objects. SSR-safe (no observer on the
 * server). Re-subscribes only when `measure` changes.
 */
export function useResizeObserver(
	measure: () => void,
	refs: ReadonlyArray<RefObject<Element | null>>,
) {
	// biome-ignore lint/correctness/useExhaustiveDependencies: refs are stable objects read at effect time; re-subscribe only on measure change
	useIsomorphicLayoutEffect(() => {
		measure()
		if (typeof ResizeObserver === "undefined") return
		const ro = new ResizeObserver(measure)
		for (const ref of refs) {
			if (ref.current) ro.observe(ref.current)
		}
		return () => ro.disconnect()
	}, [measure])
}

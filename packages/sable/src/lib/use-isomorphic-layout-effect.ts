"use client";

import { useEffect, useLayoutEffect } from "react"

/**
 * `useLayoutEffect` on the client, `useEffect` on the server — avoids React's
 * "useLayoutEffect does nothing on the server" warning during SSR. Use it for
 * pre-paint measurement (so the first paint already reflects the measured size).
 */
export const useIsomorphicLayoutEffect =
	typeof window !== "undefined" ? useLayoutEffect : useEffect

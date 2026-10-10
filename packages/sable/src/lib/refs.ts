import type { Ref } from "react"

/** Assign a value to a callback ref or a ref object (no-op for null/undefined). */
export function setRef<T>(ref: Ref<T> | undefined, value: T | null) {
	if (typeof ref === "function") ref(value)
	else if (ref) (ref as { current: T | null }).current = value
}

/** Compose several refs into one callback ref that fans a node out to all of them. */
export function mergeRefs<T>(
	...refs: Array<Ref<T> | undefined>
): (value: T | null) => void {
	return (value) => {
		for (const ref of refs) setRef(ref, value)
	}
}

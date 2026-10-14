/** A thenable returned from a handler: Button and Form wait for it to settle. */
export const isPromise = (value: unknown): value is Promise<unknown> =>
	typeof (value as Promise<unknown> | null | undefined)?.then === "function"

"use client";

import { Field as BaseField } from "@base-ui/react/field"
import { Form as BaseForm } from "@base-ui/react/form"
import {
	Children,
	cloneElement,
	type ComponentPropsWithRef,
	type FormEvent,
	type ReactElement,
	type ReactNode,
	useId,
	useRef,
} from "react"
import { cn } from "../../lib/cn"
import { isPromise } from "../../lib/is-promise"
import { Label } from "../label"

export interface FormProps extends Omit<ComponentPropsWithRef<"form">, "onSubmit"> {
	/**
	 * The native submit handler. It may return a promise: when it (or the
	 * promise) is done, the first control a Field marks invalid takes focus, so
	 * errors your own code sets get the same treatment as Sable's validation.
	 */
	onSubmit?: (event: FormEvent<HTMLFormElement>) => unknown
	/**
	 * When fields validate: `onSubmit` (default — on submit, then live on change
	 * after the first attempt), `onBlur`, or `onChange`. A Field's own
	 * `validationMode` wins.
	 */
	validationMode?: BaseForm.ValidationMode
	/**
	 * Errors from outside the form (typically a server response after submit),
	 * keyed by each Field's `name`. Each message shows under its field and clears
	 * when the user edits that field.
	 */
	errors?: BaseForm.Props["errors"]
	/**
	 * Called with the named Field values (as an object) once every field is
	 * valid. Using it calls `preventDefault()` on the native submit for you. It
	 * may return a promise, as `onSubmit` may.
	 */
	onFormSubmit?: (
		...args: Parameters<NonNullable<BaseForm.Props["onFormSubmit"]>>
	) => unknown
	/** Imperative actions: `actionsRef.current.validate(name?)`. */
	actionsRef?: BaseForm.Props["actionsRef"]
	/**
	 * Your code owns validation: `onSubmit` always runs, and each Field shows its
	 * `error`. Nothing is checked first, neither the Fields nor the browser, so a
	 * `required` Field keeps its asterisk and `aria-required` without blocking the
	 * submit. `validationMode`, `errors`, `onFormSubmit` and `actionsRef` do
	 * nothing here: they drive Sable's own validation.
	 */
	noValidate?: boolean
}

/**
 * Form — a styled `<form>` that lays its fields out in a vertical column with
 * comfortable spacing (override via `className`, e.g. `gap-4`). Built on Base
 * UI's Form: on submit it validates every Field (native constraints such as
 * `required` / `type="email"`, plus each Field's `validate`), shows the message
 * under the field instead of a browser bubble, focuses the first invalid
 * control, and only then calls `onSubmit`. Validation can still be entirely
 * yours: drive it however you like (react-hook-form, a schema, manual state)
 * and pass each `Field` an `error` string. Library-agnostic by design.
 *
 *   <Form onSubmit={handleSubmit}>
 *     <Field label="Email" required messages={{ valueMissing: "Enter your email." }}>
 *       <Input type="email" />
 *     </Field>
 *     <Button type="submit">Save</Button>
 *   </Form>
 *
 * Validating in your own code instead? Pass `noValidate`: `onSubmit` always
 * runs, and each Field shows the `error` you give it. Without it, an empty
 * `required` Field stops the submit before your handler could set that error.
 */
export function Form({
	className,
	onSubmit,
	onFormSubmit,
	noValidate,
	validationMode,
	errors,
	actionsRef,
	...props
}: FormProps) {
	// Base UI's Form turns the browser's own validation off (noValidate) and
	// validates the Fields it knows about. A control outside any Field (a bare
	// <input required>) would then slip through, so once Base UI is satisfied we
	// ask the browser too and block on anything it still rejects — the same
	// guarantee a plain <form> gave. Pass `noValidate` to skip that check.
	const blockedRef = useRef(false)
	const formRef = useRef<HTMLFormElement | null>(null)
	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		blockedRef.current = false
		const form = event.currentTarget
		formRef.current = form
		if (!form.checkValidity()) {
			event.preventDefault()
			blockedRef.current = true
			form.reportValidity()
			return
		}
		afterSubmit(form, onSubmit?.(event))
	}
	if (noValidate) {
		// Base UI's Form validates every Field before it calls onSubmit, and no prop
		// turns that off. An empty `required` Field then blocked the submit with the
		// browser's wording, so the app never got to set its own `error`. A plain
		// form leaves validation wholly to the app; the Fields still wire their
		// labels, descriptions, errors and `required` (they need no Form around them).
		return (
			<form
				noValidate
				className={cn("flex flex-col gap-6", className)}
				onSubmit={(event) => {
					const form = event.currentTarget
					afterSubmit(form, onSubmit?.(event))
				}}
				{...props}
			/>
		)
	}
	return (
		<BaseForm
			className={cn("flex flex-col gap-6", className)}
			validationMode={validationMode}
			errors={errors}
			actionsRef={actionsRef}
			onSubmit={handleSubmit}
			onFormSubmit={
				onFormSubmit
					? (values, details) => {
							if (blockedRef.current) return
							const result = onFormSubmit(values, details)
							if (formRef.current && isPromise(result)) afterSubmit(formRef.current, result)
						}
					: undefined
			}
			{...(props as BaseForm.Props)}
		/>
	)
}
Form.displayName = "Form"

/** Frames to keep looking for an error: one set in a transition or an action commits later than the next paint. */
const SETTLE_FRAMES = 10

/**
 * Errors the app sets itself (each Field's `error`) render after its handler
 * returns, so Base UI's focus-first-invalid, which runs inside the submit, never
 * sees them. Once the handler (or its promise) is done and React has painted,
 * focus the first control a Field marked invalid, unless focus is already on
 * one, or the user has moved on to something outside the form while it waited.
 */
function afterSubmit(form: HTMLFormElement, result: unknown) {
	const attempt = (framesLeft: number) =>
		requestAnimationFrame(() => {
			if (!form.isConnected) return
			const active = document.activeElement
			// Typing in the header search during a slow submit: leave them there.
			if (active && active !== document.body && !form.contains(active)) return
			if (active && form.contains(active) && active.getAttribute("aria-invalid") === "true") return
			const first = [...form.querySelectorAll<HTMLElement>('[aria-invalid="true"]')].find(
				(el) => !(el instanceof HTMLInputElement && el.type === "hidden") && !el.closest("[aria-hidden='true'],[inert]"),
			)
			if (!first) {
				if (framesLeft > 0) attempt(framesLeft - 1)
				return
			}
			first.focus()
			if (first instanceof HTMLInputElement && /^(?:text|search|email|tel|url|password|number)?$/.test(first.type)) {
				first.select()
			}
		})
	if (isPromise(result)) result.finally(() => attempt(SETTLE_FRAMES))
	else attempt(SETTLE_FRAMES)
}

/** The native constraint flags of `ValidityState` a Field can word itself. */
export type ConstraintFlag =
	| "valueMissing"
	| "typeMismatch"
	| "patternMismatch"
	| "tooShort"
	| "tooLong"
	| "rangeUnderflow"
	| "rangeOverflow"
	| "stepMismatch"
	| "badInput"

export interface FieldProps
	extends Omit<ComponentPropsWithRef<"div">, "children" | "title" | "onChange"> {
	/** Field label (wired to the control via htmlFor). */
	label?: ReactNode
	/** Helper text under the control (wired via aria-describedby). */
	description?: ReactNode
	/**
	 * Error message — sets the control's aria-invalid + shows a destructive
	 * message. Takes precedence over Base UI's own validation message.
	 */
	error?: ReactNode
	/** Marks the field required: adds the control's `required` + a visual asterisk. */
	required?: boolean
	/**
	 * Your wording for a failed native constraint, by the `ValidityState` flag it
	 * sets: `{ valueMissing: "Enter a subject.", typeMismatch: "That isn't an
	 * email address." }`. A constraint without one shows the browser's message.
	 * `error` still wins over both.
	 */
	messages?: Partial<Record<ConstraintFlag, ReactNode>>
	/**
	 * Disables the control (and any Base UI control inside) and dims the label.
	 * @default false
	 */
	disabled?: boolean
	/**
	 * Identifies the field in `Form`'s `errors` and `onFormSubmit` values. Takes
	 * precedence over the control's own `name`.
	 */
	name?: string
	/**
	 * Custom validation. Return an error string (or strings) when the value is
	 * invalid, `null` when it is valid. Runs after native constraints pass; the
	 * message shows in the error slot when no `error` prop is set.
	 */
	validate?: BaseField.Root.Props["validate"]
	/** When this field validates. Overrides `Form`'s `validationMode`. @default "onSubmit" */
	validationMode?: BaseField.Root.Props["validationMode"]
	/** Debounce for `validate` when `validationMode="onChange"`, in ms. @default 0 */
	validationDebounceTime?: number
	/**
	 * Layout. `vertical` (default) stacks label → control. `horizontal` places the
	 * control then the label inline — for a single checkbox / switch / radio.
	 */
	orientation?: "vertical" | "horizontal"
	/**
	 * Something at the end of the control's row. Vertically, beside the control:
	 * a promo code's Apply button, with the control taking the rest of the row.
	 * Horizontally, at the end of the label's first line: a facet count or a
	 * price, with the label taking the rest.
	 */
	trailing?: ReactNode
	className?: string
	/** The single control element (e.g. `<Input />`, `<Textarea />`, `<Select…>`). */
	children: ReactElement
}

/**
 * Field — wires a label, a control, optional helper text, and an error message
 * together with the correct a11y plumbing, automatically: the label's `htmlFor`,
 * the control's `id` + `aria-describedby` + `aria-invalid`, and the `required`
 * state. Built on Base UI's Field: every Base UI-backed Sable control (Input,
 * Textarea, Select, Combobox, NumberField, Checkbox, Switch, Slider, OtpField…)
 * registers with it through context, and the single child is also cloned with
 * the same wiring so plain elements and custom controls keep working. Stays
 * validation-library-agnostic: pass `error`, or let Base UI validate.
 *
 * The root, label, description, error and control carry Base UI's state
 * attributes — `data-invalid` / `data-valid`, `data-touched`, `data-dirty`,
 * `data-filled`, `data-focused`, `data-disabled` — for state-driven styling.
 *
 *   <Field label="Display name" description="Shown on your profile." required>
 *     <Input />
 *   </Field>
 *   <Field label="Subscribe" orientation="horizontal"><Checkbox /></Field>
 *   <Field label="Promo code" trailing={<Button variant="secondary">Apply</Button>}>
 *     <Input />
 *   </Field>
 *
 * Other props (`data-*`, `id`, `aria-*`) land on the root element.
 */
export function Field({
	label,
	description,
	error,
	required,
	messages,
	disabled,
	name,
	validate,
	validationMode,
	validationDebounceTime,
	orientation = "vertical",
	trailing,
	className,
	children,
	...props
}: FieldProps) {
	const generatedId = useId()
	const child = Children.only(children) as ReactElement<Record<string, unknown>>
	const controlId = (child.props.id as string | undefined) ?? generatedId
	const descId = description ? `${controlId}-description` : undefined
	const errId = `${controlId}-error`
	const hasError = error != null && error !== false && error !== ""

	const labelNode = label ? (
		<BaseField.Label
			htmlFor={controlId}
			render={<Label />}
			className="data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
		>
			{label}
			{required ? (
				<span aria-hidden="true" className="text-destructive">
					{" "}
					*
				</span>
			) : null}
		</BaseField.Label>
	) : null

	// Field.Validity re-renders with the field's live validity, so the clone
	// knows whether an error message is on screen. Base UI controls already get
	// this wiring from context; the clone repeats the same ids so a plain
	// element (or a non-Base UI control) is wired identically.
	const control = (
		<BaseField.Validity>
			{({ validity }) => {
				const errorShown = hasError || validity.valid === false
				const describedBy =
					[child.props["aria-describedby"], descId, errorShown ? errId : null]
						.filter(Boolean)
						.join(" ") || undefined
				return cloneElement(child, {
					id: controlId,
					...(describedBy ? { "aria-describedby": describedBy } : null),
					...(hasError ? { "aria-invalid": true } : null),
					...(required != null ? { required } : null),
					...(disabled ? { disabled: true } : null),
				})
			}}
		</BaseField.Validity>
	)

	const descriptionNode = description ? (
		<BaseField.Description
			id={descId}
			className="text-body-sm text-muted-foreground"
		>
			{description}
		</BaseField.Description>
	) : null

	// One error slot: the `error` prop when set, then the Field's own wording for
	// the constraint that failed, then Base UI's message (the browser's text for a
	// native constraint, `validate`'s, or Form errors).
	const errorNode = (
		<BaseField.Validity>
			{({ validity }) => {
				const flag = messages
					? (Object.keys(messages) as ConstraintFlag[]).find((key) => validity[key])
					: undefined
				return (
					<BaseField.Error
						id={errId}
						className="text-body-sm text-destructive"
						{...(hasError
							? { match: true, children: error }
							: flag
								? { children: messages?.[flag] }
								: null)}
					/>
				)
			}}
		</BaseField.Validity>
	)

	return (
		<BaseField.Root
			className={cn("flex flex-col gap-1.5", className)}
			invalid={hasError || undefined}
			disabled={disabled}
			name={name}
			validate={validate}
			validationMode={validationMode}
			validationDebounceTime={validationDebounceTime}
			{...props}
		>
			{orientation === "horizontal" ? (
				// Control beside a text column. The control sits in a box one LABEL
				// line tall (`h-[1lh]` in the label's own type step), so it centres
				// on the first line and stays there when the label wraps. Helper and
				// error text live in the label's column, not under the control.
				// A Switch (the tallest, --spacing(6)) is taller than that line, so
				// the row is padded by the difference: the control stays inside the
				// Field's box, where an AccordionPanel or any clipping parent keeps
				// it whole.
				<div className="flex items-start gap-2 py-[max(0px,calc((--spacing(6)_-_1lh)/2))] text-label-lg">
					<div className="flex h-[1lh] shrink-0 items-center">{control}</div>
					<div className="flex min-w-0 flex-1 flex-col gap-1.5">
						{labelNode}
						{descriptionNode}
						{errorNode}
					</div>
					{trailing != null ? (
						<div className="flex h-[1lh] shrink-0 items-center">{trailing}</div>
					) : null}
				</div>
			) : (
				<>
					{labelNode}
					{trailing != null ? (
						<div className="flex items-start gap-2">
							<div className="min-w-0 flex-1">{control}</div>
							{trailing}
						</div>
					) : (
						control
					)}
					{descriptionNode}
					{errorNode}
				</>
			)}
		</BaseField.Root>
	)
}
Field.displayName = "Field"

"use client";

import { Field as BaseField } from "@base-ui/react/field"
import { Form as BaseForm } from "@base-ui/react/form"
import {
	Children,
	cloneElement,
	type ComponentPropsWithRef,
	type ReactElement,
	type ReactNode,
	useId,
	useRef,
} from "react"
import { cn } from "../../lib/cn"
import { Label } from "../label"

export interface FormProps extends ComponentPropsWithRef<"form"> {
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
	 * valid. Using it calls `preventDefault()` on the native submit for you.
	 */
	onFormSubmit?: BaseForm.Props["onFormSubmit"]
	/** Imperative actions: `actionsRef.current.validate(name?)`. */
	actionsRef?: BaseForm.Props["actionsRef"]
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
 *     <Field label="Email" error={errors.email}><Input type="email" /></Field>
 *     <Button type="submit">Save</Button>
 *   </Form>
 */
export function Form({
	className,
	onSubmit,
	onFormSubmit,
	noValidate,
	...props
}: FormProps) {
	// Base UI's Form turns the browser's own validation off (noValidate) and
	// validates the Fields it knows about. A control outside any Field (a bare
	// <input required>) would then slip through, so once Base UI is satisfied we
	// ask the browser too and block on anything it still rejects — the same
	// guarantee a plain <form> gave. Pass `noValidate` to skip that check.
	const blockedRef = useRef(false)
	const handleSubmit = (
		event: Parameters<NonNullable<FormProps["onSubmit"]>>[0],
	) => {
		blockedRef.current = false
		const form = event.currentTarget
		if (!noValidate && !form.checkValidity()) {
			event.preventDefault()
			blockedRef.current = true
			form.reportValidity()
			return
		}
		onSubmit?.(event)
	}
	return (
		<BaseForm
			className={cn("flex flex-col gap-6", className)}
			onSubmit={handleSubmit}
			onFormSubmit={
				onFormSubmit
					? (values, details) => {
							if (!blockedRef.current) onFormSubmit(values, details)
						}
					: undefined
			}
			{...(props as BaseForm.Props)}
		/>
	)
}
Form.displayName = "Form"

export interface FieldProps {
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
 */
export function Field({
	label,
	description,
	error,
	required,
	disabled,
	name,
	validate,
	validationMode,
	validationDebounceTime,
	orientation = "vertical",
	className,
	children,
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

	// One error slot: the `error` prop when set, otherwise Base UI's validation
	// message (native constraint, `validate`, or Form errors).
	const errorNode = (
		<BaseField.Error
			id={errId}
			className="text-body-sm text-destructive"
			{...(hasError ? { match: true, children: error } : null)}
		/>
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
		>
			{orientation === "horizontal" ? (
				// Control beside a text column. The control sits in a box one LABEL
				// line tall (`h-[1lh]` in the label's own type step), so it centres
				// on the first line and stays there when the label wraps. Helper and
				// error text live in the label's column, not under the control.
				<div className="flex items-start gap-2.5">
					<div className="flex h-[1lh] shrink-0 items-center text-label-lg">
						{control}
					</div>
					<div className="flex min-w-0 flex-col gap-1.5">
						{labelNode}
						{descriptionNode}
						{errorNode}
					</div>
				</div>
			) : (
				<>
					{labelNode}
					{control}
					{descriptionNode}
					{errorNode}
				</>
			)}
		</BaseField.Root>
	)
}
Field.displayName = "Field"

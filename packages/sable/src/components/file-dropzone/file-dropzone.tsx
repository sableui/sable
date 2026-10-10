import {
	type ComponentPropsWithRef,
	type DragEvent,
	type ReactNode,
	useId,
	useRef,
	useState,
} from "react"
import { Icon } from "../../icon"
import { cn } from "../../lib/cn"
import { useTypeTier } from "../../lib/density"
import { fileDropzoneVariants } from "./file-dropzone.variants"

export type FileRejectionCode =
	| "file-invalid-type"
	| "file-too-large"
	| "too-many-files"

export interface FileRejection {
	file: File
	code: FileRejectionCode
	/** The message the dropzone announced for this file. */
	message: string
}

export interface FileDropzoneProps
	extends Omit<
		ComponentPropsWithRef<"div">,
		"onDrop" | "onDragEnter" | "onDragOver" | "onDragLeave" | "children"
	> {
	/**
	 * Same syntax as the native `accept` attribute: extensions (`.pdf`), exact
	 * MIME types (`application/pdf`) and wildcards (`image/*`), comma-separated.
	 * Enforced on drop as well as in the picker — the picker's filter is only a
	 * suggestion the OS can be told to ignore, and drop has no filter at all.
	 */
	accept?: string
	/** Largest accepted file, in bytes. */
	maxSize?: number
	/** Accept more than one file per selection. @default false */
	multiple?: boolean
	/**
	 * Most files accepted from ONE selection when `multiple`. The dropzone does
	 * not hold your list — pass `limit - files.length` to cap the total.
	 */
	maxFiles?: number
	disabled?: boolean
	/** Sets `required` on the underlying file input. */
	required?: boolean
	/** Files that passed every check, in selection order. */
	onFilesAccepted?: (files: File[]) => void
	/** Files that failed a check. Each was already announced to the user. */
	onFilesRejected?: (rejections: FileRejection[]) => void
	/**
	 * The zone's visible call to action.
	 * @default "Drop a file here or browse" ("files" when `multiple`)
	 */
	label?: ReactNode
	/** The constraints, in words: "PNG or PDF, up to 10 MB". */
	description?: ReactNode
	/**
	 * How the accepted types read in an error, completing "Use … instead" —
	 * "PNG or PDF", "an image or PDF". Without it a type rejection can only
	 * say "Choose a different file".
	 */
	acceptLabel?: string
	/** Replace the default rejection copy — e.g. to localize it. */
	formatError?: (rejection: Omit<FileRejection, "message">) => string
	/** Semantic icon name. @default "arrow-up" */
	icon?: string
	/** `md` owns an empty section; `sm` is a strip above an existing list. @default "md" */
	size?: "md" | "sm"
	/** Marks the zone invalid. `<Field error>` sets this for you. */
	"aria-invalid"?: boolean | "true" | "false"
}

function matchesAccept(file: File, accept: string | undefined): boolean {
	if (!accept) return true
	const name = file.name.toLowerCase()
	const type = file.type.toLowerCase()
	return accept
		.split(",")
		.map((t) => t.trim().toLowerCase())
		.filter(Boolean)
		.some((rule) => {
			if (rule.startsWith(".")) return name.endsWith(rule)
			if (rule.endsWith("/*")) return type.startsWith(rule.slice(0, -1))
			return type === rule
		})
}

/** Bytes as the user reads them: 10 MB, 512 KB. */
export function formatFileSize(bytes: number): string {
	const units = ["B", "KB", "MB", "GB"]
	let value = bytes
	let unit = 0
	while (value >= 1024 && unit < units.length - 1) {
		value /= 1024
		unit++
	}
	const rounded = value >= 10 || unit === 0 ? Math.round(value) : Math.round(value * 10) / 10
	return `${rounded} ${units[unit]}`
}

function hasFiles(event: DragEvent): boolean {
	return Array.from(event.dataTransfer?.types ?? []).includes("Files")
}

/**
 * FileDropzone — a drop target and a file picker in one keyboard-operable
 * control.
 *
 * The visible zone is a real `<button>`: Enter or Space opens the system
 * picker, so a keyboard or switch user gets the same control a mouse user
 * drags onto. Every selection — dropped or picked — runs the same checks
 * (`accept`, `maxSize`, `maxFiles`), because the picker's filter is a hint the
 * OS lets users override and a drop has no filter at all.
 *
 * The label and description sit inside the button, so together they are its
 * accessible name — a screen-reader user hears the constraints before choosing.
 * Inside a `<Field>`, the field label names the button instead.
 *
 * Rejections are announced through a `role="status"` region that exists from
 * the first render (a live region inserted together with its text is announced
 * unreliably) and are referenced by the button's `aria-describedby`, so the
 * reason is still there when focus returns.
 *
 * It does not keep the file list. Accepted files go to `onFilesAccepted`; you
 * hold them and render each as an `Attachment` beneath the zone, which is
 * where upload progress, retry and remove belong.
 *
 *   <FileDropzone accept="image/*,.pdf" acceptLabel="an image or PDF"
 *     maxSize={10 * 1024 * 1024} multiple
 *     description="Images or PDFs, up to 10 MB each"
 *     onFilesAccepted={(next) => setFiles((f) => [...f, ...next])} />
 */
export function FileDropzone({
	accept,
	maxSize,
	multiple = false,
	maxFiles,
	disabled = false,
	required,
	onFilesAccepted,
	onFilesRejected,
	label,
	description,
	acceptLabel,
	formatError,
	icon = "arrow-up",
	size = "md",
	id,
	className,
	"aria-describedby": ariaDescribedBy,
	"aria-invalid": ariaInvalid,
	...props
}: FileDropzoneProps) {
	const generatedId = useId()
	const buttonId = id ?? generatedId
	const errId = `${buttonId}-errors`
	const inputRef = useRef<HTMLInputElement>(null)
	const depth = useRef(0)
	const [dragging, setDragging] = useState(false)
	const [errors, setErrors] = useState<string[]>([])
	const tier = useTypeTier()

	const messageFor = (r: Omit<FileRejection, "message">): string => {
		if (formatError) return formatError(r)
		const name = `“${r.file.name}”`
		switch (r.code) {
			case "file-invalid-type":
				return acceptLabel
					? `${name} isn't a supported type. Use ${acceptLabel} instead.`
					: `${name} isn't a supported type. Choose a different file.`
			case "file-too-large":
				return `${name} is larger than ${formatFileSize(maxSize ?? 0)}. Choose a smaller file.`
			case "too-many-files":
				return multiple
					? `${name} wasn't added. Add up to ${maxFiles} files at a time.`
					: `${name} wasn't added. Add one file at a time.`
		}
	}

	const take = (files: File[]) => {
		if (disabled || files.length === 0) return
		const limit = multiple ? (maxFiles ?? Number.POSITIVE_INFINITY) : 1
		const accepted: File[] = []
		const rejected: FileRejection[] = []
		for (const file of files) {
			const code: FileRejectionCode | null = !matchesAccept(file, accept)
				? "file-invalid-type"
				: maxSize != null && file.size > maxSize
					? "file-too-large"
					: accepted.length >= limit
						? "too-many-files"
						: null
			if (code) rejected.push({ file, code, message: messageFor({ file, code }) })
			else accepted.push(file)
		}
		setErrors(rejected.map((r) => r.message))
		if (accepted.length) onFilesAccepted?.(accepted)
		if (rejected.length) onFilesRejected?.(rejected)
	}

	const endDrag = () => {
		depth.current = 0
		setDragging(false)
	}

	const invalid = errors.length > 0 || ariaInvalid === true || ariaInvalid === "true"
	const describedBy =
		[ariaDescribedBy, errors.length ? errId : null]
			.filter(Boolean)
			.join(" ") || undefined

	return (
		<div
			className={cn("flex w-full flex-col", className)}
			onDragEnter={(e) => {
				if (!hasFiles(e)) return
				e.preventDefault()
				depth.current++
				if (!disabled) setDragging(true)
			}}
			onDragOver={(e) => {
				if (!hasFiles(e)) return
				e.preventDefault()
				e.dataTransfer.dropEffect = disabled ? "none" : "copy"
			}}
			onDragLeave={(e) => {
				if (!hasFiles(e)) return
				depth.current = Math.max(0, depth.current - 1)
				if (depth.current === 0) setDragging(false)
			}}
			onDrop={(e) => {
				e.preventDefault()
				endDrag()
				take(Array.from(e.dataTransfer?.files ?? []))
			}}
			{...props}
		>
			<button
				type="button"
				id={buttonId}
				disabled={disabled}
				data-dragging={dragging ? "" : undefined}
				data-invalid={invalid ? "" : undefined}
				aria-invalid={invalid || undefined}
				aria-describedby={describedBy}
				onClick={() => inputRef.current?.click()}
				className={fileDropzoneVariants({ size })}
			>
				<span
					aria-hidden="true"
					className={cn(
						"flex size-(--control-md) shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground motion-interactive",
						"group-data-[dragging]:-translate-y-0.5 group-data-[dragging]:bg-primary group-data-[dragging]:text-primary-foreground",
					)}
				>
					<Icon name={icon} className="text-lg" />
				</span>
				<span className="flex min-w-0 flex-col gap-0.5">
					<span className={tier.control}>
						{label ?? (
							<>
								{multiple ? "Drop files here or " : "Drop a file here or "}
								<span className="text-primary underline underline-offset-2">browse</span>
							</>
						)}
					</span>
					{description ? (
						<span className={cn("text-muted-foreground", tier.supporting)}>
							{description}
						</span>
					) : null}
				</span>
			</button>
			<input
				ref={inputRef}
				type="file"
				accept={accept}
				multiple={multiple}
				disabled={disabled}
				required={required}
				tabIndex={-1}
				aria-hidden="true"
				className="sr-only"
				onChange={(e) => {
					take(Array.from(e.currentTarget.files ?? []))
					// Reset so choosing the same file again still fires change.
					e.currentTarget.value = ""
				}}
			/>
			<div
				id={errId}
				role="status"
				className={cn("text-destructive not-empty:pt-2", tier.supporting)}
			>
				{errors.length === 1 ? (
					<p>{errors[0]}</p>
				) : errors.length > 1 ? (
					<ul className="flex flex-col gap-0.5">
						{errors.map((message, i) => (
							<li key={`${i}-${message}`}>{message}</li>
						))}
					</ul>
				) : null}
			</div>
		</div>
	)
}
FileDropzone.displayName = "FileDropzone"

import {
	Attachment,
	Button,
	Field,
	FileDropzone,
	fileDropzoneMeta,
	formatFileSize,
	Icon,
} from "@sableui/react"
import { useState } from "react"
import {
	ComponentPlayground,
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

const LIMIT = 4

/** The pairing: the dropzone hands files off, the page owns the list. */
function ListDemo() {
	const [files, setFiles] = useState<File[]>([])
	const remaining = LIMIT - files.length
	return (
		<div className="flex w-full max-w-lg flex-col gap-3">
			<FileDropzone
				multiple
				size={files.length ? "sm" : "md"}
				accept="image/*,.pdf"
				acceptLabel="an image or PDF"
				maxSize={10 * 1024 * 1024}
				maxFiles={remaining}
				disabled={remaining === 0}
				description={
					remaining === 0
						? "You've added the most files allowed. Remove one to add another."
						: "Images or PDFs, up to 10 MB each"
				}
				onFilesAccepted={(next) => setFiles((f) => [...f, ...next])}
			/>
			{files.map((file, i) => (
				<Attachment
					key={`${file.name}-${i}`}
					name={file.name}
					meta={formatFileSize(file.size)}
					actions={
						<Button
							variant="ghost"
							size="icon-xs"
							aria-label={`Remove ${file.name}`}
							onClick={() => setFiles((f) => f.filter((_, j) => j !== i))}
						>
							<Icon name="xmark" />
						</Button>
					}
				/>
			))}
		</div>
	)
}

export function FileDropzonePage() {
	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="File Dropzone"
				lede={ledeFor(fileDropzoneMeta)}
			/>

			<ComponentPlayground meta={fileDropzoneMeta} />

			<Section
				title="Drop or browse"
				description="Click to browse, or drag a file over it to see the drop state."
			>
				<Example
					code={
						'<FileDropzone accept="image/*,.pdf" acceptLabel="an image or PDF" maxSize={10 * 1024 * 1024} multiple description="Images or PDFs, up to 10 MB each" />'
					}
				>
					<div className="w-full max-w-lg">
						<FileDropzone
							accept="image/*,.pdf"
							acceptLabel="an image or PDF"
							maxSize={10 * 1024 * 1024}
							multiple
							description="Images or PDFs, up to 10 MB each"
						/>
					</div>
				</Example>
			</Section>

			<Section
				title="With a file list"
				description="Once files are added, the zone shrinks to a strip so the list stays in view."
			>
				<Example>
					<ListDemo />
				</Example>
			</Section>

			<Section
				title="Rejections"
				description="Try a file that isn't a PDF, or one over 1 MB. The error says how to fix it."
			>
				<Example>
					<div className="w-full max-w-lg">
						<Field label="Signed contract">
							<FileDropzone
								accept=".pdf"
								acceptLabel="a PDF"
								maxSize={1024 * 1024}
								description="PDF, up to 1 MB"
							/>
						</Field>
					</div>
				</Example>
			</Section>

			<Section title="Disabled">
				<Example>
					<div className="w-full max-w-lg">
						<FileDropzone disabled description="Uploads are paused while we finish processing." />
					</div>
				</Example>
			</Section>

			<MetaFooter meta={fileDropzoneMeta} />
		</>
	)
}

import type { ComponentMeta } from "../../lib/meta"

export const fileDropzoneMeta: ComponentMeta = {
	name: "FileDropzone",
	summary:
		"Drag-and-drop target and file picker in one keyboard-operable button. Checks accept, maxSize and maxFiles on every selection, announces each rejection with how to fix it, and hands accepted files to you to list as Attachments.",
	status: "stable",
	keywords: [
		"file upload",
		"dropzone",
		"drag and drop",
		"file picker",
		"upload",
		"attach file",
		"file input",
		"import",
	],
	usage: {
		description:
			"Use FileDropzone where adding files is the main job of a section — an upload step, an import screen, a document request. It gives the drag gesture a visible target and the same action a button for everyone who does not drag. It holds no list: render accepted files as Attachments beneath it, where progress, retry and remove belong.",
		bestPractices: [
			{
				guidance: "do",
				description:
					"State the constraints in `description` (\"PNG or PDF, up to 10 MB\") and give `acceptLabel` the same words, so a rejection repeats the rule the user already read.",
			},
			{
				guidance: "do",
				description:
					"Pair it with a list of Attachment rows that you own. Once files are added, switch to `size=\"sm\"` so the target stays available without pushing the list below the fold.",
			},
			{
				guidance: "do",
				description:
					"Cap the total by passing `maxFiles={limit - files.length}`; the dropzone only sees one selection at a time. When none remain, set `disabled` and say why in `description` (\"Remove one to add another\").",
			},
			{
				guidance: "dont",
				description:
					"Do not use it for an incidental attach action inside a composer or a toolbar. A paperclip Button that opens the picker is the right weight there; ChatComposer already has one.",
			},
			{
				guidance: "dont",
				description:
					"Do not rely on `accept` alone to protect the server. The dropzone's checks are for the user's benefit; validate type and size again where the file is received.",
			},
			{
				guidance: "dont",
				description:
					"Do not silently drop rejected files. The zone announces each one, but if you also discard files later (a server-side limit), say so on the Attachment with `status=\"error\"` and a fix.",
			},
		],
		anatomy: [
			{
				name: "Zone",
				required: true,
				description:
					"A full-width button with a dashed border. Click, Enter or Space opens the picker; it is also the drop target.",
			},
			{
				name: "Icon",
				required: false,
				description: "A decorative mark that lifts while a file is dragged over the zone.",
			},
			{
				name: "Label and description",
				required: true,
				description:
					"The call to action and the constraints. Together they form the button's accessible name.",
			},
			{
				name: "Status",
				required: true,
				description:
					"A role=status region, present from the first render, that lists each rejected file and how to fix it.",
			},
		],
	},
	related: {
		components: ["Attachment", "Input", "Button", "Progress"],
	},
	props: [
		{
			name: "accept",
			type: "string",
			description:
				"Native accept syntax — `.pdf`, `application/pdf`, `image/*`, comma-separated. Enforced on drop and on pick.",
		},
		{
			name: "maxSize",
			type: "number",
			description: "Largest accepted file, in bytes.",
		},
		{
			name: "multiple",
			type: "boolean",
			default: "false",
			description: "Accept more than one file per selection.",
		},
		{
			name: "maxFiles",
			type: "number",
			description:
				"Most files accepted from one selection when `multiple`. Pass the remaining capacity to cap a total.",
		},
		{
			name: "onFilesAccepted",
			type: "(files: File[]) => void",
			description: "Files that passed every check, in selection order.",
		},
		{
			name: "onFilesRejected",
			type: "(rejections: FileRejection[]) => void",
			description:
				"Files that failed, each with `code` (file-invalid-type, file-too-large, too-many-files) and the announced `message`.",
		},
		{
			name: "label",
			type: "ReactNode",
			default: '"Drop a file here or browse"',
			description: "The visible call to action. Pluralised automatically when `multiple`.",
		},
		{
			name: "description",
			type: "ReactNode",
			description: "The constraints in words, shown under the label.",
		},
		{
			name: "acceptLabel",
			type: "string",
			description:
				"How the accepted types complete \"Use … instead\" in an error (\"PNG or PDF\", \"an image or PDF\"). Without it a type error can only say \"Choose a different file\".",
		},
		{
			name: "formatError",
			type: "(rejection) => string",
			description: "Replace the rejection copy, e.g. to localize it.",
		},
		{
			name: "icon",
			type: "string",
			default: '"arrow-up"',
			description: "Semantic icon name.",
		},
		{
			name: "size",
			type: '"md" | "sm"',
			default: '"md"',
			description:
				"`md` is the empty-section target; `sm` is a single-row strip above an existing list.",
		},
		{
			name: "disabled / required / id / aria-invalid",
			type: "—",
			description:
				"Standard form-control props. `id` lands on the button, so `<Field>` labels it; `aria-invalid` draws the destructive border.",
		},
	],
	variants: {
		size: ["md", "sm"],
	},
	tokensUsed: [
		"card",
		"foreground",
		"muted",
		"muted-foreground",
		"border-strong",
		"primary",
		"primary-foreground",
		"accent",
		"accent-foreground",
		"ring",
		"destructive",
	],
	motion: [
		{
			slot: "arrival",
			recipe: "none",
			part: "Zone",
			why: "The zone is the section's content, present from the start. An entrance would only delay the drop target someone is already dragging toward.",
		},
		{
			slot: "response",
			recipe: "motion-interactive",
			part: "Zone",
			why: "Hover strengthens the border to primary, which confirms the whole dashed area — not just the word \"browse\" — is the click target.",
		},
		{
			slot: "transition",
			recipe: "motion-interactive",
			part: "Icon",
			why: "When a file crosses into the zone the icon fills and lifts and the surface tints. That is the only signal that releasing here will work; without it users drop on the page and the browser opens the file instead.",
		},
		{
			slot: "activity",
			recipe: "none",
			part: "Zone",
			why: "The zone hands files off immediately and never uploads. Transfer progress belongs on each Attachment, where it can be per-file and retryable.",
		},
	],
	a11y: [
		"The zone is a native button: Enter or Space opens the system picker, so dragging is never the only way in.",
		"Rejections render into a role=status region that exists from the first render, and the button's aria-describedby points at it while it has content, so the reason is still read when focus returns.",
		"Every error names the file and says how to fix it (\"Choose a smaller file\"), rather than only what failed.",
		"The underlying file input is visually hidden and removed from the tab order; the button is the single focus stop.",
	],
	examples: [
		{
			label: "Images and PDFs",
			code: '<FileDropzone accept="image/*,.pdf" acceptLabel="an image or PDF" maxSize={10 * 1024 * 1024} multiple description="Images or PDFs, up to 10 MB each" onFilesAccepted={(files) => console.log(files)} />',
		},
		{
			label: "With an Attachment list",
			code: `<div className="flex flex-col gap-3">
	<FileDropzone size="sm" multiple description="Up to 5 files" onFilesAccepted={(files) => console.log(files)} />
	<Attachment name="contract.pdf" meta="2.4 MB · PDF" />
	<Attachment name="site-photo.jpg" meta="Uploading…" status="uploading" progress={42} />
</div>`,
		},
		{
			label: "In a field",
			code: '<Field label="Proof of address" description="A bill or statement from the last 3 months."><FileDropzone accept=".pdf" acceptLabel="a PDF" maxSize={5 * 1024 * 1024} description="PDF, up to 5 MB" /></Field>',
		},
	],
}

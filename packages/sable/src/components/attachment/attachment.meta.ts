import type { ComponentMeta } from "../../lib/meta"

export const attachmentMeta: ComponentMeta = {
	name: "Attachment",
	summary:
		"A file or image attached to a message: media or icon lead, name and metadata, upload and error states, an actions slot, and a full-card trigger that keeps those actions separately clickable.",
	status: "stable",
	keywords: [
		"attachment",
		"file",
		"upload",
		"image preview",
		"chat file",
		"document",
		"drag and drop",
		"file card",
	],
	usage: {
		description:
			"The card a file takes in a conversation — in the composer while it uploads, and in the transcript once it has. It renders all four states an attachment actually moves through (queued, uploading, failed, delivered) rather than only the delivered one, because the other three are the states that are hard to get right and would otherwise fall back on every caller.",
		bestPractices: [
			{
				guidance: "do",
				description:
					'Use `variant="media"` for images and `variant="card"` for documents. A filename tells you nothing about a photo, and a thumbnail tells you nothing about a contract.',
			},
			{
				guidance: "do",
				description:
					'Pass `onOpen` rather than wrapping the card in your own button. It renders a stretched trigger underneath the actions, so the card is one tab stop, each action is its own, and clicking "remove" never opens the file.',
			},
			{
				guidance: "do",
				description:
					'Give `status="uploading"` a numeric `progress` when you have one and omit it when you do not — the bar goes indeterminate rather than lying about 0%.',
			},
			{
				guidance: "do",
				description:
					'Put the reason in `meta` when `status="error"`. The card re-colors but keeps its shape, so a failed upload stays recognisable as the file it was — the text is what says why.',
			},
			{
				guidance: "dont",
				description:
					"Do not nest interactive controls inside a card you have wrapped in a link or button yourself. That is invalid HTML and unreachable in the order it looks like; `onOpen` exists to avoid it.",
			},
			{
				guidance: "dont",
				description:
					"Do not use it as a generic file-list row. `Tree` is the file listing; this one is shaped for a conversation, where an attachment is a message payload.",
			},
			{
				guidance: "dont",
				description:
					"Do not rely on the error colour alone to signal failure. Colour is not a status for anyone who cannot see it — say what happened in `meta`.",
			},
		],
		anatomy: [
			{
				name: "Media",
				required: true,
				description:
					"Thumbnail crop or file glyph. Fills the tile in `media`, a lead square in `card`.",
			},
			{
				name: "Label",
				required: true,
				description:
					"Name and metadata. A row beside the media in `card`; a scrim strip over the picture in `media`, shown only when there is something to say.",
			},
			{
				name: "Actions",
				required: false,
				description:
					"Remove / retry / download controls, stacked above the stretched trigger so they stay separately clickable.",
			},
			{
				name: "Progress",
				required: false,
				description:
					"A hairline bar along the bottom edge while `status=\"uploading\"`; determinate with `progress`, indeterminate without.",
			},
		],
	},
	related: {
		components: ["Message", "Bubble", "MessageScroller", "Progress"],
	},
	props: [
		{
			name: "name",
			type: "string",
			description:
				"File name. Truncated rather than wrapped — the stem truncates and a short extension stays visible — and used as the default label for the stretched trigger and the media tile's alt text.",
		},
		{
			name: "meta",
			type: "ReactNode",
			description:
				"Size, type, upload progress, or the failure reason — the quiet second line.",
		},
		{
			name: "thumbnail",
			type: "string",
			description:
				"Image preview URL. Present means the card shows a crop of the file instead of a glyph.",
		},
		{
			name: "icon",
			type: "string",
			default: '"file"',
			description:
				'Semantic icon name for a non-image file (resolved through IconProvider). Defaults to "image-stack" when a thumbnail is set.',
		},
		{
			name: "variant",
			type: '"card" | "media"',
			default: '"card"',
			description:
				"`card` is a name-led horizontal row for documents; `media` is a square tile that is mostly picture.",
		},
		{
			name: "status",
			type: '"idle" | "uploading" | "error"',
			default: '"idle"',
			description:
				"Transfer state. `uploading` adds a progress bar; `error` re-colors the card without changing its shape.",
		},
		{
			name: "progress",
			type: "number",
			description:
				"Percentage 0–100 while uploading. Omit for an indeterminate bar.",
		},
		{
			name: "actions",
			type: "ReactNode",
			description:
				"Remove / retry / download controls. Stay clickable when `onOpen` makes the card a trigger. On a `media` tile they float on the top-end corner over the picture, so pass `variant=\"floating\"` buttons there.",
		},
		{
			name: "onOpen",
			type: "() => void",
			description:
				"Makes the whole card activate, via a stretched button rendered beneath the actions rather than by wrapping the card.",
		},
		{
			name: "openLabel",
			type: "string",
			default: "`Open ${name}`",
			description: "Accessible label for that stretched trigger.",
		},
		{
			name: "...div props",
			type: 'Omit<ComponentPropsWithRef<"div">, "onClick">',
			description:
				"Spread onto the card. Use `onOpen` rather than `onClick` — a click handler on a div is not a control.",
		},
	],
	variants: {
		variant: ["card", "media"],
		status: ["idle", "uploading", "error"],
	},
	tokensUsed: [
		"card",
		"border",
		"border-strong",
		"muted",
		"muted-foreground",
		"foreground",
		"destructive",
		"overlay",
		"overlay-foreground",
		"ring",
	],
	a11y: [
		"The full-card trigger is a real stretched `<button>` with an accessible label, not a click handler on a div — so it is one tab stop, keyboard-activatable, and focus-ringed.",
		"Actions sit above that trigger in the stacking order, which keeps them individually focusable and stops a click on `remove` from also opening the file. Text is only made click-through when a trigger is present, so a filename stays selectable otherwise.",
		"A thumbnail is described as the attachment in `media` (where the picture is the only label) and left decorative in `card` (where the filename is right beside it), so AT never reads the same name twice.",
		"The upload bar carries an accessible name via Progress; the error state is carried by text in `meta` as well as colour.",
		"Label text on a media tile sits on `overlay` / `overlay-foreground` — a fixed pairing that stays legible over arbitrary imagery, where a theme surface token would not.",
	],
	examples: [
		{
			label: "Document with a remove action",
			code: '<Attachment name="proposal.pdf" meta="2.4 MB · PDF" onOpen={() => open(file)} actions={<Button variant="ghost" size="icon-xs" aria-label="Remove"><Icon name="xmark" /></Button>} />',
		},
		{
			label: "Image tile, uploading",
			code: '<Attachment variant="media" name="cover.png" thumbnail={previewUrl} status="uploading" progress={62} meta="Uploading… 62%" />',
		},
		{
			label: "Failed upload with a retry",
			code: '<Attachment name="recording.mov" meta="Upload failed — file is over the 50 MB limit" status="error" icon="warning" actions={<Button variant="ghost" size="xs" onClick={retry}>Retry</Button>} />',
		},
		{
			label: "Attachments as a message payload",
			code: '<Message messageId="m7" align="end" footer={<RelativeTime date={sentAt} />}>\n\t<div className="flex flex-wrap gap-2">\n\t\t{files.map((f) => (<Attachment key={f.id} variant="media" name={f.name} thumbnail={f.url} onOpen={() => open(f)} />))}\n\t</div>\n</Message>',
		},
	],
}

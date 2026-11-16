import { toastMeta } from "@sableui/react"
import { type PreviewEntry } from "../preview-kit"
import { TOAST_CONTROLS, ToastStage, toastSnippet } from "../toast-playground"

// A toast is a call, not an element: the stage is a button that makes it,
// and the snippet is the call. Position and stacked are the provider's — see ToastStage.
const entry: PreviewEntry = {
	meta: toastMeta,
	only: ["type", "title", "description", "action", "timeout", "position", "stacked"],
	controls: TOAST_CONTROLS,
	render: (values) => <ToastStage values={values} />,
	snippet: (values) => toastSnippet(values),
}

export default entry

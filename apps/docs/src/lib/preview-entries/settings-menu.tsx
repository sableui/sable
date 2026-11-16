import { settingsMenuMeta } from "@sableui/react"
import { attrs, SettingsMenuPreview, type PreviewEntry } from "../preview-kit"

const entry: PreviewEntry = {
	meta: settingsMenuMeta,
	only: ["variant", "size", "side", "align", "disabled"],
	render: (values) => <SettingsMenuPreview values={values} />,
	snippet: (values) => `<SettingsMenu${attrs(settingsMenuMeta, values, ["variant", "size", "side", "align", "disabled"])} label="Change model" summary={model}>
<SettingsRow label="Model" value={model}>
	<MenuRadioGroup value={model} onValueChange={setModel}>
		<MenuRadioItem value="Sol">Sol</MenuRadioItem>
		<MenuRadioItem value="Luna">Luna</MenuRadioItem>
	</MenuRadioGroup>
</SettingsRow>
/SettingsMenu>`,
}

export default entry

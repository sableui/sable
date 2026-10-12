export { Icon, type IconProps } from "./Icon"
export { composeIconSets } from "./compose"
// No icon set is re-exported here: Reicon is opt-in from
// "@sableui/react/icons/reicon", so this barrel never reaches its artwork.
export {
	IconProvider,
	useIconSet,
	type IconProviderProps,
	type IconContextValue,
} from "./IconProvider"
export type { IconSet, IconRenderProps, IconVariant } from "./registry"

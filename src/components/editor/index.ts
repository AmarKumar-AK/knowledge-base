// Editor components index file
export { default as LinkDialog } from './LinkDialog';
export { default as ColorPicker } from './ColorPicker';
export { default as EditorToolbar } from './EditorToolbar';
export { default as TagsInput } from './TagsInput';
export { Link, findLinkEntities } from './LinkDecorator';
export { 
  createLink,
  removeLink,
  removeTextColors,
  removeBackgroundColors
} from './editorUtils';
export { colorStyleMap } from './colorStyleMap';
export { textColorOptions, bgColorOptions } from './colorOptions';
export type { ColorOption } from './colorOptions';

// @index('./**/*.svelte',  (f, _) => `export {default as ${_.pascalCase(f.name)}} from '${f.path}.svelte'`)
export { default as Avatar } from './avatar.svelte';
export { default as Separator } from './Separator.svelte';
export { default as Breadcrumb } from './breadcrumb.svelte';
export { default as Button } from './button.svelte';
export { default as Link } from './links.svelte';
export { default as FileUpload } from './FileUpload.svelte';
export { default as Dialog } from './dialog.svelte';
export { Badge } from './ui/badge';
export * as Slider from './ui/slider';

//turn all import in this page to to {default } imports

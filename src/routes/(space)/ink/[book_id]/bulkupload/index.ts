import type { chapter } from '$lib/types';
import { type ComponentType } from 'svelte';
export type dataType = Pick<chapter, 'title' | 'sequence' | 'status'> & {
	lastModified: Date;
	file: File;
	uploadStatus: keyof typeof bulk_file_status;
	errors: string;
	content: string;
};
export type metaType = {
	editable: boolean;
	dropdown: boolean;
	dropdownComponent: ComponentType<any>;
	click: (arg: dataType) => void;
};

export const bulk_file_status = {
	validationFailed: 'yellow', // title size check
	size: 'yellow', // size too big
	skip: 'gray', // skipped
	conversion: 'red', // conversion failed
	upload: '#59120a', // upload failed, failed to call create chapter apis
	validity: 'green' // valid, can be upload
} as const;

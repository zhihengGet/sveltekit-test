import { toast } from 'svelte-sonner';

export const success = (m: string) => toast.success(m);

export const warning = (m: string) => toast.warning(m);

export const failure = (m: string) => toast.error(m);

export const toastNotify = {
	success,
	warning,
	failure,
	error: failure,
	info: toast.info
};

import type { book } from '$lib/types';

export const status = ['completed', 'ongoing', 'archived'] as const;
export const status_full = [...status, 'draft'] as book['status'];

import { SITE_URL } from '$lib/data/constants';
import type { AppType } from '../../routes/(api)/rest/[...paths]/+server';

import { hc } from 'hono/client';
// this is a trick to calculate the type when compiling

// this is a trick to calculate the type when compiling
const client1 = hc<AppType>('');
export type Client = typeof client1;

export const hcWithType = (...args: Parameters<typeof hc>): Client =>
	hc<AppType>(...args);

export const client = hcWithType(SITE_URL);

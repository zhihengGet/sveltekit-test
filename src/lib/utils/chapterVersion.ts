import type { chapter } from '$lib/types';
import { groupBy, sortBy } from 'lodash-es';

function groupByVersion(chapters: chapter[]) {
	const groups = groupBy(chapters, (v) => Math.trunc(v.sequence));

	for (const k in groups) {
		const items = groups[k];
		const s = sortBy(items, (v) => -v.sequence);
		groups[k] = s;
	}

	return groups;
}
export { groupByVersion };

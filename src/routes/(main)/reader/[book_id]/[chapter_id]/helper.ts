import type { chapter, min_chapter } from '$lib/types';
import { keys } from '$lib/utils/getKeys';
import { groupBy, sortBy } from 'lodash-es';

/**
 *
 * @param list chapter list
 * @param isVersionedChapter chapter list versioning enabled then we sort by desc , else, asc
 * @returns [sequence list, groups, prevMap,nextMap]
 */
export function groupChapters(
	list: min_chapter[],
	skipDecimal: boolean = false
) {
	const temp = list ?? [];
	console.log('group chapters list', skipDecimal, typeof list);
	const groups = groupBy(temp, (v) => Math.floor(v.sequence));
	for (let x in groups) {
		let items = groups[x];
		groups[x] = sortBy(items, (v) => v.sequence);
	}
	let s = sortBy(keys(groups), (v) => parseFloat(v)) as (keyof typeof groups)[];
	let toIndex = s.reduce((prev, curr, index) => {
		prev[curr] = index;
		return prev;
	}, {}) as { [s in string]: number };
	//@ts-expect-error ts bad
	let latest_chapter_id =
		s.length > 0 ? groups?.[s.at(-1)].at(-1)?.id : undefined;
	//@ts-expect-error ts bad
	let first_chapter_id = s.length > 0 ? groups?.[s.at(0)].at(0)?.id : undefined;
	type mapper = { [s in number]: min_chapter };
	const prevMap: { [s in string]: min_chapter } = {};
	const prevMapArray: { [s in string]: min_chapter[] } = {};
	const nextMap: { [s in string]: min_chapter } = {};
	const nextMapArray: { [s in string]: min_chapter[] } = {};
	const prevMapLast: { [s in string]: min_chapter } = {};
	const nextMapLast: { [s in string]: min_chapter } = {};

	for (let x of temp) {
		const seq = Math.floor(x.sequence); // normalize
		let i = toIndex[seq] as number;
		const previ = s[i - 1];
		let next = s[i + 1];
		if (i > 0 && previ !== undefined) {
			//@ts-expect-error ts bad
			const prev = groups[previ].at(0) as min_chapter;
			prevMap[x.id] = prev;
			//@ts-expect-error ts bad
			prevMapLast[x.id] = groups[previ].at(-1);
			prevMapArray[x.id] = groups[previ] as min_chapter[];
		}
		if (i < s.length - 1) {
			//@ts-expect-error ts bad
			const next = groups[s[i + 1]].at(0) as min_chapter;
			nextMap[x.id] = next;
			//@ts-expect-error ts bad
			nextMapLast[x.id] = groups[s[i + 1]].at(-1);
			//@ts-expect-error ts bad
			nextMapArray[x.id] = groups[s[i + 1]];
		}
	}
	//console.log([s, groups, prevMap as mapper, nextMap as mapper]);
	return {
		/**
		 * @description Prev Main Sequence given an chapter id
		 */
		prevMap,
		/**
		 * @description Next Main Sequence  given an chapter id ,returns the start of the next main sequence
		 */
		nextMap,
		/**
		 * @description sorted main sequeqnce list
		 */
		mainSequences: s,
		chaptersGroupByMainSeq: groups,
		latest_chapter_id,
		first_chapter_id,
		sortedChapterList: sortBy(list, (v) => v.sequence),
		nextMapArray,
		prevMapArray,
		prevMapLast,
		nextMapLast
	} as const;
}

/* 

SPLIT CHAPTER INTO CHUNKS GROUPED BY Sequence

[ 0,0.1,0.2 ]  , [   ] ,  [3,3.1,3.2   ]
when skip decimal :  we fetch the last bit in each chunk, because we should show the latest version to user
when skip decimal is false, we show all chapter sorted by sequence
*/

/* groupChapters([
	{
		title: 'TEST',
		sequence: '0',
		id: '3',
		book_id: '1',
		user_modified_at: '2024-05-20T05:36:20.000Z',
		created_at: '2024-05-04T04:20:55.061Z'
	}
]);
 */

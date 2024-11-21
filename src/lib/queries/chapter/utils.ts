import type { min_chapter } from '$lib/types';
import { groupBy, entries } from 'lodash-es';

type chapter = min_chapter;
type chapterMainSequence = string;
type chapterSequence = string;
type chapterHistory = Record<
	chapterMainSequence, // specific chapter sequence
	{
		chapters: Record<chapterSequence, chapter>;
		versions: number[];
	}
>;
type OrderedChapters = Record<
	chapter['status'],
	{ keyedChapters: chapterHistory; mainChapterSeq: number[] }
>;

type chapterStatus = Record<chapter['status'], chapter[]>;
export function groupChapters(data: chapter[]) {
	data.sort((a, b) => a.sequence - b.sequence);

	// group by status
	const groupByStatus = groupBy(
		data,
		(v) => v.status
	) as unknown as chapterStatus;

	const keys = Object.keys(groupByStatus).sort() as chapter['status'][];

	const ordered: OrderedChapters = {
		published: {
			keyedChapters: {},
			mainChapterSeq: []
		},
		draft: {
			keyedChapters: {},
			mainChapterSeq: []
		},
		trashed: {
			keyedChapters: {},
			mainChapterSeq: []
		}
	};
	let stats = {
		draft: {
			total_word_count: 0,
			total_character_count: 0
		},
		published: {
			total_word_count: 0,
			total_character_count: 0
		},
		trashed: {
			total_word_count: 0,
			total_character_count: 0
		}
	};
	for (const k of keys) {
		const chapters = groupByStatus[k];

		// grouped by status
		const chapterBySequence = groupBy(chapters, (v) =>
			Math.floor(v.sequence)
		) as Record<string, chapter[]>;

		const chapter_by_sequence: chapterHistory = {};
		for (const [sequence, chaptersBySequence] of entries(chapterBySequence)) {
			const chapters = chaptersBySequence;
			// all the versions of this particular chapter
			const versions = chapters.map((v) => v.sequence).sort();

			const temp: chapterHistory[string] = {
				chapters: groupBy(
					chapters,
					(v) => v.sequence
				) as unknown as chapterHistory[string]['chapters'],
				versions: versions
			};

			chapter_by_sequence[sequence] = temp;
		}

		ordered[k] = {
			keyedChapters: chapter_by_sequence,
			mainChapterSeq: Object.keys(chapter_by_sequence)
				.map((v) => parseFloat(v))
				.sort()
		};
	}
	return ordered;
}
/* export function getFirstChapter(
	data: OrderedChapters,
	status: chapter['status'] = 'published'
) {
	const published = data[status];
	const firstChapterVersion =
		published.keyedChapters[published.mainChapterSeq[0]];
	const first =
		firstChapterVersion.chapters[firstChapterVersion.versions.at(-1) ?? 0];

	return first;
} */
export function getFirstChapter(data: chapter[]) {
	let c = 0;
	let ret = null;
	for (const v of data) {
		if (Number.isInteger(v.sequence)) {
			c += 1;
			if (c == 2) {
				return ret;
			}
		}
		ret = v;
	}
	return ret;
}
//@return all prev chapter and all its version
export function getPrevChapters(
	data: chapter[] | undefined,
	currChapter: chapter
) {
	if (!data) {
		return;
	}
	const rd = data.slice().reverse();

	for (let i = 0; i < rd.length - 1; i += 1) {
		if (rd[i].sequence == currChapter.sequence) {
			return rd[i + 1];
		}
	}
}

export function getNextChapters(data: chapter[] = [], currChapter: chapter) {
	const mainNumber = Math.trunc(currChapter.sequence);
	console.table(data);
	console.log('called get next', currChapter.sequence);

	// case 1 :     1 2 [3] 3.1 4
	// case 2:    1 2 3 [3.1] 3.2 3.3 4.1 4.4  (curr 3.2)
	for (let i = 0; i < data.length; i += 1) {
		if (Math.trunc(data[i].sequence) > mainNumber) {
			let j = i;

			while (
				j + 1 < data.length &&
				Math.trunc(data[j + 1].sequence) == Math.trunc(data[i].sequence)
			) {
				j += 1;
			}
			console.log('got', data[j]);
			return data[j];
		}
	}
	console.log('no more next');
	return null;
}
/* export function getNeighborChapter(
	data: OrderedChapters,
	rawList: chapter[],
	status: chapter['status'] = 'published',
	targetChapterId?: number
) {
	const target = rawList.find((v) => v.id == targetChapterId)?.sequence;

	if (!target) {
		return Chapter404;
	}
	let prev = 0;
	let next = 0;
	const published = data[status];
	const seq = data[status].mainChapterSeq;
	const i = seq.findIndex((v) => v == Math.floor(target));

	prev = i > 0 ? seq[i - 1] : -1;
	next = i + 1 <= seq.length ? seq[i + 1] : -1;

	let prevLatestChapter = null;
	let nextLatestChapter = null;
	if (prev != -1) {
		const prevChapters = published.keyedChapters[prev];
		const prevS = prevChapters.versions.at(-1);
		prevLatestChapter = prevChapters.chapters[prevS];
	}
	if (next != -1) {
		const nextChapters = published.keyedChapters[next];
		const nextSq = nextChapters.versions.at(-1);
		nextLatestChapter = nextChapters.chapters[nextSq];
	}
	return { prevLatestChapter, nextLatestChapter };
}
 */

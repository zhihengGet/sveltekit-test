import categoryAndTags from './categoryJson';
import language from './lang';
import type { book } from '$lib/types';
import { sortBy, zipWith } from 'lodash-es';
import type { Component, SvelteComponent } from 'svelte';
import { add } from 'date-fns';
import { primaryAudienceOptions } from './age';
/* contains constants defined at client side */
export type categoryTypes = (typeof categoryAndTags)[number]['label'];
export type categoryValueTypes = (typeof categoryAndTags)[number]['value'];

const sort = [
	'like count',
	//'dislike count',
	//'hotness', // max(chapters)
	//recommendations',
	'shelved count'
	//	'release date', // for top 100 relevance , sort by date
	//"relevance", // by relevance score,
	//'totalClick',
	//'charCount'
] as const;

export type sortType = typeof sort;
// @description  maps sort  like count to db  likeCount
export const sortMapper: { [key in sortType[number]]: keyof book } = {
	'like count': 'like_count',

	//	'dislike count': 'dislikeCount',
	//hotness: 'like_count',
	'shelved count': 'shelved_count'
	//'release date': 'createdAt',
	//	charCount: 'charCount'
	//recommendations: 'recommendation'
	//'paid user count': 'click',
	//totalClick: 'click'
};

/**
 * @constant an object {1% : 0.01}
 */
const discount: { [t: string]: number } = {};
for (let x = 0; x < 101; x++) discount[x + '%'] = x / 100;

//const stats = ["Rating", "Likes", "Review", "Shelf Count"];
//const isPremium: book['price'][] = ['premium', 'free', 'public domain'];
const status: book['status'][] = ['completed', 'ongoing', 'archived', 'draft'];
export const statusSummary: { [s in book['status']]: string } = {
	completed: 'completed',
	ongoing: 'ongoing',
	archived: 'Archived: Under renovation: Exciting updates in progress',
	draft: 'Draft: Read at your own risk'
};
const publicStatus = status; /*  [  
	'completed',
	'ongoing',
	'archived',
	'draft' //TODO 
] as const satisfies Readonly<Omit<book['status'], 'draft'>[]>; */
const lead = [
	'male lead',
	'female lead',
	'both(m/f)',
	'transgender',
	'non-human',
	//'all',
	'not related',
	'mixed' // mixed , group lead
] as const;
type leadType = (typeof lead)[number];
export { type leadType };
export type charCountFilter = '>50k' | '>100k' | '>200k' | '>400k';

type options = { label: string; value: string }[];

const charCount = [
	'>50k',
	'>100k',
	'>200k',
	'>400k'
] as const satisfies Readonly<charCountFilter[]>;
const avgRating = ['>=25', '>=50', '>=75', '>=90'] as const;
export const avgRatingCountMap = {
	'>=25': 25,
	'>=50': 50,
	'>=75': 75,
	'>=90': 90
} as const satisfies { [x in (typeof avgRating)[number]]: number };
export const charCountMap = {
	'>100k': 100 * 1000,
	'>200k': 200 * 1000,
	'>400k': 400 * 1000,
	'>50k': 50 * 1000
} as const satisfies { [x in string]: number };
const langOptions: options = [];
const langCode: (typeof language)[number]['code'][] = [];

const langMap: Record<string, string> = {};
for (const x of language) {
	langCode.push(x.code);
	langMap[x.code] = x.name;
	langOptions.push({ label: x.name, value: x.name });
}
const sellType = ['book', 'chapter', 'none'] as const satisfies Readonly<
	book['sell_type'][]
>;
const statusOption: options = [];
for (const s of status) {
	const v = s as string;
	statusOption.push({ label: statusSummary[v], value: v });
}

export type timeRangeType = (keyof typeof timeRange)[];
export const target_audience = [];

export const ContenTMatureTags = [
	{
		label:
			'Mature: Features strong language, graphic violence, or explicit content',
		value: 'mature'
	}
];

export const BAD_CONTENT = [
	{
		value: 'illegal_content',
		label: 'Illegal Content',
		description:
			'Material that violates any laws or promotes illegal activities.'
	},
	{
		value: 'hate_speech',
		label: 'Hate Speech',
		description:
			'Content that promotes or incites violence, hatred, or discrimination against individuals or groups based on race, ethnicity, religion, gender, sexual orientation, or other protected characteristics.'
	},
	{
		value: 'graphic_violence',
		label: 'Graphic Violence',
		description:
			'Excessive depictions of violence, cruelty, or gore, especially when glorified or gratuitous.'
	},
	{
		value: 'child_exploitation',
		label: 'Child Exploitation',
		description:
			'Any content involving or promoting the exploitation of minors, including child abuse, pedophilia, or underage sexual content.'
	},
	{
		value: 'pornographic_content',
		label: 'Pornographic Content',
		description:
			'Explicit adult material that is pornographic in nature, including depictions of non-consensual sexual acts or bestiality.'
	},
	{
		value: 'plagiarism',
		label: 'Plagiarism',
		description:
			"Content that is not original and violates copyright laws, including blatant plagiarism or unauthorized use of another's work."
	},
	{
		value: 'instructions_for_harm',
		label: 'Instructions for Harm',
		description:
			'Material that provides instructions or encouragement for self-harm, suicide, or harm to others.'
	},
	{
		value: 'terrorism_promotion',
		label: 'Terrorism Promotion',
		description:
			'Content that supports or promotes terrorist organizations, activities, or ideologies.'
	}
];

/* export const ageMapper = ageOption.reduce((prev, curr) => {
	prev[curr.label] = curr.value;
	return prev;
}, {}); */
export const audienceLabelToValue = primaryAudienceOptions.reduce(
	(prev, curr) => {
		prev[curr.label] = curr.value;
		return prev;
	},
	{}
);
// export const ageToLabelMapper = ageOption.reduce((prev, curr) => {
// 	prev[curr.value] = curr.label;
// 	return prev;
// }, {});
//ageToLabelMapper['null'] = 'All Age';

export const timeRange = [
	'yesterday',
	'last 7 days',
	'last 30 days',
	'last 300 days'
	//	'all time'
] as const;
const date = new Date().getTime();
const DAY = 1000 * 60 * 60 * 24;
export const timeRangeMapper = {
	yesterday: () => new Date(date - DAY * 1).toUTCString(),
	'last 7 days': () => new Date(date - DAY * 7).toUTCString(),
	'last 30 days': () => add(date, { days: -30 }).toUTCString(),
	'last 300 days': () => add(date, { days: -300 }).toUTCString(),
	'all time': () => add(date, { years: -100 }).toUTCString()
} as const;
const simpleFilter = {
	sort: sort,
	timeRange: timeRange
};

type categoryAndTags = typeof categoryAndTags;
const category: categoryAndTags[number]['label'][] = [];
export const categoryValues: categoryAndTags[number]['value'][] = [];

const categoryOptions: options = [];
const tagOptions: options = [];
const leadOptions: options = [];
const tags: { [s in (typeof categoryAndTags)[number]['label']]: string[] } = {
	fiction: [],
	nonfiction: [],
	ACG: [],
	'fan novel': [],
	Tutorial: [],
	blog: [],
	'Eastern Fantasy': []
};

export const categoryIcon: {
	[s in categoryTypes]: Component<SvelteComponent> | string;
} = {
	fiction: '🐉',
	nonfiction: '🕸',
	'Eastern Fantasy': '',
	'fan novel': '',
	Tutorial: '',
	blog: '',
	ACG: ''
};

const TagsOptionGroup: { [x in categoryValueTypes]: options } = {
	fiction: [],
	nonfiction: [],
	Eastern: [],
	'fan novel': [],
	Tutorial: [],
	blog: [],
	ACG: []
};
export type filterOptions = typeof TagsOptionGroup;
let allTags: (typeof categoryAndTags)[number]['subCategory'][number][] = [];
for (const x of categoryAndTags) {
	category.push(x.label);
	categoryValues.push(x.value);
	categoryOptions.push({ label: x.label, value: x.value });
	allTags = allTags.concat(x.subCategory);
	TagsOptionGroup[x.value] = zipWith(x.subCategory, x.subCategory, (a, b) => {
		return { label: a, value: b };
	});
	TagsOptionGroup[x.value] = sortBy(TagsOptionGroup[x.value], (v) => v.label);
}

for (const x of lead) {
	if (x) leadOptions.push({ value: x, label: x });
}

// create options for create book

for (const tag of allTags) {
	tagOptions.push({ label: tag, value: tag });
}
/**
 * @description used for filter
 */
const bookFilter = {
	string: {
		status: publicStatus,
		lead: lead
	},
	multi: {
		'Content Rating': {
			db_key: 'maturity_levels',
			label: { mature: 'mature' },
			value: ['mature']
		} //  label: db field
	},
	objectLabel: {
		language: {
			value: 'language', // book key
			subLabel: langCode,
			subLabelValues: langMap
		},
		'word count': {
			value: 'word_count',
			subLabel: charCount,
			subLabelValues: charCountMap
		},
		'average rating': {
			value: 'average_rating',
			subLabel: avgRating,
			subLabelValues: avgRatingCountMap
		},
		age: {
			value: 'audience',
			subLabel: primaryAudienceOptions.map((v) => v.label),
			subLabelValues: audienceLabelToValue
		}
	},
	//special handler
	category: categoryOptions,
	//isPremium: isPremium,
	//allTags: allTags,
	tags: TagsOptionGroup,
	//sort: sort,
	//langCode: langCode,
	//textSearch: textSearch, // language can be used with mongo search
	//sellType: sellType,
	created_at: timeRange,
	updated_at: timeRange
} as const;

export { bookFilter };
export {
	//isPremium,
	status,
	lead,
	sellType,
	discount,
	simpleFilter,
	category,
	allTags,
	langCode,
	tagOptions,
	categoryOptions,
	langOptions,
	leadOptions,
	statusOption,
	TagsOptionGroup
};

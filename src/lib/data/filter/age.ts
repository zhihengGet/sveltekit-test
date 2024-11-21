export const ageRange = [
	[0, 2],
	[3, 5],
	[6, 8],
	[9, 12],
	[13, 17],
	[18]
] as const;

export const ageRangeToLabel = {
	'0 2': 'Infant Toddler',
	'3 5': 'Preschooler',
	'6 8': 'Young Child',
	'9 12': 'Pre-teens',
	'13 17': 'Yougn Adult',
	'18+': 'Adult',
	'all age': 'All Age'
};
export const ageRangeToValue = {
	'0 2': 'infant/toddler',
	'3 5': 'Preschooler',
	'6 8': 'Young Child',
	'9 12': 'Pre-teens',
	'13 17': 'Yougn Adult',
	'18+': 'Adult',
	'all age': 'All Age'
};

export const primaryAudienceOptions = [
	{ label: 'Toddler', value: '0 2' },
	{ label: 'Preschoolers', value: '3 5' },
	{ label: 'Young children', value: '6 8' },
	{ label: 'Pre-teens', value: '9 5' },
	{ label: 'Young Adult', value: '13 17' },
	{ label: 'Adult', value: '18+' },
	{ label: 'All Age', value: 'all age' }
];

export const RangeToValue = (min: number | string, high?: number) => {
	if (!high) return min + '+';

	return min + ' ' + high;
};
export const ageBands = {
	'0-2': {
		type: 'Simple picture books with few or no words',
		target_audience: 'Infants and toddlers'
	},
	'3-5': {
		type: 'Picture books',
		target_audience: 'Preschoolers'
	},
	'6-8': {
		type: 'Early-level readers, first chapter books',
		target_audience: 'Young children'
	},
	'9-12': {
		type: 'Middle-grade chapter books',
		target_audience: 'Pre-teens'
	},
	'13-17': {
		type: 'Teen and young adult chapter books',
		target_audience: 'Teens'
	},
	'18+': {
		type: 'Adult books',
		target_audience: 'Adults'
	}
};

const category = [
	{
		value: 'fiction',
		subCategory: [
			'classic',
			'crime',
			'epic',
			'fable',
			'fairy tale',
			'fantasy',
			'folktale',
			'gothic fiction',
			'historical fiction',
			'horror',
			'humor',
			'magical realism',
			'legend',
			'meta fiction',
			'mystery',
			'mythology',
			'mythopoeia',
			'realistic fiction',
			'romance',
			'satire',
			'science fiction',
			'short story',
			'swashbuckler',
			'tall tale',
			'theological fiction',
			'suspense thriller',
			'travel',
			'wuxia',
			'poetry'
		],
		label: 'fiction',
		description:
			'wiki: Fiction generally is a narrative form, in any medium, consisting of people, events, or places that are imaginary'
	},
	{
		value: 'nonfiction',
		subCategory: [
			'Biography & Memoir',
			'History',
			'Self-Help',
			'True Crime',
			'Science',
			'Travel',
			'Health & Wellness',
			'Business & Economics',
			'Philosophy',
			'Politics',
			'Religion & Spirituality',
			'Food & Cooking',
			'Art & Photography',
			'Sports',
			'Nature & Environment',
			'Technology',
			'Psychology',
			'Education',
			'Parenting & Family',
			'Anthropology & Sociology',
			'Essays & Journalism',
			'Music & Entertainment',
			'Motivational & Inspirational',
			'Home & Garden',
			'Reference & How-To'
		].map((v) => v.toLocaleLowerCase()),
		label: 'nonfiction',
		description:
			'wiki:Nonfiction or non-fiction is any document or content that purports in good faith to represent truth and accuracy regarding information, events, or people'
	},
	{
		value: 'ACG',
		subCategory: [
			'cyberpunk',
			'game',
			'ecchi',
			'demons',
			'harem',
			'josei',
			'martial arts',
			'kids',
			'historical',
			'hentai',
			'isekai',
			'military',
			'mecha',
			'music',
			'parody',
			'police',
			'post apocalyptic',
			'reverse harem',
			'school',
			'seinen',
			'shoujo',
			'shoujo ai',
			'shounen',
			'shounen ai',
			'space',
			'sports',
			'super power',
			'tragedy',
			'vampire',
			'yuri',
			'yaoi',
			'wuxia',
			'xianxia'
		],
		label: 'ACG',
		description:
			'The term ACG stands for Anime, Comics, and Games, and it refers to the interconnected culture and genres that span across these three mediums, particularly in East Asia, most notably Japan and China.'
	},
	{
		value: 'Eastern',
		subCategory: [
			'martial arts',
			'historical',
			'Reincarnation',
			'Slice of Life',
			'wuxia(武侠)',
			'Cultivation',
			'xianxia(仙侠)',
			'xuanhuan(玄幻)'
		],
		label: 'Eastern Fantasy',
		description:
			'Eastern genres refer to literary and entertainment genres that originate from East Asia, primarily from countries like China, Japan, and Korea. These genres are shaped by cultural, historical, and philosophical influences unique to the region and often feature themes, settings, and storytelling elements that differ from Western genres.'
	},
	{
		value: 'fan novel',
		label: 'fan novel',
		subCategory: ['fandom'],
		description:
			" type of fictional text written by fans of any work of fiction where the author uses copyrighted characters, settings, or other intellectual properties from an original creator as a basis for their writing. Fan fiction ranges from a couple of sentences to an entire novel, and fans can both keep the creator's characters and settings or add their own. Fan fiction is a form of fan labor.Fan fiction can be based on any fictional (and sometimes non-fictional) subject. Common bases for fan fiction include novels, movies, bands, and video games."
	},
	{
		value: 'Tutorial',
		subCategory: [
			'Science',
			'Biology',
			'Business',
			'Stock',
			'Artificial Intelligence',
			'Data Science',
			'Programming',
			'Photoshop',
			'Adobe Suite',
			'Startups',
			'Design',
			'Culture',
			'Cryptocurrency',
			'Politics',
			'Food',
			'Relationships',
			'Future',
			'Literature',
			'Music',
			'World',
			'Religion',
			'Race',
			'Privacy',
			'Media',
			'philosophy',
			'language',
			'justice',
			'history',
			'environment',
			'education',
			'pets'
		],
		label: 'Tutorial',
		description: 'Learning'
	},
	{
		value: 'blog',
		subCategory: [
			'others',
			'lifestyle',
			'education',
			'politics',
			'travel',
			'technology',
			'Fashion',
			'finance',
			'gaming',
			'fitness',
			'Business',
			'Entrepreneurship',
			'Career',
			'Music',
			'foot',
			'Photography',
			'Craft',
			'personal'
		],
		label: 'blog',
		description: 'Whatever you want :)'
	}
] as const;
export const categories = [
	{
		category: 'Fiction',
		description:
			'Books based on imaginative narration, including invented characters and settings.'
	},
	{
		category: 'Nonfiction',
		description:
			'Books that provide factual information, covering a wide range of subjects.'
	}
];
export const recommended_tags_for_category = [
	{
		category: 'Fiction',
		description:
			'Books based on imaginative narration, including invented characters and settings.'
	},
	{
		category: 'Nonfiction',
		description:
			'Books that provide factual information, covering a wide range of subjects.'
	}
];
export default category;

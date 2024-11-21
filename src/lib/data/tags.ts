export const user_tags = {
	roles: [
		{
			role: 'Author',
			responsibilities: [
				'Writes the manuscript',
				'Develops characters, plot, and themes',
				'Revises and edits the manuscript before submission to an editor'
			]
		},
		{
			role: 'Developmental Editor',
			responsibilities: [
				'Assesses the overall structure, plot, and pacing',
				'Provides feedback on character development and narrative coherence',
				'Works closely with the author to shape the manuscript'
			]
		},
		{
			role: 'Copy Editor',
			responsibilities: [
				'Corrects grammar, spelling, and punctuation errors',
				'Ensures consistency in style and tone',
				'Checks for factual accuracy and adherence to style guides'
			]
		},
		{
			role: 'Proofreader',
			responsibilities: [
				'Performs the final review of the manuscript',
				'Identifies and corrects typographical errors',
				'Checks for formatting and layout consistency'
			]
		},
		{
			role: 'Cover Artist',
			responsibilities: [
				'Designs the book cover',
				"Creates visually appealing artwork that reflects the book's content",
				'Ensures the cover meets industry standards and formats'
			]
		},
		{
			role: 'Interior Designer',
			responsibilities: [
				"Designs the layout of the book's interior",
				'Selects appropriate fonts and margins',
				'Ensures readability and visual appeal'
			]
		},
		{
			role: 'Illustrator',
			responsibilities: [
				'Creates illustrations for the book, if needed',
				'Works with the author to ensure illustrations match the text',
				'Prepares artwork for both print and digital formats'
			]
		},
		{
			role: 'Formatter',
			responsibilities: [
				'Converts the manuscript into various formats (EPUB, MOBI, PDF)',
				'Ensures proper display across different devices and platforms',
				'Checks that the formatting adheres to industry standards'
			]
		},
		{
			role: 'Beta Reader',
			responsibilities: [
				'Provides feedback on the manuscript before publication',
				'Identifies plot holes, inconsistencies, and areas for improvement',
				"Offers a reader's perspective on the story"
			]
		},
		{
			role: 'Marketing Specialist',
			responsibilities: [
				'Develops and executes a marketing plan for the book',
				'Creates promotional materials and campaigns',
				'Manages social media, email marketing, and advertising'
			]
		},
		{
			role: 'Publicist',
			responsibilities: [
				'Arranges media coverage, interviews, and reviews',
				'Promotes the book to target audiences',
				'Builds relationships with media outlets and influencers'
			]
		},
		{
			role: 'Distributor',
			responsibilities: [
				"Facilitates the book's distribution to retailers and platforms",
				'Manages ISBN and metadata registration',
				'Ensures the book is available in both print and digital formats'
			]
		},
		{
			role: 'Book Coach/Consultant',
			responsibilities: [
				'Guides the author through the self-publishing process',
				'Offers advice on editing, design, marketing, and distribution',
				'Provides personalized support to achieve publishing goals'
			]
		},
		{
			role: 'Audio Producer',
			responsibilities: [
				'Oversees the recording of the audiobook',
				'Hires voice actors and directs the recording sessions',
				'Edits and finalizes the audio for publication'
			]
		},
		{
			role: 'Legal Advisor',
			responsibilities: [
				'Advises on copyright and intellectual property issues',
				'Reviews contracts and agreements',
				'Ensures compliance with legal and industry standards'
			]
		},
		{
			role: 'Book Reviewer',
			responsibilities: [
				'Reads and analyzes the book',
				'Writes an evaluation covering various aspects of the book',
				'Publishes the review on relevant platforms or media outlets'
			]
		},
		{
			role: 'Critic',
			responsibilities: [
				'Conducts a deeper literary analysis of the book',
				'Places the book within the broader literary context',
				'Writes reviews or essays for established publications or journals'
			]
		},
		{
			role: 'Endorser',
			responsibilities: [
				'Writes a short endorsement or blurb for the book',
				"Highlights the book's strengths or unique qualities",
				"Contributes to the book's marketing and promotion"
			]
		},
		{
			role: 'Sensitivity Reader',
			responsibilities: [
				'Reviews the manuscript for cultural, racial, or social sensitivities',
				'Provides feedback on potential issues that could offend or misrepresent',
				'Suggests revisions to improve inclusivity and accuracy'
			]
		},
		{
			role: 'ARC (Advanced Reader Copy) Reviewer',
			responsibilities: [
				'Reads and reviews the book before its official release',
				'Provides early feedback to generate buzz and reviews',
				'Shares reviews on social media, blogs, or online retailers'
			]
		},
		{
			role: 'Translator',
			responsibilities: [
				'Translates the book into another language',
				'Ensures cultural context and meaning are preserved in translation',
				'Adapts the text for different markets and audiences'
			]
		},
		{
			role: 'Voice Actor/Narrator',
			responsibilities: [
				'Records the audiobook version of the book',
				'Brings characters to life through voice acting',
				'Works closely with the audio producer to ensure high-quality narration'
			]
		},
		{
			role: 'Social Media Manager',
			responsibilities: [
				'Manages the author’s or book’s social media presence',
				'Creates and schedules posts, engages with the audience',
				'Tracks and analyzes social media performance'
			]
		},
		{
			role: 'Influencer/Bookstagrammer/BookTuber',
			responsibilities: [
				'Promotes the book on social media platforms',
				'Creates content such as reviews, unboxings, or discussions',
				'Engages with their followers to generate interest in the book'
			]
		},
		{
			role: 'Public Speaking Coach',
			responsibilities: [
				'Helps the author prepare for public speaking engagements',
				'Provides training on delivering presentations and readings',
				'Assists in developing a confident and engaging public speaking style'
			]
		},
		{
			role: 'Book Fair/Event Coordinator',
			responsibilities: [
				'Organizes author appearances at book fairs and events',
				'Coordinates logistics such as travel, booth setup, and scheduling',
				'Promotes the author’s participation to attract attendees'
			]
		}
	]
};

export const user_tag_select_items = user_tags.roles.map((v) => {
	return { label: v.role, value: v.role, hoverOver: v.responsibilities };
});

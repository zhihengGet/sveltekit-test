const achievementsData = {
	like_count: [
		{
			min: 0,
			max: 50,
			title: 'Steady Start',
			icon: '👍',
			description: 'People are enjoying your contributions!',
			level: {
				current: 1,
				max: 5
			}
		},
		{
			min: 51,
			max: 200,
			title: 'Well Appreciated',
			icon: '🌟',
			description: 'Your posts are gaining positive feedback.',
			level: {
				current: 2,
				max: 5
			}
		},
		{
			min: 201,
			max: 500,
			title: 'Community Favorite',
			icon: '🔥',
			description: "You're a valued voice in the community.",
			level: {
				current: 3,
				max: 5
			}
		},
		{
			min: 501,
			max: 1000,
			title: 'Respected Contributor',
			icon: '💎',
			description: 'Your contributions are highly appreciated.',
			level: {
				current: 4,
				max: 5
			}
		},
		{
			min: 1001,
			max: null,
			title: 'Community Leader',
			icon: '🏅',
			description: 'Your positive impact on the community is undeniable.',
			level: {
				current: 5,
				max: 5
			}
		}
	],
	dislike_count: [
		{
			min: 0,
			max: 5,
			title: 'Keep Improving',
			icon: '🚀',
			description: "A few disagreements, but you're on the right track!",
			level: {
				current: 1,
				max: 3
			}
		},
		{
			min: 6,
			max: 20,
			title: 'Room for Growth',
			icon: '🌱',
			description:
				'There’s room for improvement. Stay engaged and keep sharing your voice!',
			level: {
				current: 2,
				max: 3
			}
		},
		{
			min: 21,
			max: null,
			title: 'Reflect and Revise',
			icon: '🔄',
			description:
				'Sometimes controversy happens—consider ways to connect better with the community.',
			level: {
				current: 3,
				max: 3
			}
		}
	],
	follower_total: [
		{
			min: 0,
			max: 50,
			title: 'First Followers',
			icon: '🌱',
			description: "You're gaining your first supporters!",
			level: {
				current: 1,
				max: 5
			}
		},
		{
			min: 51,
			max: 200,
			title: 'Rising Star',
			icon: '🎈',
			description: 'Your following is growing steadily.',
			level: {
				current: 2,
				max: 5
			}
		},
		{
			min: 201,
			max: 500,
			title: 'Influencer',
			icon: '💼',
			description: "You're building a strong presence in the community.",
			level: {
				current: 3,
				max: 5
			}
		},
		{
			min: 501,
			max: 1000,
			title: 'Popular Creator',
			icon: '🌟',
			description: 'Your influence is growing rapidly.',
			level: {
				current: 4,
				max: 5
			}
		},
		{
			min: 1001,
			max: null,
			title: 'Community Leader',
			icon: '🏆',
			description: "You're a respected and followed voice.",
			level: {
				current: 5,
				max: 5
			}
		}
	]
};

type Achievement =
	(typeof achievementsData)[keyof typeof achievementsData][number];
export function getAchievement(
	type: keyof typeof achievementsData,
	count: number
): Achievement | null {
	const data = achievementsData[type];
	if (!data) return null;

	for (const achievement of data) {
		const min = achievement.min;
		const max = achievement.max;
		console.log('testing', min, max);
		if (count >= min && (!max || count <= max)) {
			return achievement;
		}
	}

	return null; // In case no achievement matches
}

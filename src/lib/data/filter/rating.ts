import type { book } from '$lib/types';
type ratingTypes = {
	[key in keyof Pick<
		book,
		| 'level_of_immersion_rating'
		| 'character_development_rating'
		| 'world_setting_rating'
		| 'writing_rating'
		| 'plot_rating'
	>]: number;
};

/* export type ratingCriteriaType =
  | "Plot"
  | "Character Design"
  | "World Setting"
  | "Level Of Immersion"
  | "Skill Of Writing";

let ratingMeaning = {
  "Awesome😍": 5,
  "Good😋": 4,
  "Average😜": 3,
  "Passing😔": 2,
  "Nice Try😂": 1,
  idk: 0,
};

let criteriaToDB: { [s in ratingCriteriaType]: keyof book } = {
  "Character Design": "character_development_rating",
  "World Setting": "world_setting_rating",
  "Level Of Immersion": "level_of_immersion_rating",
  "Skill Of Writing": "writing_rating",
  Plot: "plot_rating",
};

let DBRatingToCriteria: { [s in keyof ratingTypes]: ratingCriteriaType } = {
  character_development_rating: "Character Design",
  world_setting_rating: "World Setting",
  level_of_immersion_rating: "Level Of Immersion",
  writing_rating: "Skill Of Writing",
  plot_rating: "Plot",
};let indexToRatingCriteria: { [s in ratingCriteriaType]: number } = {
  "Character Design": 0,
  "World Setting": 1,
  "Level Of Immersion": 2,
  "Skill Of Writing": 3,
  Plot: 4,
};
 */
export type book_ratings = keyof ratingTypes;
export const criteria = [
	'character_development_rating',
	'world_setting_rating',
	'level_of_immersion_rating',
	'writing_rating',
	'plot_rating'
] as (keyof ratingTypes)[];

const ratingIcons = {
	plot_rating: '📙',
	character_development_rating: '👸',
	world_setting_rating: '🗺',
	level_of_immersion_rating: '💤',
	writing_rating: '✍'
} as const;

/* let criteriaIcons: [keyof ratingTypes, string][] = [
  ["plot_rating", "📙"],
  ["character_development_rating", "👸"],
  ["world_setting_rating", "🗺"],
  ["level_of_immersion_rating", "💤"],
  ["writing_rating", "✍"],
];
 */
/* let bookRatingCriteria: [ratingCriteriaType, string][] = [
  ["Plot", "📙"],
  ["Character Design", "👸"],
  ["World Setting", "🗺"],
  ["Level Of Immersion", "💤"],
  ["Skill Of Writing", "✍"],
];
 */
export {
	// ratingMeaning,
	//  bookRatingCriteria as bookCriteria,
	// criteriaToDB,
	//  indexToRatingCriteria,
	//  DBRatingToCriteria,
	// criteria,
	// criteriaIcons,
	ratingIcons
};

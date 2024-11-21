export type previews_kv = {
	author: string;
	emailed: string[];
	reviewed: string[];
	expiredAt: number;
	commented: string[];
	daily_view: { [s in string]: number };
	total_views: number;
};

export type user_setting_book = {
	theme: object;
	setting: { skipVersion: boolean; hideComments: boolean };
};

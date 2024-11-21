import {
	compareAsc,
	differenceInDays,
	differenceInMilliseconds,
	formatDistance
} from 'date-fns';

export const timeAgo = (
	from: number | string | Date,
	to: number | Date = Date.now()
) => {
	if (typeof from == 'string') from = new Date(from);
	//	console.log('time', from, to);
	return formatDistance(from, to, { addSuffix: true });
};
export const addTime = (from: number | Date, to: number | Date = Date.now()) =>
	formatDistance(from, to);
export const getDays = (from: number | Date, to: number | Date = Date.now()) =>
	differenceInDays(from, to);

export const isOutOfGap = (prev: number | Date, gap: number = 500) => {
	return differenceInMilliseconds(Date.now(), prev) > gap;
};

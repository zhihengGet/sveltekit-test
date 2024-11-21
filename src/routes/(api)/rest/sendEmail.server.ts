import { Resend } from 'resend';
import { batchSendBetaReadMailHTML } from '$components/email_template/email';
export const resend = new Resend('re_APxwWAuy_AQP1BTkwZ6mfQjhV7dQV9mEx');

export const sendNotifyOnReviewEmail = async ({
	to,
	html,
	subject
}: {
	to: string;
	html: string;
	subject?: string;
}) => {
	const data = await resend.emails.send({
		from: 'reviews@forkread.com',
		to: to,
		subject: subject ?? 'An reader made a review ',
		html
	});
	if (data.error) console.log('error occurred while emailing ', to);
	console.log(data);
	return data;
};

export const batchSendBetaReadMail = async ({
	author,
	username,
	to,
	words,
	book_name,
	url,
	book_id,
	cover_url,
	description
}: Omit<Parameters<typeof batchSendBetaReadMailHTML>[0], 'to' | 'username'> & {
	to: string[];
	username: string[];
}) => {
	const { data, error } = await resend.batch.send(
		to.map((v, i) => {
			return {
				from: `${author} <betareaders@forkread.com>`,
				to: [v],
				subject:
					'An review invitation from the author of the book  *' +
					book_name.trim() +
					'*',
				html: batchSendBetaReadMailHTML({
					username: username[i],
					author,
					to: v,
					words,
					book_name,
					url,
					book_id,
					cover_url,
					description
				})
			};
		})
	);

	if (error) {
		console.error({ error });
		throw error;
	}
	console.log(data);
	return data?.data.length;
};

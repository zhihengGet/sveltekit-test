import { FileToHTMLFailed } from '$lib/queries/base/errors';

//import mammoth from 'mammoth/mammoth.browser';

// dotted file extension
export function fileExtension(
	filename: string
): '.docx' | '.html' | '.jpg' | '.jpeg' | '.png' | '.txt' {
	//@ts-expect-error idk
	return '.' + (filename.split('.').pop() ?? 'jpg');
}
const cache = new WeakMap();
/**
 *
 * @param file {File}
 * @description convert docx/html to html string
 * @returns  string
 */
export async function toHTML(file: File) {
	//@ts-expect-error import for broswer
	const { convertToHtml } = await import('mammoth/mammoth.browser');
	const type = fileExtension(file.name);

	let html = null;
	if (type == '.docx') {
		const b = await file.arrayBuffer();
		const r = cache.has(file)
			? cache.get(file)
			: await convertToHtml({ arrayBuffer: b })
					//@ts-expect-error idk
					.catch(function (error) {
						console.error(error);
						return null;
					});
		if (r) {
			return r.value;
		}
		return FileToHTMLFailed;
	} else if (type == '.html' || type == '.txt') {
		html = await file.text();
	}
	return html;
}

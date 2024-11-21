import DOMPurify from 'dompurify';
import * as xss from 'xss';
//import DOMPurify from 'isomorphic-dompurify';
// cloudfare does not support
export function IsomorphicSanitizer(html: string) {
	if (typeof window === 'undefined') {
		return xss.default(html, {
			onTagAttr(tag, name, value, isWhiteAttr) {
				console.log(tag, name);
				if (
					['class', 'style', 'dir', 'value', 'id', 'contenteditable'].indexOf(
						name
					) > -1 ||
					name.startsWith('data-') ||
					tag == 'button' ||
					isWhiteAttr
				)
					return name + '="' + xss.default.escapeAttrValue(value) + '"';
				return;
			}
		});
	}
	console.log('dom santized');
	const clean = DOMPurify.sanitize(html);
	return clean;
}

export function clientPurify(html) {
	return DOMPurify.sanitize(html);
}

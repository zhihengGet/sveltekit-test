import { SITE_URL } from '$lib/data/constants';

function isRelativeLink(href: string) {
	var r = new RegExp('^(?:[a-z+]+:)?//', 'i');
	return !r.test(href);
}
const domain = new URL(SITE_URL);
function isExternalLink(href: string) {
	if (isRelativeLink(href)) return;
	const url = new URL(href);
	if (url.hostname.endsWith(domain.hostname)) {
		return false;
	}
	return true;
}
export { isRelativeLink, isExternalLink };

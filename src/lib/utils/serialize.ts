// Encoding UTF-8 ⇢ base64
import * as devalue from 'devalue';

export function stringify(obj: any) {
	return devalue.stringify(obj);
}
export function parse(obj: string) {
	return devalue.parse(obj);
}
function b64EncodeUnicode(str: string) {
	return btoa(
		encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
			return String.fromCharCode(parseInt(p1, 16));
		})
	);
}

// Decoding base64 ⇢ UTF-8

function b64DecodeUnicode(str: string) {
	return decodeURIComponent(
		Array.prototype.map
			.call(atob(str), function (c) {
				return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
			})
			.join('')
	);
}

export { b64DecodeUnicode, b64EncodeUnicode };

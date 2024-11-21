import type { filterOptions } from '$lib/data/filter';
import { maxBy } from 'lodash-es';

/**
 *
 * @param s
 * @returns byte in UTF-8
 */
export function getSize(s: string) {
	return new Blob([s]).size;
}
/**
 * @description probably should use UTF-8 ,  JavaScript uses UTF-16; Blob uses UTF-8 when reading strings (as noted here). UTF-8 and UTF-16 frequently do not use the same number of bytes to represent a string.
 * @link  https://dev.to/rajnishkatharotiya/get-byte-size-of-the-string-in-javascript-20jm
 * @param s
 * @returns byte in UTF-8
 */
export function getUTF16Bytes(s: string) {
	const byteLengthUtf16 = s.length * 2;
	return byteLengthUtf16;
}
/**
 *
 * @param size byte
 * @returns
 */
export function toMb(size: number) {
	return size / 1000000;
}
/**
 *
 * @param size byte
 * @returns filename without ext
 */
export function filename(filename: string) {
	const arr = filename.split('.');
	arr.pop();

	return arr.join('');
}
/**
 *
 * @param size byte
 * @returns
 */
export function renameFile(file: File, newFilename: string) {
	const myRenamedFile = new File([file], newFilename);

	return myRenamedFile;
}

export function stripHTML(html: string) {
	const r = /\s*(<[^>]+>|<script.+?<\/script>|<style.+?<\/style>)\s*/gi;
	return html.replaceAll(r, '');
}
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter/Segmenter#examples
export function IntSegmentor(body: string, locale: string) {
	const segmenterFr = new Intl.Segmenter(locale, { granularity: 'word' });
	let i = 0;
	let segment = segmenterFr.segment(body);
	for (const e of segment) if (e.isWordLike) i++;
	return i;
}
export function WordCountApprox(char: number) {
	// locale aware
	let avg_char_per_word = 5;
	//https://en.wikipedia.org/wiki/English_punctuation
	const average_eng_punch =
		(char / avg_char_per_word / 1000) *
		(65.3 + 61.6 + 26.7 + 24.3 + 15.3 + 5.6 + 3.4 + 3.3 + 3.2);
	const eng_punch = /^[.,:!?]/;

	let approx = Math.ceil((char - average_eng_punch) / avg_char_per_word);
	return approx;
}
//https://stackoverflow.com/questions/18679576/counting-words-in-string
export function WordCount(str: string, lang: string) {
	if (['English', 'english', 'en', 'enUS', 'en-us'].includes(lang)) {
		return EnglishWordCount(str);
	}
}
export function EnglishWordCount(str: string) {
	return (
		str.match(/([a-zA-Z0-9À-ž]+\S?)+/gm)?.filter(function (n) {
			return n != '';
		}).length ?? 0
	);
}
export function getStringInfo({
	html,
	maxLength,
	maxByte,
	useTextContext = true,
	lang = 'English'
}: {
	html: string;
	maxLength: number;
	maxByte: number;
	useTextContext: boolean;
	lang?: string;
}) {
	let data = stripHTML(html);
	const textLength = data.length;
	const raw = html.length;

	const size = getSize(html);
	const char = useTextContext ? textLength : raw;

	const eng_punch = /^[.,:!?]/;

	let approx = EnglishWordCount(data);
	const extra = lang == 'English' ? `Approx.WordCount: ${approx}` : '';
	const text = `Length⦝:${char} Max(${maxLength}), ${extra} , 🖧 Storage:${size / 1e6}MB Max(${maxByte / 1e6}MB)`;

	return {
		textContentLength: textLength,
		isLengthValid: char <= maxLength,
		lengthErrorMessage:
			char <= maxLength
				? ''
				: `Maximum length is ${maxLength},You exceeded by ${char - maxLength}`,
		sizeErrorMessage:
			size <= maxByte
				? ''
				: `Maximum size in KB is ${size / 1e3},You exceeded by ${size / 1e3 - maxByte / 1e3}`,
		isSizeValid: size <= maxByte,
		htmlLength: raw,
		sizeByte: size,
		message: text,
		englishWord: approx
	};
}
// Fill the photo with an indication that none has been
// captured.
/**
 * Converts a data URL to a File object.
 * @param dataUrl - The data URL to convert.
 * @param filename - The desired filename for the resulting File object.
 * @returns A File object created from the data URL.
 * @throws Error if the input is not a valid data URL.
 */
export function dataURLtoFile(dataUrl: string, filename: string): File {
	// Validate input
	if (!dataUrl.startsWith('data:')) {
		throw new Error('Invalid data URL');
	}

	// Split the data URL into its components
	const [header, base64Data] = dataUrl.split(',');
	if (!header || !base64Data) {
		throw new Error('Invalid data URL format');
	}

	// Extract MIME type
	const mimeMatch = header.match(/:(.*?);/);
	if (!mimeMatch) {
		throw new Error('Unable to determine MIME type');
	}
	const mime = mimeMatch[1];

	// Decode base64 data
	let binaryString: string;
	try {
		binaryString = atob(base64Data);
	} catch (error) {
		throw new Error('Invalid base64 data');
	}

	// Convert binary string to Uint8Array
	const bytes = new Uint8Array(binaryString.length);
	for (let i = 0; i < binaryString.length; i++) {
		bytes[i] = binaryString.charCodeAt(i);
	}

	// Create and return File object
	return new File([bytes], filename, { type: mime });
}

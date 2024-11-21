const strength = {
	0: 'Worst',
	1: 'Bad',
	2: 'Weak',
	3: 'Good',
	4: 'Strong'
};
const get = (id: string, valid: boolean) => {
	return { score: valid ? 1 : 0, suggestions: id };
};
//https://webdesign.tutsplus.com/password-validation-with-javascript--cms-107222t
function s(value: string) {
	const a = get('Min. 8 characters', value.length >= 8);
	const b = get('Include lowercase letter', /[a-z]/.test(value));
	const c = get('Include uppercase', /[A-Z]/.test(value));
	const d = get('Include number', /\d/.test(value));
	const e = get(
		'Include a special character: #.-?!@$%^&*',
		/[#.?!@$%^&*-]/.test(value)
	);
	const totalScore = a.score + b.score + c.score + d.score + e.score - 1;
	const invalid = [a, b, c, d, e].filter((v) => v.score == 0);
	return {
		score: totalScore as 0 | 1 | 2 | 3 | 4,
		feedback: { suggestions: invalid.map((v) => v.suggestions) }
	};
}
export function checkPassword(p: string) {
	const {
		score,
		feedback: { suggestions }
	} = s(p); //  zxcvbn(p);

	return {
		score,
		readableScore: strength[score],
		suggestions,
		isValid: score >= 3
	};
}

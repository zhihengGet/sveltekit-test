import { CustomError, loginError } from './errors';
async function isLoggedIn(): Promise<CustomError | true> {
	const id = await getUID();
	if (!id) return loginError;
	return true;
}

// return an rejected promise of user is not logged in
export async function isLoggedInCheck(t: () => any = () => null) {
	if ((await isLoggedIn()) === true) return loginError;
	return t();
}
import { getUID } from '../user';

export async function FetchWrapper(args: {
	checkAuth: true;
	fetchParams: RequestInfo;
}): Promise<Response> {
	if (args.checkAuth) {
		// failed
		return isLoggedInCheck(() => fetch(args.fetchParams));
	}
	return fetch(args.fetchParams);
}

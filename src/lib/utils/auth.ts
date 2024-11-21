import type { Session } from '@supabase/supabase-js';

const ACCESS_TOKEN_STR_COOKIE = 'sp-ssr-session';
export function clearAuthCookie() {
	// delete cookies on sign out
	const expires = new Date(0).toUTCString();
	document.cookie = `${ACCESS_TOKEN_STR_COOKIE}=; path=/; expires=${expires}; SameSite=Lax; secure`;
	document.cookie = `${ACCESS_TOKEN_STR_COOKIE}=; path=/; expires=${expires}; SameSite=Lax; secure`;
}

export function saveSessionToCookie(session: Session | null) {
	if (session) {
		const maxAge = 100 * 365 * 24 * 60 * 60; // 100 years, never expires
		document.cookie = `${ACCESS_TOKEN_STR_COOKIE}=${session.access_token}; path=/; max-age=${maxAge}; SameSite=Lax; secure`;
		document.cookie = `${ACCESS_TOKEN_STR_COOKIE}=${session.refresh_token}; path=/; max-age=${maxAge}; SameSite=Lax; secure`;
	}
}

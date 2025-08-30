import { checkAuth } from '$lib/auth-helpers.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, request }) => {
	// This demo page requires wallet reading permissions
	const requiredScopes = ['esi-wallet.read_character_wallet.v1'];
	
	const authResult = await checkAuth(cookies, request.url, requiredScopes);
	
	return {
		...authResult,
		requiredScopes
	};
};

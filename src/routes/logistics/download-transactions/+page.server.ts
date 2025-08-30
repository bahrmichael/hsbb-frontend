import { checkAuth } from '$lib/auth-helpers';
import { loadCharacterData } from '$lib/logistics/data.ts';

/** @type {import('./$types').PageServerLoad} */
export async function load({ cookies, request }) {
	const authResult = await checkAuth(cookies, request.url);
	if (authResult.requiresSignIn) {
		return authResult;
	}

	const characterId = +(authResult.characterId ?? '0');
	if (!characterId) {
		return {
			...authResult,
			error: 'No character ID found'
		};
	}

	const { transactions } = await loadCharacterData(characterId, 30);

	return {
		...authResult,
		transactions
	};
}

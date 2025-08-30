import { checkAuth } from '$lib/auth-helpers';

export async function load({ cookies, request }) {
	const authResult = await checkAuth(cookies, request.url);
	if (authResult.requiresSignIn) {
		return authResult;
	}

	return {
		characterId: authResult.characterId,
		characterName: authResult.name,
		token: authResult.token,
		iat: authResult.iat
	};
}

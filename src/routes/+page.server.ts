import { decodeJwt } from '$lib/decode-jwt.ts';

export async function load({ cookies, request }) {
	const oldToken = cookies.get('token-v1');
	if (oldToken) {
		cookies.delete('token-v1', { path: '/' });
	}

	const token = cookies.get('token-v2');
	if (!token) {
		return {
			requiresSignIn: true
		};
	}

	try {
		const { characterId, name, iat } = await decodeJwt(token, request.url);

		return {
			characterId,
			characterName: name,
			token,
			iat
		};
	} catch (e) {
		console.error(e);
		return {
			requiresSignIn: true
		};
	}
}

import { decodeJwt } from '$lib/decode-jwt.ts';

export async function load({ cookies, request }) {
	const token = cookies.get('token-v1');
	if (!token) {
		return {
			requiresSignIn: true,
		};
	}

	const { characterId, name, iat } = await decodeJwt(token, request.url);

	return {
		characterId,
		characterName: name,
		token,
		iat,
	};
}
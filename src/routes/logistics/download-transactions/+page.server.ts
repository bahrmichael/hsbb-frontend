import { decodeJwt } from '$lib/decode-jwt.ts';
import { loadCharacterData } from '$lib/logistics/data.ts';
import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ cookies, request }) {
	const token = cookies.get('token-v1');
	if (!token) {
		return error(403);
	}

	const { characterId, name, iat } = await decodeJwt(token, request.url);

	const {
		transactions,
	} = await loadCharacterData(characterId, 30);

	return {
		characterId,
		characterName: name,
		token,
		iat,
		transactions,
	};
}
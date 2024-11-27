import { decodeJwt } from '$lib/decode-jwt.ts';
import { error } from '@sveltejs/kit';
import { loadCharacterData } from '$lib/logistics/data.ts';

/** @type {import('./$types').PageServerLoad} */
export async function load({ cookies, params }) {
	const token = cookies.get('token-v1');
	if (!token) {
		throw error(401, 'Unauthorized');
	}

	const { characterId, iat } = await decodeJwt(token, 'token-v1');

	if (characterId !== 93475128) {
		throw error(403, 'Forbidden');
	}

	const targetId = params.characterId;
	if (!targetId) {
		throw error(400, 'Can\'t resolve characterId from path.');
	}

	const {
		name,
		outstandingContracts,
		transactions,
		remainingContractCollateral,
		balance,
		pendingItems,
	} = await loadCharacterData(+targetId);

	return {
		characterId,
		characterName: 'Admin',
		token,
		iat,
		outstandingContracts,
		transactions,
		remainingContractCollateral,
		balance,
		name,
		pendingItems,
	};
}


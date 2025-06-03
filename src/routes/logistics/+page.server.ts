import { decodeJwt } from '$lib/decode-jwt.ts';
import { getRequestStatus, loadCharacterData } from '$lib/logistics/data.ts';

/** @type {import('./$types').PageServerLoad} */
export async function load({ cookies, request }) {
	const token = cookies.get('token-v2');
	if (!token) {
		return {
			requiresSignIn: true
		};
	}

	const { characterId, name, iat } = await decodeJwt(token, request.url);

	const { balance, transactions, remainingContractCollateral, outstandingContracts, pendingItems } =
		await loadCharacterData(characterId, 30);

	const { hasContractRequest, hasPayoutRequest } = await getRequestStatus(characterId);

	return {
		characterId,
		characterName: name,
		token,
		iat,
		hasContractRequest,
		hasPayoutRequest,
		balance,
		transactions,
		remainingContractCollateral,
		outstandingContracts,
		pendingItems
	};
}

import { checkAuth } from '$lib/auth-helpers';
import { getRequestStatus, loadCharacterData } from '$lib/logistics/data.ts';

/** @type {import('./$types').PageServerLoad} */
export async function load({ cookies, request }) {
	const authResult = await checkAuth(cookies, request.url);
	if (authResult.requiresSignIn) {
		return authResult;
	}

	const characterId = +(authResult.characterId ?? '0');
	if (!characterId) {
		throw new Error('Invalid character ID');
	}

	const { balance, transactions, remainingContractCollateral, outstandingContracts, pendingItems } =
		await loadCharacterData(characterId, 30);

	const { hasContractRequest, hasPayoutRequest } = await getRequestStatus(characterId);

	return {
		...authResult,
		hasContractRequest,
		hasPayoutRequest,
		balance,
		transactions,
		remainingContractCollateral,
		outstandingContracts,
		pendingItems
	};
}

import { checkAuth } from '$lib/auth-helpers';
import { getVercelStorageClient } from '$lib/vercel-storage.ts';

export async function load({ cookies, request }) {
	const authResult = await checkAuth(cookies, request.url);
	if (authResult.requiresSignIn) {
		return authResult;
	}

	const kv = getVercelStorageClient();

	const transactions = (await kv.get(`transactions:${authResult.characterId}`)) || [];

	// Current balance is the balance from the latest transaction, or 0 if no transactions
	const currentBalance =
		Array.isArray(transactions) && transactions.length > 0 ? transactions[0].balance : 0;

	return {
		...authResult,
		balance: currentBalance,
		transactions
	};
}

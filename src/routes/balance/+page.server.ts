import { decodeJwt } from '$lib/decode-jwt.ts';
import { getVercelStorageClient } from '$lib/vercel-storage.ts';

export async function load({ cookies, request }) {
	const token = cookies.get('token-v1');
	if (!token) {
		return {
			requiresSignIn: true
		};
	}

	const { characterId, name, iat } = await decodeJwt(token, request.url);
	const kv = getVercelStorageClient();

	// Retrieve transactions from Vercel KV using character ID as key
	const transactions = (await kv.get(`transactions:${characterId}`)) || [];

	// Current balance is the balance from the latest transaction, or 0 if no transactions
	const currentBalance =
		Array.isArray(transactions) && transactions.length > 0 ? transactions[0].balance : 0;

	return {
		characterId,
		characterName: name,
		token,
		iat,
		balance: currentBalance,
		transactions
	};
}

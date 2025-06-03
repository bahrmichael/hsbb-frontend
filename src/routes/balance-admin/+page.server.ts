import { error } from '@sveltejs/kit';
import { decodeJwt } from '$lib/decode-jwt.ts';
import { getVercelStorageClient } from '$lib/vercel-storage.ts';
import axios from 'axios';

interface TransactionRecord {
	date: string;
	reward: number;
	balance: number;
}

interface CharacterBalance {
	character_id: string;
	balance: number;
	character_name?: string;
	last_transaction_date?: string;
}

/** @type {import('./$types').PageServerLoad} */
export async function load({ cookies, request }) {
	const token = cookies.get('token-v1');
	if (!token) {
		throw error(401, 'Unauthorized');
	}

	const { characterId, name, iat } = await decodeJwt(token, request.url);

	if (name !== 'Lerso Nardieu') {
		throw error(403, 'Forbidden');
	}

	const kv = getVercelStorageClient();
	const balances: CharacterBalance[] = [];

	// Scan for all transaction keys
	let cursor = 0;
	do {
		const result = await kv.scan(cursor, { match: 'transactions:*', count: 100 });
		console.log({ result });
		cursor = result[0];
		const keys = result[1];

		for (const key of keys) {
			const transactions: TransactionRecord[] = (await kv.get(key)) ?? [];
			if (transactions && transactions.length > 0) {
				// Sort transactions by date to get the most recent
				transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

				const characterId = key.replace('transactions:', '');
				const latestTransaction = transactions[0];

				balances.push({
					character_id: characterId,
					balance: latestTransaction.balance,
					last_transaction_date: latestTransaction.date
				});
			}
		}
	} while (cursor !== 0);

	// Get character names from EVE ESI API
	const characterIds = balances.map((b) => parseInt(b.character_id)).filter((id) => !isNaN(id));
	let characters: { id: number; name: string }[] = [];

	if (characterIds.length > 0) {
		try {
			characters = (
				await axios.post(`https://esi.evetech.net/v3/universe/names`, characterIds)
			).data.filter((r) => r.category === 'character');
		} catch (e) {
			console.error('Failed to fetch character names:', e);
		}
	}

	// Merge character names with balances
	for (const balance of balances) {
		const character = characters.find((c) => c.id === parseInt(balance.character_id));
		if (character) {
			balance.character_name = character.name;
		}
	}

	// Sort by balance descending
	balances.sort((a, b) => b.balance - a.balance);

	return {
		characterId,
		characterName: name,
		token,
		iat,
		balances
	};
}

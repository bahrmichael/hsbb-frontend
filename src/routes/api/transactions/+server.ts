import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { getVercelStorageClient } from '$lib/vercel-storage.js';

interface Transaction {
	character_id: string;
	date: string;
	reward: number;
}

interface TransactionRecord {
	date: string;
	reward: number;
	balance: number;
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	const apiKey = request.headers.get('x-api-key');
	if (!apiKey || apiKey !== env.HSBB_TRANSACTIONS_API_KEY) {
		throw error(401, 'Unauthorized');
	}

	const transactions: Transaction[] = await request.json();
	if (!Array.isArray(transactions)) {
		throw error(400, 'Request body must be an array of transactions');
	}

	const client = getVercelStorageClient();

	for (const transaction of transactions) {
		if (!transaction.character_id || !transaction.date || typeof transaction.reward !== 'number') {
			throw error(400, 'Each transaction must have character_id, date, and reward fields');
		}

		const key = `transactions:${transaction.character_id}`;

		// Get existing transactions for this character
		const existingTransactions: TransactionRecord[] = (await client.get(key)) || [];

		// Sort transactions by date to ensure chronological order
		existingTransactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

		// Calculate new balance by adding reward to the latest balance (or 0 if no transactions)
		const latestBalance =
			existingTransactions.length > 0
				? existingTransactions[existingTransactions.length - 1].balance
				: 0;
		const newBalance = latestBalance + transaction.reward;

		// Create new transaction record
		const newRecord: TransactionRecord = {
			date: transaction.date,
			reward: transaction.reward,
			balance: newBalance
		};

		// Add new record to the list
		existingTransactions.push(newRecord);

		// Trim to keep only transactions from the last 30 days
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
		const recentTransactions = existingTransactions
			.filter((t) => new Date(t.date) >= thirtyDaysAgo)
			.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

		// Save back to KV store
		await client.set(key, recentTransactions);
	}

	return new Response(
		JSON.stringify({
			success: true
		}),
		{
			status: 200,
			headers: {
				'Content-Type': 'application/json'
			}
		}
	);
}

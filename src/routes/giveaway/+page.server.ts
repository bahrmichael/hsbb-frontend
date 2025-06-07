import { error } from '@sveltejs/kit';
import { getVercelStorageClient } from '$lib/vercel-storage.ts';

const kv = getVercelStorageClient();

/** @type {import('./$types').PageServerLoad} */
export async function load({ url }) {
	const redeemCode = url.searchParams.get('code');

	if (!redeemCode) {
		throw error(400, 'Redeem code is required');
	}

	const redeemData = await kv.get(`redeem:${redeemCode}`);
	if (!redeemData) {
		throw error(404, 'Invalid or expired redeem code');
	}

	const giveawayNames = await getAvailableGiveaways();

	if (giveawayNames.length === 0) {
		throw error(503, 'No giveaways are currently available');
	}

	return {
		redeemCode,
		giveawayNames
	};
}

async function getAvailableGiveaways() {
	const names = await kv.smembers('giveaway:names');
	const result: { name: string; availableCount: number }[] = [];

	for (const name of names || []) {
		const count = await kv.llen(`giveaway:${name}:codes`);
		const availableCount = count || 0;

		// Only include giveaways with available codes
		if (availableCount > 0) {
			result.push({
				name: name as string,
				availableCount
			});
		}
	}

	return result.sort((a, b) => a.name.localeCompare(b.name));
}

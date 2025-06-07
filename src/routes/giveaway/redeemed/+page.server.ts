import { error } from '@sveltejs/kit';
import { getVercelStorageClient } from '$lib/vercel-storage.ts';

const kv = getVercelStorageClient();

/** @type {import('./$types').PageServerLoad} */
export async function load({ url }) {
	const redeemCode = url.searchParams.get('redeemCode');
	const giveawayName = decodeURIComponent(url.searchParams.get('selectedGiveaway') ?? '');

	if (!redeemCode || !giveawayName) {
		return error(400, 'Redeem code and giveaway selection are required');
	}

	const redeemData = await kv.get(`redeem:${redeemCode}`);
	if (!redeemData) {
		return error(404, 'Invalid or expired redeem code');
	}

	// Get a skin code from the selected giveaway
	const skinCode = await drawGiveawayCode(giveawayName);
	if (!skinCode) {
		return error(404, 'No codes available for this giveaway');
	}

	// Mark redeem code as used and delete it
	await kv.del(`redeem:${redeemCode}`);

	return {
		skinCode
	};
}

async function drawGiveawayCode(giveawayName: string) {
	const code = await kv.lpop(`giveaway:${giveawayName}:codes`);
	return code as string | null;
}

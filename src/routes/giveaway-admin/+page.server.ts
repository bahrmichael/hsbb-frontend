import { error, fail } from '@sveltejs/kit';
import { decodeJwt } from '$lib/decode-jwt.ts';
import { getVercelStorageClient } from '$lib/vercel-storage.ts';

const kv = getVercelStorageClient();

/** @type {import('./$types').PageServerLoad} */
export async function load({ cookies, request }) {
	const token = cookies.get('token-v2');
	if (!token) {
		throw error(401, 'Unauthorized');
	}

	const { characterId, name, iat } = await decodeJwt(token, request.url);

	if (name !== 'Lerso Nardieu') {
		throw error(403, 'Forbidden');
	}

	const giveawayNames = await getGiveawayNames();

	return {
		characterId,
		characterName: name,
		token,
		iat,
		giveawayNames
	};
}

/** @type {import('./$types').Actions} */
export const actions = {
	addCodes: async ({ request, cookies }) => {
		const token = cookies.get('token-v2');
		if (!token) {
			throw error(401, 'Unauthorized');
		}

		const { name } = await decodeJwt(token, request.url);
		if (name !== 'Lerso Nardieu') {
			throw error(403, 'Forbidden');
		}

		const data = await request.formData();
		const giveawayName = data.get('name')?.toString()?.trim();
		const codes = data.get('codes')?.toString()?.trim();

		if (!giveawayName || !codes) {
			return fail(400, { error: 'Name and codes are required' });
		}

		const codeList = codes
			.split('\n')
			.map((code) => code.trim())
			.filter((code) => code.length > 0);

		if (codeList.length === 0) {
			return fail(400, { error: 'No valid codes provided' });
		}

		try {
			await addGiveawayCodes(giveawayName, codeList);
			return { success: true, added: codeList.length };
		} catch (e) {
			console.error('Failed to add giveaway codes:', e);
			return fail(500, { error: 'Failed to add codes' });
		}
	},

	generateRedeemCode: async ({ request, cookies }) => {
		const token = cookies.get('token-v2');
		if (!token) {
			throw error(401, 'Unauthorized');
		}

		const { name } = await decodeJwt(token, request.url);
		if (name !== 'Lerso Nardieu') {
			throw error(403, 'Forbidden');
		}

		try {
			const redeemCode = await generateRedeemCode();
			return { generatedRedeemCode: redeemCode };
		} catch (e) {
			console.error('Failed to generate redeem code:', e);
			return fail(500, { error: 'Failed to generate redeem code' });
		}
	}
};

// Data structure design:
// giveaway:names -> Set of all giveaway names
// giveaway:${name}:codes -> List of available codes for a giveaway
// giveaway:${name}:used -> List of used codes (for audit trail)
// redeem:${code} -> Redeem code metadata with creation timestamp

async function addGiveawayCodes(giveawayName: string, codes: string[]) {
	// Add giveaway name to the set of names
	await kv.sadd('giveaway:names', giveawayName);

	// Add codes to the giveaway's code list
	if (codes.length > 0) {
		await kv.lpush(`giveaway:${giveawayName}:codes`, ...codes);
	}
}

async function getGiveawayNames() {
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

async function generateRedeemCode() {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	let result = '';
	for (let i = 0; i < 20; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}

	const redeemCode = `HSBB-${result}`;

	// Store redeem code with metadata
	await kv.set(
		`redeem:${redeemCode}`,
		JSON.stringify({
			createdAt: new Date().toISOString()
		})
	);

	return redeemCode;
}

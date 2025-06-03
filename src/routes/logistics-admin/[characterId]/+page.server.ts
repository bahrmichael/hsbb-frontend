import { decodeJwt } from '$lib/decode-jwt.ts';
import { error } from '@sveltejs/kit';
import { loadCharacterData } from '$lib/logistics/data.ts';
import axios from 'axios';
import { env } from '$env/dynamic/private';

async function getItemsValue(items: { typeName: string; amount: number }[]): Promise<number> {
	if (items.length === 0) {
		return 0;
	}
	const janice = axios.create({
		baseURL: `https://janice.e-351.com/api/rest`,
		headers: {
			'X-ApiKey': env.JANICE_API_KEY,
			'Accept-Encoding': 'gzip,deflate,compress',
			'User-Agent': env.JANICE_USER_AGENT
		}
	});

	const text = items.map((i) => `${i.typeName} x${Math.abs(i.amount)}`).join('\n');
	const janiceResult = (
		await janice.post(`/v2/appraisal?market=2&persist=true&compactize=true`, text, {
			headers: {
				'Content-Type': 'text/plain',
				accept: 'application/json'
			}
		})
	).data;

	return Math.ceil(janiceResult.effectivePrices.totalBuyPrice);
}

/** @type {import('./$types').PageServerLoad} */
export async function load({ cookies, params }) {
	const token = cookies.get('token-v2');
	if (!token) {
		throw error(401, 'Unauthorized');
	}

	const { characterId, iat } = await decodeJwt(token, 'token-v2');

	if (characterId !== 93475128) {
		throw error(403, 'Forbidden');
	}

	const targetId = params.characterId;
	if (!targetId) {
		throw error(400, "Can't resolve characterId from path.");
	}

	const {
		name,
		outstandingContracts,
		transactions,
		remainingContractCollateral,
		balance,
		pendingItems
	} = await loadCharacterData(+targetId, 60);

	const surplusItems = pendingItems.filter((i) => i.amount < 0);
	let clearableValue: number;
	if (surplusItems.length > 0) {
		clearableValue = await getItemsValue(surplusItems);
	} else {
		clearableValue = -1 * (await getItemsValue(pendingItems.filter((i) => i.amount > 0)));
	}

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
		clearableValue
	};
}

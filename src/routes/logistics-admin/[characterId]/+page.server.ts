import { decodeJwt } from '$lib/decode-jwt.ts';
import { error } from '@sveltejs/kit';
import { loadCharacterData } from '$lib/logistics/data.ts';
import axios from 'axios';
import { env } from '$env/dynamic/private';

const SKIP_JANICE = true;

/** @type {import('./$types').PageServerLoad} */
export async function load({ cookies, params }) {
	const token = cookies.get('token-v1');
	if (!token) {
		throw error(401, 'Unauthorized');
	}

	const { characterId, iat } = await decodeJwt(token, 'token-v1');

	if (characterId !== 93475128) {
		throw error(403, 'Forbidden');
	}

	const targetId = params.characterId;
	if (!targetId) {
		throw error(400, 'Can\'t resolve characterId from path.');
	}

	const {
		name,
		outstandingContracts,
		transactions,
		remainingContractCollateral,
		balance,
		pendingItems,
	} = await loadCharacterData(+targetId, undefined);

	let janiceCalc = 'incomplete';
	if (!!pendingItems.length && !SKIP_JANICE) {
		const anyPositive = !!pendingItems.find((i) => i.amount > 0);
		const anyNegative = !!pendingItems.find((i) => i.amount < 0);

		if (anyPositive && anyNegative) {
			janiceCalc = 'mixed';
		} else {

			const janice = axios.create({
				baseURL: `https://janice.e-351.com/api/rest`,
				headers: {
					'X-ApiKey': env.JANICE_API_KEY,
					'Accept-Encoding': 'gzip,deflate,compress',
					'User-Agent': env.JANICE_USER_AGENT
				}
			});

			const text = pendingItems.map((i) => `${i.typeName} x${Math.abs(i.amount)}`).join('\n');
			const janiceResult = (await janice.post(`/v2/appraisal?market=2&persist=true&compactize=true`, text, {
				headers: {
					'Content-Type': 'text/plain',
					'accept': 'application/json',
				}
			})).data;

			janiceCalc = `https://janice.e-351.com/a/${janiceResult.code}`;
		}

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
		janiceCalc,
	};
}


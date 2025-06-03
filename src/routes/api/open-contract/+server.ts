import { error } from '@sveltejs/kit';
import { decodeJwt } from '$lib/decode-jwt.ts';
import { getAccessToken } from '$lib/eve-identity.ts';
import axios from 'axios';

/** @type {import('./$types').RequestHandler} */
export async function POST({ url, cookies }) {
	const contractIdParam = url.searchParams.get('contractId');
	if (!contractIdParam) {
		error(400, 'contractId is required');
	}
	const contractId = Number(contractIdParam);

	if (isNaN(contractId)) {
		error(400, 'contractId must be a number');
	}

	const token = cookies.get('token-ingame');
	if (!token) {
		error(401, 'Unauthorized');
	}

	try {
		await decodeJwt(token, 'ingame');
	} catch (e) {
		console.error(e);
		throw error(401, 'Unauthorized');
	}
	const { characterId } = await decodeJwt(token, 'ingame');
	const { accessToken } = await getAccessToken(characterId);

	await axios.post(
		`https://esi.evetech.net/latest/ui/openwindow/contract/?contract_id=${contractId}&token=${accessToken}`
	);
	return new Response(null, { status: 200 });
}

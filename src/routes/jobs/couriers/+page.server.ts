import { env } from '$env/dynamic/private';
import { createClient } from '@vercel/kv';

function getClient() {
	return createClient({
		url: env.KV_REST_API_URL,
		token: env.KV_REST_API_TOKEN
	});
}

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	const data: any = await getClient().get('couriers-outstanding');
	return {
		// the filter against d1 is a safety guard that this courier has received all the necessary data, and is not in a broken state
		couriers: data.filter((c: any) => c.d1 > 0),
	}
}
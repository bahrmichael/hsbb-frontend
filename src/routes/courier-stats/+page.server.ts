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
	const data = await getClient().get('couriers-snapshot');
	return {
		couriers: data,
	}
}
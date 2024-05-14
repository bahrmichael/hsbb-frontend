import { createClient } from '@vercel/kv';
import { env } from '$env/dynamic/private';

export function getVercelStorageClient() {
	return createClient({
		url: env.KV_REST_API_URL,
		token: env.KV_REST_API_TOKEN
	});
}
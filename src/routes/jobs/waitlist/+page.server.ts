import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { decodeJwt } from '$lib/decode-jwt.ts';
import { getVercelStorageClient } from '$lib/vercel-storage.ts';

export async function load({ cookies, request }) {
	const token = cookies.get('token-v1');
	if (!token) {
		return {
			requiresSignIn: true,
		};
	}

	const { characterId, name } = await decodeJwt(token, request.url);
	const active = ((await getVercelStorageClient().get(`waitlist:${characterId}`)) as string ?? 'inactive').startsWith('active')

	return {
		characterId,
		characterName: name,
		active,
	};
}

export const actions: Actions = {
	default: async ({ cookies, request }) => {
		const token = cookies.get('token-v1');
		if (!token) {
			return fail(400, { error: 'Token missing.' });
		}

		const {characterId} = await decodeJwt(token, request.url);

		const client = getVercelStorageClient();

		const current = (await client.get(`waitlist:${characterId}`) ?? 'inactive') as string;
		await client.set(`waitlist:${characterId}`, current.startsWith('active') ? 'inactive' : `active:${new Date().toISOString()}`);

		return redirect(300, '/jobs/waitlist');
	},
}
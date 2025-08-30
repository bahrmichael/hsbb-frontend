import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { getVercelStorageClient } from '$lib/vercel-storage.ts';
import { checkAuth } from '$lib/auth-helpers';

export async function load({ cookies, request }) {
	const authResult = await checkAuth(cookies, request.url);
	if (authResult.requiresSignIn) {
		return authResult;
	}

	const active = (
		((await getVercelStorageClient().get(`waitlist:${authResult.characterId}`)) as string) ??
		'inactive'
	).startsWith('active');

	return {
		...authResult,
		active
	};
}

export const actions: Actions = {
	default: async ({ cookies, request }) => {
		const token = cookies.get('token-v2');
		if (!token) {
			return fail(400, { error: 'Token missing.' });
		}

		const { characterId } = await decodeJwt(token, request.url);

		const client = getVercelStorageClient();

		const current = ((await client.get(`waitlist:${characterId}`)) ?? 'inactive') as string;
		await client.set(
			`waitlist:${characterId}`,
			current.startsWith('active') ? 'inactive' : `active:${new Date().toISOString()}`
		);

		return redirect(300, '/jobs/waitlist');
	}
};

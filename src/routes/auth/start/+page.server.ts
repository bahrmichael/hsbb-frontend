import { redirect, error } from '@sveltejs/kit';
import { getVercelStorageClient } from '$lib/vercel-storage.ts';
import { ulid } from 'ulid';
import type { PageServerLoad } from './$types';
import { CLIENT_CONFIGS, urlOriginToInstance } from '$lib/eve-auth';

export const load: PageServerLoad = async ({ url }) => {
	const searchParams = url.searchParams;
	const scope = searchParams.get('scope');
	const redirectTo = searchParams.get('redirectTo');

	if (!redirectTo) {
		error(400, 'Missing required parameters: scope and redirectTo');
	}

	// Generate state ULID
	const state = ulid();

	// Determine instance based on URL
	const { clientId } = CLIENT_CONFIGS[urlOriginToInstance(url.origin)];

	try {
		// Store state and redirectTo in KV storage
		const client = getVercelStorageClient();
		await client.setex(`auth:state:${state}`, 600, redirectTo); // 10 minute expiration
	} catch (err) {
		console.error('Failed to store auth state:', err);
		error(500, 'Failed to start authentication flow');
	}

	// Build EVE SSO authorization URL
	const authUrl = new URL('https://login.eveonline.com/v2/oauth/authorize');
	authUrl.searchParams.set('response_type', 'code');
	authUrl.searchParams.set('client_id', clientId);
	authUrl.searchParams.set('redirect_uri', `${url.origin}/auth/callback`);
	authUrl.searchParams.set('scope', scope ?? '');
	authUrl.searchParams.set('state', state);

	// Redirect to EVE SSO (outside try/catch since redirect() throws internally)
	redirect(302, authUrl.toString());
};

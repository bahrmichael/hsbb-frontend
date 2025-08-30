import { redirect, error } from '@sveltejs/kit';
import { getVercelStorageClient } from '$lib/vercel-storage.ts';
import * as jwt from 'jose';
import type { PageServerLoad } from './$types';
import { CLIENT_CONFIGS, urlOriginToInstance } from '$lib/eve-auth';

const EVE_SSO_TOKEN_URL = 'https://login.eveonline.com/v2/oauth/token';

interface TokenResponse {
	access_token: string;
	refresh_token: string;
	expires_in: number;
	token_type: string;
}

interface TokenClaims {
	sub: string; // character ID
	name: string;
	iss: string;
	aud: string[];
	iat: number;
	exp: number;
	scp: string[]; // scopes
}

export const load: PageServerLoad = async ({ url, cookies }) => {
	const searchParams = url.searchParams;
	const code = searchParams.get('code');
	const state = searchParams.get('state');

	if (!code || !state) {
		error(400, 'Missing authorization code or state');
	}

	let redirectTo: string;

	try {
		// Check if state exists in KV storage
		const client = getVercelStorageClient();
		const storedRedirectTo = await client.get(`auth:state:${state}`);

		if (!storedRedirectTo) {
			error(400, 'Invalid or expired state parameter');
		}

		redirectTo = storedRedirectTo as string;

		// Delete the state from storage (one-time use)
		await client.del(`auth:state:${state}`);

		const instance = urlOriginToInstance(url.origin);
		const { clientId, clientSecret } = CLIENT_CONFIGS[instance];

		if (!clientSecret) {
			console.error(`Missing client secret for ${url.origin}`);
			error(500, 'Server configuration error');
		}

		// Exchange authorization code for tokens
		const tokenResponse = await exchangeCodeForTokens(
			code,
			clientId,
			clientSecret,
			instance,
			url.toString()
		);

		// Decode the access token to get character information
		const claims = jwt.decodeJwt(tokenResponse.access_token) as TokenClaims;
		const characterId = claims.sub.split(':')[2]; // Extract character ID from "CHARACTER:EVE:12345678"

		// Store refresh token and claims in KV storage
		await storeUserTokens(characterId, tokenResponse, claims);

		// Issue our own JWT
		const ownJwt = await issueOwnJwt(characterId, claims, url.origin);

		// Set cookie with our JWT
		cookies.set('token-v2', ownJwt, {
			path: '/',
			maxAge: 60 * 60 * 24 * 365 * 10, // 10 years
			httpOnly: true,
			secure: true
		});
	} catch (err) {
		console.error('Authentication error:', err);
		error(500, 'Authentication failed');
	}

	// Redirect to the original destination (outside try/catch since redirect() throws internally)
	redirect(302, redirectTo);
};

async function exchangeCodeForTokens(
	code: string,
	clientId: string,
	clientSecret: string,
	instance: string,
	requestUrl: string
): Promise<TokenResponse> {
	const credentials = btoa(`${clientId}:${clientSecret}`);

	// Use the same redirect URI logic as the start flow
	const url = new URL(requestUrl);
	const redirectUri =
		url.hostname === 'localhost'
			? `http://localhost:5173/auth/callback`
			: `https://${instance}.evebuyback.com/auth/callback`;

	const response = await fetch(EVE_SSO_TOKEN_URL, {
		method: 'POST',
		headers: {
			Authorization: `Basic ${credentials}`,
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams({
			grant_type: 'authorization_code',
			code: code,
			redirect_uri: redirectUri
		})
	});

	if (!response.ok) {
		const errorText = await response.text();
		console.error('Token exchange failed:', errorText);
		throw new Error(`Token exchange failed: ${response.status}`);
	}

	return await response.json();
}

async function storeUserTokens(
	characterId: string,
	tokenResponse: TokenResponse,
	claims: TokenClaims
): Promise<void> {
	const client = getVercelStorageClient();

	// Check if user already exists
	const existingData = await client.get(`user:${characterId}`);

	const userData = {
		characterId,
		name: claims.name,
		refreshToken: tokenResponse.refresh_token,
		scopes: claims.scp || [],
		lastLogin: new Date().toISOString(),
		...(existingData && typeof existingData === 'object' ? existingData : {})
	};

	// If existing data has scopes, merge them with new scopes
	if (existingData && typeof existingData === 'object' && 'scopes' in existingData) {
		const existingScopes = Array.isArray(existingData.scopes) ? existingData.scopes : [];
		userData.scopes = [...new Set([...existingScopes, ...userData.scopes])];
	}

	// Store user data (no expiration for user data)
	await client.set(`user:${characterId}`, userData);
}

async function issueOwnJwt(
	characterId: string,
	claims: TokenClaims,
	urlOrigin: string
): Promise<string> {
	const jwtKey = CLIENT_CONFIGS[urlOriginToInstance(urlOrigin)].jwt;

	const secret = new TextEncoder().encode(jwtKey);

	const payload = {
		characterId,
		name: claims.name,
		scopes: claims.scp ?? [],
		iat: Math.floor(Date.now() / 1000)
	};

	return await new jwt.SignJWT(payload)
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime('10y')
		.sign(secret);
}

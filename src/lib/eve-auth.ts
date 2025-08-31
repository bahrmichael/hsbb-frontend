import { getVercelStorageClient } from '$lib/vercel-storage.ts';
import { env } from '$env/dynamic/private';

const EVE_SSO_TOKEN_URL = 'https://login.eveonline.com/v2/oauth/token';

export function urlOriginToInstance(url: string): 'highsec' | 'lowsec' | 'localhost' {
	if (url.includes('localhost')) {
		return 'localhost';
	}
	return url.includes('lowsec') ? 'lowsec' : 'highsec';
}

export const CLIENT_CONFIGS = {
	highsec: {
		clientId: '7817dc406c90427db9d3570bb3cc495b',
		clientSecret: env.EVE_CLIENT_SECRET_HIGHSEC,
		jwt: env.EVE_JWT_KEY_HIGHSEC
	},
	lowsec: {
		clientId: '542b75e8f71c4fb8aec7d58cdbc1fba5',
		clientSecret: env.EVE_CLIENT_SECRET_LOWSEC,
		jwt: env.EVE_JWT_KEY_LOWSEC
	},
	localhost: {
		clientId: '1ebac362ff4e41c09d4078f7267adcfa',
		clientSecret: env.EVE_CLIENT_SECRET_LOCALHOST,
		jwt: 'S3cRET!'
	}
};

interface TokenResponse {
	access_token: string;
	refresh_token: string;
	expires_in: number;
	token_type: string;
}

interface UserData {
	characterId: string;
	name: string;
	refreshToken: string;
	scopes: string[];
	lastLogin: string;
}

/**
 * Get a fresh access token for a character using their stored refresh token
 */
export async function getAccessToken(
	characterId: string,
	instance: 'highsec' | 'lowsec' = 'highsec'
): Promise<string | null> {
	try {
		const client = getVercelStorageClient();
		const userData = (await client.get(`user:${characterId}`)) as UserData | null;

		if (!userData || !userData.refreshToken) {
			console.error(`No refresh token found for character ${characterId}`);
			return null;
		}

		const { clientId, clientSecret } = CLIENT_CONFIGS[instance];

		if (!clientSecret) {
			console.error(`Missing client secret for ${instance}`);
			return null;
		}

		const credentials = btoa(`${clientId}:${clientSecret}`);

		const response = await fetch(EVE_SSO_TOKEN_URL, {
			method: 'POST',
			headers: {
				Authorization: `Basic ${credentials}`,
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: new URLSearchParams({
				grant_type: 'refresh_token',
				refresh_token: userData.refreshToken
			})
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error('Token refresh failed:', errorText);

			// If refresh token is invalid, remove user data
			if (response.status === 400) {
				await client.del(`user:${characterId}`);
			}

			return null;
		}

		const tokenResponse: TokenResponse = await response.json();

		// Update refresh token in storage if a new one was provided
		if (tokenResponse.refresh_token && tokenResponse.refresh_token !== userData.refreshToken) {
			userData.refreshToken = tokenResponse.refresh_token;
			await client.set(`user:${characterId}`, userData);
		}

		return tokenResponse.access_token;
	} catch (error) {
		console.error('Error getting access token:', error);
		return null;
	}
}

/**
 * Get user data from storage
 */
export async function getUserData(characterId: string): Promise<UserData | null> {
	try {
		const client = getVercelStorageClient();
		const userData = (await client.get(`user:${characterId}`)) as UserData | null;
		return userData;
	} catch (error) {
		console.error('Error getting user data:', error);
		return null;
	}
}

/**
 * Check if user has required scopes
 */
export async function hasRequiredScopes(
	characterId: string,
	requiredScopes: string[]
): Promise<boolean> {
	const userData = await getUserData(characterId);
	if (!userData) return false;

	return requiredScopes.every((scope) => userData.scopes.includes(scope));
}

/**
 * Get missing scopes for a user
 */
export async function getMissingScopes(
	characterId: string,
	requiredScopes: string[]
): Promise<string[]> {
	const userData = await getUserData(characterId);
	if (!userData) return requiredScopes;

	return requiredScopes.filter((scope) => !userData.scopes.includes(scope));
}

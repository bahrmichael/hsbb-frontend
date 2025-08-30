import * as jwt from 'jose';
import { getVercelStorageClient } from '$lib/vercel-storage.ts';

async function getKey(instance: string) {
	const client = getVercelStorageClient();
	const jwtKey = await client.get(`${instance}:jwt`);
	if (!jwtKey) {
		throw new Error('JWT key not found');
	}
	return new TextEncoder().encode(jwtKey as string);
}

export interface DecodedToken {
	characterId: string;
	name: string;
	iat: number;
}

/**
 * Decode and verify our own JWT tokens (not EVE SSO tokens)
 */
export async function decodeJwt(token: string, target: string): Promise<DecodedToken> {
	const instance = target.includes('lowsec') ? 'lsbb' : 'hsbb';

	const decoded = await jwt.jwtVerify(token, () => getKey(instance));
	const payload = decoded.payload as any;

	return {
		characterId: payload.characterId,
		name: payload.name,
		iat: payload.iat
	};
}

/**
 * Check if a JWT token is valid without throwing an error
 */
export async function isValidToken(token: string, target: string): Promise<boolean> {
	try {
		await decodeJwt(token, target);
		return true;
	} catch {
		return false;
	}
}

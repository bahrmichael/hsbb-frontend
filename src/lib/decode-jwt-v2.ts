import * as jwt from 'jose';
import { CLIENT_CONFIGS, urlOriginToInstance } from '$lib/eve-auth';

function getKey(instance: 'highsec' | 'lowsec' | 'localhost') {
	const jwtKey = CLIENT_CONFIGS[instance].jwt;
	if (!jwtKey) {
		throw new Error(`JWT key not found for instance: ${instance}`);
	}
	return new TextEncoder().encode(jwtKey);
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
	const instance = urlOriginToInstance(target);

	const decoded = await jwt.jwtVerify(token, getKey(instance));
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

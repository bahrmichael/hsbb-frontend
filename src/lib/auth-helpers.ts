import { decodeJwt, type DecodedToken } from '$lib/decode-jwt-v2.ts';
import { getMissingScopes } from '$lib/eve-auth.ts';
import type { Cookies } from '@sveltejs/kit';

export interface AuthResult {
	requiresSignIn: boolean;
	token?: string;
	characterId?: string;
	name?: string;
	iat?: number;
	missingScopes?: string[];
}

/**
 * Check authentication and scopes for a page
 */
export async function checkAuth(
	cookies: Cookies,
	requestUrl: string,
	requiredScopes: string[] = []
): Promise<AuthResult> {
	const token = cookies.get('token-v2');
	
	if (!token) {
		return { 
			requiresSignIn: true,
			missingScopes: requiredScopes
		};
	}

	try {
		const decoded: DecodedToken = await decodeJwt(token, requestUrl);
		
		// Check if user has required scopes
		let missingScopes: string[] = [];
		if (requiredScopes.length > 0) {
			missingScopes = await getMissingScopes(decoded.characterId, requiredScopes);
		}

		return {
			requiresSignIn: false,
			token,
			characterId: decoded.characterId,
			name: decoded.name,
			iat: decoded.iat,
			missingScopes
		};
	} catch (error) {
		console.error('Token validation failed:', error);
		return { 
			requiresSignIn: true,
			missingScopes: requiredScopes
		};
	}
}

/**
 * Simplified auth check that throws if not authenticated
 */
export async function requireAuth(
	cookies: Cookies,
	requestUrl: string,
	requiredScopes: string[] = []
): Promise<DecodedToken & { missingScopes: string[] }> {
	const authResult = await checkAuth(cookies, requestUrl, requiredScopes);
	
	if (authResult.requiresSignIn) {
		throw new Error('Authentication required');
	}

	return {
		characterId: authResult.characterId!,
		name: authResult.name!,
		iat: authResult.iat!,
		missingScopes: authResult.missingScopes || []
	};
}

import { createClient } from '@vercel/kv';

import * as jwt from 'jose';

import { env } from '$env/dynamic/private';

function getClient() {
	return createClient({
		url: env.KV_REST_API_URL,
		token: env.KV_REST_API_TOKEN
	});
}

async function getKey() {
	const client = getClient();
	const jwtKey = await client.get('hsbb:jwt');
	if (!jwtKey) {
		throw new Error('JWT key not found');
	}
	return new TextEncoder().encode(
		jwtKey as string
	);
}

export async function load({ cookies, request }) {
	const token = cookies.get('token-v1');
	if (!token) {
		return {
			requiresSignIn: true,
		};
	}

	const decoded = await jwt.jwtVerify(token, getKey);
	const { characterId, name, iat } = decoded.payload;

	return {
		characterId,
		characterName: name,
		token,
		iat,
	};
}
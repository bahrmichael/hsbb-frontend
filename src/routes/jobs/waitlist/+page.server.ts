import { createClient } from '@vercel/kv';

import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
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
	const { characterId, name } = decoded.payload;

	const active = ((await getClient().get(`waitlist:${characterId}`)) as string ?? 'inactive').startsWith('active')

	return {
		characterId,
		characterName: name,
		active,
	};
}

export const actions: Actions = {
	default: async ({ cookies }) => {
		const token = cookies.get('token-v1');
		if (!token) {
			return fail(400, { error: 'Token missing.' });
		}

		const decoded = await jwt.jwtVerify(token, getKey);
		const {characterId} = decoded.payload;

		const client = getClient();
		const current = (await client.get(`waitlist:${characterId}`) ?? 'inactive') as string;
		await client.set(`waitlist:${characterId}`, current.startsWith('active') ? 'inactive' : `active:${new Date().toISOString()}`);

		return redirect(300, '/jobs/waitlist');
	},
}
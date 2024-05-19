import * as jwt from 'jose';
import { getVercelStorageClient } from '$lib/vercel-storage.ts';

async function getKey(instance: string) {
	const client = getVercelStorageClient();
	const jwtKey = await client.get(`${instance}:jwt`);
	if (!jwtKey) {
		throw new Error('JWT key not found');
	}
	return new TextEncoder().encode(
		jwtKey as string
	);
}

export async function decodeJwt(token: string, target: string): Promise<any> {
	const instance = target === 'ingame' ? 'hsbb-ingame' : (target.includes('lowsec') ? 'lsbb' : 'hsbb');
	const decoded = await jwt.jwtVerify(token, () => getKey(instance));
	return decoded.payload;
}
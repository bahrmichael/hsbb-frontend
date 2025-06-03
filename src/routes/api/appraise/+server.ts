import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { decodeJwt } from '$lib/decode-jwt.ts';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, cookies }) {
	const token = cookies.get('token-v1');
	if (!token) {
		throw error(401, 'Unauthorized');
	}
	// just verify the token is valid
	try {
		await decodeJwt(token, 'token-v1');
	} catch (e) {
		console.error(e);
		throw error(401, 'Unauthorized');
	}

	const formData = await request.formData();

	const response = await fetch(`${env.APPRAISAL_URL}/appraisal?persist=no&market=jita`, {
		method: 'POST',
		body: formData
	});

	if (!response.ok) {
		throw error(response.status, 'Failed to get appraisal');
	}

	const data = await response.json();
	return new Response(JSON.stringify(data), {
		status: 200,
		headers: {
			'Content-Type': 'application/json'
		}
	});
}

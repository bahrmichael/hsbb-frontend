import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { checkAuth } from '$lib/auth-helpers';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, cookies }) {
	const authResult = await checkAuth(cookies, request.url);
	if (authResult.requiresSignIn) {
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

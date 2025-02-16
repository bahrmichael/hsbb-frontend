import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { decodeJwt } from '$lib/decode-jwt.ts';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, cookies }) {

	const token = cookies.get('token-v1');
	if (!token) {
		throw error(401, 'Unauthorized');
	}
	const {name} = await decodeJwt(token, 'token-v1');

	const payload = await request.json();

 	await fetch(env.DISCORD_FEEDBACK_URL, {
 		method: 'POST',
 		headers: {
 			'Content-Type': 'application/json'
 		},
 		body: JSON.stringify({
 			content: {
				 ...payload,
				 name,
			}
 		})
 	});

	return new Response(null, { status: 200 });
}

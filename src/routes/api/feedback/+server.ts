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

	const formData = new FormData();
	formData.append('payload_json', JSON.stringify({
		// discord allows up to 2000 characters
		content: `Received ${payload.rating} starts from ${name}: ${payload.feedback}`.slice(0, 2000),
	}));
	formData.append('files[0]', new Blob([payload.calculatorInput], { type: 'text/plain' }), 'input.txt');
	formData.append('files[1]', new Blob([JSON.stringify(payload.appraisalResultJson)], { type: 'application/json' }), 'evepraisal.json');

	const res = await fetch(env.DISCORD_FEEDBACK_URL, {
		method: 'POST',
		body: formData
	});

	console.log('Status:', res.status)
	console.log('Response:', await res.text())

	return new Response(null, { status: 200 });
}

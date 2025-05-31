import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { put } from '@vercel/blob';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, url }) {
	const apiKey = request.headers.get('x-api-key');
	if (!apiKey || apiKey !== env.DATA_API_KEY) {
		throw error(401, 'Unauthorized');
	}

	const filename = url.searchParams.get('filename');
	if (!filename) {
		throw error(400, 'Missing required filename query parameter');
	}

	if (filename.endsWith('.json')) {
		throw error(400, 'Filename must not have .json suffix');
	}

	const jsonData = await request.json();

	const blobFilename = `${filename}.json`;
	const blob = await put(blobFilename, JSON.stringify(jsonData), {
		access: 'public',
		allowOverwrite: true
	});

	return new Response(
		JSON.stringify({
			success: true,
			url: blob.url,
			filename: blobFilename
		}),
		{
			status: 200,
			headers: {
				'Content-Type': 'application/json'
			}
		}
	);
}

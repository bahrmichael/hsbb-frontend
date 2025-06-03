import { error } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function POST({ url, cookies }) {
	const cookieName = url.searchParams.get('cookieName');
	if (!cookieName) {
		error(400, 'cookieName is required');
	}
	cookies.delete(cookieName, { path: '/' });
	return new Response(null, { status: 200 });
}

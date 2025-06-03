const HSBB = '7817dc406c90427db9d3570bb3cc495b';
const LSBB = '542b75e8f71c4fb8aec7d58cdbc1fba5';

/** @type {import('./$types').PageServerLoad} */
export async function load({ cookies, request }) {
	const url = new URL(request.url);
	const searchParams = url.searchParams;
	const clientId = searchParams.get('client_id');
	const apiKey = searchParams.get('api_key');

	// todo: handle things like audit that should be ignored, maybe?
	const tokenName = clientId === HSBB || clientId === LSBB ? 'token-v2' : `token-${clientId}`;
	cookies.set(tokenName, apiKey ?? '', {
		path: '/',
		maxAge: 60 * 60 * 24 * 365 * 10
	});

	if (clientId === 'waitlist') {
		return {
			redirectTo: '/jobs/waitlist'
		};
	} else if (clientId === 'ingame') {
		return {
			redirectTo: '/jobs/couriers'
		};
	} else if (clientId === 'audit') {
		return {
			redirectTo: '/audit/complete'
		};
	} else {
		return {
			redirectTo: '/'
		};
	}
}

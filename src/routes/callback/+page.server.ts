const AUTH_API = `https://uc4v3lk6rh.execute-api.us-east-1.amazonaws.com/dev/auth`;

/** @type {import('./$types').PageServerLoad} */
export async function load({ cookies, request }) {
	const url = new URL(request.url);
	const instance = url.origin.includes('lowsec') ? 'lowsec' : 'highsec';
	const searchParams = url.searchParams;
	const code = searchParams.get('code');

	let authUrl = `${AUTH_API}?code=${code}&appId=${instance}-buyback`;
	try {
		const response = await fetch(authUrl);
		if (response.status >= 400) {
			return {
				error: 'Failed to authenticate'
			};
		}
		const data = await response.json();
		cookies.set('token-v1', data.token, {
			path: '/',
			maxAge: 60 * 60 * 24 * 365 * 10
		});

		if (searchParams.get('state') === 'waitlist') {
			return {
				redirectTo: '/jobs/waitlist'
			};
		} else {
			return {
				redirectTo: '/'
			};
		}
	} catch (e) {
		console.error(e);
		return {
			error: 'Failed to authenticate'
		};
	}
}
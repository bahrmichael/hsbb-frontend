const AUTH_API = `https://uc4v3lk6rh.execute-api.us-east-1.amazonaws.com/dev/auth`;

/** @type {import('./$types').PageServerLoad} */
export async function load({ cookies, request }) {
	const url = new URL(request.url);
	const instance = url.origin.includes('lowsec') ? 'lowsec' : 'highsec';
	const searchParams = url.searchParams;
	const state = searchParams.get('state');
	const appId = state === 'ingame' ? 'hsbb-jobs' : ( state === 'audit' ? 'hsbb-member-audit' : `${instance}-buyback`);
	const code = searchParams.get('code');

	let authUrl = `${AUTH_API}?code=${code}&appId=${appId}`;
	try {
		const response = await fetch(authUrl);
		if (response.status >= 400) {
			return {
				error: 'Failed to authenticate'
			};
		}
		const data = await response.json();

		if (state !== 'audit') {
			const tokenName = state === 'ingame' ? 'token-ingame' : 'token-v1';
			cookies.set(tokenName, data.token, {
				path: '/',
				maxAge: 60 * 60 * 24 * 365 * 10
			});
		}

		if (state === 'waitlist') {
			return {
				redirectTo: '/jobs/waitlist'
			};
		} else if (state === 'ingame') {
			return {
				redirectTo: '/jobs/couriers'
			};
		} else if (state === 'audit') {
			return {
				redirectTo: '/audit/complete'
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
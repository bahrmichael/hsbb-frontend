export function getInstance(): 'highsec' | 'lowsec' {
		const subdomain = window.location.host.split('.')[0];
		switch (subdomain) {
				case 'lowsec':
						return 'lowsec';
				case 'highsec':
				default:
						return 'highsec';
		}
}
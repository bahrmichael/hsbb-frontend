<script lang="ts">
	import { browser } from '$app/environment';

	interface Props {
		scope: string[];
		redirectTo: string;
		buttonText?: string;
		class?: string;
	}

	let { scope, redirectTo, buttonText = 'Sign in with EVE Online', class: className = '' }: Props =
		$props();

	function handleSignIn() {
		if (!browser) return;

		// Build the start flow URL with query parameters
		const startFlowUrl = new URL('/auth/start', window.location.origin);
		startFlowUrl.searchParams.set('scope', scope.join(' '));
		startFlowUrl.searchParams.set('redirectTo', redirectTo);

		// Redirect to the start flow page
		window.location.href = startFlowUrl.toString();
	}
</script>

<button type="button" class={`btn btn-primary ${className}`} onclick={handleSignIn}>
	{buttonText}
</button>

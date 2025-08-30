<script lang="ts">
	import { onMount } from 'svelte';

	// This page should never be seen as the server redirects immediately
	// But in case there's an issue, show a loading message and redirect home
	onMount(() => {
		setTimeout(() => {
			window.location.href = '/';
		}, 3000);
	});
</script>

<div class="container mx-auto px-4 py-8 text-center">
	<div class="loading loading-spinner loading-lg"></div>
	<p class="mt-4">Starting authentication flow...</p>
	<p class="text-sm text-gray-500 mt-2">
		If you're not redirected automatically, 
		<a href="/" class="link">click here</a> to return home.
	</p>
</div>

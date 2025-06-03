<script>
	import Appraisal from '$lib/Appraisal.svelte';
	import Navbar from '$lib/Navbar.svelte';
	import Footer from '$lib/Footer.svelte';
	import { onMount } from 'svelte';

	let showNewAuthNotice = false;

	onMount(() => {
		showNewAuthNotice = !!localStorage.getItem('token-v1');
	});
</script>

<div id="container" class="container mx-auto">
	<Navbar />
	{#if showNewAuthNotice}
		<div role="alert" class="alert mb-10">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				class="stroke-current shrink-0 w-6 h-6"
				><path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
				></path></svg
			>
			<span>We cleared all logins and need you to sign in again.</span>
		</div>
	{/if}
	<Appraisal />
	<Footer />
</div>

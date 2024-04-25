<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { getInstance } from '$lib/instance';
	import ErrorIcon from '$lib/icons/Error.svelte';

	const AUTH_API = `https://uc4v3lk6rh.execute-api.us-east-1.amazonaws.com/dev/auth`;

	let failed = false;

	onMount(() => {
		const code = $page.url.searchParams.get('code');
		fetch(`${AUTH_API}?code=${code}&appId=${getInstance()}-buyback`)
			.then((res) => res.json())
			.then((data) => {
				localStorage.setItem('token-v1', data.token);
				goto('/', { replaceState: true });
			})
			.catch((err) => {
				console.error(err);
				failed = true;
			});
	});
</script>

<div id="container" class="container mx-auto my-10">
	{#if failed}
		<div role="alert" class="alert alert-error w-3/4">
			<ErrorIcon />
			<span>Failed to log in. Please go to the calculator and try again.</span>
		</div>
	{:else}
		<progress class="progress w-24 mr-8"></progress>
		<span class="text-xl text-bold">Logging in ...</span>
	{/if}
</div>


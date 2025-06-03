<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import ErrorIcon from '$lib/icons/Error.svelte';
	import { page } from '$app/stores';

	$: redirectTo = $page.data.redirectTo;
	$: error = $page.data.error;

	onMount(() => {
		if (redirectTo) {
			goto(redirectTo, { replaceState: true });
		}
	});
</script>

<div id="container" class="container mx-auto my-10">
	{#if error}
		<div role="alert" class="alert alert-error w-3/4">
			<ErrorIcon />
			<span>Failed to log in. Please go to the calculator and try again.</span>
		</div>
	{:else}
		<progress class="progress w-24 mr-8"></progress>
		<span class="text-xl text-bold">Logging in ...</span>
	{/if}
</div>

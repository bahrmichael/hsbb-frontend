<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	const link = $page.data.redirectTo;

	onMount(() => {
			window.location.replace(link);
	});
</script>

<div id="container" class="container mx-auto">
	Redirecting to store ...
</div>
